import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Image from "next/image";
import AdminDashboard from "@/components/AdminDashboard";

const Admin = async () => {
  const appointments = await getRecentAppointmentList();

  return (
    <div className="md:flex">
      <Sidebar />
      <div className="root-layout">
        <Image
          src="/assets/icons/logo-icon.svg"
          height={100}
          width={100}
          alt="patient"
          className="size-[45px] xl:h-10 xl:w-fit"
        />
        <MobileNav />
      </div>
      <div className="mx-auto flex max-w-7xl md:max-w-5xl min-w-20 flex-col space-y-14">
        <main className="admin-main">
          <section className="w-full space-y-4">
            <h1 className="header">Welcome 👋</h1>
            <p className="text-dark-700">
              Start the day with managing new appointments
            </p>
          </section>

          <AdminDashboard
            documents={appointments.documents}
            scheduledCount={appointments.scheduledCount}
            pendingCount={appointments.pendingCount}
            cancelledCount={appointments.cancelledCount}
          />
        </main>
      </div>
    </div>
  );
};

export default Admin;