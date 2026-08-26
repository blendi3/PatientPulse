"use client";

import { useEffect, useState } from "react";

import { getDoctorByUserId, requestUnavailableDate } from "@/lib/actions/doctor.actions";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite.client";
import Image from "next/image";
import PulseLogo from "@/components/PulseLogo";
import { getImageUrl } from "@/lib/utils";
import { ArrowLeft, CalendarOff } from "lucide-react";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AvailabilityPage = () => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [doctor, setDoctor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await account.get();
        const labels = (user as any).labels || [];
        if (!labels.includes("doctor")) {
          router.push("/");
          return;
        }

        const doctorRecord = await getDoctorByUserId(user.$id);
        if (!doctorRecord) {
          router.push("/");
          return;
        }

        setDoctor(doctorRecord);
        setAuthorized(true);
      } catch {
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [router]);

const handleToggleDate = async (dateStr: string, currentlyPending: boolean) => {
  const currentPending = doctor.pendingUnavailableDates || [];
  const updatedPendingOptimistic = currentlyPending
    ? currentPending.filter((d: string) => d !== dateStr)
    : [...currentPending, dateStr];

  setDoctor({ ...doctor, pendingUnavailableDates: updatedPendingOptimistic });

  const result = await requestUnavailableDate(doctor.$id, dateStr, !currentlyPending);
  if (!result.success) {
    toast.error(result.error || "Failed to update.");
    setDoctor({ ...doctor, pendingUnavailableDates: currentPending });
  } else {
    toast.success(currentlyPending ? "Request cancelled." : "Day-off request sent for approval.");
  }
};

  if (isLoading || !authorized) return null;

  return (
    <div className="min-h-screen bg-dark-200">
      <header className="w-full border-b border-dark-500">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <PulseLogo size={32} />
            <p className="text-16-semibold text-white">PatientPulse</p>
          </div>
          <Image
            src={doctor?.image ? getImageUrl(doctor.image) : "/assets/images/admin.png"}
            width={36}
            height={36}
            alt={doctor?.name}
            className="rounded-full border border-dark-500 object-cover size-9"
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <Link
          href="/doctor-portal"
          className="flex items-center gap-2 text-14-regular text-dark-700 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          Back to portal
        </Link>

        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <CalendarOff className="size-5 text-red-400" />
            <h1 className="header">Manage availability</h1>
          </div>
          <p className="text-dark-700">
            Click a date to mark yourself unavailable. Patients won't be able to book you that day.
          </p>
        </section>

<AvailabilityCalendar
  unavailableDates={doctor.unavailableDates || []}
  pendingDates={doctor.pendingUnavailableDates || []}
  onToggleDate={handleToggleDate}
/>
      </main>
    </div>
  );
};

export default AvailabilityPage;
