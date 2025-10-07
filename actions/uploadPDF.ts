"use server";

import { api } from "@/convex/_generated/api";
import convex from "@/lib/convexClient";
import { currentUser } from "@clerk/nextjs/server";
import { getFileDownloadUrl } from "./getFileDownloadUrl";

export async function uploadPDF(formData: FormData) {
  const user = await currentUser();

  if (!user) {
    return { success: false, message: "User not authenticated" };
  }

  try {
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "No file provided." };
    }
    // validating file type
    if (
      !file.type.includes("pdf") &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return { success: false, error: "Only PDF files are allowed." };
    }

    const uploadUrl = await convex.mutation(api.receipts.generateUploadUrl, {});

    // convert file to array buffer fro fetch API
    const arrayBuffer = await file.arrayBuffer();

    // upload the file to convex storage
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
      },
      body: new Uint8Array(arrayBuffer),
    });

    if (!uploadResponse.ok) {
      throw new Error(`File upload failed: ${uploadResponse.statusText}`);
    }

    const { storageId } = await uploadResponse.json();

    // Add receipt to the database
    const receiptId = await convex.mutation(api.receipts.storeReceipt, {
      userId: user.id,
      fileId: storageId,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
    });

    // Generate the file URL
    const fileUrl = await getFileDownloadUrl(storageId);

    // Trigger inngest agent flow...
    

    return {
      success: true,
      data: {
        receiptId,
        fileName: file.name,
      },
    };
  } catch (error) {
    console.log("Server action upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
