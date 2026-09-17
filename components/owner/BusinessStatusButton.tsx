"use client";

import ConfirmAction from "@/components/ui/ConfirmAction";
import { toggleBusiness } from "@/lib/business-actions";

export default function BusinessStatusButton({
  businessId,
  isActive,
}: {
  businessId: string;
  isActive: boolean;
}) {
  return (
    <ConfirmAction
      label={isActive ? "Deactivate" : "Activate"}
      title={isActive ? "Deactivate business?" : "Activate business?"}
      description={
        isActive
          ? "Are you sure you want to deactivate this business? It will no longer be available for new client reservations."
          : "Are you sure you want to activate this business?"
      }
      destructive={isActive}
      successMessage={
        isActive
          ? "Business deactivated successfully."
          : "Business activated successfully."
      }
      className={`min-h-11 cursor-pointer rounded-lg px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 ${
        isActive
          ? "text-gray-600 hover:text-red-600"
          : "text-gray-600 hover:text-green-700"
      }`}
      action={() => toggleBusiness(businessId, false)}
    />
  );
}