"use client";
import ConfirmAction from "@/components/ui/ConfirmAction";
import { completeReservationByOwner } from "@/lib/reservation-actions";
export default function OwnerCompleteReservationButton({ reservationId }: { reservationId: string }) {
 return <ConfirmAction label={"Mark as completed"} title={"Complete reservation?"} description={"Mark this reservation as completed?"} destructive={false} successMessage={"Reservation completed successfully."} action={() => completeReservationByOwner(reservationId, false)} />;
}
