import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isBusinessPublic } from "@/lib/business-visibility";
import CancelReservationButton from "@/components/reservation/CancelReservationButton";
import ReviewForm from "@/components/owner/review/ReviewForm";
import ReservationPagination from "@/components/reservation/ReservationPagination";
import Link from "next/link";
import Image from "next/image";
import { getBusinessPublicPath } from "@/lib/business-url";
import { canReview } from "@/lib/review-eligibility";
import {
  clientReservationsWhere,
  reservationFilters,
} from "@/lib/client-reservations";

const emptyText: Record<string, string> = {
  all: "No reservations yet.",
  upcoming: "No upcoming reservations.",
  completed: "No completed reservations.",
  "ready-for-review": "No reservations ready for review.",
  cancelled: "No cancelled reservations.",
};

export default async function ClientReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    filter?: string;
    page?: string;
  }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CLIENT") {
    redirect("/login");
  }

  const params = await searchParams;

  const filter = reservationFilters.some(([key]) => key === params.filter)
    ? params.filter!
    : "all";

  const now = new Date();

  const where = clientReservationsWhere(session.user.id, filter, now);

  const [total, allCount] = await Promise.all([
    prisma.reservation.count({
      where,
    }),
    prisma.reservation.count({
      where: {
        userId: session.user.id,
      },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / 12));
  const requested = Number(params.page);

  const page = Math.min(
    pages,
    Number.isSafeInteger(requested) && requested > 0 ? requested : 1,
  );

  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      review: {
        select: {
          id: true,
        },
      },
      business: {
        select: {
          id: true,
          publicId: true,
          name: true,
          city: true,
          address: true,
          isActive: true,
          isSuspended: true,
          category: {
            select: {
              name: true,
            },
          },
          images: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              imageUrl: true,
            },
          },
        },
      },
      service: {
        select: {
          name: true,
          duration: true,
          price: true,
        },
      },
    },
    orderBy: [
      {
        startTime: "desc",
      },
      {
        id: "desc",
      },
    ],
    take: 12,
    skip: (page - 1) * 12,
  });

  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Belgrade",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Belgrade",
    hour: "2-digit",
    minute: "2-digit",
  });

  const price = new Intl.NumberFormat("sr-RS");

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="rounded-3xl bg-[#E9EAFF] px-6 py-8 sm:px-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          My Reservations
        </h1>

        <p className="mt-3 text-gray-600">
          Keep track of your appointments and share your experiences.
        </p>
      </header>

      <nav
        aria-label="Reservation filters"
        className="mt-5 flex gap-2 overflow-x-auto pb-2"
      >
        {reservationFilters.map(([key, label]) => (
          <Link
            key={key}
            href={`/dashboard/client/reservations?filter=${key}`}
            aria-current={filter === key ? "page" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-xl border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-indigo-500 ${
              filter === key
                ? "border-indigo-200 bg-[#E9EAFF] text-gray-900"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {!reservations.length ? (
        <section className="mt-5 rounded-2xl border border-gray-200 bg-[#FFF4E1]/40 px-6 py-12 text-center">
          <h2 className="text-xl font-semibold">
            {allCount ? emptyText[filter] : emptyText.all}
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            {allCount
              ? "Try another filter to see your other appointments."
              : "Find a business and book your next appointment."}
          </p>

          {!allCount && (
            <Link
              href="/businesses"
              className="mt-6 inline-flex rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-700"
            >
              Explore businesses
            </Link>
          )}
        </section>
      ) : (
        <div className="mt-4 space-y-3">
          {reservations.map((reservation) => {
            const visible = isBusinessPublic(reservation.business);

            const ready = canReview(reservation, session.user.id);

            const upcoming =
              reservation.status === "CONFIRMED" && reservation.startTime > now;

            const label = ready
              ? "Ready for review"
              : upcoming
                ? "Upcoming"
                : {
                    CONFIRMED: "Confirmed",
                    COMPLETED: "Completed",
                    CANCELED: "Cancelled",
                    NO_SHOW: "No show",
                  }[reservation.status];

            const badge = ready
              ? "bg-[#FFF4E1] text-amber-900"
              : reservation.status === "CANCELED"
                ? "bg-red-50 text-red-700"
                : reservation.status === "COMPLETED"
                  ? "bg-green-50 text-green-800"
                  : reservation.status === "NO_SHOW"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-[#E9EAFF] text-indigo-900";

            return (
              <article
                key={reservation.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                <div className="grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[230px_minmax(0,1fr)_220px_210px] lg:items-center">
                  <div className="relative aspect-[16/10] bg-gray-50 md:h-full md:min-h-[170px] md:aspect-auto">
                    <Image
                      src={
                        visible
                          ? reservation.business.images[0]?.imageUrl ||
                            "/business-placeholder.svg"
                          : "/business-placeholder.svg"
                      }
                      alt=""
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 230px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 p-5 md:px-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="min-w-0 break-words text-lg font-semibold leading-snug">
                        {visible ? (
                          <Link
                            href={getBusinessPublicPath(
                              reservation.business.category.name,
                              reservation.business.publicId,
                            )}
                            className="hover:text-indigo-700"
                          >
                            {reservation.business.name}
                          </Link>
                        ) : (
                          "Business unavailable"
                        )}
                      </h2>

                      <span
                        className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-medium ${badge}`}
                      >
                        {label}
                      </span>
                    </div>

                    {visible && (
                      <p className="mt-2 break-words text-sm text-gray-500">
                        {reservation.business.city.name} ·{" "}
                        {reservation.business.address}
                      </p>
                    )}

                    {reservation.service && (
                      <>
                        <p className="mt-4 break-words text-sm font-medium text-gray-900">
                          {reservation.service.name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {reservation.service.duration} min
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center px-5 pb-5 md:col-start-2 md:px-6 lg:col-start-auto lg:px-6 lg:py-5">
                    {upcoming && (
                      <div className="w-full [&>div]:w-full [&>div>button]:min-h-12 [&>div>button]:w-full [&>div>button]:rounded-xl">
                        <CancelReservationButton
                          reservationId={reservation.id}
                        />
                      </div>
                    )}

                    {ready && (
                      <div className="w-full [&>div]:w-full [&>div>button]:min-h-12 [&>div>button]:w-full [&>div>button]:rounded-xl [&>div>button]:bg-gray-900 [&>div>button]:text-white [&>div>button]:hover:bg-gray-700">
                        <ReviewForm reservationId={reservation.id} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 border-t border-gray-100 px-5 py-5 md:col-start-2 md:border-t-0 md:pt-0 lg:col-start-auto lg:border-l lg:border-gray-100 lg:px-6 lg:py-5">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-gray-400"
                      >
                        <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
                      </svg>

                      <span>{date.format(reservation.startTime)}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-gray-400"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>

                      <span>
                        {time.format(reservation.startTime)} –{" "}
                        {time.format(reservation.endTime)}
                      </span>
                    </div>

                    {reservation.service && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 text-gray-400"
                        >
                          <path d="M20 13 13 20 4 11V4h7l9 9Z" />
                          <circle cx="8.5" cy="8.5" r="1" />
                        </svg>

                        <span>
                          {price.format(reservation.service.price)} RSD
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ReservationPagination page={page} pages={pages} filter={filter} />
    </main>
  );
}
