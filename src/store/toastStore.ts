import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { ToastMessage, ToastVariant } from "@/types";

interface ToastState {
  toasts: ToastMessage[];
  push: (variant: ToastVariant, title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (variant, title, description) => {
    const toast: ToastMessage = { id: uuid(), variant, title, description };
    set((state) => ({ toasts: [...state.toasts, toast] }));
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== toast.id) }));
    }, 5000);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push("success", title, description),
  error: (title: string, description?: string) =>
    useToastStore.getState().push("error", title, description),
  info: (title: string, description?: string) =>
    useToastStore.getState().push("info", title, description),
  warning: (title: string, description?: string) =>
    useToastStore.getState().push("warning", title, description),
};
