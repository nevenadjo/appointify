import Link from "next/link";
import { formatPrice } from "@/lib/currency";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildDailySeries,
  buildRatingDistribution,
  buildRevenueSeries,
  buildStatusCounts,
} from "@/lib/owner-statistics";

const APP_ACCENT = "#4F46E5";
const SOFT_ACCENT = "#FFF4E1";

const STATUS_COLORS = {
  confirmed: "#16a34a",
  completed: APP_ACCENT,
  cancelled: "#dc2626",
  noShow: "#f59e0b",
};

function formatChartDate(date: string) {
  const value = new Date(`${date}T00:00:00.000Z`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(value);
}

function getVisibleDateTicks<T extends { date: string }>(
  entries: T[],
  targetCount = 6,
) {
  if (entries.length <= targetCount) {
    return entries.map((entry) => entry.date);
  }

  const step = Math.max(1, Math.ceil(entries.length / targetCount));

  const tickDates = entries
    .filter(
      (_, index) =>
        index % step === 0 || index === entries.length - 1,
    )
    .map((entry) => entry.date);

  return [...new Set(tickDates)];
}

function clampPercent(value: number) {
  return Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : 0;
}

export default async function BusinessStatisticsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const { businessId } = await params;

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

  const today = new Date();

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    reservations,
    reviews,
    servicesWithCounts,
  ] = await Promise.all([
    prisma.reservation.findMany({
      where: { businessId },
      select: {
        id: true,
        status: true,
        source: true,
        createdAt: true,
        completedAt: true,
        startTime: true,
        service: {
          select: {
            price: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),

    prisma.review.findMany({
      where: { businessId },
      select: {
        rating: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.service.findMany({
      where: { businessId },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            reservations: true,
          },
        },
      },
      orderBy: [
        { reservations: { _count: "desc" } },
        { name: "asc" },
      ],
    }),
  ]);

  const totalReservations = reservations.length;
  const totalReviews = reviews.length;

  const onlineReservations = reservations.filter(
    (reservation) => reservation.source === "ONLINE",
  ).length;

  const manualReservations = reservations.filter(
    (reservation) => reservation.source === "MANUAL",
  ).length;

  const statusCounts = buildStatusCounts(reservations);

  const confirmedReservations = statusCounts.confirmed;
  const completedReservations = statusCounts.completed;
  const canceledReservations = statusCounts.cancelled;

  const reservationsLast30Days = reservations.filter(
    (reservation) => reservation.createdAt >= thirtyDaysAgo,
  );

  const reviewsLast30Days = reviews.filter(
    (review) => review.createdAt >= thirtyDaysAgo,
  );

  const kpiReservations = reservationsLast30Days.length;

  const kpiRevenue = reservationsLast30Days
    .filter(
      (reservation) => reservation.status === "COMPLETED",
    )
    .reduce(
      (sum, reservation) =>
        sum + Number(reservation.service?.price ?? 0),
      0,
    );

  const kpiReviews = reviewsLast30Days.length;

  const kpiAverageRating =
    kpiReviews > 0
      ? reviewsLast30Days.reduce(
          (sum, review) => sum + review.rating,
          0,
        ) / kpiReviews
      : null;

  const ratingDistribution =
    buildRatingDistribution(reviews);

  const maxRatingCount = Math.max(
    ...ratingDistribution,
    1,
  );

  const recentReservations = buildDailySeries(
    reservations,
    30,
    today,
  );

  const recentRevenue = buildRevenueSeries(
    reservations,
    30,
    today,
  );

  const popularServices = servicesWithCounts
    .filter(
      (service) => service._count.reservations > 0,
    )
    .slice(0, 5);

  const totalValue = Math.max(
    ...recentReservations.map((entry) => entry.count),
    1,
  );

  const statusTotal = Math.max(
    confirmedReservations +
      completedReservations +
      canceledReservations +
      statusCounts.noShow,
    1,
  );

  const reservationTickDates = getVisibleDateTicks(
    recentReservations,
    6,
  );

  const revenueTickDates = getVisibleDateTicks(
    recentRevenue,
    6,
  );

  const reservationBreakdown = [
    {
      label: "Confirmed",
      value: confirmedReservations,
      color: STATUS_COLORS.confirmed,
    },
    {
      label: "Completed",
      value: completedReservations,
      color: STATUS_COLORS.completed,
    },
    {
      label: "Cancelled",
      value: canceledReservations,
      color: STATUS_COLORS.cancelled,
    },
    {
      label: "Online",
      value: onlineReservations,
      color: "#8b5cf6",
    },
    {
      label: "Manual",
      value: manualReservations,
      color: "#cbd5e1",
    },
  ];

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href={`/dashboard/owner/${business.id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900 hover:underline"
        >
          ← Back to {business.name}
        </Link>

        <div className="mt-4 flex flex-col gap-2 border-b border-gray-200 pb-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
            Statistics
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            {business.name}
          </h1>
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Reservations
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {kpiReservations}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Last 30 days
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Revenue
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {formatPrice(kpiRevenue)}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Last 30 days
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Average rating
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {kpiAverageRating !== null
                ? kpiAverageRating.toFixed(1)
                : "—"}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Last 30 days
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Reviews
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {kpiReviews}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Last 30 days
            </p>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-[#FFF4E1]/40 p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Reservations over time
              </h2>

              <p className="text-sm text-gray-500">
                Booked reservations in the last 30 days
              </p>
            </div>
          </div>

          {recentReservations.some(
            (entry) => entry.count > 0,
          ) ? (
            <div className="mt-5">
              <div className="w-full overflow-x-auto pb-2">
                <div className="h-64 min-w-[640px] sm:min-w-0">
                  <svg
                    viewBox="0 0 720 220"
                    preserveAspectRatio="none"
                    className="h-full w-full overflow-visible"
                  >
                    <g>
                      {[0, 1, 2, 3].map((step) => (
                        <line
                          key={step}
                          x1="40"
                          x2="700"
                          y1={30 + step * 45}
                          y2={30 + step * 45}
                          stroke="#e5e7eb"
                          strokeDasharray="4 6"
                        />
                      ))}

                      <path
                        d={recentReservations
                          .map((entry, index) => {
                            const x =
                              40 +
                              index *
                                (660 /
                                  Math.max(
                                    recentReservations.length -
                                      1,
                                    1,
                                  ));

                            const y =
                              180 -
                              (entry.count / totalValue) *
                                120;

                            return `${
                              index === 0 ? "M" : "L"
                            }${x} ${y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke={APP_ACCENT}
                        strokeWidth="3"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />

                      {recentReservations.map(
                        (entry, index) => {
                          const x =
                            40 +
                            index *
                              (660 /
                                Math.max(
                                  recentReservations.length -
                                    1,
                                  1,
                                ));

                          const y =
                            180 -
                            (entry.count / totalValue) *
                              120;

                          return (
                            <g key={entry.date}>
                              <circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill={APP_ACCENT}
                              />

                              <title>
                                {`${entry.date}: ${entry.count} reservations`}
                              </title>
                            </g>
                          );
                        },
                      )}

                      {recentReservations.map(
                        (entry, index) => {
                          const x =
                            40 +
                            index *
                              (660 /
                                Math.max(
                                  recentReservations.length -
                                    1,
                                  1,
                                ));

                          const showLabel =
                            reservationTickDates.includes(
                              entry.date,
                            );

                          return showLabel ? (
                            <text
                              key={`${entry.date}-label`}
                              x={x}
                              y="206"
                              textAnchor="middle"
                              fontSize="10"
                              fill="#6b7280"
                            >
                              {formatChartDate(entry.date)}
                            </text>
                          ) : null;
                        },
                      )}
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
              Reservation data will appear here once this
              business receives bookings.
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_1.45fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Reservations by status
            </h2>

            {statusTotal > 0 ? (
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative mx-auto h-44 w-44 shrink-0">
                  <svg
                    viewBox="0 0 120 120"
                    className="h-full w-full -rotate-90"
                  >
                    {[
                      {
                        label: "Confirmed",
                        value: confirmedReservations,
                        color: STATUS_COLORS.confirmed,
                        offset: 0,
                      },
                      {
                        label: "Completed",
                        value: completedReservations,
                        color: STATUS_COLORS.completed,
                        offset: confirmedReservations,
                      },
                      {
                        label: "Cancelled",
                        value: canceledReservations,
                        color: STATUS_COLORS.cancelled,
                        offset:
                          confirmedReservations +
                          completedReservations,
                      },
                      {
                        label: "No-show",
                        value: statusCounts.noShow,
                        color: STATUS_COLORS.noShow,
                        offset:
                          confirmedReservations +
                          completedReservations +
                          canceledReservations,
                      },
                    ]
                      .filter(
                        (entry) => entry.value > 0,
                      )
                      .map((entry) => {
                        const circumference =
                          2 * Math.PI * 45;

                        const fraction =
                          entry.value / statusTotal;

                        const dash =
                          fraction * circumference;

                        return (
                          <circle
                            key={entry.label}
                            cx="60"
                            cy="60"
                            r="45"
                            fill="none"
                            stroke={entry.color}
                            strokeWidth="14"
                            strokeDasharray={`${dash} ${
                              circumference - dash
                            }`}
                            strokeDashoffset={
                              -(
                                (entry.offset /
                                  statusTotal) *
                                circumference
                              )
                            }
                          />
                        );
                      })}
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {totalReservations}
                    </span>

                    <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
                      total
                    </span>
                  </div>
                </div>

                <ul className="w-full space-y-3 text-sm text-gray-700">
                  {[
                    {
                      label: "Confirmed",
                      value: confirmedReservations,
                      color: STATUS_COLORS.confirmed,
                    },
                    {
                      label: "Completed",
                      value: completedReservations,
                      color: STATUS_COLORS.completed,
                    },
                    {
                      label: "Cancelled",
                      value: canceledReservations,
                      color: STATUS_COLORS.cancelled,
                    },
                    {
                      label: "No-show",
                      value: statusCounts.noShow,
                      color: STATUS_COLORS.noShow,
                    },
                  ].map((entry) => (
                    <li
                      key={entry.label}
                      className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: entry.color,
                          }}
                        />

                        {entry.label}
                      </span>

                      <span className="font-semibold text-gray-900">
                        {entry.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                Reservation data will appear here once this
                business receives bookings.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Popular services
            </h2>

            {popularServices.length > 0 ? (
              <div className="mt-5 space-y-4">
                {popularServices.map(
                  (service, index) => {
                    const width = clampPercent(
                      (service._count.reservations /
                        Math.max(
                          popularServices[0]._count
                            .reservations,
                          1,
                        )) *
                        100,
                    );

                    return (
                      <div key={service.id}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                          <span className="truncate font-medium text-gray-700">
                            {index + 1}. {service.name}
                          </span>

                          <span className="shrink-0 font-semibold text-gray-900">
                            {
                              service._count
                                .reservations
                            }
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${width}%`,
                              backgroundColor:
                                APP_ACCENT,
                            }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                No reservation data available for
                services yet.
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Revenue over time
              </h2>

              <p className="text-sm text-gray-500">
                Completed reservations in the last 30 days
              </p>
            </div>
          </div>

          {recentRevenue.some(
            (entry) => entry.value > 0,
          ) ? (
            <div className="mt-5">
              <div className="w-full overflow-x-auto pb-2">
                <div className="h-64 min-w-[640px] sm:min-w-0">
                  <svg
                    viewBox="0 0 720 220"
                    preserveAspectRatio="none"
                    className="h-full w-full overflow-visible"
                  >
                    <g>
                      {[0, 1, 2, 3].map((step) => (
                        <line
                          key={step}
                          x1="40"
                          x2="700"
                          y1={30 + step * 45}
                          y2={30 + step * 45}
                          stroke="#e5e7eb"
                          strokeDasharray="4 6"
                        />
                      ))}

                      {(() => {
                        const maxRevenue = Math.max(
                          ...recentRevenue.map(
                            (entry) => entry.value,
                          ),
                          1,
                        );

                        const points = recentRevenue
                          .map((entry, index) => {
                            const x =
                              40 +
                              index *
                                (660 /
                                  Math.max(
                                    recentRevenue.length -
                                      1,
                                    1,
                                  ));

                            const y =
                              180 -
                              (entry.value /
                                maxRevenue) *
                                120;

                            return `${x},${y}`;
                          })
                          .join(" ");

                        return (
                          <>
                            <polyline
                              fill="none"
                              stroke={APP_ACCENT}
                              strokeWidth="3"
                              points={points}
                            />

                            {recentRevenue.map(
                              (entry, index) => {
                                const x =
                                  40 +
                                  index *
                                    (660 /
                                      Math.max(
                                        recentRevenue.length -
                                          1,
                                        1,
                                      ));

                                const y =
                                  180 -
                                  (entry.value /
                                    maxRevenue) *
                                    120;

                                return (
                                  <g key={entry.date}>
                                    <circle
                                      cx={x}
                                      cy={y}
                                      r="4"
                                      fill={APP_ACCENT}
                                    />

                                    <title>
                                      {`${entry.date}: ${formatPrice(
                                        entry.value,
                                      )}`}
                                    </title>
                                  </g>
                                );
                              },
                            )}

                            {recentRevenue.map(
                              (entry, index) => {
                                const x =
                                  40 +
                                  index *
                                    (660 /
                                      Math.max(
                                        recentRevenue.length -
                                          1,
                                        1,
                                      ));

                                const showLabel =
                                  revenueTickDates.includes(
                                    entry.date,
                                  );

                                return showLabel ? (
                                  <text
                                    key={`${entry.date}-label`}
                                    x={x}
                                    y="206"
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#6b7280"
                                  >
                                    {formatChartDate(
                                      entry.date,
                                    )}
                                  </text>
                                ) : null;
                              },
                            )}
                          </>
                        );
                      })()}
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
              Revenue will appear here once this business
              has completed bookings.
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Rating distribution
            </h2>

            {totalReviews > 0 ? (
              <div className="mt-5 space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count =
                    ratingDistribution[5 - star];

                  const width = clampPercent(
                    (count / maxRatingCount) * 100,
                  );

                  return (
                    <div
                      key={star}
                      className="grid grid-cols-[56px_1fr_32px] items-center gap-3 text-sm text-gray-700"
                    >
                      <span className="font-medium text-gray-600">
                        {star} star
                        {star === 1 ? "" : "s"}
                      </span>

                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>

                      <span className="text-right font-semibold text-gray-900">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                Rating data will appear after clients leave
                reviews.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Reservation breakdown
            </h2>

            <div className="mt-5 space-y-3">
              {reservationBreakdown.map((entry) => (
                <div
                  key={entry.label}
                  className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-3 py-2.5"
                >
                  <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: entry.color,
                      }}
                    />

                    {entry.label}
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}