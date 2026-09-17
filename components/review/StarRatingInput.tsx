"use client";

import { useId } from "react";

export default function StarRatingInput({ label, value, onChange, disabled = false, error }: {
  label: string; value: number; onChange: (value: number) => void; disabled?: boolean; error?: string;
}) {
  const errorId = useId();
  return <fieldset disabled={disabled} aria-invalid={!!error} aria-describedby={error ? errorId : undefined}>
    <legend className="text-sm font-medium text-gray-900">{label}</legend>
    <div className="mt-1 flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" aria-label={`${star} out of 5`} aria-pressed={value === star} onClick={() => onChange(star)}
        className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-3xl transition-colors hover:bg-[#FFF4E1] focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:cursor-default ${star <= value ? "text-amber-500" : "text-gray-300"}`}><span aria-hidden="true">★</span></button>)}
    </div>
    {error && <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
  </fieldset>;
}
