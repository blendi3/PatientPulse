"use client";

import { useEffect, useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import NotificationBell from "@/components/NotificationBell";
import { CalendarOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite.client";
import { getDoctorByUserId } from "@/lib/actions/doctor.actions";
import { getAppointmentsByDoctorId, markAppointmentComplete } from "@/lib/actions/appointment.actions";
import Image from "next/image";
import PulseLogo from "@/components/PulseLogo";
import { formatDateTime, getImageUrl } from "@/lib/utils";
import {
  LogOut,
  Calendar,
  User,
  KeyRound,
  ChevronDown,
  Phone,
  Mail,
  FileText,
  Clock,
  Users,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const statusStyles: Record<string, string> = {
  scheduled: "bg-green-500/10 text-green-500",
  pending: "bg-yellow-500/10 text-yellow-500",
  cancelled: "bg-red-500/10 text-red-400",
  completed: "bg-blue-500/10 text-blue-400",
};

const StatBox = ({
  icon: Icon,
  label,
  count,
}: {
  icon: any;
  label: string;
  count: number;
}) => (
  <div className="flex-1 rounded-xl border border-dark-500 bg-dark-400 p-5 flex items-center gap-4">
    <div className="flex items-center justify-center size-11 rounded-full bg-green-500/10 shrink-0">
      <Icon className="size-5 text-green-500" />
    </div>
    <div>
      <p className="text-24-bold text-white">{count}</p>
      <p className="text-14-regular text-dark-700">{label}</p>
    </div>
  </div>
);

const AppointmentRow = ({
  appt,
  onUpdate,
}: {
  appt: any;
  onUpdate: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

 
  const canComplete = appt.status === "scheduled";
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [treatmentNotes, setTreatmentNotes] = useState("");

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const result = await markAppointmentComplete(appt.$id, treatmentNotes);
      if (result.success) {
        toast.success("Marked as completed.");
        setShowTreatmentForm(false);
        setTreatmentNotes("");
        onUpdate();
      } else {
        toast.error(result.error || "Failed to update.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="rounded-lg border border-dark-500 bg-dark-400 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-green-500/10 shrink-0">
            <User className="size-5 text-green-500" />
          </div>
          <div>
            <p className="text-14-semibold text-white">{appt.patient?.name}</p>
            <p className="text-12-regular text-dark-700 flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDateTime(appt.schedule).dateTime}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-12-medium px-3 py-1 rounded-full capitalize",
              statusStyles[appt.status] || "bg-dark-500 text-dark-700"
            )}
          >
            {appt.status}
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-dark-700 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-dark-500 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-14-regular text-dark-700">
              <Phone className="size-4 shrink-0" />
              {appt.patient?.phone || "—"}
            </div>
            <div className="flex items-center gap-2 text-14-regular text-dark-700">
              <Mail className="size-4 shrink-0" />
              {appt.patient?.email || "—"}
            </div>
          </div>
          <div className="flex items-start gap-2 text-14-regular text-dark-700">
            <FileText className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="text-white">{appt.reason || "No reason given"}</p>
              {appt.note && (
                <p className="text-12-regular text-dark-700 mt-1">
                  Note: {appt.note}
                </p>
              )}
            </div>
          </div>
          {canComplete && !showTreatmentForm && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTreatmentForm(true);
              }}
              className="flex items-center gap-2 text-14-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              <CheckCircle2 className="size-4" />
              Mark as completed
            </button>
          )}

          {canComplete && showTreatmentForm && (
            <div
              className="space-y-3 pt-2 border-t border-dark-500"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-13-medium text-dark-700">
                Add treatment notes (visible to admin/reception)
              </p>
              <Textarea
                value={treatmentNotes}
                onChange={(e) => setTreatmentNotes(e.target.value)}
                placeholder="Diagnosis, treatment given, prescribed medication, follow-up instructions..."
                className="shad-textArea"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="shad-primary-btn px-4 py-2 rounded-lg text-14-semibold"
                >
                  {isCompleting ? "Saving..." : "Save & mark complete"}
                </button>
                <button
                  onClick={() => setShowTreatmentForm(false)}
                  className="text-14-medium text-dark-700 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DoctorPortal = () => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [doctor, setDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

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

        const appts = await getAppointmentsByDoctorId(doctorRecord.$id);
        setAppointments(appts);
      } catch {
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    try {
      await account.updatePassword(newPassword, oldPassword);
      toast.success("Password updated successfully!");
      setNewPassword("");
      setOldPassword("");
      setPasswordDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };



  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await account.deleteSession("current");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  

  if (!authorized) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday.getTime() + 86400000);
  const startOfWeekEnd = new Date(startOfToday.getTime() + 7 * 86400000);

  const upcomingAll = appointments.filter(
    (a) => new Date(a.schedule) >= startOfToday && a.status !== "cancelled"
  );
 const completed = appointments.filter((a) => a.status === "completed");
const unresolved = appointments.filter(
  (a) =>
    (new Date(a.schedule) < startOfToday || a.status === "cancelled") &&
    a.status !== "completed"
);

  const todayCount = appointments.filter((a) => {
    const d = new Date(a.schedule);
    return d >= startOfToday && d < startOfTomorrow && a.status !== "cancelled";
  }).length;

  const weekCount = appointments.filter((a) => {
    const d = new Date(a.schedule);
    return d >= startOfToday && d < startOfWeekEnd && a.status !== "cancelled";
  }).length;

  const totalPatients = new Set(appointments.map((a) => a.patient?.$id)).size;

  const groupByDay = (list: any[]) => {
    const groups: Record<string, any[]> = {};
    list.forEach((appt) => {
      const d = new Date(appt.schedule);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      let label: string;
      if (dayStart.getTime() === startOfToday.getTime()) {
        label = "Today";
      } else if (dayStart.getTime() === startOfTomorrow.getTime()) {
        label = "Tomorrow";
      } else if (dayStart < startOfWeekEnd) {
        label = "This week";
      } else {
        label = "Later";
      }
      if (!groups[label]) groups[label] = [];
      groups[label].push(appt);
    });
    return groups;
  };

  const groupedUpcoming = groupByDay(upcomingAll);
  const groupOrder = ["Today", "Tomorrow", "This week", "Later"];

  return (
    <div className="min-h-screen bg-dark-200">
      <header className="w-full border-b border-dark-500">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <PulseLogo size={32} />
            <p className="text-16-semibold text-white">PatientPulse</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell doctorId={doctor.$id} />
              <Link
    href="/doctor-portal/availability"
    className="flex items-center gap-2 text-14-medium text-dark-700 hover:text-white transition-colors"
  >
    <CalendarOff className="size-4" />
    Availability
  </Link>
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 text-14-medium text-dark-700 hover:text-white transition-colors">
                  <KeyRound className="size-4" />
                  Change password
                </button>
              </DialogTrigger>
              <DialogContent className="shad-dialog sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="rounded-md border border-dark-500 bg-dark-400">
                    <Input
                      type="password"
                      placeholder="Current password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      className="shad-input border-0"
                    />
                  </div>
                  <div className="rounded-md border border-dark-500 bg-dark-400">
                    <Input
                      type="password"
                      placeholder="New password (min. 8 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="shad-input border-0"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="shad-primary-btn w-full h-11"
                  >
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </DialogContent>
            </Dialog>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 text-14-medium text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="size-4" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        <div className="flex items-center gap-4">
          <Image
            src={doctor?.image ? getImageUrl(doctor.image) : "/assets/images/admin.png"}
            width={64}
            height={64}
            alt={doctor?.name}
            className="rounded-full border border-dark-500 object-cover size-16"
          />
          <div>
            <h1 className="header">Dr. {doctor?.name}</h1>
            <p className="text-dark-700">{doctor?.specialization}</p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-14-regular text-dark-700">Loading appointments...</p>
        ) : (
          <>
            <section className="flex flex-col sm:flex-row gap-4">
              <StatBox icon={Clock} label="Today" count={todayCount} />
              <StatBox icon={Calendar} label="This week" count={weekCount} />
              <StatBox icon={Users} label="Total patients" count={totalPatients} />
            </section>

            <section className="space-y-6">
              <h2 className="text-18-bold text-white">
                Upcoming appointments ({upcomingAll.length})
              </h2>
              {upcomingAll.length === 0 ? (
                <p className="text-14-regular text-dark-700">
                  No upcoming appointments.
                </p>
              ) : (
                groupOrder
                  .filter((label) => groupedUpcoming[label]?.length)
                  .map((label) => (
                    <div key={label} className="space-y-3">
                      <p className="text-14-semibold text-dark-700 uppercase tracking-wide">
                        {label}
                      </p>
                      {groupedUpcoming[label].map((appt) => (
                       <AppointmentRow
  key={appt.$id}
  appt={appt}
  onUpdate={() => {
    getAppointmentsByDoctorId(doctor.$id).then(setAppointments);
  }}
/>
                      ))}
                    </div>
                  ))
              )}
            </section>

<section className="space-y-6">
  <div className="space-y-4">
    <h2 className="text-18-bold text-white">
      Past & cancelled ({unresolved.length})
    </h2>
    {unresolved.length === 0 ? (
      <p className="text-14-regular text-dark-700">Nothing here.</p>
    ) : (
      <div className="space-y-3">
        {unresolved.map((appt) => (
          <AppointmentRow
            key={appt.$id}
            appt={appt}
            onUpdate={() => {
              getAppointmentsByDoctorId(doctor.$id).then(setAppointments);
            }}
          />
        ))}
      </div>
    )}
  </div>

  <div className="space-y-4">
    <h2 className="text-18-bold text-white">
      Completed ({completed.length})
    </h2>
    {completed.length === 0 ? (
      <p className="text-14-regular text-dark-700">No completed appointments yet.</p>
    ) : (
      <div className="space-y-3 opacity-60">
        {completed.map((appt) => (
          <AppointmentRow
            key={appt.$id}
            appt={appt}
            onUpdate={() => {
              getAppointmentsByDoctorId(doctor.$id).then(setAppointments);
            }}
          />
        ))}
      </div>
    )}
  </div>
</section>
          </>
        )}
      </main>
    </div>
  );
};

export default DoctorPortal;