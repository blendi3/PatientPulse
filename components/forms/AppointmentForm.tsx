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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import { getImageUrl } from "@/lib/utils";

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
  const [isChangingDoctor, setIsChangingDoctor] = useState(false);
const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);

  const AppointmentFormValidation = getAppointmentSchema(type);

  useEffect(() => {
    const fetchSpecializations = async () => {
      const specializations = await getSpecializationList();
      setSpecializations(specializations);
    };
    fetchSpecializations();
  }, []);

  useEffect(() => {
  const fetchAllDoctors = async () => {
    const response = await getDoctorList();
    setAllDoctors(response.documents);
  };
  fetchAllDoctors();
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

  const watchedPhysician = form.watch("primaryPhysician");

const selectedDoctorForDate = [...filteredDoctors, ...allDoctors].find(
  (doc) => doc.name === watchedPhysician
);

const excludedDates = (selectedDoctorForDate?.unavailableDates || []).map(
  (d: string) => new Date(d)
);

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
      const selectedDoctor = [...filteredDoctors, ...allDoctors].find(
        (doc) => doc.name === values.primaryPhysician
      );

      if (selectedDoctor?.unavailableDates?.length) {
  const scheduleDateStr = new Date(values.schedule).toISOString().split("T")[0];
  if (selectedDoctor.unavailableDates.includes(scheduleDateStr)) {
    toast.error(
      `Dr. ${selectedDoctor.name} is unavailable on this date. Please choose another date or doctor.`
    );
    setIsLoading(false);
    return;
  }
}

      if (type === "create" && patientId) {
        const appointmentData = {
          userId,
          patient: patientId,
          primaryPhysician: values.primaryPhysician,
          doctorId: selectedDoctor?.$id,
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
            doctorId: selectedDoctor?.$id,
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

        {type === "create" && (
          <>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CostumFormField
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="specialization"
                label="Specialist?"
                placeholder="Choose a specialty from the list"
                onChange={handleSpecializationChange}
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
                        src={doctor.image ? getImageUrl(doctor.image) : "/assets/images/admin.png"}
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

            {selectedDoctorForDate?.unavailableDates?.length > 0 && (
  <p className="text-13-regular text-yellow-500 -mt-4">
    Dr. {selectedDoctorForDate.name} has {selectedDoctorForDate.unavailableDates.length} day{selectedDoctorForDate.unavailableDates.length > 1 ? "s" : ""} off coming up — those dates won't be available to book.
  </p>
)}

            <CostumFormField
            fieldType={FormFieldType.DATE_PICKER}
  control={form.control}
  name="schedule"
  label="Expected appointment date"
  showTimeSelect
  dateFormat="dd/MM/yyyy - HH:mm"
  filterTime={filterTimes}
  excludeDates={excludedDates}
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

{type === "schedule" && (
  <div className="space-y-4">
    {!isChangingDoctor ? (
      <div className="rounded-md border border-dark-500 bg-dark-400 p-4 flex items-center justify-between">
        <div>
          <p className="text-14-medium text-dark-700">Doctor</p>
          <p className="text-16-semibold text-white">
            Dr. {appointment?.primaryPhysician}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsChangingDoctor(true)}
          className="text-14-regular text-green-500 hover:text-green-400"
        >
          Change doctor
        </button>
      </div>
    ) : (
      <CostumFormField
        fieldType={FormFieldType.SELECT}
        control={form.control}
        name="primaryPhysician"
        label="Doctor"
        placeholder="Select a doctor"
      >
        {allDoctors.map((doctor) => (
          <SelectItem
            className="hover:bg-dark-500 cursor-pointer"
            key={doctor.$id}
            value={doctor.name}
          >
            <div className="flex cursor-pointer items-center gap-2">
              <Image
                src={doctor.image ? getImageUrl(doctor.image) : "/assets/images/admin.png"}
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
    )}

    <CostumFormField
      fieldType={FormFieldType.DATE_PICKER}
      control={form.control}
      name="schedule"
      label="Appointment date & time"
      showTimeSelect
      dateFormat="dd/MM/yyyy - HH:mm"
      filterTime={filterTimes}
    />
  </div>
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