"use client";
import ConfirmAction from "@/components/ui/ConfirmAction";
import { cancelReservation } from "@/lib/reservation-actions";
export default function CancelReservationButton({ reservationId }: { reservationId: string }) {
 return <ConfirmAction label={"Cancel reservation"} title={"Cancel reservation?"} description={"Are you sure you want to cancel this reservation?"} destructive={true} successMessage={"Reservation canceled successfully."} action={() => cancelReservation(reservationId, false)} className="min-h-11 cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40" />;
}
