"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Appointment, Doctor } from "@/types/appwrite.types";

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
    cell: ({ row }) => (
      <p className="text-14-medium min-w-[90px]">{row.original.user.phone}</p>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <p className="text-14-medium min-w-[90px]">{row.original.user.email}</p>
    ),
  },
];
