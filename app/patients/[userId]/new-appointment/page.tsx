import { Button } from "@/components/ui/button";
import PatientForm from "@/components/forms/PatientForm";
import Image from "next/image";
import Link from "next/link";
import AppointmentForm from "@/components/forms/AppointmentForm";
import { getPatient } from "@/lib/actions/patient.actions";
import * as Sentry from "@sentry/nextjs";
import PulseLogo from "@/components/PulseLogo";

export default async function NewAppointment({
  params: { userId },
}: SearchParamProps) {
  const patient = await getPatient(userId);

  Sentry.metrics.set("user_view_new-appointment", patient.name);

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[860px] flex-1 justify-between">
          <div className="mb-12 flex items-center gap-1">
            <PulseLogo size={40} />
            <p className="text-2xl font-semibold">PatientPulse</p>
          </div>

          <AppointmentForm
            type="create"
            userId={userId}
            patientId={patient.$id}
          />

          <p className="copyright mt-10 py-12">© 2024 PatientPulse</p>
        </div>
      </section>

      <Image
        src="/assets/images/appointment-img.png"
        height={1000}
        width={1000}
        alt="appointment"
        className="side-img max-w-[390px] bg-bottom"
      />
    </div>
  );
}
