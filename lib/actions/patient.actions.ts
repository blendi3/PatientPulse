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
import { unstable_noStore as noStore } from "next/cache";

export const createuser = async (user: CreateUserParams & { password?: string }) => {
  try {
    const newUser = await users.create(
      ID.unique(),
      user.email,
      undefined,
      user.password || undefined,
      user.name
    );
    await users.updatePrefs(newUser.$id, { phone: user.phone });
    await users.updateLabels(newUser.$id, ["patient"]);
    return parseStringify(newUser);
  } catch (error: any) {
    console.error("Error in createuser:", error);
    if (error && error?.code === 409) {
      const documents = await users.list([Query.equal("email", [user.email])]);
      return documents?.users[0];
    }
    throw error;
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
        identificationDocumentUrl: file
  ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`
  : null,
        ...patient,
      }
    );

    revalidatePath("/patientstask");
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

    const patientsWithUserDetails = await Promise.all(
      patients.documents.map(async (doc) => {
        const user = await getUser(doc.userId); // Assuming each patient document has a userId field
        return {
          ...doc,
          user: {
            name: user.name,
            phone: (user as any).prefs?.phone,
            email: user.email,
          },
        };
      })
    );

    const uniquePatients = patientsWithUserDetails.filter(
      (patient, index, self) =>
        index ===
        self.findIndex(
          (p) =>
            p.user.name === patient.user.name &&
            p.user.phone === patient.user.phone
        )
    );

    return parseStringify(uniquePatients);
  } catch (error) {
    console.error("Error fetching patients:", error);
  }
};


export const getPatientById = async (patientId: string) => {
  noStore();
  try {
    const patient = await databases.getDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId
    );

    const user = await getUser(patient.userId);

    return parseStringify({
      ...patient,
      user: {
        name: user.name,
        email: user.email,
        phone: (user as any).prefs?.phone,
      },
    });
  } catch (error) {
    console.error("Error fetching patient by ID:", error);
    return null;
  }
};

export const updatePatient = async (
  patientId: string,
  userId: string,
  currentValues: {
    name: string;
    email: string;
    phone?: string;
  },
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    occupation?: string;
    emergencyContactName?: string;
    emergencyContactNumber?: string;
    allergies?: string;
    currentMedication?: string;
    identificationType?: string;
    identificationNumber?: string;
  }
) => {
  try {
    if (updates.name && updates.name !== currentValues.name) {
      await users.updateName(userId, updates.name);
    }

    if (updates.email && updates.email !== currentValues.email) {
      await users.updateEmail(userId, updates.email);
    }

    if (updates.phone && updates.phone !== currentValues.phone) {
      await users.updatePrefs(userId, { phone: updates.phone });
    }

    const patientUpdates: Record<string, string> = {};
    [
      "address",
      "occupation",
      "emergencyContactName",
      "emergencyContactNumber",
      "allergies",
      "currentMedication",
      "identificationType",
      "identificationNumber",
    ].forEach((key) => {
      if (updates[key as keyof typeof updates]) {
        patientUpdates[key] = updates[key as keyof typeof updates] as string;
      }
    });

    if (Object.keys(patientUpdates).length > 0) {
      await databases.updateDocument(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        patientId,
        patientUpdates
      );
    }

    revalidatePath(`/patientstask/${patientId}`);
    revalidatePath("/patientstask");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating patient:", error);
    return { success: false, error: error?.message || "Failed to update patient." };
  }
};

export const setPatientPassword = async (userId: string, password: string) => {
  try {
    await users.updatePassword(userId, password);
    console.log("PASSWORD UPDATED FOR:", userId);

    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );

    if (patients.documents[0]) {
      const updateResult = await databases.updateDocument(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        patients.documents[0].$id,
        { hasPassword: true }
      );
    } else {
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error setting patient password:", error);
    return { success: false, error: error?.message || "Failed to set password." };
  }
};


export const resetPatientPasswordByEmail = async (email: string) => {
  try {
    const documents = await users.list([Query.equal("email", [email])]);
    const user = documents?.users[0];

    if (!user) {
      return { success: false, error: "No account found with that email." };
    }

    const tempPassword = Math.random().toString(36).slice(-10) + "A1!";
    await users.updatePassword(user.$id, tempPassword);

    return { success: true, tempPassword, name: user.name };
  } catch (error: any) {
    console.error("Error resetting patient password:", error);
    return { success: false, error: error?.message || "Failed to reset password." };
  }
};
