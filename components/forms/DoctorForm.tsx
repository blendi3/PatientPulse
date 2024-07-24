"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl } from "@/components/ui/form";
import CostumFormField from "@/components/CostumFormField";
import SubmitButton from "../SubmitButton";
import { useState } from "react";
import { DoctorFormValidation } from "@/lib/validation";
import { addDoctor } from "@/lib/actions/doctor.actions";
import { FormFieldType } from "./PatientForm";
import FileUploader from "../FileUploader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DoctorForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  // const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof DoctorFormValidation>>({
    resolver: zodResolver(DoctorFormValidation),
    defaultValues: {
      name: "",
      email: "",
      yearsOfExperience: "",
      phone: "",
      image: undefined,
    },
  });

  async function onSubmit({
    name,
    email,
    yearsOfExperience,
    phone,
    image,
  }: z.infer<typeof DoctorFormValidation>) {
    setIsLoading(true);

    try {
      const doctorData = {
        name,
        email,
        yearsOfExperience,
        phone,
        image,
      };
      console.log("Submitting Doctor Data:", doctorData);
      // @ts-ignore
      await addDoctor(doctorData);
      toast.success("Doctor registered successfully!");
      form.reset();
    } catch (error) {
      console.log(error);
      toast.error("Failed to register doctor. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
          <h1 className="header">Doctor Information</h1>
          <p className="text-dark-700">
            Fill in the details of the doctor you want to register
          </p>
        </section>

        <div className="flex flex-col gap-6 xl:flex-row">
          <CostumFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="name"
            label="Full Name"
            placeholder="Dr. John Doe"
            iconSrc="/assets/icons/user.svg"
            iconAlt="user"
          />
          <CostumFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="email"
            label="Email"
            placeholder="dr.johndoe@gmail.com"
            iconSrc="/assets/icons/email.svg"
            iconAlt="email"
          />
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          <CostumFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="yearsOfExperience"
            label="Years of Experience"
            placeholder="10"
            iconSrc="/assets/icons/experiencte.svg"
            iconAlt="experience"
          />
          <CostumFormField
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            name="phone"
            label="Phone Number"
            placeholder="(383) 123 456 789"
          />
        </div>

        <CostumFormField
          fieldType={FormFieldType.SKELETON}
          control={form.control}
          name="image"
          label="Identification Image(not working still on progress)"
          renderSkeleton={(field) => (
            <FormControl>
              <FileUploader files={field.value} onChange={field.onChange} />
            </FormControl>
          )}
        />

        <SubmitButton isLoading={isLoading}>Register Doctor</SubmitButton>
      </form>
    </Form>
  );
};

export default DoctorForm;