"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createReview } from "@/lib/review-actions";
import { validateRatings, type FieldErrors } from "@/lib/form-validation";
import Modal from "@/components/ui/Modal";
import { useAppToast } from "@/components/ui/ToastProvider";
import StarRatingInput from "@/components/review/StarRatingInput";

const fields = [
  ["rating", "Overall rating"],
  ["serviceRating", "Service quality"],
  ["cleanlinessRating", "Cleanliness"],
  ["valueRating", "Value for money"],
  ["punctualityRating", "Punctuality"],
] as const;
const emptyRatings = { rating: 0, serviceRating: 0, cleanlinessRating: 0, valueRating: 0, punctualityRating: 0 };

export default function ReviewForm({ reservationId }: { reservationId: string }) {
  const [open, setOpen] = useState(false);
  const toast = useAppToast();
  const submitting = useRef(false);
  const router = useRouter();
  const id = useId();
  const [ratings, setRatings] = useState(emptyRatings);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function close() { if (!submitting.current) setOpen(false); }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const next = validateRatings(ratings);
    setErrors(next);
    if (Object.keys(next).length) return;
    submitting.current = true;
    setLoading(true);
    setError("");
    try {
      const result = await createReview(reservationId, ratings.rating, comment, ratings.serviceRating, ratings.cleanlinessRating, ratings.valueRating, ratings.punctualityRating);
      setErrors(result.errors || {});
      if (result.errors && Object.keys(result.errors).length) return;
      if (result.error) { setError(result.error); return; }
      if (!result.success) { setError("Your review could not be submitted."); return; }
      setOpen(false);
      toast("Review submitted successfully.");
      setRatings(emptyRatings);
      setComment("");
      router.refresh();
    } catch {
      setError("Your review could not be submitted. Please try again.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return <>
    <button type="button" onClick={() => { setError(""); setOpen(true); }} className="min-h-11 w-full cursor-pointer rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-700 focus-visible:outline-indigo-500">Leave a review</button>
    {open && <Modal titleId={id + "-title"} onClose={close} pending={loading}>
      <div className="flex items-start justify-between gap-4">
        <div><h2 id={`${id}-title`} className="text-2xl font-semibold">Leave a review</h2><p className="mt-2 text-sm text-gray-500">Share your experience with this appointment.</p></div>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {fields.map(([key, label]) => <StarRatingInput error={errors[key]} key={key} label={label} value={ratings[key]} disabled={loading} onChange={(value) => setRatings((current) => ({ ...current, [key]: value }))} />)}
        <div><label htmlFor={`${id}-comment`} className="text-sm font-medium">Comment <span className="font-normal text-gray-500">(optional)</span></label><textarea id={`${id}-comment`} value={comment} disabled={loading} onChange={(event) => setComment(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus-visible:outline-indigo-500" /></div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button type="button" disabled={loading} onClick={close} className="min-h-11 cursor-pointer rounded-xl border border-gray-200 px-5 py-3 text-sm hover:bg-gray-50 disabled:opacity-40">Cancel</button>
          <button type="submit" disabled={loading} className="min-h-11 cursor-pointer rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40">{loading ? "Submitting..." : "Submit review"}</button>
        </div>
      </form>
    </Modal>}
  </>;
}
