"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import Modal from "./Modal";
import { useAppToast } from "./ToastProvider";
import type { FormResult } from "@/lib/form-validation";

export default function ConfirmAction({ title, description, label, confirmLabel, pendingLabel = "Updating...", successMessage, destructive = false, action, className, disabled = false, onSuccess, children }: {
  title: string; description: string; label: string; confirmLabel?: string; pendingLabel?: string; successMessage: string;
  destructive?: boolean; disabled?: boolean; className?: string; action: () => Promise<FormResult | void>;
  onSuccess?: () => void; children?: ReactNode;
}) {
  const [open, setOpen] = useState(false), [pending, setPending] = useState(false), [error, setError] = useState("");
  const busy = useRef(false), id = useId(), router = useRouter(), toast = useAppToast();
  async function submit() {
    if (busy.current) return;
    busy.current = true; setPending(true); setError("");
    try {
      const result = await action();
      if (result?.error || result?.success !== true || (result?.errors && Object.keys(result.errors).length)) {
        setError(result?.error || Object.values(result?.errors || {}).join(" ") || "The update could not be completed."); return;
      }
      setOpen(false); router.refresh(); toast(successMessage); onSuccess?.();
    } catch (error) { unstable_rethrow(error); setError("Something went wrong. Please try again."); }
    finally { busy.current = false; setPending(false); }
  }
  return <>
    <button type="button" disabled={disabled} onClick={() => { setError(""); setOpen(true); }} className={className || "min-h-11 cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium disabled:opacity-40"}>{label}</button>
    {open && <Modal titleId={id} pending={pending} compact onClose={() => setOpen(false)}>
      <h2 id={id} className="pr-10 text-xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
      {children}
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" disabled={pending} onClick={() => setOpen(false)} className="min-h-11 cursor-pointer rounded-xl border border-gray-200 px-5 py-2 text-sm hover:bg-gray-100">
          Cancel
        </button>
        <button type="button" disabled={pending} onClick={submit} className={`min-h-11 cursor-pointer rounded-xl px-5 py-2 text-sm font-medium text-white disabled:opacity-50 ${destructive ? "bg-red-600 enabled:hover:bg-red-700" : "bg-gray-900 enabled:hover:bg-gray-700"}`}>
          {pending ? pendingLabel : confirmLabel || label}
        </button>
      </div>
    </Modal>}
  </>;
}
