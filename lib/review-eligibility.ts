import type { Prisma } from "@prisma/client";

export function reviewEligibleWhere(userId: string) {
  return { userId, status: "COMPLETED", review: { is: null } } satisfies Prisma.ReservationWhereInput;
}

export function canReview(reservation: { userId: string | null; status: string; review: unknown }, userId: string) {
  return reservation.userId === userId && reservation.status === "COMPLETED" && !reservation.review;
}

export function validReviewRating(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}
