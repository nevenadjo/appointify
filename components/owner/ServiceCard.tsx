import OwnerFormLink from "@/components/owner/OwnerFormLink";
import { formatPrice } from "@/lib/currency";

import ServiceStatusButton from "./ServiceStatusButton";

type ServiceCardProps = {
  service: {
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: number;
    color: string | null;
    isActive: boolean;
  };
  businessId: string;
};

export default function ServiceCard({
  service,
  businessId,
}: ServiceCardProps) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5">
      <div className={!service.isActive ? "opacity-60" : ""}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-lg font-semibold">
                {service.name}
              </h3>

              <span className="text-xs font-medium text-gray-500">
                {service.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {service.description && (
              <p className="mt-2 break-words text-sm leading-6 text-gray-600">
                {service.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        className={`mt-auto flex flex-wrap justify-between gap-2 pt-6 text-sm ${
          !service.isActive ? "opacity-60" : ""
        }`}
      >
        <span>{service.duration} min</span>

        <span className="font-medium">
          {formatPrice(service.price)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3">
        <OwnerFormLink
          href={`/dashboard/owner/${businessId}/services/${service.id}/edit`}
          className="inline-flex min-h-11 items-center rounded-lg text-sm font-medium hover:underline focus-visible:outline-indigo-500"
        >
          Edit
        </OwnerFormLink>

        <ServiceStatusButton
          serviceId={service.id}
          isActive={service.isActive}
        />
      </div>
    </div>
  );
}