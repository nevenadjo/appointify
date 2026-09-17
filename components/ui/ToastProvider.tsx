"use client";

import { createContext, useContext, type ReactNode } from "react";
import Toast, { useToast } from "./Toast";

const ToastContext = createContext<(message: string) => void>(() => {});
export const useAppToast = () => useContext(ToastContext);
export default function ToastProvider({ children }: { children: ReactNode }) {
  const { message, showToast, clearToast } = useToast();
  return <ToastContext.Provider value={showToast}>{children}<Toast message={message} onClose={clearToast} /></ToastContext.Provider>;
}
