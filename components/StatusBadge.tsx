import { StatusIcon } from "@/constants";
import clsx from "clsx";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import React from "react";

const StatusBadge = ({ status }: { status: Status }) => {
  return (
    <div
      className={clsx("status-badge", {
        "bg-green-600": status === "scheduled",
        "bg-blue-600": status === "pending",
        "bg-red-600": status === "cancelled",
        "bg-gray-600": status === "completed",
      })}
    >
      {status === "completed" ? (
        <CheckCircle2 className="h-fit w-3 text-gray-300" />
      ) : (
        <Image
          src={StatusIcon[status]}
          height={24}
          width={24}
          alt={status}
          className="h-fit w-3"
        />
      )}
      <p
        className={clsx("text-12-semibold capitalize", {
          "text-green-500": status === "scheduled",
          "text-blue-500": status === "pending",
          "text-red-500": status === "cancelled",
          "text-gray-400": status === "completed",
        })}
      >
        {status}
      </p>
    </div>
  );
};
export default StatusBadge;