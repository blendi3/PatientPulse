"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite.client";
import { getPatient } from "@/lib/actions/patient.actions";
import {
  getAllAppointmentsForPatient,
  cancelAppointmentBySelf,
} from "@/lib/actions/appointment.actions";
import PulseLogo from "@/components/PulseLogo";
import { formatDateTime, cn } from "@/lib/utils";
import { Calendar, LogOut, X, Loader2, ClipboardList } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const statusStyles: Record<string, string> = {
  scheduled: "bg-green-500/10 text-green-500",
  pending: "bg-yellow-500/10 text-yellow-500",
  cancelled: "bg-red-500/10 text-red-400",
  completed: "bg-gray-500/10 text-gray-400",
};

const CancelDialog = ({
  appointmentId,
  onCancelled,
}: {
  appointmentId: string;
  onCancelled: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const result = await cancelAppointmentBySelf(appointmentId, reason);
      if (result.success) {
        toast.success("Appointment cancelled.");
        setOpen(false);
        onCancelled();
      } else {
        toast.error(result.error || "Failed to cancel.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 text-13-medium text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-md hover:bg-red-500/10">
          <X className="size-4" />
          Cancel
        </button>
      </DialogTrigger>
      <DialogContent className="shad-dialog">
        <DialogHeader>
          <DialogTitle>Cancel appointment</DialogTitle>
        </DialogHeader>
        <p className="text-14-regular text-dark-700">
          Are you sure you want to cancel this appointment? Let us know why (optional).
        </p>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancelling..."
          className="shad-textArea"
        />
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => setOpen(false)}
            className="text-14-medium text-dark-700 hover:text-white transition-colors px-4 py-2"
          >
            Keep appointment
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white text-14-semibold px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            Yes, cancel it
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MyAppointmentsPage = () => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAppointments = async (patientId: string) => {
    const data = await getAllAppointmentsForPatient(patientId);
    setAppointments(data);
  };

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = await account.get();
        const labels = (user as any).labels || [];
        if (labels.includes("doctor") || labels.includes("mvp") || labels.includes("admin")) {
          router.push("/");
          return;
        }
        const patientDoc = await getPatient(user.$id);
        if (!patientDoc) {
          toast.error("No patient record found for this account.");
          router.push("/my-appointments/login");
          return;
        }
        setPatient(patientDoc);
        setUserId(user.$id);
        setAuthorized(true);
        await loadAppointments(patientDoc.$id);
      } catch {
        router.push("/my-appointments/login");
      } finally {
        setIsLoading(false);
      }
    };
    checkAccess();
  }, [router]);

  const handleLogout = async () => {
    await account.deleteSession("current");
    router.push("/my-appointments/login");
  };

  if (isLoading) return null;
  if (!authorized) return null;

  const upcoming = appointments.filter(
    (a) => a.status === "scheduled" || a.status === "pending"
  );
  const past = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );

  const nextAppointment = upcoming
    .slice()
    .sort((a, b) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime())[0];

  const daysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / 86400000);
    if (days <= 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };

  return (
    <div className="min-h-screen bg-dark-200">
      <header className="w-full border-b border-dark-500">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <PulseLogo size={32} />
            <p className="text-16-semibold text-white">PatientPulse</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-14-medium text-dark-700 hover:text-white transition-colors"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-24-bold text-white">
              Hi, {patient.user?.name?.split(" ")[0] || "there"} 👋
            </h1>
           <p className="text-dark-700 mt-1">Here&apos;s what&apos;s coming up.</p>
          </div>
          <Link
            href={`/patients/${userId}/new-appointment`}
            className="shad-primary-btn px-4 py-2 rounded-lg text-14-semibold whitespace-nowrap"
          >
            Book New Appointment
          </Link>
        </div>

        {nextAppointment && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="size-5 text-green-500" />
              <p className="text-15-semibold text-white">Your next appointment</p>
            </div>
            <p className="text-14-regular text-white">
              Dr. {nextAppointment.primaryPhysician} —{" "}
              {formatDateTime(nextAppointment.schedule).dateTime}
            </p>
            <p className="text-13-regular text-green-500 mt-1 font-semibold">
              {daysUntil(nextAppointment.schedule)}
            </p>
          </div>
        )}

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-5 text-dark-700" />
            <h2 className="text-16-semibold text-white">Upcoming</h2>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-14-regular text-dark-700">No upcoming appointments.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((appt) => (
                <div
                  key={appt.$id}
                  className="flex items-center justify-between rounded-lg border border-dark-500 bg-dark-400 p-4"
                >
                  <div>
                    <p className="text-14-semibold text-white">
                      Dr. {appt.primaryPhysician}
                    </p>
                    <p className="text-12-regular text-dark-700">
                      {formatDateTime(appt.schedule).dateTime}
                    </p>
                    {appt.reason && (
                      <p className="text-12-regular text-dark-700 mt-1">
                        Reason: {appt.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-12-medium px-3 py-1 rounded-full capitalize",
                        statusStyles[appt.status]
                      )}
                    >
                      {appt.status}
                    </span>
                    <CancelDialog
                      appointmentId={appt.$id}
                      onCancelled={() => loadAppointments(patient.$id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-16-semibold text-white">Past</h2>
          {past.length === 0 ? (
            <p className="text-14-regular text-dark-700">No past appointments yet.</p>
          ) : (
            <div className="space-y-3">
              {past.map((appt) => (
                <div
                  key={appt.$id}
                  className="rounded-lg border border-dark-500 bg-dark-400 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-14-semibold text-white">
                        Dr. {appt.primaryPhysician}
                      </p>
                      <p className="text-12-regular text-dark-700">
                        {formatDateTime(appt.schedule).dateTime}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-12-medium px-3 py-1 rounded-full capitalize",
                        statusStyles[appt.status]
                      )}
                    >
                      {appt.status}
                    </span>
                  </div>
                  {appt.status === "completed" && appt.isReleased && appt.treatmentNotes && (
                    <div className="rounded-md bg-dark-300 border border-dark-500 p-3">
                     <p className="text-12-medium text-green-500 mb-1">Doctor&apos;s notes</p>
                      <p className="text-13-regular text-white whitespace-pre-wrap">
                        {appt.treatmentNotes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MyAppointmentsPage;