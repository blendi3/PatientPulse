import React, { useState } from "react";
import { Button } from "./ui/button";
import { deleteAppointment } from "@/lib/actions/appointment.actions";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DeleteButton = ({ appointmentId }: { appointmentId: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  async function handleDeleteAppointment(appointmentId: string) {
    try {
      await deleteAppointment(appointmentId);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to delete appointment:", error);
    }
  }

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="danger" onClick={() => setIsOpen(true)}>
            <Image
              src="/assets/icons/delete.svg"
              height={24}
              width={24}
              alt="delete"
              className="min-w-[24px] min-h-[24px]"
            />
          </Button>
        </DialogTrigger>
        <DialogContent className="shad-dialog sm:max-w-md">
          <DialogHeader className="mb-4 space-y-3">
            <DialogTitle className="capitalize">Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you are willing to delete this appointment?{" "}
              <strong>This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="danger"
            onClick={() => handleDeleteAppointment(appointmentId)}
          >
            Delete Appointment
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeleteButton;
