"use server";

import { ID } from "node-appwrite";
import {
  DOCTOR_COLLECTION_ID,
  DATABASE_ID,
  databases,
  BUCKET_ID,
  storage,
} from "../appwrite.config";

import { parseStringify } from "../utils";
import { Doctor } from "@/types/appwrite.types";

export const addDoctor = async (doctor: Doctor) => {
  try {
    let imageUrl = "";

    console.log("Doctor object received:", doctor); // Log the doctor object

    if (doctor.image) {
      const uploadedImage = await uploadImage(doctor.image);
      imageUrl = uploadedImage.$id;
      console.log("Uploaded Image URL:", imageUrl); // Log the uploaded image URL
    }

    const newDoctor = await databases.createDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      ID.unique(),
      { ...doctor, image: imageUrl }
    );

    console.log("New Doctor created:", newDoctor); // Log the new doctor object

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
      []
    );

    return parseStringify(doctors);
  } catch (error) {
    console.log(error);
  }
};

export const uploadImage = async (image: string): Promise<any> => {
  try {
    console.log("Received image:", image); // Log the received image data

    const buffer = Buffer.from(image, "base64");
    console.log("Buffer created:", buffer); // Log the buffer object

    const file = new File([buffer], "image.jpg", { type: "image/jpeg" });
    console.log("File created:", file); // Log the file object

    const uploadedImage = await storage.createFile(
      BUCKET_ID!,
      ID.unique(),
      file
    );

    console.log("Uploaded Image:", uploadedImage); // Log the uploaded image object

    return parseStringify(uploadedImage);
  } catch (error) {
    console.error("Upload Image error", error);
  }
};
