"use client";

import ConfirmAction from "@/components/ui/ConfirmAction";
import { toggleService } from "@/lib/service-actions";

export default function ServiceStatusButton({
  serviceId,
  isActive,
}: {
  serviceId: string;
  isActive: boolean;
}) {
  return (
    <ConfirmAction
      label={isActive ? "Deactivate" : "Activate"}
      title={isActive ? "Deactivate service?" : "Activate service?"}
      description={"Are you sure you want to change this service's availability?"}
      destructive={isActive}
      successMessage={
        isActive
          ? "Service deactivated successfully."
          : "Service activated successfully."
      }
      className={`min-h-11 cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        isActive
          ? "hover:border-red-300 hover:text-red-600"
          : "hover:border-green-300 hover:text-green-700"
      }`}
      action={() => toggleService(serviceId, false)}
    />
  );
}