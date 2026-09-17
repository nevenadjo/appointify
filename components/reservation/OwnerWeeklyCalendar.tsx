"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/currency";

type CalendarReservation = {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  source: string;
  notes: string | null;
  service: {
    name: string;
    duration: number;
    price: number;
  } | null;
  user: {
    name: string | null;
    email: string;
    phone: string | null;
  } | null;
};

type OwnerWeeklyCalendarProps = {
  businessId: string;
  initialWeek: string;
  initialReservations: CalendarReservation[];
};

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  return date;
}

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

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function formatStatus(status: string) {
  if (status === "NO_SHOW") {
    return "No-show";
  }

  return status.charAt(0) + status.slice(1).toLowerCase();
}

function isAwaitingAction(
  reservation: CalendarReservation,
  now: Date,
) {
  return (
    reservation.source === "ONLINE" &&
    reservation.status === "CONFIRMED" &&
    new Date(reservation.endTime) <= now
  );
}

function getCalendarCardClasses(
  status: string,
  isManual: boolean,
  awaitingAction = false,
) {
  if (isManual) {
    return "border-amber-200 bg-amber-50 hover:border-amber-300";
  }

  if (awaitingAction) {
    return "border-orange-200 bg-orange-50/70 hover:border-orange-300";
  }

  switch (status) {
    case "CONFIRMED":
      return "border-indigo-200 bg-[#E9EAFF]/60 hover:border-indigo-300";
    case "COMPLETED":
      return "border-gray-200 bg-gray-50 hover:border-gray-300";
    case "NO_SHOW":
      return "border-amber-200 bg-amber-50/70 hover:border-amber-300";
    default:
      return "border-gray-200 bg-white hover:border-gray-300";
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "border-green-200 bg-green-50 text-green-700";
    case "COMPLETED":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";
    case "NO_SHOW":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

export default function OwnerWeeklyCalendar({
  businessId,
  initialWeek,
  initialReservations,
}: OwnerWeeklyCalendarProps) {
  const [week, setWeek] = useState(initialWeek);
  const [reservations, setReservations] = useState(
    initialReservations,
  );
  const [selectedReservation, setSelectedReservation] =
    useState<CalendarReservation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const now = new Date();
  const weekStart = startOfWeek(parseDate(week));
  const weekEnd = addDays(weekStart, 6);

  const calendarDays = Array.from(
    { length: 7 },
    (_, index) => addDays(weekStart, index),
  );

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const weekRangeFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  const weekTitle =
    weekStart.getFullYear() === weekEnd.getFullYear()
      ? `${weekRangeFormatter.format(weekStart)} – ${weekRangeFormatter.format(weekEnd)}, ${weekEnd.getFullYear()}`
      : `${weekRangeFormatter.format(weekStart)}, ${weekStart.getFullYear()} – ${weekRangeFormatter.format(weekEnd)}, ${weekEnd.getFullYear()}`;

  const todayWeekStart = startOfWeek(now);

  const selectedAwaitingAction = selectedReservation
    ? isAwaitingAction(selectedReservation, now)
    : false;

  useEffect(() => {
    if (!selectedReservation) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedReservation(null);
      }
    }

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedReservation]);

  async function changeWeek(date: Date) {
    if (loading) {
      return;
    }

    const nextWeek = formatDateParam(startOfWeek(date));

    if (nextWeek === week) {
      return;
    }

    setLoading(true);
    setError("");
    setSelectedReservation(null);

    try {
      const response = await fetch(
        `/api/owner/businesses/${businessId}/reservations/calendar?week=${encodeURIComponent(nextWeek)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "Could not load this week.");
        return;
      }

      setReservations(data.reservations);
      setWeek(nextWeek);

      const url = new URL(window.location.href);

      url.searchParams.set("view", "calendar");
      url.searchParams.set("week", nextWeek);
      url.searchParams.delete("filter");
      url.searchParams.delete("page");

      window.history.replaceState(
        null,
        "",
        `${url.pathname}${url.search}`,
      );
    } catch {
      setError("Could not load this week.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {weekTitle}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Weekly schedule
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => changeWeek(addDays(weekStart, -7))}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={
                loading ||
                formatDateParam(todayWeekStart) === week
              }
              onClick={() => changeWeek(todayWeekStart)}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-indigo-200 bg-[#E9EAFF] px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-[#DFE1FF] disabled:cursor-default disabled:opacity-60"
            >
              Today
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => changeWeek(addDays(weekStart, 7))}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="relative mt-5">
          {loading && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-3">
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
                Loading...
              </span>
            </div>
          )}

          <div
            className={`transition-opacity duration-200 ${
              loading ? "opacity-50" : "opacity-100"
            }`}
          >
            <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white lg:grid lg:grid-cols-7">
              {calendarDays.map((day) => {
                const dayReservations = reservations.filter(
                  (reservation) =>
                    isSameDay(
                      new Date(reservation.startTime),
                      day,
                    ),
                );

                const isToday = isSameDay(day, now);

                return (
                  <div
                    key={day.toISOString()}
                    className="min-w-0 border-r border-gray-200 last:border-r-0"
                  >
                    <div
                      className={`border-b border-gray-200 px-3 py-4 text-center ${
                        isToday ? "bg-[#E9EAFF]/60" : ""
                      }`}
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {day.toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </p>

                      <div
                        className={`mx-auto mt-1 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                          isToday
                            ? "bg-[#4F46E5] text-white"
                            : "text-gray-900"
                        }`}
                      >
                        {day.getDate()}
                      </div>
                    </div>

                    <div className="min-h-72 space-y-2 p-2">
                      {dayReservations.length === 0 ? (
                        <p className="px-1 py-3 text-center text-xs text-gray-400">
                          No appointments
                        </p>
                      ) : (
                        dayReservations.map((reservation) => {
                          const isManual =
                            reservation.source === "MANUAL";

                          const awaitingAction =
                            isAwaitingAction(reservation, now);

                          return (
                            <button
                              key={reservation.id}
                              type="button"
                              onClick={() =>
                                setSelectedReservation(
                                  reservation,
                                )
                              }
                              className={`block w-full cursor-pointer rounded-xl border p-3 text-left transition-all hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${getCalendarCardClasses(
                                reservation.status,
                                isManual,
                                awaitingAction,
                              )}`}
                            >
                              <p className="text-xs font-semibold text-gray-900">
                                {timeFormatter.format(
                                  new Date(
                                    reservation.startTime,
                                  ),
                                )}
                              </p>

                              <p className="mt-1 break-words text-sm font-medium leading-5 text-gray-900">
                                {isManual
                                  ? "Blocked"
                                  : (reservation.service
                                      ?.name ??
                                    "Reservation")}
                              </p>

                              {!isManual &&
                                (awaitingAction ||
                                  reservation.status !==
                                    "CONFIRMED") && (
                                  <p
                                    className={`mt-1 text-[11px] ${
                                      awaitingAction
                                        ? "font-medium text-orange-700"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {awaitingAction
                                      ? "Awaiting action"
                                      : formatStatus(
                                          reservation.status,
                                        )}
                                  </p>
                                )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 lg:hidden">
              {calendarDays.map((day) => {
                const dayReservations = reservations.filter(
                  (reservation) =>
                    isSameDay(
                      new Date(reservation.startTime),
                      day,
                    ),
                );

                const isToday = isSameDay(day, now);

                return (
                  <section
                    key={day.toISOString()}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                  >
                    <div
                      className={`flex items-center justify-between border-b border-gray-200 px-4 py-3 ${
                        isToday ? "bg-[#E9EAFF]/60" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {day.toLocaleDateString("en-US", {
                            weekday: "long",
                          })}
                        </p>

                        <span className="text-sm text-gray-500">
                          {day.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {isToday && (
                        <span className="rounded-full bg-[#4F46E5] px-2.5 py-1 text-xs font-medium text-white">
                          Today
                        </span>
                      )}
                    </div>

                    {dayReservations.length === 0 ? (
                      <p className="px-4 py-5 text-sm text-gray-400">
                        No appointments
                      </p>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {dayReservations.map((reservation) => {
                          const isManual =
                            reservation.source === "MANUAL";

                          const awaitingAction =
                            isAwaitingAction(reservation, now);

                          return (
                            <div
                              key={reservation.id}
                              className="flex items-start gap-4 px-4 py-4"
                            >
                              <div className="w-20 shrink-0">
                                <p className="text-sm font-semibold text-gray-900">
                                  {timeFormatter.format(
                                    new Date(
                                      reservation.startTime,
                                    ),
                                  )}
                                </p>

                                <p className="mt-0.5 text-xs text-gray-400">
                                  {timeFormatter.format(
                                    new Date(
                                      reservation.endTime,
                                    ),
                                  )}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedReservation(
                                    reservation,
                                  )
                                }
                                className={`min-w-0 flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-left transition-all hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${getCalendarCardClasses(
                                  reservation.status,
                                  isManual,
                                  awaitingAction,
                                )}`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="break-words text-sm font-medium text-gray-900">
                                    {isManual
                                      ? "Blocked time"
                                      : (reservation.service
                                          ?.name ??
                                        "Reservation")}
                                  </p>

                                  {!isManual && (
                                    <span
                                      className={`text-[11px] font-medium ${
                                        awaitingAction
                                          ? "text-orange-700"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {awaitingAction
                                        ? "Awaiting action"
                                        : formatStatus(
                                            reservation.status,
                                          )}
                                    </span>
                                  )}
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {selectedReservation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedReservation(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-details-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-indigo-600">
                  {selectedReservation.source === "MANUAL"
                    ? "Blocked time"
                    : "Reservation"}
                </p>

                <h2
                  id="reservation-details-title"
                  className="mt-1 text-2xl font-semibold text-gray-900"
                >
                  {selectedReservation.source === "MANUAL"
                    ? "Blocked time"
                    : (selectedReservation.service?.name ??
                      "Reservation")}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close reservation details"
                onClick={() =>
                  setSelectedReservation(null)
                }
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Date
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {dateFormatter.format(
                    new Date(
                      selectedReservation.startTime,
                    ),
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Time
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {timeFormatter.format(
                    new Date(
                      selectedReservation.startTime,
                    ),
                  )}
                  {" – "}
                  {timeFormatter.format(
                    new Date(
                      selectedReservation.endTime,
                    ),
                  )}
                </p>
              </div>

              {selectedReservation.source !== "MANUAL" && (
                <>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Status
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        selectedAwaitingAction
                          ? "border-orange-200 bg-orange-50 text-orange-700"
                          : getStatusClasses(
                              selectedReservation.status,
                            )
                      }`}
                    >
                      {selectedAwaitingAction
                        ? "Awaiting action"
                        : formatStatus(
                            selectedReservation.status,
                          )}
                    </span>
                  </div>

                  {selectedReservation.service && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Service
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {selectedReservation.service.name}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {
                          selectedReservation.service
                            .duration
                        }{" "}
                        min ·{" "}
                        {formatPrice(
                          selectedReservation.service
                            .price,
                        )}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {selectedReservation.source !== "MANUAL" &&
              selectedReservation.user && (
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Client
                  </p>

                  <p className="mt-2 font-medium text-gray-900">
                    {selectedReservation.user.name ??
                      "Client"}
                  </p>

                  <p className="mt-1 break-all text-sm text-gray-600">
                    {selectedReservation.user.email}
                  </p>

                  {selectedReservation.user.phone && (
                    <p className="mt-1 text-sm text-gray-600">
                      {selectedReservation.user.phone}
                    </p>
                  )}
                </div>
              )}

            {selectedReservation.notes && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Notes
                </p>

                <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-gray-700">
                  {selectedReservation.notes}
                </p>
              </div>
            )}

            <div className="mt-7 flex justify-end border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={() =>
                  setSelectedReservation(null)
                }
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}