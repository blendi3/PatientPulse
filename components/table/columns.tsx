"use client";

import { ColumnDef } from "@tanstack/react-table";

import StatusBadge from "../StatusBadge";
import { formatDateTime } from "@/lib/utils";
import { Doctors } from "@/constants";
import Image from "next/image";
import AppointmentModal from "../AppointmentModal";
import { Appointment } from "@/types/appwrite.types";
import DeleteButton from "../DeleteButton";

export const columns: ColumnDef<Appointment>[] = [
  {
    header: "ID",
    cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>,
  },
  {
    accessorKey: "patient",
    header: "Patient",
    cell: ({ row }) => (
      <p className="text-14-medium">{row.original.patient.name}</p>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <div className="min-w-[115px]">
          <StatusBadge status={row.original.status} />
        </div>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: "Appointment",
    cell: ({ row }) => {
      // Directly check if schedule exists
      if (row.original.schedule) {
        const formattedDate = formatDateTime(row.original.schedule).dateTime;
        return <p className="text-14-regular min-w-[100px]">{formattedDate}</p>;
      } else {
        // Handle the case where schedule is undefined
        console.log("Schedule is undefined for row:", row);
        return (
          <p className="text-14-regular min-w-[100px]">Date not available</p>
        );
      }
    },
  },
  {
    accessorKey: "primaryPhysician",
    header: () => "Doctor",
    cell: ({ row }) => {
      const doctor = Doctors.find(
        (doc) => doc.name === row.original.primaryPhysician
      );

      return (
        <div className="flex items-center gap-2">
          <Image
            src={doctor?.image || ""}
            alt={doctor?.name || ""}
            width={100}
            height={100}
            className="size-8"
          />
          <p className="whitespace-nowrap">Dr. {doctor?.name}</p>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row: { original: data } }) => {
      return (
        <div className="flex gap-4">
          <AppointmentModal
            type="schedule"
            patientId={data.patient.$id}
            userId={data.userId}
            appointment={data}
          />
          <AppointmentModal
            type="cancel"
            patientId={data.patient.$id}
            userId={data.userId}
            appointment={data}
          />
          <DeleteButton appointmentId={data.$id} />
        </div>
      );
    },
  },
];
