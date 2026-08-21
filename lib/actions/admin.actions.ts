"use server";

import { ID } from "node-appwrite";
import { users } from "../appwrite.config";

export const createAdmin = async (
  email: string,
  password: string,
  name: string,
  role: "admin" | "mvp"
) => {
  try {
    const newUser = await users.create(
      ID.unique(),
      email,
      undefined,
      password,
      name
    );

    await users.updateLabels(newUser.$id, [role]);

    return { success: true, user: newUser };
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return { success: false, error: error?.message || "Failed to create admin." };
  }
};
