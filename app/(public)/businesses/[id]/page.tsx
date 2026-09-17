import BusinessContentPanel from "@/components/businesses/BusinessContentPanel";
import { formatPrice } from "@/lib/currency";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import BusinessHours from "@/components/businesses/BusinessHours";
import BusinessFaq from "@/components/businesses/BusinessFaq";
import BusinessSectionNav from "@/components/businesses/BusinessSectionNav";
import { publicBusinessWhere } from "@/lib/business-visibility";
import BookAppointmentButton from "@/components/reservation/BookAppointmentButton";
import { auth } from "@/lib/auth";
import FavoriteButton from "@/components/favorite/FavoriteButton";
import BusinessImageCarousel from "@/components/ui/BusinessImageCarousel";
import DetailPagination, {
  boundedPage,
} from "@/components/businesses/DetailPagination";
import { getBusinessPublicIdFromPath } from "@/lib/business-url";
import RatingStars from "@/components/review/RatingStars";
import Image from "next/image";

type BusinessPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BusinessPage({
  params,
  searchParams,
}: BusinessPageProps) {
  const { id: routeValue } = await params;
  const query = await searchParams;

  const publicId = getBusinessPublicIdFromPath(routeValue);

  const activeTab = query.tab === "reviews" ? "reviews" : "services";
  const tabQuery = { ...query, tab: activeTab };

  const session = await auth();

  let business = await prisma.business.findFirst({
    where: {
      publicId,
      ...publicBusinessWhere,
    },
    include: {
      category: true,
      city: true,
      workingHours: true,
      images: {
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          services: {
            where: {
              isActive: true,
            },
          },
          reviews: true,
        },
      },
    },
  });

  if (!business) {
    business = await prisma.business.findFirst({
      where: {
        id: routeValue,
        ...publicBusinessWhere,
      },
      include: {
        category: true,
        city: true,
        workingHours: true,
        images: {
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            services: {
              where: {
                isActive: true,
              },
            },
            reviews: true,
          },
        },
      },
    });
  }

  if (!business) {
    notFound();
  }

  let isFavorite = false;

  if (session?.user?.role === "CLIENT") {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_businessId: {
          userId: session.user.id,
          businessId: business.id,
        },
      },
    });

    isFavorite = !!favorite;
  }

  const serviceSearch =
    (Array.isArray(query.serviceSearch)
      ? query.serviceSearch[0]
      : query.serviceSearch
    )?.trim() || "";

  const serviceWhere = {
    businessId: business.id,
    isActive: true,
    ...(serviceSearch
      ? {
          OR: [
            {
              name: {
                contains: serviceSearch,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: serviceSearch,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  } satisfies Prisma.ServiceWhereInput;

  const [serviceCount, prices] = await Promise.all([
    prisma.service.count({
      where: serviceWhere,
    }),
    prisma.service.aggregate({
      where: {
        businessId: business.id,
        isActive: true,
      },
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    }),
  ]);

  const servicesPage = boundedPage(query.servicesPage, serviceCount, 8);

  const reviewsPage = boundedPage(
    query.reviewsPage,
    business._count.reviews,
    4,
  );

  const reviewSort =
    query.reviewSort === "highest" || query.reviewSort === "lowest"
      ? query.reviewSort
      : "newest";
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

  const [services, reviews, rating] = await Promise.all([
    prisma.service.findMany({
      where: serviceWhere,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip: (servicesPage - 1) * 8,
      take: 8,
    }),
    prisma.review.findMany({
      where: {
        businessId: business.id,
      },
      include: {
        reservation: {
          select: { service: { select: { name: true } } },
        },
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: reviewOrder,
      skip: (reviewsPage - 1) * 4,
      take: 4,
    }),
    prisma.review.aggregate({
      where: {
        businessId: business.id,
      },
      _avg: {
        rating: true,
      },
    }),
  ]);

  const averageRating = rating._avg.rating?.toFixed(1);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header>
        <div className="mt-1 flex items-center gap-2 sm:gap-3">
          <h1 className="min-w-0 break-words text-3xl font-semibold tracking-tight">
            {business.name}
          </h1>

          {session?.user?.role === "CLIENT" && (
            <FavoriteButton businessId={business.id} isFavorite={isFavorite} />
          )}
        </div>

        <div className="mt-3 text-sm">
          {averageRating ? (
            <p>
              <span aria-hidden="true" className="text-amber-500">
                ★{" "}
              </span>

              <span className="font-semibold">{averageRating}</span>

              <span className="text-gray-500">
                {" "}
                · {business._count.reviews} reviews
              </span>
            </p>
          ) : (
            <p className="text-gray-500">No reviews yet</p>
          )}
        </div>
      </header>

      <div className="mt-6 grid items-start gap-6 rounded-3xl bg-[#E9EAFF] p-6 sm:p-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8">
        <section aria-label="Business information" className="min-w-0">
          <span className="inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-gray-700">
            {business.category.name}
          </span>

          {business.description && (
            <p className="mt-5 whitespace-pre-line break-words leading-relaxed text-gray-700">
              {business.description}
            </p>
          )}

          <div className="mt-7 grid gap-x-6 gap-y-6 sm:grid-cols-2 xl:gap-x-8">
            <dl className="min-w-0 space-y-5 text-sm">
              <div>
                <dt className="font-medium text-gray-900">Location</dt>

                <dd className="mt-1 break-words text-gray-600">
                  {business.city.name} · {business.address}
                </dd>
              </div>

              {business.phone && (
                <div>
                  <dt className="font-medium text-gray-900">Phone</dt>

                  <dd className="mt-1 break-words text-gray-600">
                    {business.phone}
                  </dd>
                </div>
              )}

              {business.email && (
                <div>
                  <dt className="font-medium text-gray-900">Email</dt>

                  <dd className="mt-1 break-all text-gray-600">
                    {business.email}
                  </dd>
                </div>
              )}
              <div className="border-t border-indigo-100 pt-4">
                <dt className="sr-only">Payment</dt>
                <dd className="flex items-center gap-2 text-gray-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-5 w-5 shrink-0"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 10h18M7 15h4" strokeLinecap="round" />
                  </svg>
                  {business.acceptsCards
                    ? "Cash and card accepted"
                    : "Cash only"}
                </dd>
              </div>
            </dl>

            <BusinessHours hours={business.workingHours} />
          </div>
        </section>

        {business.images.length > 0 ? (
          <BusinessImageCarousel
            images={business.images}
            businessName={business.name}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white/50">
            <img
              src="/business-placeholder.svg"
              alt="Placeholder for business images. Business did not upload images yet."
              className="h-[280px] w-full object-cover sm:h-[320px]"
            />
          </div>
        )}
      </div>

      <BusinessContentPanel
        navigation={
          <BusinessSectionNav
            id={routeValue}
            query={query}
            active={activeTab}
            counts={business._count}
          />
        }
        controls={
          activeTab === "reviews" ? (
            <form
              action={`/businesses/${routeValue}#reviews`}
              className="flex flex-wrap items-center gap-2"
            >
              {Object.entries(query)
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
                      key={`${key}-${index}`}
                      type="hidden"
                      name={key}
                      value={item}
                    />
                  )),
                )}
              <input type="hidden" name="tab" value="reviews" />
              <input type="hidden" name="reviewsPage" value="1" />
              <label htmlFor="review-sort" className="text-sm text-gray-600">
                Sort:
              </label>
              <select
                id="review-sort"
                name="reviewSort"
                defaultValue={reviewSort}
                className="min-h-11 min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-indigo-500"
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
              <button
                type="submit"
                className="min-h-11 cursor-pointer rounded-xl bg-[#E9EAFF] px-4 py-2 text-sm font-medium hover:bg-indigo-100"
              >
                Apply
              </button>
            </form>
          ) : undefined
        }
      >
        {activeTab === "services" && (
          <section id="services" className="scroll-mt-24">
            <form
              action={`/businesses/${routeValue}#services`}
              className="flex flex-col gap-2 sm:flex-row"
              role="search"
              aria-label="Search this business's services"
            >
              {Object.entries(tabQuery)
                .filter(
                  ([key]) => key !== "serviceSearch" && key !== "servicesPage",
                )
                .flatMap(([key, value]) =>
                  (Array.isArray(value)
                    ? value
                    : value !== undefined
                      ? [value]
                      : []
                  ).map((item, index) => (
                    <input
                      key={`${key}-${index}`}
                      type="hidden"
                      name={key}
                      value={item}
                    />
                  )),
                )}

              <input
                name="serviceSearch"
                aria-label="Search services"
                defaultValue={serviceSearch}
                placeholder="Search services..."
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus-visible:outline-indigo-500"
              />

              <button
                type="submit"
                className="min-h-11 cursor-pointer rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700"
              >
                Search
              </button>
            </form>

            {services.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-gray-200 p-6 text-gray-500">
                {serviceSearch
                  ? "No services match your search. Try a different name or description."
                  : "No services available."}
              </p>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {services.map((service) => (
                  <article
                    key={service.id}
                    className="flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5"
                  >
                    <h3 className="break-words text-lg font-semibold">
                      {service.name}
                    </h3>

                    {service.description && (
                      <p className="mt-2 break-words text-sm leading-relaxed text-gray-600">
                        {service.description}
                      </p>
                    )}

                    <div className="mt-auto pt-6">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-gray-500">
                          {service.duration} min
                        </span>

                        <span className="font-semibold">
                          {formatPrice(service.price)}
                        </span>
                      </div>

                      <BookAppointmentButton
                        href={`/businesses/${routeValue}/reserve?serviceId=${service.id}`}
                        businessHref={`/businesses/${routeValue}`}
                        businessId={business.id}
                        serviceId={service.id}
                        isAuthenticated={!!session?.user}
                        businessName={business.name}
                        serviceName={service.name}
                        duration={service.duration}
                        price={service.price}
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}

            <DetailPagination
              id={routeValue}
              query={tabQuery}
              parameter="servicesPage"
              page={servicesPage}
              total={serviceCount}
              size={8}
              section="services"
            />
          </section>
        )}

        {activeTab === "reviews" && (
          <section id="reviews" className="mt-6 scroll-mt-24">
            {reviews.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-gray-500">
                No reviews yet.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <Image
                          src={review.user.image || "/uploads/avatar.png"}
                          alt=""
                          width={40}
                          height={40}
                          unoptimized
                          className={`h-10 w-10 shrink-0 rounded-full object-cover ${review.user.image ? "" : "opacity-40"}`}
                        />

                        <div className="min-w-0">
                          <p className="break-words font-medium">
                            {review.user.name ?? "User"}
                          </p>

                          {review.reservation.service && (
                            <p className="mt-1 break-words text-sm text-gray-500">
                              Service: {review.reservation.service.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <p
                        aria-label={`Overall rating: ${review.rating} out of 5`}
                        className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-[#E9EAFF]/50 px-3 py-2 text-sm font-semibold"
                      >
                        <span aria-hidden="true" className="text-amber-500">
                          ★
                        </span>{" "}
                        {review.rating.toFixed(1)}
                      </p>
                    </div>

                    {review.comment && (
                      <p className="mt-5 whitespace-pre-line break-words leading-relaxed text-gray-700">
                        {review.comment}
                      </p>
                    )}
                    <dl className="mt-5 grid grid-cols-1 gap-x-12 gap-y-4 rounded-xl bg-[#FFF4E1]/30 p-4 sm:grid-cols-2 lg:grid-cols-3">
                      {(
                        [
                          ["Overall", review.rating],
                          ["Service quality", review.serviceRating],
                          ["Cleanliness", review.cleanlinessRating],
                          ["Value for money", review.valueRating],
                          ["Punctuality", review.punctualityRating],
                        ] as const
                      ).map(
                        ([label, value]) =>
                          value != null && (
                            <div
                              key={label}
                              className="flex flex-wrap items-center justify-between gap-2"
                            >
                              <dt className="text-sm text-gray-600">{label}</dt>
                              <dd>
                                <RatingStars rating={value} />
                              </dd>
                            </div>
                          ),
                      )}
                    </dl>
                  </article>
                ))}
              </div>
            )}

            <DetailPagination
              id={routeValue}
              query={tabQuery}
              parameter="reviewsPage"
              page={reviewsPage}
              total={business._count.reviews}
              size={4}
              section="reviews"
            />
          </section>
        )}
      </BusinessContentPanel>

      <BusinessFaq
        name={business.name}
        address={business.address}
        city={business.city.name}
        acceptsCards={business.acceptsCards}
        hours={business.workingHours}
        average={averageRating}
        reviewCount={business._count.reviews}
        minimumPrice={prices._min.price}
        maximumPrice={prices._max.price}
      />
    </main>
  );
}
