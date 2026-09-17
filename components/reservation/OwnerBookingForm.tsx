"use client";

import { useId, useState } from "react";
import { FormErrors, FormInput, FormTextarea } from "@/components/forms/ValidatedForm";
import { validateReservationTimes, type FieldErrors } from "@/lib/form-validation";
import { createManualReservation } from "@/lib/reservation-actions";
import { useRouter } from "next/navigation";

import Modal from "@/components/ui/Modal";
import { useAppToast } from "@/components/ui/ToastProvider";
type ManualReservationFormProps = {
  businessId: string;
};

export default function ManualReservationForm({
  businessId,
}: ManualReservationFormProps) {
  const [open, setOpen] = useState(false); const id = useId(); const toast = useAppToast();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (loading) return;
    const next: FieldErrors = {};
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(new Date(date).getTime()) || new Date(date).toISOString().slice(0, 10) !== date) next.date = "Please select a valid date.";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) next.startTime = "Please select a valid start time.";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) next.endTime = "Please select a valid end time.";
    const start = new Date(date + "T" + startTime);
    const end = new Date(date + "T" + endTime);
    if (!Object.keys(next).length) Object.assign(next, validateReservationTimes(start.toISOString(), end.toISOString()));
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);

    try {
      const result = await createManualReservation(
        businessId,
        start.toISOString(),
        end.toISOString(),
        notes,
      );

      setErrors(result.errors || {});
      if (result.error) setError(result.error);
      if (result?.success) {
        router.refresh();
        setOpen(false); toast("Time blocked successfully.");

        setDate("");
        setStartTime("");
        setEndTime("");
        setNotes("");
        setLoading(false);
      }
    } catch (error) {
      setError(
        "Unable to block this time. Please try again.",
      );

    } finally { setLoading(false); }
  }

  return (
    <><button type="button" onClick={() => setOpen(true)} className="mt-4 min-h-11 cursor-pointer rounded-xl bg-gray-900 px-5 py-3 text-white hover:bg-gray-800">Block time</button>{open && <Modal titleId={id} onClose={() => setOpen(false)} pending={loading}><h2 id={id} className="pr-12 text-xl font-semibold">Block time</h2><FormErrors.Provider value={errors}><form noValidate
      onSubmit={handleSubmit}
      className="mt-6 space-y-4 rounded-xl p-4"
    >
      <p className="text-sm bg-[#E9EAFF] p-4 rounded-lg">
        Block time to make a specific time period unavailable for client bookings, for example during breaks, personal appointments, or other commitments.
      </p>
      <div>
        <label htmlFor="manual-date" className="block text-sm font-medium">Date</label>

        <FormInput
          type="date" name="date" id="manual-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full cursor-pointer rounded-md border px-4 py-3"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="manual-start" className="block text-sm font-medium">Start time</label>

          <FormInput
            type="time" name="startTime" id="manual-start"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full cursor-pointer rounded-md border px-4 py-3"
            required
          />
        </div>

        <div>
          <label htmlFor="manual-end" className="block text-sm font-medium">End time</label>

          <FormInput
            type="time" name="endTime" id="manual-end"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 w-full cursor-pointer rounded-md border px-4 py-3"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="manual-notes" className="block text-sm font-medium">Notes</label>

        <FormTextarea name="notes" id="manual-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Optional note..."
          className="mt-1 w-full rounded-md border px-4 py-3"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl cursor-pointer bg-black px-5 py-3 text-white disabled:opacity-50 hover:bg-gray-800"
      >
        {loading ? "Saving..." : "Block time"}
      </button>
    <button type="button" disabled={loading} onClick={() => setOpen(false)} className="ml-3 min-h-11 rounded-xl cursor-pointer border px-5 py-3 hover:bg-gray-100">Cancel</button></form></FormErrors.Provider></Modal>}</>
  );
}
