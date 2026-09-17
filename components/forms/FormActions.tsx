"use client";
import { useContext } from "react";
import { FormPending } from "./ValidatedForm";
export default function FormActions({ label, onCancel }: { label: string; onCancel?: () => void }) {
  const pending = useContext(FormPending);
  return <div className="flex flex-wrap justify-end gap-3 pt-3">
    {onCancel && <button type="button" disabled={pending} onClick={onCancel} className="min-h-11 cursor-pointer rounded-xl border border-gray-200 px-5 py-3 text-sm hover:bg-gray-100">
      Cancel
    </button>}
    <button type="submit" disabled={pending} className="min-h-11 cursor-pointer rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-50 hover:bg-gray-800">
      {pending ? "Saving..." : label}
    </button>
  </div>;
}
