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

export const getAdminList = async () => {
  try {
    const result = await users.list();
    const admins = result.users.filter(
      (user) =>
        user.labels?.includes("admin") || user.labels?.includes("mvp")
    );
    return { success: true, admins };
  } catch (error: any) {
    console.error("Error fetching admins:", error);
    return { success: false, admins: [] };
  }
};

export const deleteAdmin = async (userId: string) => {
  try {
    await users.delete(userId);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting admin:", error);
    return { success: false, error: error?.message || "Failed to delete admin." };
  }
};
