"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import AppointmentForm from "./forms/AppointmentForm";
import { Appointment } from "@/types/appwrite.types";

const AppointmentModal = ({
  type,
  patientId,
  userId,
  appointment,
  open,
  onOpenChange,
  hideTrigger = false,
}: {
  type: "schedule" | "cancel";
  patientId: string;
  userId: string;
  appointment: Appointment;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className={`capitalize ${type === "schedule" && "text-green-500"}`}
          >
            {type}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className="shad-dialog sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle className="capitalize">{type} Appointment</DialogTitle>
          <DialogDescription>
            Please fill in the following details to {type} an appointment
          </DialogDescription>
        </DialogHeader>
        <AppointmentForm
          userId={userId}
          patientId={patientId}
          appointment={appointment}
          type={type}
          setIsOpen={setIsOpen}
        />
      </DialogContent>
    </Dialog>
  );
};
export default AppointmentModal;