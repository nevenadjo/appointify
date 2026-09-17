import OwnerFormLink from "@/components/owner/OwnerFormLink";
import SetupAccordion from "./SetupAccordion";


type Business = {
  id: string;
  isActive: boolean,
  isSuspended: boolean;
  workingHours: {
    isOpen: boolean;
    startTime: string | null;
    endTime: string | null;
  }[];
  services: {
    isActive: boolean;
  }[];
};

export default function BusinessChecklist({
  business,
}: {
  business: Business;
}) {
  const hasWorkingHours = business.workingHours.some(
    (hour) => hour.isOpen && hour.startTime && hour.endTime,
  );

  const hasActiveServices = business.services.some(
    (service) => service.isActive,
  );

  const isReady = hasWorkingHours && hasActiveServices;
  const isVisible = business.isActive && !business.isSuspended && isReady;

  return (
    <SetupAccordion ready={isReady}>
      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>Basic information</span>

          <span className="text-sm text-green-600">✓ Complete</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>Working hours</span>

          {hasWorkingHours ? (
            <span className="text-sm text-green-600">✓ Complete</span>
          ) : (
            <OwnerFormLink
              href={`/dashboard/owner/${business.id}/working-hours`}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Add working hours
            </OwnerFormLink>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>Active services</span>

          {hasActiveServices ? (
            <span className="text-sm text-green-600">✓ Complete</span>
          ) : (
            <OwnerFormLink
              href={`/dashboard/owner/${business.id}/services/create`}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Add service
            </OwnerFormLink>
          )}
        </div>
        <div className="mt-6 border-t pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">Business visibility</p>

              <p className="text-sm text-gray-500">
                {isVisible
                  ? "Your business is visible to clients."
                  : "Your business is not visible to clients."}
              </p>
            </div>

            <span
              className={`text-sm font-medium ${
                isVisible
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {isVisible ? "Visible" : "Hidden"}
            </span>
          </div>
        </div>
      </div>
    </SetupAccordion>
  );
}
