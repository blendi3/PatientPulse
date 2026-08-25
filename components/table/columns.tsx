"use client";

import { ColumnDef } from "@tanstack/react-table";

import StatusBadge from "../StatusBadge";
import { formatDateTime, getImageUrl } from "@/lib/utils";
import Image from "next/image";
import AppointmentModal from "../AppointmentModal";
import { Appointment, Doctor } from "@/types/appwrite.types";
import DeleteButton from "../DeleteButton";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import { Row } from "@tanstack/react-table";
import { deleteAppointment } from "@/lib/actions/appointment.actions";

const DoctorCell = ({
  row,
  doctors,
}: {
  row: Row<Appointment>;
  doctors: Doctor[];
}) => {
const doctor = doctors.find(
  (doc) => doc.$id === row.original.doctorId || doc.name === row.original.primaryPhysician
);
  return (
    <div className="flex items-center gap-2 min-w-[140px] max-w-[180px]">
      <Image
        src={doctor?.image ? getImageUrl(doctor.image) : "/assets/images/admin.png"}
        alt={doctor?.name || "Doctor"}
        width={100}
        height={100}
        className="size-8 shrink-0"
      />
      <p className="truncate" title={`Dr. ${doctor?.name}`}>
        Dr. {doctor?.name}
      </p>
    </div>
  );
};

export const getColumns = (doctors: Doctor[]): ColumnDef<Appointment>[] => [
  {
    header: "ID",
    cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>,
  },
  {
    accessorKey: "patient",
    header: "Patient",
    cell: ({ row }) => (
      <p className="text-14-medium min-w-[140px]">
        {row.original.patient.name}
      </p>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <div className="min-w-[120px]">
          <StatusBadge status={row.original.status} />
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const formattedPhone = formatPhoneNumberIntl(row.original.patient.phone);

      return <p className="text-14-medium min-w-[140px]">{formattedPhone}</p>;
    },
  },
  {
    accessorKey: "schedule",
    header: "Appointment",
    cell: ({ row }) => {
      if (row.original.schedule) {
        const formattedDate = formatDateTime(row.original.schedule).dateTime;
        return <p className="text-14-regular min-w-[140px]">{formattedDate}</p>;
      } else {
        return (
          <p className="text-14-regular min-w-[100px]">Date not available</p>
        );
      }
    },
  },
  {
    accessorKey: "primaryPhysician",
    header: () => "Doctor",
    cell: ({ row }) => <DoctorCell row={row} doctors={doctors} />,
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <p
        className="text-14-regular min-w-[140px] max-w-[200px] truncate"
        title={row.original.note ? `${row.original.reason} — ${row.original.note}` : row.original.reason}
      >
        {row.original.reason || "—"}
      </p>
    ),
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
          <DeleteButton
            id={data.$id}
            title="Delete Appointment"
            description="Are you sure you want to delete this appointment?"
            deleteFunction={deleteAppointment}
          />
        </div>
      );
    },
  },
];