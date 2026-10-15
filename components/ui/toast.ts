/**
 * QuickKit minimal toast system.
 * Transient, memory-only. Lives in AppRuntime (above route pages).
 */

import { create } from "zustand";

export type ToastTone = "default" | "success" | "warning" | "danger";

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastStore {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
  clear: () => void;
}

let _seq = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) =>
    set((s) => {
      const id = ++_seq;
      const toast: Toast = { id, ...t };
      // auto-dismiss after 3.5s
      if (typeof window !== "undefined") {
        setTimeout(() => {
          useToastStore.getState().dismiss(id);
        }, 3500);
      }
      return { toasts: [toast, ...s.toasts].slice(0, 5) };
    }),
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

/** Convenience helpers. */
export const toast = {
  default: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "default" }),
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "success" }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "warning" }),
  danger: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "danger" }),
};
