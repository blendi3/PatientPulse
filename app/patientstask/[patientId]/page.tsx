import { getPatientById } from "@/lib/actions/patient.actions";
import { getTreatmentHistoryForPatient } from "@/lib/actions/appointment.actions";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Image from "next/image";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import EditPatientModal from "@/components/EditPatientModal";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, Users, ShieldAlert, FileText, User } from "lucide-react";
import PulseLogo from "@/components/PulseLogo";

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="space-y-1">
    <p className="text-12-regular text-dark-700">{label}</p>
    <p className="text-15-medium text-white">{value || "—"}</p>
  </div>
);

const SectionCard = ({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-dark-500 bg-dark-400 p-6">
    <div className="flex items-center gap-2 mb-6">
      <div className="flex items-center justify-center size-8 rounded-full bg-green-500/10">
        <Icon className="size-4 text-green-500" />
      </div>
      <h2 className="text-16-semibold text-white">{title}</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  </div>
);

const PatientDetailsPage = async ({
  params: { patientId },
}: {
  params: { patientId: string };
}) => {
  const patient = await getPatientById(patientId);

  const treatmentHistory = patient ? await getTreatmentHistoryForPatient(patient.$id) : [];

  if (!patient) {
    return (
      <div className="md:flex">
        <Sidebar />
        <div className="root-layout">
          <PulseLogo size={40} />
          <MobileNav />
        </div>
        <div className="mx-auto flex max-w-7xl md:max-w-5xl min-w-20 flex-col space-y-14">
          <main className="admin-main">
            <p className="text-16-regular text-dark-700">Patient not found.</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="md:flex">
      <Sidebar />
      <div className="root-layout">
        <PulseLogo size={40} />
        <MobileNav />
      </div>
      <div className="mx-auto flex max-w-7xl md:max-w-5xl min-w-20 flex-col space-y-14">
        <main className="admin-main">
          <Link
            href="/patientstask"
            className="flex items-center gap-2 text-14-regular text-dark-700 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft className="size-4" />
            Back to patients
          </Link>

            <section className="w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-16 rounded-full bg-dark-400 border border-dark-500">
                <User className="size-8 text-dark-600" />
              </div>
              <div>
                <h1 className="header">{patient.user.name}</h1>
                <p className="text-dark-700">
                  Registered {formatDateTime(patient.$createdAt).dateOnly}
                </p>
              </div>
            </div>
            <EditPatientModal patient={patient} />
          </section>

          <div className="space-y-6">
            <SectionCard icon={Mail} title="Contact Information">
              <InfoRow label="Email" value={patient.user.email} />
              <InfoRow label="Phone" value={patient.user.phone} />
              <InfoRow label="Address" value={patient.address} />
              <InfoRow label="Occupation" value={patient.occupation} />
              <InfoRow label="Gender" value={patient.gender} />
              <InfoRow
                label="Date of Birth"
                value={patient.birthDate ? formatDateTime(patient.birthDate).dateOnly : undefined}
              />
            </SectionCard>

            <SectionCard icon={Users} title="Emergency Contact">
              <InfoRow label="Name" value={patient.emergencyContactName} />
              <InfoRow label="Phone" value={patient.emergencyContactNumber} />
            </SectionCard>

            <SectionCard icon={ShieldAlert} title="Medical Information">
              <InfoRow label="Allergies" value={patient.allergies} />
              <InfoRow
                label="Medical history & current medication"
                value={patient.currentMedication}
              />
            </SectionCard>

            <div className="rounded-xl border border-dark-500 bg-dark-400 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center justify-center size-8 rounded-full bg-green-500/10">
                  <FileText className="size-4 text-green-500" />
                </div>
                <h2 className="text-16-semibold text-white">Identification</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InfoRow label="ID Type" value={patient.identificationType} />
                <InfoRow label="ID Number" value={patient.identificationNumber} />
              </div>
              {patient.identificationDocumentUrl &&
  !patient.identificationDocumentUrl.includes("undefined") && (
                <div>
                  <p className="text-12-regular text-dark-700 mb-3">
                    Identification Document
                  </p>
                  <a
                    href={patient.identificationDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-fit"
                  >
                    <Image
                      src={patient.identificationDocumentUrl}
                      width={220}
                      height={220}
                      alt="Identification document"
                      className="rounded-lg border border-dark-500 object-cover hover:opacity-80 transition-opacity"
                    />
                  </a>
                </div>
              )}
            </div>
          </div>
           {treatmentHistory.length > 0 && (
            <div className="rounded-xl border border-dark-500 bg-dark-400 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center justify-center size-8 rounded-full bg-green-500/10">
                  <FileText className="size-4 text-green-500" />
                </div>
                <h2 className="text-16-semibold text-white">Treatment History</h2>
              </div>
              <div className="space-y-4">
                {treatmentHistory.map((appt: any) => (
                  <div
                    key={appt.$id}
                    className="rounded-lg border border-dark-500 bg-dark-300 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-14-semibold text-white">
                        Dr. {appt.primaryPhysician}
                      </p>
                      <p className="text-12-regular text-dark-700">
                        {formatDateTime(appt.schedule).dateOnly}
                      </p>
                    </div>
                    <p className="text-13-regular text-dark-700">
                      Reason: {appt.reason || "—"}
                    </p>
                    {appt.treatmentNotes ? (
                      <p className="text-14-regular text-white whitespace-pre-wrap">
                        {appt.treatmentNotes}
                      </p>
                    ) : (
                      <p className="text-13-regular text-dark-700 italic">
                        No treatment notes recorded.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientDetailsPage;