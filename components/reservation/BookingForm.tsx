"use client";

import {
  FormErrors,
  FormInput,
  FieldError,
} from "@/components/forms/ValidatedForm";
import type { FieldErrors } from "@/lib/form-validation";
import { createReservation } from "@/lib/reservation-actions";
import { useEffect, useId, useRef, useState } from "react";

type BookingFormProps = {
  businessId: string;
  serviceId: string;
  serviceDuration: number;
  onSuccess?: () => void;
  onPendingChange?: (pending: boolean) => void;
};

export default function BookingForm({
  businessId,
  serviceId,
  onSuccess,
  onPendingChange,
}: BookingFormProps) {
  const dateId = useId();
  const submissionInFlight = useRef(false);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    onPendingChange?.(submitting);
  }, [submitting, onPendingChange]);

  async function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedDate = event.target.value;

    setDate(selectedDate);
    setSelectedSlot("");
    setSlots([]);

    setErrors((current) => {
      const next = { ...current };
      delete next.date;
      delete next.selectedSlot;
      return next;
    });
    setError("");

    if (!selectedDate) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/businesses/${businessId}/availability?serviceId=${serviceId}&date=${selectedDate}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Failed to load available slots.");
      }

      const data = await response.json();

      setSlots(data.slots);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (submissionInFlight.current) return;
    const next: FieldErrors = {};
    if (!date || !Number.isFinite(new Date(date).getTime()))
      next.date = "Please select a valid date.";
    if (!selectedSlot) next.selectedSlot = "Please select an available time.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setError("");
    submissionInFlight.current = true;
    setSubmitting(true);

    try {
      const result = await createReservation(
        businessId,
        serviceId,
        selectedSlot,
        !onSuccess,
      );
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.success && onSuccess) {
        setDate("");
        setSelectedSlot("");
        setSlots([]);
        onSuccess();
      }
    } catch (error) {
      setSubmitting(false);

      if (error instanceof Error) {
        setError("Your appointment could not be booked. Please try again.");
      }
    } finally {
      submissionInFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <FormErrors.Provider value={errors}>
      <div className="mt-6">
        <div>
          <label
            htmlFor={dateId}
            className="block text-sm font-medium text-gray-800"
          >
            Choose a date
          </label>
          <FormInput
            name="date"
            id={dateId}
            type="date"
            value={date}
            onChange={handleDateChange}
            min={new Date().toISOString().split("T")[0]}
            className="mt-2 min-h-12 w-full min-w-0 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <FieldError name="selectedSlot" />
        {date && (
          <div className="mt-6" aria-busy={loading}>
            <h3 className="text-sm font-medium text-gray-800">
              Available times
            </h3>
            {loading ? (
              <p
                role="status"
                className="mt-3 rounded-xl bg-[#E9EAFF]/40 p-4 text-sm text-gray-600"
              >
                Loading available times...
              </p>
            ) : slots.length === 0 ? (
              <p
                role="status"
                className="mt-3 rounded-xl bg-[#FFF4E1]/60 p-4 text-sm text-gray-600"
              >
                No available appointments for this date.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    aria-pressed={selectedSlot === slot}
                    onClick={() => {
                      setSelectedSlot(slot);

                      setErrors((current) => {
                        const next = { ...current };
                        delete next.selectedSlot;
                        return next;
                      });

                      setError("");
                    }}
                    className={
                      "min-h-11 cursor-pointer rounded-xl border px-2 py-3 text-sm font-medium focus-visible:outline-indigo-500 " +
                      (selectedSlot === slot
                        ? "border-indigo-400 bg-[#E9EAFF] text-gray-900"
                        : "border-gray-200 bg-white text-gray-700 hover:border-indigo-200 hover:bg-[#E9EAFF]/40")
                    }
                  >
                    {new Date(slot).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="mt-6 border-t border-gray-100 pt-5">
          {selectedSlot && (
            <p className="mb-4 text-sm text-gray-600">
              Selected time:{" "}
              <span className="font-medium text-gray-900">
                {new Date(selectedSlot).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={loading || submitting}
            onClick={handleConfirm}
            className="min-h-12 w-full cursor-pointer rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white enabled:hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Booking..." : "Confirm booking"}
          </button>
        </div>
      </div>
    </FormErrors.Provider>
  );
}
