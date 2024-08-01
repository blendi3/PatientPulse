import React, { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteButtonProps {
  id: string;
  title: string;
  description: string;
  deleteFunction: (id: string) => Promise<void>;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
  id,
  title,
  description,
  deleteFunction,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteFunction(id);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

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
            <DialogTitle className="capitalize">{title}</DialogTitle>
            <DialogDescription>
              {description} <strong>This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeleteButton;
