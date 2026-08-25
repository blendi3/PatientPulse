"use client";

import { useState, useMemo } from "react";
import StatCard from "@/components/StatCard";
import { DataTable } from "@/components/table/DataTable";
import { getColumns } from "@/components/table/columns";
import { getDoctorList } from "@/lib/actions/doctor.actions";
import { useEffect } from "react";
import { Doctor } from "@/types/appwrite.types";
import SearchBar from "@/components/SearchBar";
import AppointmentCalendar from "@/components/AppointmentCalendar";
import { Table2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminDashboardProps = {
  documents: any[];
  scheduledCount: number;
  pendingCount: number;
  cancelledCount: number;
};

const AdminDashboard = ({
  documents,
  scheduledCount,
  pendingCount,
  cancelledCount,
}: AdminDashboardProps) => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"table" | "calendar">("table");
  const [doctors, setDoctors] = useState<Doctor[]>([]);


  useEffect(() => {
  const fetchDoctors = async () => {
    const response = await getDoctorList();
    setDoctors(response.documents);
  };
  fetchDoctors();
}, []);

const filteredAppointments = useMemo(() => {
  const now = new Date();

  return documents.filter((appointment) => {
    const matchesQuery = appointment.patient?.name
      ?.toLowerCase()
      .includes(query.toLowerCase());

    const isPast = new Date(appointment.schedule) < now;

    let matchesStatus = true;
    if (statusFilter === "past") {
      matchesStatus = isPast;
    } else if (statusFilter === "all") {
      matchesStatus = !isPast;
    } else {
      matchesStatus = appointment.status === statusFilter && !isPast;
    }

    return matchesQuery && matchesStatus;
  });
}, [documents, query, statusFilter]);

  return (
    <>
      <section className="admin-stat">
        <StatCard
          type="appointments"
          count={scheduledCount}
          label="Scheduled appointments"
          icon="/assets/icons/appointments.svg"
        />
        <StatCard
          type="pending"
          count={pendingCount}
          label="Pending appointments"
          icon="/assets/icons/pending.svg"
        />
        <StatCard
          type="cancelled"
          count={cancelledCount}
          label="Cancelled appointments"
          icon="/assets/icons/cancelled.svg"
        />
      </section>

      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar
            query={query}
            setQuery={setQuery}
            placeholder="Search by patient name"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="shad-select-trigger w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
        <SelectContent className="shad-select-content">
  <SelectItem value="all">Upcoming</SelectItem>
  <SelectItem value="scheduled">Scheduled</SelectItem>
  <SelectItem value="pending">Pending</SelectItem>
  <SelectItem value="cancelled">Cancelled</SelectItem>
  <SelectItem value="past">Past</SelectItem>
</SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-dark-500 bg-dark-400 p-1 w-fit">
          <button
            onClick={() => setView("table")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-14-medium transition-colors",
              view === "table"
                ? "bg-green-500 text-white"
                : "text-dark-700 hover:text-white"
            )}
          >
            <Table2 className="size-4" />
            Table
          </button>
          <button
            onClick={() => setView("calendar")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-14-medium transition-colors",
              view === "calendar"
                ? "bg-green-500 text-white"
                : "text-dark-700 hover:text-white"
            )}
          >
            <CalendarDays className="size-4" />
            Calendar
          </button>
        </div>
      </section>

      {view === "table" ? (
       <DataTable columns={getColumns(doctors)} data={filteredAppointments} />
      ) : (
        <AppointmentCalendar appointments={filteredAppointments} />
      )}
    </>
  );
};

export default AdminDashboard;