export type DailySeriesEntry = {
  date: string;
  count: number;
};

export type RevenueSeriesEntry = {
  date: string;
  value: number;
};

export type ReservationSummaryRow = {
  createdAt: Date | string | null;
  status?: string | null;
  source?: string | null;
  completedAt?: Date | string | null;
  service?: { price: number | string | null } | null;
  startTime?: Date | string | null;
};

export type ReviewSummaryRow = {
  rating: number | null;
};

function toDateKey(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    .toISOString()
    .slice(0, 10);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

export function buildDailySeries(
  reservations: ReservationSummaryRow[],
  days: 7 | 30,
  referenceDate: Date = new Date(),
): DailySeriesEntry[] {
  const end = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
    ),
  );
  const start = addDays(end, -(days - 1));
  const totals = new Map<string, number>();

  for (let offset = 0; offset < days; offset += 1) {
    const date = addDays(start, offset);
    totals.set(date.toISOString().slice(0, 10), 0);
  }

  for (const reservation of reservations) {
    const key = toDateKey(reservation.createdAt);
    if (!key) continue;
    if (
      new Date(`${key}T00:00:00.000Z`).getTime() < start.getTime() ||
      new Date(`${key}T00:00:00.000Z`).getTime() > end.getTime()
    )
      continue;
    totals.set(key, (totals.get(key) ?? 0) + 1);
  }

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(start, index);
    const key = date.toISOString().slice(0, 10);
    return { date: key, count: totals.get(key) ?? 0 };
  });
}

export function buildRevenueSeries(
  reservations: ReservationSummaryRow[],
  days: 7 | 30,
  referenceDate: Date = new Date(),
): RevenueSeriesEntry[] {
  const end = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
    ),
  );
  const start = addDays(end, -(days - 1));
  const totals = new Map<string, number>();

  for (let offset = 0; offset < days; offset += 1) {
    const date = addDays(start, offset);
    totals.set(date.toISOString().slice(0, 10), 0);
  }

  for (const reservation of reservations) {
    if (reservation.status !== "COMPLETED") continue;
    const value = Number(reservation.service?.price ?? 0);
    if (!value) continue;
    const key = toDateKey(
      reservation.completedAt ?? reservation.startTime ?? reservation.createdAt,
    );
    if (!key) continue;
    if (
      new Date(`${key}T00:00:00.000Z`).getTime() < start.getTime() ||
      new Date(`${key}T00:00:00.000Z`).getTime() > end.getTime()
    )
      continue;
    totals.set(key, (totals.get(key) ?? 0) + value);
  }

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(start, index);
    const key = date.toISOString().slice(0, 10);
    return { date: key, value: totals.get(key) ?? 0 };
  });
}

export function buildStatusCounts(reservations: ReservationSummaryRow[]): {
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
} {
  return reservations.reduce(
    (counts, reservation) => {
      switch (reservation.status) {
        case "CONFIRMED":
          counts.confirmed += 1;
          break;
        case "COMPLETED":
          counts.completed += 1;
          break;
        case "CANCELED":
          counts.cancelled += 1;
          break;
        case "NO_SHOW":
          counts.noShow += 1;
          break;
        default:
          break;
      }
      return counts;
    },
    { confirmed: 0, completed: 0, cancelled: 0, noShow: 0 },
  );
}

export function buildRatingDistribution(
  reviews: ReviewSummaryRow[],
): [number, number, number, number, number] {
  return reviews.reduce(
    (distribution, review) => {
      const rating = Number(review.rating ?? 0);
      if (rating >= 1 && rating <= 5) {
        if (rating === 5) distribution[0] += 1;
        if (rating === 4) distribution[1] += 1;
        if (rating === 3) distribution[2] += 1;
        if (rating === 2) distribution[3] += 1;
        if (rating === 1) distribution[4] += 1;
      }
      return distribution;
    },
    [0, 0, 0, 0, 0],
  );
}
