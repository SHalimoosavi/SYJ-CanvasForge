import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getExtension,
  isMimeConsistent,
  validateBasics,
  verifyIntegrity,
} from "@/services/fileValidation";
import { extensionToKind } from "@/services/fileValidation";
import { useUploadStore } from "@/store/uploadStore";
import { toast } from "@/store/toastStore";

const ROUTE_BY_KIND: Record<string, string> = {
  pdf: "/pdf",
  image: "/image",
  document: "/document",
};

export interface IngestProgress {
  fileName: string;
  status: "validating" | "done" | "error";
}

export function useFileIngest() {
  const addFile = useUploadStore((state) => state.addFile);
  const navigate = useNavigate();
  const [isIngesting, setIsIngesting] = useState(false);
  const [progress, setProgress] = useState<IngestProgress[]>([]);

  const ingest = useCallback(
    async (fileList: FileList | File[], options?: { navigateOnFirst?: boolean }) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      setIsIngesting(true);
      setProgress(files.map((f) => ({ fileName: f.name, status: "validating" })));

      let firstAccepted: { kind: string } | null = null;
      let acceptedCount = 0;

      for (const file of files) {
        const basics = validateBasics(file);
        if (!basics.valid) {
          toast.error("File rejected", basics.error);
          setProgress((prev) =>
            prev.map((p) => (p.fileName === file.name ? { ...p, status: "error" } : p)),
          );
          continue;
        }

        const extension = getExtension(file.name);
        if (!extension) {
          toast.error("Unsupported file type", `"${file.name}" cannot be processed.`);
          continue;
        }

        if (!isMimeConsistent(file, extension)) {
          toast.warning(
            "File type mismatch",
            `"${file.name}"'s content type doesn't match its extension. Proceeding with caution.`,
          );
        }

        const integrity = await verifyIntegrity(file, extension);
        if (!integrity.valid) {
          toast.error("File rejected", integrity.error);
          setProgress((prev) =>
            prev.map((p) => (p.fileName === file.name ? { ...p, status: "error" } : p)),
          );
          continue;
        }

        try {
          await addFile(file, extension);
          acceptedCount += 1;
          const kind = extensionToKind(extension);
          if (!firstAccepted) firstAccepted = { kind };
          setProgress((prev) =>
            prev.map((p) => (p.fileName === file.name ? { ...p, status: "done" } : p)),
          );
        } catch {
          toast.error("Upload failed", `Could not read "${file.name}".`);
          setProgress((prev) =>
            prev.map((p) => (p.fileName === file.name ? { ...p, status: "error" } : p)),
          );
        }
      }

      setIsIngesting(false);

      if (acceptedCount > 0) {
        toast.success(
          `${acceptedCount} file${acceptedCount > 1 ? "s" : ""} ready`,
          "Opening the editor…",
        );
        if (options?.navigateOnFirst !== false && firstAccepted) {
          navigate(ROUTE_BY_KIND[firstAccepted.kind] ?? "/");
        }
      }
    },
    [addFile, navigate],
  );

  return { ingest, isIngesting, progress };
}
