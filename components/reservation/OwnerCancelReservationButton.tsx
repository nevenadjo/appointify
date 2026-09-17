"use client";
import { useId, useState } from "react";
import { cancelReservationByOwner } from "@/lib/reservation-actions";
import ConfirmAction from "@/components/ui/ConfirmAction";
export default function OwnerCancelReservationButton({ reservationId }: { reservationId: string }) {
  const id = useId(); const [reason, setReason] = useState(""); const [error, setError] = useState("");
  return <ConfirmAction label="Cancel reservation" title="Cancel reservation?" description="Please provide a reason. The client will be notified of this cancellation." confirmLabel="Cancel reservation" pendingLabel="Canceling..." destructive successMessage="Reservation canceled successfully." action={async () => {
    if (!reason.trim()) { setError("Please enter a cancellation reason."); return { success: false, error: "Please enter a cancellation reason." }; }
    const result = await cancelReservationByOwner(reservationId, reason.trim(), false);
    setError(result.errors?.reason || result.error || ""); return result;
  }}><label htmlFor={id} className="mt-4 block text-sm font-medium">Cancellation reason</label><textarea id={id} value={reason} onChange={e => { setReason(e.target.value); setError(""); }} rows={3} aria-invalid={!!error} aria-describedby={error ? id + "-error" : undefined} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2" />{error && <p id={id + "-error"} className="text-sm text-red-600">{error}</p>}</ConfirmAction>;
}
