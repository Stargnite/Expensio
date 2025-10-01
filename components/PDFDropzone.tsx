"use client";

import { useUser } from "@clerk/clerk-react";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSchematicEntitlement } from "@schematichq/schematic-react";

function PDFDropzone() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles\
    , setUploadedFiles] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  //   const [canUpload, setCanUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const user = useUser();
  const {
    value: isFeatureEnabled,
    featureUsageExceeded,
    featureUsage,
    featureAllocation,
  } = useSchematicEntitlement("scans");

  //   console.log("Feature is enabled>>>>>", isFeatureEnabled);
  //   console.log("Feature is exceeded>>>>>", featureUsageExceeded);
  //   console.log("Feature is usage>>>>>", featureUsage);
  //   console.log("Feature is allow>>>>>", featureAllocation);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      if (!user) {
        alert("Please sign in to upload files.");
        return;
      }

      const fileArray = Array.from(files);
      const pdfFiles = fileArray.filter(
        (file) =>
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf"),
      );

      setIsUploading(true);
      try {
        // Uploadinf files logic
        const newUploadedFiles: string[] = [];

        for (const file of pdfFiles) {
          const formData = new FormData();
          formData.append("file", file);

          const result = await uploadPDF(formData);

          if (!result.success) {
            throw new Error(result.error || "Upload failed");
          }
          newUploadedFiles.push(file.name);
        }
        setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);

        // Clear files list after 5 seconds
        setTimeout(() => {
          setUploadedFiles([]);
        }, 5000);

        router.push("/receipts");
      } catch (error) {
        console.error("Upload error:", error);
        alert(`An error occurred during upload. Please try again.`);
      } finally {
        setIsUploading(false);
      }
    },
    [user, router],
  );

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingOver(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingOver(false);
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);

      if (!user) {
        alert("Please sign in to upload files.");
        return;
      }

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [user, handleUpload],
  );

  //   const canUpload = isUserSignedIn && isFeatureEnabled;
  const canUpload = true;

  return (
    <DndContext sensors={sensors}>
      <div className="w-full max-w-md mx-auto ">
        <div
          onDragOver={canUpload ? handleDragOver : undefined}
          onDragLeave={canUpload ? handleDragLeave : undefined}
          onDrop={canUpload ? handleDrop : (e) => e.preventDefault()}
          className={`border-2 roulded-lg border-dashed p-8 text-center transition-colors
            ${isDraggingOver ? "border-blue-500 bg-blue-50" : "border-gray-300"}
            ${!canUpload ? "opacity-70 cursor-not-allowed" : ""}`}
        ></div>
      </div>
    </DndContext>
  );
}

export default PDFDropzone;
