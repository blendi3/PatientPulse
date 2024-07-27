"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addSpecialization } from "@/lib/actions/doctor.actions"; // Import your function
import { Input } from "./ui/input";
import CostumFormField from "./CostumFormField";
import { FormFieldType } from "./forms/PatientForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { NewRoleFormValidation } from "@/lib/validation";
import { z } from "zod";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SubmitButton from "./SubmitButton";

type FormValues = z.infer<typeof NewRoleFormValidation>;

const NewRole = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(NewRoleFormValidation),
    defaultValues: {
      name: "",
    },
  });

  const { handleSubmit, reset, control } = form;

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await addSpecialization(values.name);
      toast.success("Specialization added successfully!");
      reset(); // Clear the form
      setIsOpen(false); // Close the dialog
    } catch (error) {
      console.error("Error adding specialization:", error);
      toast.error("Failed to add specialization.");
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} className="shad-primary-btn">
          Add New Specialization
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog sm:max-w-md">
        <DialogHeader className="mb-2">
          <DialogTitle>Add New Specialization</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the name of the new specialization you want to add.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1">
            <CostumFormField
              fieldType={FormFieldType.INPUT}
              control={control}
              name="name"
              label="Specialization Name"
              placeholder="Enter specialization name"
            />
            <SubmitButton isLoading={isLoading}>Save</SubmitButton>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default NewRole;
