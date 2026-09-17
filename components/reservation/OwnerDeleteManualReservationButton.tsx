"use client";
import ConfirmAction from "@/components/ui/ConfirmAction";
import { deleteManualReservation } from "@/lib/reservation-actions";
export default function OwnerDeleteManualReservationButton({ reservationId }: { reservationId: string }) {
 return <ConfirmAction label={"Remove blocked time"} title={"Remove blocked time?"} description={"Are you sure you want to remove this blocked time?"} destructive={true} successMessage={"Blocked time removed successfully."} action={() => deleteManualReservation(reservationId)} />;
}
