"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Doctor } from "@/types/appwrite.types";
import { formatPhoneNumberIntl } from "react-phone-number-input";

export const doctorcolumn: ColumnDef<Doctor>[] = [
  {
    header: "ID",
    cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <p className="text-14-medium min-w-[120px]">{row.original.name}</p>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const formattedPhone = formatPhoneNumberIntl(row.original.phone);
      return <p className="text-14-medium min-w-[120px]">{formattedPhone}</p>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <p className="text-14-medium min-w-[120px]">{row.original.email}</p>
    ),
  },
  {
    accessorKey: "specialization",
    header: "Speciality",
    cell: ({ row }) => (
      <p className="text-14-medium min-w-[120px]">
        {row.original.specialization}
      </p>
    ),
  },
];
