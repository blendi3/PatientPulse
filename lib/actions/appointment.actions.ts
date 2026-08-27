"use server";

import { ID, Query } from "node-appwrite";
import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  DOCTOR_COLLECTION_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";

export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );

    revalidatePath("/admin");
    return parseStringify(newAppointment);
  } catch (error) {
    console.log(error);
  }
};

export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    console.log(error);
  }
};

export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
            [Query.orderAsc("schedule")]
    );

    if (appointments.total === 0) {
      return {
        totalCount: 0,
        scheduledCount: 0,
        pendingCount: 0,
        cancelledCount: 0,
        documents: [],
      };
    }

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        if (appointment.status === "scheduled") {
          acc.scheduledCount += 1;
        } else if (appointment.status === "pending") {
          acc.pendingCount += 1;
        } else if (appointment.status === "cancelled") {
          acc.cancelledCount += 1;
        }
        return acc;
      },
      initialCounts
    );

    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    };

    return parseStringify(data);
  } catch (error) {
    console.log(error);
    return {
      totalCount: 0,
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      documents: [],
    };
  }
};

export const getBookedSchedules = async () => {
  try {
    const schedules = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderAsc("schedule")]
    );

    return schedules.documents.map((schedule) => schedule.schedule);
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const deleteAppointment = async (appointmentId: string) => {
  try {
    await databases.deleteDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );
    revalidatePath("/admin");
  } catch (error) {
    console.log("Error deleting appointment:", error);
  }
};

export const updateAppointment = async ({
  userId,
  appointmentId,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );

    if (!updatedAppointment) {
      throw new Error("Appointment not found");
    }

    const smsMessage = `
    Hi, it's PatientPulse.
     ${
       type === "schedule"
         ? `Your appointment has been scheduled for ${
             formatDateTime(appointment.schedule!).dateTime
           } with Dr. ${appointment.primaryPhysician}`
         : `We regret to inform you that your appointment has been cancelled for the following reason: ${appointment.cancellationReason}`
     }.
    `;

    await sendSMSNotification(userId, smsMessage);

    revalidatePath("/admin");
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.log(error);
  }
};

export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );

    return parseStringify(message);
  } catch (error) {
    console.log(error);
  }
};

export const getAppointmentsByDoctorId = async (doctorId: string) => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.equal("doctorId", doctorId), Query.orderAsc("schedule")]
    );

    return parseStringify(appointments.documents);
  } catch (error) {
    console.error("Error fetching doctor's appointments:", error);
    return [];
  }
};

export const backfillDoctorIds = async () => {
  try {
    const doctorsResponse = await databases.listDocuments(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!
    );
    const doctors = doctorsResponse.documents;

    const appointmentsResponse = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.limit(100)]
    );

    let updated = 0;

    for (const appt of appointmentsResponse.documents) {
      if (!appt.doctorId && appt.primaryPhysician) {
        const matchedDoctor = doctors.find(
          (doc) => doc.name === appt.primaryPhysician
        );
        if (matchedDoctor) {
          await databases.updateDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            appt.$id,
            { doctorId: matchedDoctor.$id }
          );
          updated++;
        }
      }
    }

    return { success: true, updated };
  } catch (error: any) {
    console.error("Error backfilling doctorIds:", error);
    return { success: false, error: error?.message };
  }
};

export const markAppointmentComplete = async (appointmentId: string, treatmentNotes: string) => {
  try {
    const updated = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      { status: "completed", treatmentNotes }
    );

    return { success: true, appointment: parseStringify(updated) };
  } catch (error: any) {
    console.error("Error marking appointment complete:", error);
    return { success: false, error: error?.message };
  }
};

export const getTreatmentHistoryForPatient = async (patientId: string) => {
  noStore();
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal("patient", patientId),
        Query.equal("status", "completed"),
        Query.orderDesc("schedule"),
      ]
    );
    return parseStringify(appointments.documents);
  } catch (error: any) {
    console.error("Error fetching treatment history:", error);
    return [];
  }
};


export const getAllAppointmentsForPatient = async (patientId: string) => {
  noStore();
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal("patient", patientId),
        Query.orderDesc("schedule"),
      ]
    );
    return parseStringify(appointments.documents);
  } catch (error: any) {
    console.error("Error fetching patient appointments:", error);
    return [];
  }
};

export const cancelAppointmentBySelf = async (appointmentId: string, reason: string) => {
  try {
    const updated = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      { status: "cancelled", cancellationReason: reason }
    );
    return { success: true, appointment: parseStringify(updated) };
  } catch (error: any) {
    console.error("Error cancelling appointment:", error);
    return { success: false, error: error?.message };
  }
};

export const setAppointmentReleased = async (appointmentId: string, isReleased: boolean) => {
  try {
    await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      { isReleased }
    );
    return { success: true };
  } catch (error: any) {
    console.error("Error updating release status:", error);
    return { success: false, error: error?.message };
  }
};
