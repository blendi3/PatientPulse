"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite.client";
import { getDoctorByUserId } from "@/lib/actions/doctor.actions";
import { getAppointmentsByDoctorId } from "@/lib/actions/appointment.actions";
import Image from "next/image";
import PulseLogo from "@/components/PulseLogo";
import { formatDateTime, getImageUrl } from "@/lib/utils";
import { LogOut, Calendar, Phone, User } from "lucide-react";
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
import { KeyRound } from "lucide-react";

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
  const upcoming = appointments.filter(
    (a) => new Date(a.schedule) >= now && a.status !== "cancelled"
  );
  const past = appointments.filter(
    (a) => new Date(a.schedule) < now || a.status === "cancelled"
  );

  return (
    <div className="min-h-screen bg-dark-200">
      <header className="w-full border-b border-dark-500">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <PulseLogo size={32} />
            <p className="text-16-semibold text-white">PatientPulse</p>
 </div>
          <div className="flex items-center gap-4">
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
            <section className="space-y-4">
              <h2 className="text-18-bold text-white">
                Upcoming appointments ({upcoming.length})
              </h2>
              {upcoming.length === 0 ? (
                <p className="text-14-regular text-dark-700">
                  No upcoming appointments.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((appt) => (
                    <div
                      key={appt.$id}
                      className="rounded-lg border border-dark-500 bg-dark-400 p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-full bg-green-500/10">
                          <User className="size-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-14-semibold text-white">
                            {appt.patient?.name}
                          </p>
                          <p className="text-12-regular text-dark-700 flex items-center gap-1">
                            <Calendar className="size-3" />
                            {formatDateTime(appt.schedule).dateTime}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-12-medium px-3 py-1 rounded-full",
                          appt.status === "scheduled"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        )}
                      >
                        {appt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-18-bold text-white">
                Past & cancelled ({past.length})
              </h2>
              {past.length === 0 ? (
                <p className="text-14-regular text-dark-700">No past appointments.</p>
              ) : (
                <div className="space-y-3 opacity-60">
                  {past.map((appt) => (
                    <div
                      key={appt.$id}
                      className="rounded-lg border border-dark-500 bg-dark-400 p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-14-semibold text-white">
                          {appt.patient?.name}
                        </p>
                        <p className="text-12-regular text-dark-700">
                          {formatDateTime(appt.schedule).dateTime}
                        </p>
                      </div>
                      <span className="text-12-medium text-dark-700">
                        {appt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default DoctorPortal;
