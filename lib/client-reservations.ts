import type { Prisma } from "@prisma/client";
import { reviewEligibleWhere } from "./review-eligibility";

export const reservationFilters = [
  ["all", "All"], ["upcoming", "Upcoming"], ["completed", "Completed"],
  ["ready-for-review", "Ready for review"], ["cancelled", "Cancelled"],
] as const;

export function clientReservationsWhere(userId: string, filter: string, now: Date): Prisma.ReservationWhereInput {
  switch (filter) {
    case "upcoming": return { userId, status: "CONFIRMED", startTime: { gt: now } };
    case "completed": return { userId, status: "COMPLETED", review: { isNot: null } };
    case "ready-for-review": return reviewEligibleWhere(userId);
    case "cancelled": return { userId, status: "CANCELED" };
    default: return { userId };
  }
}
