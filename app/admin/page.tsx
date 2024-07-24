import { DataTable } from "@/components/table/DataTable";
import StatCard from "@/components/StatCard";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import React from "react";
import { columns } from "@/components/table/columns";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import DoctorForm from "@/components/forms/DoctorForm";
import Image from "next/image";

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
      <div className="mx-auto flex max-w-7xl min-w-20 flex-col space-y-14">
        {/* <header className="admin-header">
          <Link href="/" className="cursor-pointer">
            <div className="flex items-center gap-1">
              <Image
                src="/assets/icons/logo-icon.svg"
                height={1000}
                width={1000}
                alt="patient"
                className="h-8 w-fit"
              />
              <p className="text-2xl font-semibold">PatientPulse</p>
            </div>
          </Link>
          <p className="text-16-semibold">Admin Dashboard</p>
        </header> */}

        <main className="admin-main">
          <section className="w-full space-y-4">
            <h1 className="header">Welcome 👋</h1>
            <p className="text-dark-700">
              Start the day with managing new appointments
            </p>
          </section>

          <section className="admin-stat">
            <StatCard
              type="appointments"
              count={appointments.scheduledCount}
              label="Scheduled appointments"
              icon="/assets/icons/appointments.svg"
            />
            <StatCard
              type="pending"
              count={appointments.pendingCount}
              label="Pending appointments"
              icon="/assets/icons/pending.svg"
            />
            <StatCard
              type="cancelled"
              count={appointments.cancelledCount}
              label="Cancelled appointments"
              icon="/assets/icons/cancelled.svg"
            />
          </section>

          <DataTable columns={columns} data={appointments.documents} />
        </main>
      </div>
    </div>
  );
};

export default Admin;
