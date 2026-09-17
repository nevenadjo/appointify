"use server";
import type { FormResult } from "@/lib/form-validation";

import { unstable_rethrow } from "next/navigation";
import { databaseFailure } from "@/lib/form-database-error";

import { validateRatings, formFailure } from "@/lib/form-validation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getBusinessPublicPath } from "@/lib/business-url";
import { reviewEligibleWhere } from "@/lib/review-eligibility";
import { Prisma } from "@prisma/client";

export async function createReview(
  reservationId: string,
  rating: number,
  comment: string,
  serviceRating: number,
  cleanlinessRating: number,
  valueRating: number,
  punctualityRating: number
): Promise<FormResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "CLIENT") {
      redirect("/login");
    }

    const errors = validateRatings({ rating, serviceRating, cleanlinessRating, valueRating, punctualityRating });
    if (typeof comment !== "string") errors.comment = "Comment must be text.";
    if (Object.keys(errors).length) return formFailure(errors);

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        ...reviewEligibleWhere(session.user.id),
      },
      select: {
        id: true,
        businessId: true,
        business: {
          select: {
            publicId: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!reservation) {
      return { error: "This reservation cannot be reviewed or has already been reviewed." };
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        reservationId,
      },
    });

    if (existingReview) {
      return { error: "This reservation has already been reviewed." };
    }

    try {
      await prisma.review.create({
      data: {
        reservationId: reservation.id,
        businessId: reservation.businessId,
        userId: session.user.id,
        rating,
        serviceRating,
        cleanlinessRating,
        valueRating,
        punctualityRating,
        comment: comment.trim() || null,
      },
    });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return { error: "This reservation has already been reviewed." };
      }
      throw error;
    }

    const publicPath = getBusinessPublicPath(
      reservation.business.category.name,
      reservation.business.publicId
    );

    revalidatePath(publicPath);
    revalidatePath("/dashboard/client/reservations");
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error);
  }
}
