"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Appointment, Doctor } from "@/types/appwrite.types";
import DeleteButton from "../DeleteButton";
import { deletePatient } from "@/lib/actions/patient.actions";

export const patientscolum: ColumnDef<Appointment>[] = [
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
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DeleteButton
        id={row.original.$id}
        title="Delete Patient"
        description="Are you sure you want to delete this patient?"
        deleteFunction={deletePatient}
      />
    ),
  },
];
