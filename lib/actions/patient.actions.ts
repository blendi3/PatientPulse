"use server";

import { ID, Query } from "node-appwrite";
import {
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  databases,
  storage,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";
import { InputFile } from "node-appwrite/file";
import { revalidatePath } from "next/cache";

export const createuser = async (user: CreateUserParams) => {
  try {
    const newUser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );

    return parseStringify(newUser);
  } catch (error: any) {
    if (error && error?.code === 409) {
      const documents = await users.list([Query.equal("email", [user.email])]);

      return documents?.users[0];
    }
  }
};

export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);

    return parseStringify(user);
  } catch (error) {
    console.log(error);
  }
};

export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    let file;

    if (identificationDocument) {
      const inputFile = InputFile.fromBuffer(
        identificationDocument?.get("blobfile") as Blob,
        identificationDocument?.get("fileName") as string
      );

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id || null,
        identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
        ...patient,
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.log(error);
  }
};

export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );

    return parseStringify(patients.documents[0]); // Ensure you're getting the first patient
  } catch (error) {
    console.log(error);
  }
};

export const getPatients = async () => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    if (patients.total === 0) {
      return {
        totalCount: 0,
        documents: [],
      };
    }

    const userMap = new Map<string, any>();

    const patientsWithUserDetails = await Promise.all(
      patients.documents.map(async (doc) => {
        const user = await getUser(doc.userId); // Assuming each patient document has a userId field
        const userKey = `${user.name}-${user.phone}`;

        if (!userMap.has(userKey)) {
          userMap.set(userKey, {
            name: user.name,
            phone: user.phone,
            email: user.email,
          });
        }

        return {
          ...doc,
          user: userMap.get(userKey),
        };
      })
    );

    // Filter out duplicate users
    const uniquePatients = Array.from(userMap.values()).map((user) => {
      return patientsWithUserDetails.find(
        (patient) =>
          patient.user.name === user.name && patient.user.phone === user.phone
      );
    });

    const data = {
      totalCount: patients.total,
      documents: uniquePatients,
    };

    return parseStringify(data);
  } catch (error) {
    console.log(error);
    return {
      totalCount: 0,
      documents: [],
    };
  }
};

export const deletePatient = async (patientId: string) => {
  try {
    await databases.deleteDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId
    );
    revalidatePath("/patientstask");
  } catch (error) {
    console.log(error);
  }
};
