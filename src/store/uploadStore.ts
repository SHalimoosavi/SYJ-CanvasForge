import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { SupportedExtension, UploadedFile } from "@/types";
import { extensionToKind } from "@/services/fileValidation";

interface UploadState {
  files: UploadedFile[];
  activeFileId: string | null;
  addFile: (file: File, extension: SupportedExtension) => Promise<UploadedFile>;
  removeFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  getFile: (id: string) => UploadedFile | undefined;
  updateFileData: (id: string, data: ArrayBuffer) => void;
  clear: () => void;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  files: [],
  activeFileId: null,

  addFile: async (file, extension) => {
    const data = await file.arrayBuffer();
    const objectUrl = URL.createObjectURL(file);
    const uploaded: UploadedFile = {
      id: uuid(),
      name: file.name,
      size: file.size,
      extension,
      mimeType: file.type,
      kind: extensionToKind(extension),
      addedAt: Date.now(),
      objectUrl,
      data,
    };
    set((state) => ({
      files: [...state.files, uploaded],
      activeFileId: uploaded.id,
    }));
    return uploaded;
  },

  removeFile: (id) => {
    const target = get().files.find((f) => f.id === id);
    if (target) URL.revokeObjectURL(target.objectUrl);
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
      activeFileId: state.activeFileId === id ? null : state.activeFileId,
    }));
  },

  setActiveFile: (id) => set({ activeFileId: id }),

  getFile: (id) => get().files.find((f) => f.id === id),

  updateFileData: (id, data) => {
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, data } : f)),
    }));
  },

  clear: () => {
    get().files.forEach((f) => URL.revokeObjectURL(f.objectUrl));
    set({ files: [], activeFileId: null });
  },
}));
