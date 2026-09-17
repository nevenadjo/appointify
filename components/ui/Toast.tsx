"use client";

import { useEffect, useRef, useState } from "react";

export function useToast() {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function clearToast() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setMessage("");
  }

  function showToast(text: string) {
    clearToast();
    setMessage(text);
    timer.current = setTimeout(() => setMessage(""), 2500);
  }

  return { message, showToast, clearToast };
}

export default function Toast({ message, onClose }: { message: string; onClose?: () => void }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="pointer-events-none fixed inset-x-4 bottom-5 z-50 flex justify-center sm:left-auto sm:right-6 sm:justify-end">
      {message && <p className="max-w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-900 shadow-md">
        <span aria-hidden="true" className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E9EAFF]">✓</span>
        {message}
        {onClose && <button type="button" onClick={onClose} aria-label="Dismiss notification" className="pointer-events-auto ml-3 inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100">×</button>}
      </p>}
    </div>
  );
}
