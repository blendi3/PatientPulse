"use server";

import { APPOINTMENT_COLLECTION_ID } from "../appwrite.config";
import { ID, Query } from "node-appwrite";
import {
  DOCTOR_COLLECTION_ID,
  DATABASE_ID,
  databases,
  BUCKET_ID,
  storage,
  SPECIALIZATION_COLLECTION_ID,
} from "../appwrite.config";

import { parseStringify } from "../utils";
import { Doctor } from "@/types/appwrite.types";
import { revalidatePath } from "next/cache";

export const addDoctor = async (doctor: Doctor) => {
  try {
    let imageUrl = "";

    console.log("Doctor object received:", doctor);

    if (doctor.image) {
      const uploadedImage = await uploadImage(doctor.image);
      imageUrl = uploadedImage.$id;
      console.log("Uploaded Image URL:", imageUrl);
    }

    const newDoctor = await databases.createDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      ID.unique(),
      { ...doctor, image: imageUrl }
    );

    revalidatePath("/doctors");

    return parseStringify(newDoctor);
  } catch (error) {
    console.error("Error in addDoctor:", error);
  }
};

export const getDoctorList = async () => {
  try {
    const doctors = await databases.listDocuments(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    return parseStringify(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return { documents: [] };
  }
};

export const getDoctorsBySpecialization = async (specialization?: string) => {
  try {
    const allDoctorsResponse = await getDoctorList();
    const allDoctors = allDoctorsResponse.documents;

    if (!specialization) {
      return allDoctors;
    }

    return allDoctors.filter(
      (doctor: Doctor) => doctor.specialization === specialization
    );
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getSpecializationList = async () => {
  try {
    const doctors = await databases.listDocuments(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      []
    );

    const specializations = Array.from(
      new Set(
        (doctors.documents as Doctor[]).map(
          (doctor: Doctor) => doctor.specialization
        )
      )
    );

    return specializations;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const deleteDoctor = async (doctorId: string) => {
  try {
    await databases.deleteDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId
    );

    revalidatePath("/doctors");
  } catch (error) {
    console.error("Error in deleteDoctor:", error);
  }
};

export const getCreatedRoles = async () => {
  try {
    const specializationsResponse = await databases.listDocuments(
      DATABASE_ID!,
      SPECIALIZATION_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    const specializations = specializationsResponse.documents.map(
      (doc: any) => doc.name
    );

    return specializations;
  } catch (error) {
    console.error("Error fetching specializations:", error);
    return [];
  }
};

export const addSpecialization = async (specializationName: string) => {
  try {
    if (!specializationName || specializationName.trim() === "") {
      throw new Error("Specialization name is required.");
    }

    const newSpecialization = await databases.createDocument(
      DATABASE_ID!,
      SPECIALIZATION_COLLECTION_ID!,
      ID.unique(),
      { name: specializationName }
    );

    console.log("New Specialization created:", newSpecialization);
    return parseStringify(newSpecialization);
  } catch (error) {
    console.error("Error in addSpecialization:", error);
    throw error;
  }
};
export const uploadImage = async (image: string): Promise<any> => {
  try {
    const buffer = Buffer.from(image, "base64");
    const file = new File([buffer], "image.jpg", { type: "image/jpeg" });

    const uploadedImage = await storage.createFile(
      BUCKET_ID!,
      ID.unique(),
      file
    );

    return parseStringify(uploadedImage);
  } catch (error) {
    console.error("Upload Image error", error);
    throw error;
  }
};

export const updateDoctor = async (
  doctorId: string,
  oldName: string,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    specialization?: string;
    image?: string;
  }
) => {
  try {
    let imageUrl;

    if (updates.image) {
      const uploadedImage = await uploadImage(updates.image);
      imageUrl = uploadedImage.$id;
    }

    const updatedDoctor = await databases.updateDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId,
      {
        ...(updates.name && { name: updates.name }),
        ...(updates.email && { email: updates.email }),
        ...(updates.phone && { phone: updates.phone }),
        ...(updates.specialization && { specialization: updates.specialization }),
        ...(imageUrl && { image: imageUrl }),
      }
    );

    if (updates.name && updates.name !== oldName) {
      const affectedAppointments = await databases.listDocuments(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        [Query.equal("primaryPhysician", oldName)]
      );

      await Promise.all(
        affectedAppointments.documents.map((appt) =>
          databases.updateDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            appt.$id,
            { primaryPhysician: updates.name }
          )
        )
      );
    }

    return { success: true, doctor: parseStringify(updatedDoctor) };
  } catch (error: any) {
    console.error("Error in updateDoctor:", error);
    return { success: false, error: error?.message || "Failed to update doctor." };
  }
};

