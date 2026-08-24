"use client";

import { useState, useMemo } from "react";
import StatCard from "@/components/StatCard";
import { DataTable } from "@/components/table/DataTable";
import { columns } from "@/components/table/columns";
import SearchBar from "@/components/SearchBar";
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

  const filteredAppointments = useMemo(() => {
    return documents.filter((appointment) => {
      const matchesQuery = appointment.patient?.name
        ?.toLowerCase()
        .includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || appointment.status === statusFilter;
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
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <DataTable columns={columns} data={filteredAppointments} />
    </>
  );
};

export default AdminDashboard;