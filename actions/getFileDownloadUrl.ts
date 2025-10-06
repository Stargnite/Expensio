"use server";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import convex from "@/lib/convexClient";
import { err } from "inngest/types";

export async function getFileDownloadUrl(fileId: Id<"_storage"> | string) {
  try {
    // Get download URL from Convex action
    const downloadUrl = await convex.query(api.receipts.getReceiptDownloadUrl, {
      fileId: fileId as Id<"_storage">,
    });

    if (!downloadUrl) {
      throw new Error("Failed to get download URL");
    }

    return { success: true, downloadUrl };
  } catch (error) {
    console.error("Error generating download URL:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
