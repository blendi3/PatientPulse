"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Appointment, Doctor } from "@/types/appwrite.types";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import Link from "next/link";
import { Eye } from "lucide-react";

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
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <p className="text-14-medium min-w-[90px]">{row.original.user.email}</p>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Link
        href={`/patientstask/${row.original.$id}`}
        className="flex items-center gap-1 text-14-regular text-green-500 hover:text-green-400"
      >
        <Eye className="size-4" />
        View
      </Link>
    ),
  },
];