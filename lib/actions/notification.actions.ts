"use server";

import { ID, Query } from "node-appwrite";
import { DATABASE_ID, NOTIFICATION_COLLECTION_ID, databases } from "../appwrite.config";
import { parseStringify } from "../utils";

export const createNotification = async (doctorId: string, message: string, type: string) => {
  try {
    const notification = await databases.createDocument(
      DATABASE_ID!,
      NOTIFICATION_COLLECTION_ID!,
      ID.unique(),
      { doctorId, message, type, isRead: false }
    );
    return parseStringify(notification);
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return null;
  }
};

export const getNotificationsForDoctor = async (doctorId: string) => {
  try {
    const notifications = await databases.listDocuments(
      DATABASE_ID!,
      NOTIFICATION_COLLECTION_ID!,
      [Query.equal("doctorId", doctorId), Query.orderDesc("$createdAt")]
    );
    return parseStringify(notifications.documents);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const markNotificationRead = async (notificationId: string) => {
  try {
    await databases.updateDocument(
      DATABASE_ID!,
      NOTIFICATION_COLLECTION_ID!,
      notificationId,
      { isRead: true }
    );
    return { success: true };
  } catch (error: any) {
    console.error("Error marking notification read:", error);
    return { success: false };
  }
};
