"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Appointment, Doctor } from "@/types/appwrite.types";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import Link from "next/link";
import { Eye, CheckCircle2, XCircle } from "lucide-react";
import ResetPatientPasswordButton from "@/components/ResetPatientPasswordButton";

export const patientscolum: ColumnDef<Appointment>[] = [
  {
    header: "ID",
    cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>,
  },
  {
    accessorKey: "user",
    header: "Patient",
    cell: ({ row }) => (
      <p className="text-14-medium min-w-[90px]">{row.original.user.name}</p>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.original.user.phone;
      return (
        <p className="text-14-medium min-w-[90px]">
          {phone ? formatPhoneNumberIntl(phone) : "—"}
        </p>
      );
    },
  },
  {
    accessorKey: "hasPassword",
    header: "Account",
    cell: ({ row }) => {
      const hasAccount = (row.original as any).hasPassword;
      return hasAccount ? (
        <span className="flex items-center gap-1 text-12-medium text-green-500">
          <CheckCircle2 className="size-3.5" />
          Active
        </span>
      ) : (
        <span className="flex items-center gap-1 text-12-medium text-dark-700">
          <XCircle className="size-3.5" />
          None
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Link
          href={`/patientstask/${row.original.$id}`}
          className="flex items-center gap-1 text-14-regular text-green-500 hover:text-green-400"
        >
          <Eye className="size-4" />
          View
        </Link>
        {(row.original as any).hasPassword && (
          <ResetPatientPasswordButton
            email={row.original.user.email}
            patientName={row.original.user.name}
          />
        )}
      </div>
    ),
  },
];