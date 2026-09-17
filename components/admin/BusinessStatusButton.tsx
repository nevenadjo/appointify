"use client";
import ConfirmAction from "@/components/ui/ConfirmAction";
import { setBusinessSuspended } from "@/lib/admin-actions";
export default function BusinessStatusButton({ businessId, isSuspended }: { businessId: string; isSuspended: boolean }) {
 return <ConfirmAction label={isSuspended ? "Lift suspension" : "Suspend"} title={isSuspended ? "Unsuspend business?" : "Suspend business?"} description={isSuspended ? "Are you sure you want to make this business available again?" : "Are you sure you want to suspend this business? It will no longer be publicly available for bookings."} destructive={!isSuspended} successMessage={isSuspended ? "Business unsuspended successfully." : "Business suspended successfully."} action={() => setBusinessSuspended(businessId, !isSuspended)} />;
}
