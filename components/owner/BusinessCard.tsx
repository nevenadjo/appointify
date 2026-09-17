import OwnerFormLink from "@/components/owner/OwnerFormLink";

import BusinessStatusButton from "./BusinessStatusButton";
import BusinessHours, {
  type Hours,
} from "@/components/businesses/BusinessHours";
import BusinessImageCarousel from "@/components/ui/BusinessImageCarousel";

type BusinessCardProps = {
  business: {
    id: string;
    name: string;
    description: string | null;
    address: string;
    phone: string | null;
    email: string | null;
    city: { name: string };
    category: { name: string };
    isActive: boolean;
    isSuspended: boolean;
    acceptsCards: boolean;
    workingHours: Hours[];
    images: { id: string; imageUrl: string }[];
  };
};

export default function BusinessCard({ business }: BusinessCardProps) {
  return (
    <section className="rounded-3xl bg-[#E9EAFF] p-5 sm:p-8">
      <div className="grid items-start gap-8 xl:grid-cols-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="min-w-0 break-words text-3xl font-semibold tracking-tight">
              {business.name}
            </h1>

            <span
              className={`inline-flex shrink-0 items-center gap-2 text-xs font-medium ${
                business.isSuspended
                  ? "text-red-700"
                  : business.isActive
                    ? "text-green-700"
                    : "text-gray-600"
              }`}
            >
              <span
                className={
                  "h-2 w-2 rounded-full " +
                  (business.isSuspended
                    ? "bg-red-500"
                    : business.isActive
                      ? "bg-green-500"
                      : "bg-gray-400")
                }
              />
              {business.isSuspended
                ? "Suspended"
                : business.isActive
                  ? "Active"
                  : "Inactive"}
            </span>
          </div>

          <span className="mt-3 inline-flex rounded-full bg-white/75 px-3 py-1 text-xs font-medium">
            {business.category.name}
          </span>

          {business.description && (
            <p className="mt-5 whitespace-pre-line break-words text-sm leading-6 text-gray-700">
              {business.description}
            </p>
          )}

          <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="font-medium">Address</dt>
              <dd className="mt-1 break-words text-gray-600">
                {business.address}
              </dd>
            </div>

            {business.phone && (
              <div className="min-w-0">
                <dt className="font-medium">Phone</dt>
                <dd className="mt-1 break-words text-gray-600">
                  {business.phone}
                </dd>
              </div>
            )}

            <div className="min-w-0">
              <dt className="font-medium">City</dt>
              <dd className="mt-1 text-gray-600">
                {business.city.name}
              </dd>
            </div>

            {business.email && (
              <div className="min-w-0">
                <dt className="font-medium">Email</dt>
                <dd className="mt-1 break-all text-gray-600">
                  {business.email}
                </dd>
              </div>
            )}

            <div>
              <dt className="font-medium">Payment</dt>
              <dd className="mt-1 text-gray-600">
                {business.acceptsCards
                  ? "Cash and card"
                  : "Cash only"}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-indigo-100 pt-5">
            <BusinessHours hours={business.workingHours} />

            <OwnerFormLink
              href={`/dashboard/owner/${business.id}/working-hours`}
              className="mt-3 inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-medium text-gray-700 underline underline-offset-3 transition-colors hover:text-indigo-700 focus-visible:outline-indigo-500"
            >
              Edit working hours
            </OwnerFormLink>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <OwnerFormLink
              href={`/dashboard/owner/${business.id}/edit`}
              className="inline-flex min-h-11 items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 focus-visible:outline-indigo-500"
            >
              Edit business
            </OwnerFormLink>

            {!business.isSuspended && (
              <BusinessStatusButton
                businessId={business.id}
                isActive={business.isActive}
              />
            )}
          </div>
        </div>

        <div className="min-w-0">
          {business.images.length ? (
            <BusinessImageCarousel
              images={business.images}
              businessName={business.name}
            />
          ) : (
            <img
              src="/business-placeholder.svg"
              alt="No business photos uploaded yet"
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          )}

          <a
            href="#manage-images"
            className="mt-3 inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-medium text-gray-700 underline underline-offset-3 transition-colors hover:text-indigo-700 focus-visible:outline-indigo-500"
          >
            Manage images
          </a>
        </div>
      </div>
    </section>
  );
}