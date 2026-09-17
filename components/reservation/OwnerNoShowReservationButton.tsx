"use client";

import ConfirmAction from "@/components/ui/ConfirmAction";
import { markReservationNoShowByOwner } from "@/lib/reservation-actions";

export default function OwnerNoShowReservationButton({
  reservationId,
}: {
  reservationId: string;
}) {
  return (
    <ConfirmAction
      label="Mark as no-show"
      title="Mark as no-show?"
      description="This confirms that the client did not attend the appointment. No review will be available for this reservation."
      confirmLabel="Mark as no-show"
      pendingLabel="Updating..."
      destructive
      successMessage="Reservation marked as no-show."
      action={() => markReservationNoShowByOwner(reservationId)}
    />
  );
}