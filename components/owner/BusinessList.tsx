"use client";
import OwnerFormLink from "@/components/owner/OwnerFormLink";


import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import MobileBusinessSwitcher from "./MobileBusinessSwitcher";

type Business = {
  id: string;
  name: string;
  city: {
    id: string;
    name: string;
  };
  isActive: boolean;
  isReady: boolean;
  isSuspended: boolean;
};

export default function BusinessList({
  businesses,
}: {
  businesses: Business[];
}) {
  const params = useParams();
  const selectedId = params?.businessId;
  const pathname = usePathname();

  return (
    <>
      <MobileBusinessSwitcher
        key={pathname}
        businesses={businesses}
        selectedId={selectedId}
      />
      <aside className="hidden w-full border-gray-100 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-72 lg:shrink-0 lg:self-start lg:flex-col lg:border-r">
        <div className="shrink-0 p-4">
          <OwnerFormLink
            href="/dashboard/owner/create"
            className="block w-full rounded-md bg-black px-4 py-3 text-center text-sm font-medium text-white hover:bg-gray-800"
          >
            + Add Business
          </OwnerFormLink>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {businesses.map((business) => (
            <Link
              key={business.id}
              href={`/dashboard/owner/${business.id}`}
              className={`mb-1 block rounded-lg px-4 py-3 ${
                selectedId === business.id ? "bg-[#FFF4E1]" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{business.name}</span>

                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    business.isSuspended
                      ? "bg-red-500"
                      : !business.isActive
                        ? "bg-gray-400"
                        : !business.isReady
                          ? "bg-yellow-400"
                          : "bg-green-500"
                  }`}
                />
              </div>

              <p className="mt-1 text-xs text-gray-500">{business.city.name}</p>
              {business.isSuspended && (
                <p className="mt-1 text-xs font-medium text-red-700">
                  Suspended
                </p>
              )}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
