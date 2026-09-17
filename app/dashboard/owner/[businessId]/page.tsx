import ActionNotice from "@/components/ui/ActionNotice";
import OwnerFormLink from "@/components/owner/OwnerFormLink";
import OwnerAccordion from "@/components/owner/OwnerAccordion";
import DetailPagination, {
  boundedPage,
} from "@/components/businesses/DetailPagination";
import type { Prisma } from "@prisma/client";
import BusinessTabs from "@/components/owner/BusinessTabs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ServiceCard from "@/components/owner/ServiceCard";
import BusinessCard from "@/components/owner/BusinessCard";
import BusinessChecklist from "@/components/owner/BusinessChecklist";
import ReviewList from "@/components/owner/review/ReviewList";
import BusinessImageUpload from "@/components/owner/BusinessImageUpload";
import BusinessImageList from "@/components/owner/BusinessImageList";

export default async function BusinessPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const { businessId } = await params;
  const query = await searchParams;
  const active = query.tab === "reviews" ? "reviews" : "services";
  const reviewSort =
    query.reviewSort === "highest" || query.reviewSort === "lowest"
      ? query.reviewSort
      : "newest";
  const basePath = "/dashboard/owner/" + businessId;

  const business = await prisma.business.findFirst({
    where: {
      id: businessId,
      ownerId: session.user.id,
    },
    include: {
      category: true,
      services: {
        where: { isActive: true },
        select: { isActive: true },
        take: 1,
      },
      _count: { select: { services: true, reviews: true } },
      city: true,
      workingHours: {
        orderBy: {
          dayOfWeek: "asc",
        },
      },
      images: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!business) {
    redirect("/dashboard/owner");
  }

  const serviceSearch =
    (Array.isArray(query.serviceSearch)
      ? query.serviceSearch[0]
      : query.serviceSearch
    )?.trim() || "";
  const serviceWhere: Prisma.ServiceWhereInput = {
    businessId,
    business: { ownerId: session.user.id },
    ...(serviceSearch
      ? { name: { contains: serviceSearch, mode: "insensitive" } }
      : {}),
  };
  const serviceCount = await prisma.service.count({ where: serviceWhere });
  const servicesPage = boundedPage(query.servicesPage, serviceCount, 9);
  const servicesQuery = Object.fromEntries(
    Object.entries(query).filter(([key]) => key !== "reviewsPage"),
  );
  const reviewsQuery = Object.fromEntries(
    Object.entries(query).filter(([key]) => key !== "servicesPage"),
  );
  const clearSearchParams = new URLSearchParams();
  Object.entries(servicesQuery)
    .filter(([key]) => !["serviceSearch", "servicesPage", "tab"].includes(key))
    .forEach(([key, value]) => {
      (Array.isArray(value)
        ? value
        : value !== undefined
          ? [value]
          : []
      ).forEach((item) => clearSearchParams.append(key, item));
    });
  clearSearchParams.set("tab", "services");
  const clearSearchHref = `${basePath}?${clearSearchParams.toString()}#services`;
  const reviewsPage = boundedPage(
    query.reviewsPage,
    business._count.reviews,
    4,
  );
  const reviewOrder: Prisma.ReviewOrderByWithRelationInput[] = [
    ...(reviewSort === "newest"
      ? []
      : [
          {
            rating:
              reviewSort === "highest" ? ("desc" as const) : ("asc" as const),
          },
        ]),
    { createdAt: "desc" },
    { id: "desc" },
  ];
  const [services, reviews] = await Promise.all([
    prisma.service.findMany({
      where: serviceWhere,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip: (servicesPage - 1) * 9,
      take: 9,
    }),
    prisma.review.findMany({
      where: {
        businessId,
        business: { ownerId: session.user.id },
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        reservation: {
          select: {
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: reviewOrder,
      skip: (reviewsPage - 1) * 4,
      take: 4,
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl min-w-0 px-5 py-8 sm:px-8 sm:py-10">
      <ActionNotice code={query.notice} />
      <BusinessCard business={business} />
      <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-amber-100 bg-[#FFF4E1]/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">Reservations</h2>
          <p className="mt-1 text-sm text-gray-600">
            View and manage appointments for this business.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={"/dashboard/owner/" + business.id + "/reservations"}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-700 focus-visible:outline-indigo-500"
          >
            View reservations &rarr;
          </Link>
          <Link
            href={"/dashboard/owner/" + business.id + "/statistics"}
            className="inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus-visible:outline-indigo-500"
          >
            Statistics &rarr;
          </Link>
        </div>
      </section>
      <BusinessChecklist business={business} />
      <BusinessTabs
        businessId={businessId}
        query={query}
        active={active}
        counts={business._count}
        controls={
          active === "services" ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <form
                action={basePath + "#services"}
                role="search"
                aria-label="Search business services"
                className="flex w-full min-w-0 gap-2 sm:max-w-md"
              >
                {Object.entries(servicesQuery)
                  .filter(
                    ([key]) =>
                      !["tab", "serviceSearch", "servicesPage"].includes(key),
                  )
                  .flatMap(([key, value]) =>
                    (Array.isArray(value)
                      ? value
                      : value !== undefined
                        ? [value]
                        : []
                    ).map((item, index) => (
                      <input
                        key={key + index}
                        type="hidden"
                        name={key}
                        value={item}
                      />
                    )),
                  )}
                <input type="hidden" name="tab" value="services" />
                <input type="hidden" name="servicesPage" value="1" />
                <input
                  name="serviceSearch"
                  aria-label="Search services by name"
                  defaultValue={serviceSearch}
                  placeholder="Search services..."
                  className="min-h-11 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-indigo-500"
                />
                <button
                  type="submit"
                  className="min-h-11 cursor-pointer rounded-xl bg-[#E9EAFF] px-4 py-2 text-sm font-medium hover:bg-indigo-100 focus-visible:outline-indigo-500"
                >
                  Search
                </button>
              </form>
              <OwnerFormLink
                href={"/dashboard/owner/" + business.id + "/services/create"}
                className="inline-flex min-h-11 items-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-700 focus-visible:outline-indigo-500"
              >
                + Add service
              </OwnerFormLink>
            </div>
          ) : (
            <form
              action={basePath + "#reviews"}
              className="flex flex-wrap items-center gap-2 sm:justify-end"
            >
              {Object.entries(reviewsQuery)
                .filter(
                  ([key]) =>
                    !["tab", "reviewSort", "reviewsPage"].includes(key),
                )
                .flatMap(([key, value]) =>
                  (Array.isArray(value)
                    ? value
                    : value !== undefined
                      ? [value]
                      : []
                  ).map((item, index) => (
                    <input
                      key={key + index}
                      type="hidden"
                      name={key}
                      value={item}
                    />
                  )),
                )}
              <input type="hidden" name="tab" value="reviews" />
              <input type="hidden" name="reviewsPage" value="1" />
              <label
                htmlFor="owner-review-sort"
                className="text-sm text-gray-600"
              >
                Sort:
              </label>
              <select
                id="owner-review-sort"
                name="reviewSort"
                defaultValue={reviewSort}
                className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-indigo-500"
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
              <button
                type="submit"
                className="min-h-11 cursor-pointer rounded-xl bg-[#E9EAFF] px-4 py-2 text-sm font-medium hover:bg-indigo-100 focus-visible:outline-indigo-500"
              >
                Apply
              </button>
            </form>
          )
        }
        services={
          <section>
            {services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                <p>
                  {serviceSearch ? (
                    <>No services found for &ldquo;{serviceSearch}&rdquo;.</>
                  ) : (
                    "No services yet. Add your first service so clients can book appointments."
                  )}
                </p>
                {serviceSearch && (
                  <Link
                    href={clearSearchHref}
                    className="mt-3 inline-flex min-h-11 items-center font-medium text-gray-700 underline underline-offset-4 focus-visible:outline-indigo-500"
                  >
                    Clear search
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    businessId={business.id}
                  />
                ))}
              </div>
            )}
            <DetailPagination
              id={businessId}
              basePath={basePath}
              query={{ ...servicesQuery, tab: "services" }}
              parameter="servicesPage"
              page={servicesPage}
              total={serviceCount}
              size={9}
              section="services"
            />
          </section>
        }
        reviews={
          <section>
            <ReviewList business={{ reviews }} />
            <DetailPagination
              id={businessId}
              basePath={basePath}
              query={{ ...reviewsQuery, tab: "reviews" }}
              parameter="reviewsPage"
              page={reviewsPage}
              total={business._count.reviews}
              size={4}
              section="reviews"
            />
          </section>
        }
      />
      <OwnerAccordion id="manage-images" title="Manage images">
        <p className="mt-3 text-sm text-gray-500">
          Add photos or remove images from your business gallery.
        </p>
        <BusinessImageUpload businessId={business.id} />
        <BusinessImageList images={business.images} />
      </OwnerAccordion>
    </main>
  );
}
