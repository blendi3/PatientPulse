"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CostumFormField from "@/components/CostumFormField";
import SubmitButton from "../SubmitButton";
import { useEffect, useState } from "react";
import { getAppointmentSchema } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { FormFieldType } from "./PatientForm";
import Image from "next/image";
import { SelectItem } from "../ui/select";
import {
  createAppointment,
  getBookedSchedules,
  updateAppointment,
} from "@/lib/actions/appointment.actions";
import { Appointment, Doctor } from "@/types/appwrite.types";
import {
  getDoctorList,
  getDoctorsBySpecialization,
  getSpecializationList,
} from "@/lib/actions/doctor.actions";

const AppointmentForm = ({
  userId,
  patientId,
  type,
  appointment,
  setIsOpen,
}: {
  userId: string;
  patientId: string;
  type: "create" | "cancel" | "schedule";
  appointment?: Appointment;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [bookedSchedules, setBookedSchedules] = useState<Date[]>([]);

  const AppointmentFormValidation = getAppointmentSchema(type);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const allDoctorsResponse = await getDoctorList();
        const allDoctors = allDoctorsResponse.documents; // Use documents array
        const filtered = allDoctors.filter(
          (doctor: Doctor) =>
            specializations.includes(doctor.specialization) &&
            doctor.specialization != null
        );
        setFilteredDoctors(filtered);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDoctors();
  }, [specializations]);

  useEffect(() => {
    const fetchSpecializations = async () => {
      const specializations = await getSpecializationList();
      setSpecializations(specializations);
    };
    fetchSpecializations();
  }, []);

  const handleSpecializationChange = async (specialization: string) => {
    const doctors = await getDoctorsBySpecialization(specialization);
    setFilteredDoctors(doctors);
  };

  useEffect(() => {
    const fetchBookedSchedules = async () => {
      try {
        const schedules = await getBookedSchedules();
        setBookedSchedules(
          schedules.map((schedule: any) => new Date(schedule))
        );
      } catch (error) {
        console.log(error);
      }
    };

    fetchBookedSchedules();
  }, []);

  const filterTimes = (time: Date) => {
    const selectedDate = form.getValues("schedule");
    const disabledTimes = bookedSchedules
      .filter((schedule) => {
        const scheduleDate = new Date(schedule);
        return scheduleDate.toDateString() === selectedDate.toDateString();
      })
      .map((schedule) => {
        const scheduleDate = new Date(schedule);
        return {
          hours: scheduleDate.getHours(),
          minutes: scheduleDate.getMinutes(),
        };
      });

    const isWithinWorkingHours = time.getHours() >= 9 && time.getHours() < 19;

    const isBooked = disabledTimes.some(
      (disabledTime) =>
        disabledTime.hours === time.getHours() &&
        disabledTime.minutes === time.getMinutes()
    );

    return isWithinWorkingHours && !isBooked;
  };

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: appointment?.primaryPhysician ?? "",
      schedule: appointment ? new Date(appointment.schedule) : new Date(),
      reason: appointment?.reason ?? "",
      note: appointment?.note ?? "",
      cancellationReason: appointment?.cancellationReason ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof AppointmentFormValidation>) {
    setIsLoading(true);

    let status;

    switch (type) {
      case "schedule":
        status = "scheduled";
        break;
      case "cancel":
        status = "cancelled";
        break;
      default:
        status = "pending";
        break;
    }

    try {
      if (type === "create" && patientId) {
        const appointmentData = {
          userId,
          patient: patientId,
          primaryPhysician: values.primaryPhysician,
          schedule: new Date(values.schedule),
          reason: values.reason!,
          status: status as Status,
          note: values.note,
        };

        const appointment = await createAppointment(appointmentData);

        if (appointment) {
          form.reset();
          router.push(
            `/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`
          );
        }
      } else {
        const appointmentToUpdate = {
          userId,
          appointmentId: appointment?.$id!,
          appointment: {
            primaryPhysician: values?.primaryPhysician,
            schedule: new Date(values?.schedule),
            status: status as Status,
            cancellationReason: values?.cancellationReason,
          },
          type,
        };

        const updatedAppointment = await updateAppointment(appointmentToUpdate);

        if (updatedAppointment) {
          setIsOpen && setIsOpen(false);
          form.reset();
        }
      }
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  }

  let buttonLabel;

  switch (type) {
    case "cancel":
      buttonLabel = "Cancel Appointment";
      break;
    case "create":
      buttonLabel = "Create Appointment";
      break;
    case "schedule":
      buttonLabel = "Schedule Appointment";
      break;
    default:
      break;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        {type === "create" && (
          <section className="mb-12 space-y-4">
            <h1 className="header">New Appointment</h1>
            <p className="text-dark-700">
              Request a new appointment in 10 seconds
            </p>
          </section>
        )}

        {type !== "cancel" && (
          <>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CostumFormField
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="specialization"
                label="Which Specialist Do You Need?"
                placeholder="Choose a specialty from the list"
                onChange={handleSpecializationChange} // Directly pass the handler
              >
                {specializations.map((specialization, i) => (
                  <SelectItem
                    className="hover:bg-dark-500 cursor-pointer"
                    key={i}
                    value={specialization}
                  >
                    {specialization}
                  </SelectItem>
                ))}
              </CostumFormField>

              <CostumFormField
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="primaryPhysician"
                label="Doctor"
                placeholder="Select a doctor"
              >
                {filteredDoctors.map((doctor) => (
                  <SelectItem
                    className="hover:bg-dark-500 cursor-pointer"
                    key={doctor.$id}
                    value={doctor.name}
                  >
                    <div className="flex cursor-pointer items-center gap-2">
                      <Image
                        src={doctor.image || "/assets/images/admin.png"}
                        width={32}
                        height={32}
                        alt="doctor"
                        className="rounded-full border border-dark-500"
                      />
                      <p>{doctor.name}</p>
                    </div>
                  </SelectItem>
                ))}
              </CostumFormField>
            </div>

            <CostumFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Expected appointment date"
              showTimeSelect
              dateFormat="dd/MM/yyyy - HH:mm"
              filterTime={filterTimes}
            />

            <div className="flex flex-col gap-6 xl:flex-row">
              <CostumFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="reason"
                label="Appointment reason"
                placeholder="Annual montly check-up"
              />
              <CostumFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="note"
                label="Comments/notes"
                placeholder="Prefer afternoon appointments, if possible"
              />
            </div>
          </>
        )}

        {type === "cancel" && (
          <CostumFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="Reason for cancellation"
            placeholder="Urgent meeting came up"
          />
        )}

        <SubmitButton
          isLoading={isLoading}
          className={`${
            type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"
          } w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};

export default AppointmentForm;
