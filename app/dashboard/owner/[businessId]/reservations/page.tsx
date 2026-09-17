import { formatPrice } from "@/lib/currency";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OwnerCancelReservationButton from "@/components/reservation/OwnerCancelReservationButton";
import OwnerCompleteReservationButton from "@/components/reservation/OwnerCompleteReservationButton";
import OwnerNoShowReservationButton from "@/components/reservation/OwnerNoShowReservationButton";
import OwnerDeleteManualReservationButton from "@/components/reservation/OwnerDeleteManualReservationButton";
import OwnerBookingForm from "@/components/reservation/OwnerBookingForm";
import ReservationPagination from "@/components/reservation/ReservationPagination";
import OwnerWeeklyCalendar from "@/components/reservation/OwnerWeeklyCalendar";

const ownerReservationFilters = [
  ["all", "All"],
  ["upcoming", "Upcoming"],
  ["awaiting-action", "Awaiting action"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
  ["no-show", "No-show"],
  ["blocked", "Blocked time"],
] as const;

type OwnerReservationFilter = (typeof ownerReservationFilters)[number][0];

const emptyText: Record<OwnerReservationFilter, string> = {
  all: "No reservations yet.",
  upcoming: "No upcoming reservations.",
  "awaiting-action": "No reservations are awaiting action.",
  completed: "No completed reservations.",
  cancelled: "No cancelled reservations.",
  "no-show": "No no-show reservations.",
  blocked: "No blocked time periods.",
};

type ReservationsPageProps = {
  params: Promise<{
    businessId: string;
  }>;
  searchParams?: Promise<{
    view?: string;
    filter?: string;
    page?: string;
    week?: string;
  }>;
};

function startOfWeek(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  const day = result.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);

  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);

  return result;
}

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseWeekParam(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export default async function OwnerReservationsPage({
  params,
  searchParams,
}: ReservationsPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const { businessId } = await params;
  const q = await searchParams;

  const activeView = q?.view === "list" ? "list" : "calendar";

  const filter: OwnerReservationFilter = ownerReservationFilters.some(
    ([key]) => key === q?.filter,
  )
    ? (q?.filter as OwnerReservationFilter)
    : "all";

  const business = await prisma.business.findFirst({
    where: {
      id: businessId,
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!business) {
    redirect("/dashboard/owner");
  }

  const now = new Date();

  const filterWhere =
    filter === "upcoming"
      ? {
          source: "ONLINE" as const,
          status: "CONFIRMED" as const,
          endTime: {
            gt: now,
          },
        }
      : filter === "awaiting-action"
        ? {
            source: "ONLINE" as const,
            status: "CONFIRMED" as const,
            endTime: {
              lte: now,
            },
          }
        : filter === "completed"
          ? {
              source: "ONLINE" as const,
              status: "COMPLETED" as const,
            }
          : filter === "cancelled"
            ? {
                source: "ONLINE" as const,
                status: "CANCELED" as const,
              }
            : filter === "no-show"
              ? {
                  source: "ONLINE" as const,
                  status: "NO_SHOW" as const,
                }
              : filter === "blocked"
                ? {
                    source: "MANUAL" as const,
                  }
                : {};

  const where = {
    businessId: business.id,
    ...filterWhere,
  };

  const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const requestedWeek = parseWeekParam(q?.week);

  const calendarWeekStart = startOfWeek(requestedWeek ?? now);

  const calendarWeekEnd = addDays(calendarWeekStart, 7);

  const calendarReservations =
    activeView === "calendar"
      ? await prisma.reservation.findMany({
          where: {
            businessId: business.id,
            status: {
              not: "CANCELED",
            },
            startTime: {
              lt: calendarWeekEnd,
            },
            endTime: {
              gt: calendarWeekStart,
            },
          },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            source: true,
            notes: true,
            service: {
              select: {
                name: true,
                duration: true,
                price: true,
              },
            },
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: {
            startTime: "asc",
          },
        })
      : [];

  const initialCalendarReservations = calendarReservations.map(
    (reservation) => ({
      id: reservation.id,
      startTime: reservation.startTime.toISOString(),
      endTime: reservation.endTime.toISOString(),
      status: reservation.status,
      source: reservation.source,
      notes: reservation.notes,
      service: reservation.service,
      user: reservation.user,
    }),
  );

  const total =
    activeView === "list"
      ? await prisma.reservation.count({
          where,
        })
      : 0;

  const pages = Math.max(1, Math.ceil(total / 12));

  const requestedPage = Number(q?.page);

  const page = Math.min(
    pages,
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1,
  );

  const reservations =
    activeView === "list"
      ? await prisma.reservation.findMany({
          where,
          include: {
            service: {
              select: {
                name: true,
                duration: true,
                price: true,
              },
            },
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
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
        })
      : [];

  function getStatusClasses(status: string) {
    switch (status) {
      case "CONFIRMED":
        return "border-green-200 bg-green-50 text-green-700";
      case "COMPLETED":
        return "border-indigo-200 bg-indigo-50 text-indigo-700";
      case "CANCELED":
        return "border-red-200 bg-red-50 text-red-700";
      case "NO_SHOW":
        return "border-amber-200 bg-amber-50 text-amber-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-600";
    }
  }

  function formatStatus(status: string) {
    if (status === "NO_SHOW") {
      return "No-show";
    }

    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  const listBasePath = `/dashboard/owner/${business.id}/reservations`;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href={`/dashboard/owner/${business.id}`}
        className="text-sm text-gray-500 transition-colors hover:text-gray-900 hover:underline"
      >
        ← Back to {business.name}
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reservations</h1>

          <p className="mt-2 text-gray-600">Reservations for {business.name}</p>
        </div>

        <OwnerBookingForm businessId={business.id} />
      </div>

      <nav
        aria-label="Reservation views"
        className="mt-8 flex w-full gap-6 border-b border-[#E5E7EB] sm:gap-8"
      >
        {(["calendar", "list"] as const).map((view) => (
          <Link
            key={view}
            href={
              view === "list"
                ? `${listBasePath}?view=list&filter=${filter}`
                : `${listBasePath}?view=calendar`
            }
            scroll={false}
            aria-current={activeView === view ? "page" : undefined}
            className={
              "-mb-px inline-flex min-h-12 items-center whitespace-nowrap border-b-2 px-1 py-3 text-sm transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1] " +
              (activeView === view
                ? "border-[#6366F1] font-semibold text-[#6366F1]"
                : "border-transparent font-medium text-gray-600 hover:text-[#6366F1]")
            }
          >
            {view === "calendar" ? "Calendar" : "List"}
          </Link>
        ))}
      </nav>

      {activeView === "calendar" ? (
        <OwnerWeeklyCalendar
          businessId={business.id}
          initialWeek={formatDateParam(calendarWeekStart)}
          initialReservations={initialCalendarReservations}
        />
      ) : (
        <>
          <nav
            aria-label="Reservation filters"
            className="mt-5 flex gap-2 overflow-x-auto pb-2"
          >
            {ownerReservationFilters.map(([key, label]) => (
              <Link
                key={key}
                href={`${listBasePath}?view=list&filter=${key}`}
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

          {reservations.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <p className="font-medium text-gray-700">{emptyText[filter]}</p>

              {filter !== "all" && (
                <p className="mt-2 text-sm text-gray-500">
                  Try another filter to see other reservations.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {reservations.map((reservation) => {
                const isManual = reservation.source === "MANUAL";

                const canCancel =
                  !isManual &&
                  reservation.status === "CONFIRMED" &&
                  reservation.startTime > now;

                const canFinalize =
                  !isManual &&
                  reservation.status === "CONFIRMED" &&
                  reservation.endTime <= now;

                const canDeleteManual =
                  isManual && reservation.status === "CONFIRMED";

                return (
                  <article
                    key={reservation.id}
                    className={`rounded-2xl border p-4 transition-colors sm:p-5 ${
                      isManual
                        ? "border-amber-200 bg-amber-50/30"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <h2 className="break-words text-lg font-semibold text-gray-900">
                            {isManual
                              ? "Blocked time"
                              : (reservation.service?.name ?? "Reservation")}
                          </h2>

                          {isManual && (
                            <span className="text-xs font-medium text-amber-700">
                              Manual
                            </span>
                          )}
                        </div>

                        {!isManual && reservation.service && (
                          <p className="mt-1 text-sm text-gray-500">
                            {reservation.service.duration} min ·{" "}
                            {formatPrice(reservation.service.price)}
                          </p>
                        )}
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
                          reservation.status,
                        )}`}
                      >
                        {formatStatus(reservation.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr]">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Date
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {fullDateFormatter.format(reservation.startTime)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Time
                        </p>

                        <p className="mt-1 whitespace-nowrap text-sm font-medium text-gray-900">
                          {timeFormatter.format(reservation.startTime)}
                          {" – "}
                          {timeFormatter.format(reservation.endTime)}
                        </p>
                      </div>

                      <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          {isManual ? "Type" : "Client"}
                        </p>

                        {isManual ? (
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            Unavailable for bookings
                          </p>
                        ) : (
                          <div className="mt-1">
                            <p className="break-words text-sm font-medium text-gray-900">
                              {reservation.user?.name ?? "Client"}
                            </p>

                            {reservation.user?.email && (
                              <p className="mt-0.5 break-all text-sm text-gray-500">
                                {reservation.user.email}
                              </p>
                            )}

                            {reservation.user?.phone && (
                              <p className="mt-0.5 text-sm text-gray-500">
                                {reservation.user.phone}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {reservation.notes && (
                      <div className="mt-4 rounded-xl bg-gray-50 px-3.5 py-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Notes
                        </p>

                        <p className="mt-1 break-words text-sm leading-6 text-gray-600">
                          {reservation.notes}
                        </p>
                      </div>
                    )}

                    {(canDeleteManual || canCancel || canFinalize) && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                        {canDeleteManual && (
                          <OwnerDeleteManualReservationButton
                            reservationId={reservation.id}
                          />
                        )}

                        {canCancel && (
                          <OwnerCancelReservationButton
                            reservationId={reservation.id}
                          />
                        )}

                        {canFinalize && (
                          <>
                            <OwnerCompleteReservationButton
                              reservationId={reservation.id}
                            />

                            <OwnerNoShowReservationButton
                              reservationId={reservation.id}
                            />
                          </>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          <ReservationPagination
            page={page}
            pages={pages}
            filter={filter}
            basePath={listBasePath}
            view="list"
          />
        </>
      )}
    </main>
  );
}
