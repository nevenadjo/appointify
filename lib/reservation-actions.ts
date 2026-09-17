"use server";
import type { FormResult } from "@/lib/form-validation";

import { unstable_rethrow } from "next/navigation";
import { databaseFailure } from "@/lib/form-database-error";

import {
  validateReservationTimes,
  validReservationDate,
  formFailure,
} from "@/lib/form-validation";
import { emailDate, emailTime } from "@/lib/email-time";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicBusinessWhere } from "@/lib/business-visibility";
import { getServiceAvailableSlots } from "@/lib/availability";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  sendClientCancellationEmail,
  sendNewReservationOwnerEmail,
  sendOwnerCancellationEmail,
  sendReservationConfirmationEmail,
} from "./email";

export async function createReservation(
  businessId: string,
  serviceId: string,
  startTime: string,
  redirectOnSuccess = true,
): Promise<FormResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      redirect("/login");
    }

    if (session.user.role !== "CLIENT") {
      return formFailure({}, "Only clients can make reservations.");
    }

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        businessId,
        isActive: true,
        business: publicBusinessWhere,
      },
      include: {
        business: {
          select: {
            name: true,
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      return formFailure({}, "Service is not available.");
    }

    const start = new Date(startTime);

    if (!validReservationDate(startTime)) {
      return formFailure({}, "Invalid start time.");
    }

    if (start <= new Date()) {
      return formFailure({}, "Appointments must be booked in the future.");
    }

    const end = new Date(start.getTime() + service.duration * 60 * 1000);

    const slots = await getServiceAvailableSlots(businessId, serviceId, start);

    const isValidSlot = slots.some(
      (slot) => slot.getTime() === start.getTime(),
    );

    if (!isValidSlot) {
      return formFailure({}, "This time slot is no longer available.");
    }

    const overlappingReservation = await prisma.reservation.findFirst({
      where: {
        businessId,
        status: {
          not: "CANCELED",
        },
        startTime: {
          lt: end,
        },
        endTime: {
          gt: start,
        },
      },
    });

    if (overlappingReservation) {
      return formFailure({}, "This time slot has already been booked.");
    }

    const reservation = await prisma.reservation.create({
      data: {
        businessId,
        serviceId,
        userId: session.user.id,
        startTime: start,
        endTime: end,
        status: "CONFIRMED",
        source: "ONLINE",
      },
    });

    try {
      await sendReservationConfirmationEmail({
        to: session.user.email!,
        clientName: session.user.name,
        businessName: service.business.name,
        serviceName: service.name,
        date: emailDate(start),
        startTime: emailTime(start),
        endTime: emailTime(end),
        price: service.price,
      });
    } catch (error) {
      console.error("Failed to send reservation confirmation email:", error);
    }

    try {
      await sendNewReservationOwnerEmail({
        to: service.business.owner.email,
        ownerName: service.business.owner.name,
        clientName: session.user.name,
        businessName: service.business.name,
        serviceName: service.name,
        date: emailDate(start),
        startTime: emailTime(start),
        endTime: emailTime(end),
        price: service.price,
      });
    } catch (error) {
      console.error("Failed to send owner reservation email:", error);
    }

    if (redirectOnSuccess) redirect("/dashboard/client/reservations");
    return { success: true as const };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error);
  }
}

export async function cancelReservation(
  reservationId: string,
  redirectOnSuccess = true,
): Promise<FormResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "CLIENT") {
      redirect("/login");
    }

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        userId: session.user.id,
      },
      include: {
        business: {
          select: {
            name: true,
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        service: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    });

    if (!reservation) {
      return formFailure({}, "Reservation not found.");
    }

    if (reservation.status === "CANCELED") {
      return formFailure({}, "Reservation is already canceled.");
    }

    if (reservation.status === "COMPLETED") {
      return formFailure({}, "Completed reservations cannot be canceled.");
    }

    if (reservation.startTime <= new Date()) {
      return formFailure({}, "Past reservations cannot be canceled.");
    }

    await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        status: "CANCELED",
        cancellationReason: "Canceled by client",
      },
    });

    const date = emailDate(reservation.startTime);
    const startTime = emailTime(reservation.startTime);
    const endTime = emailTime(reservation.endTime);

    try {
      await sendClientCancellationEmail({
        to: session.user.email!,
        recipientName: session.user.name,
        clientName: session.user.name,
        businessName: reservation.business.name,
        serviceName: reservation.service?.name ?? "Service",
        date,
        startTime,
        endTime,
        price: reservation.service?.price ?? 0,
        forOwner: false,
      });
    } catch (error) {
      console.error("Failed to send client cancellation email:", error);
    }

    try {
      await sendClientCancellationEmail({
        to: reservation.business.owner.email,
        recipientName: reservation.business.owner.name,
        clientName: session.user.name,
        businessName: reservation.business.name,
        serviceName: reservation.service?.name ?? "Service",
        date,
        startTime,
        endTime,
        price: reservation.service?.price ?? 0,
        forOwner: true,
      });
    } catch (error) {
      console.error("Failed to send owner cancellation email:", error);
    }

    if (redirectOnSuccess) redirect("/dashboard/client/reservations");
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error);
  }
}

export async function cancelReservationByOwner(
  reservationId: string,
  reason: string,
  redirectOnSuccess = true,
): Promise<FormResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "OWNER") {
      redirect("/login");
    }

    if (typeof reason !== "string" || !reason.trim()) {
      return formFailure({ reason: "Cancellation reason is required." });
    }

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        business: {
          ownerId: session.user.id,
        },
      },
      include: {
        business: {
          select: {
            name: true,
          },
        },
        service: {
          select: {
            name: true,
            price: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!reservation) {
      return formFailure({}, "Reservation not found.");
    }

    if (!reservation.user?.email) {
      return formFailure({}, "Reservation client email not found.");
    }

    if (reservation.status === "CANCELED") {
      return formFailure({}, "Reservation is already canceled.");
    }

    if (reservation.status === "COMPLETED") {
      return formFailure({}, "Completed reservations cannot be canceled.");
    }

    if (reservation.startTime <= new Date()) {
      return formFailure({}, "Past reservations cannot be canceled.");
    }

    await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        status: "CANCELED",
        cancellationReason: reason.trim(),
      },
    });

    try {
      await sendOwnerCancellationEmail({
        to: reservation.user.email,
        clientName: reservation.user.name,
        businessName: reservation.business.name,
        serviceName: reservation.service?.name ?? "Service",
        date: emailDate(reservation.startTime),
        startTime: emailTime(reservation.startTime),
        endTime: emailTime(reservation.endTime),
        price: reservation.service?.price ?? 0,
        reason: reason.trim(),
      });
    } catch (error) {
      console.error("Failed to send owner cancellation email:", error);
    }

    if (redirectOnSuccess)
      redirect(`/dashboard/owner/${reservation.businessId}/reservations`);
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error);
  }
}

export async function completeReservationByOwner(
  reservationId: string,
  redirectOnSuccess = true,
): Promise<FormResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "OWNER") {
      redirect("/login");
    }

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        business: {
          ownerId: session.user.id,
        },
      },
    });

    if (!reservation) {
      return formFailure({}, "Reservation not found.");
    }

    if (reservation.status !== "CONFIRMED") {
      return formFailure({}, "Only confirmed reservations can be completed.");
    }

    if (reservation.endTime > new Date()) {
      return formFailure({}, "This reservation has not finished yet.");
    }

    await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        completedBy: session.user.id,
        autoCompleted: false,
      },
    });

    if (redirectOnSuccess)
      redirect(`/dashboard/owner/${reservation.businessId}/reservations`);
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error);
  }
}

export async function markReservationNoShowByOwner(
  reservationId: string,
): Promise<FormResult> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "OWNER") {
    return {
      success: false,
      error: "You are not authorized to perform this action.",
    };
  }

  const reservation = await prisma.reservation.findUnique({
    where: {
      id: reservationId,
    },
    select: {
      id: true,
      status: true,
      source: true,
      endTime: true,
      business: {
        select: {
          id: true,
          ownerId: true,
        },
      },
    },
  });

  if (!reservation || reservation.business.ownerId !== session.user.id) {
    return {
      success: false,
      error: "Reservation not found.",
    };
  }

  if (reservation.source !== "ONLINE") {
    return {
      success: false,
      error: "Blocked time cannot be marked as a no-show.",
    };
  }

  if (reservation.status !== "CONFIRMED") {
    return {
      success: false,
      error: "Only confirmed reservations can be marked as a no-show.",
    };
  }

  if (reservation.endTime > new Date()) {
    return {
      success: false,
      error: "The appointment must end before it can be marked as a no-show.",
    };
  }

  await prisma.reservation.update({
    where: {
      id: reservation.id,
    },
    data: {
      status: "NO_SHOW",
      completedAt: null,
      completedBy: null,
      autoCompleted: false,
    },
  });

  revalidatePath(`/dashboard/owner/${reservation.business.id}/reservations`);

  return {
    success: true,
  };
}

export async function createManualReservation(
  businessId: string,
  startTime: string,
  endTime: string,
  notes?: string,
): Promise<FormResult & { businessId?: string }> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "OWNER") {
      redirect("/login");
    }

    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: session.user.id,
      },
    });

    if (!business) {
      redirect("/dashboard/owner");
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const errors = validateReservationTimes(startTime, endTime);
    if (Object.keys(errors).length) return formFailure(errors);
    
    if (start <= new Date()) {
      return formFailure({
        startTime: "Blocked time must start in the future.",
      });
    }
    if (notes !== undefined && typeof notes !== "string")
      return formFailure({ notes: "Notes must be text." });

    const overlappingReservation = await prisma.reservation.findFirst({
      where: {
        businessId,
        status: {
          not: "CANCELED",
        },
        startTime: {
          lt: end,
        },
        endTime: {
          gt: start,
        },
      },
    });

    if (overlappingReservation) {
      return formFailure({}, "This time slot is already occupied.");
    }

    await prisma.reservation.create({
      data: {
        businessId,
        userId: null,
        serviceId: null,
        startTime: start,
        endTime: end,
        status: "CONFIRMED",
        source: "MANUAL",
        notes: notes?.trim() || null,
      },
    });

    revalidatePath(`/dashboard/owner/${businessId}/reservations`);

    return {
      success: true,
      businessId,
    };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error);
  }
}

export async function deleteManualReservation(
  reservationId: string,
): Promise<FormResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "OWNER") {
      redirect("/login");
    }

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        source: "MANUAL",
        business: {
          ownerId: session.user.id,
        },
      },
      select: {
        id: true,
        businessId: true,
      },
    });

    if (!reservation) {
      return formFailure({}, "Manual reservation not found.");
    }

    await prisma.reservation.delete({
      where: {
        id: reservation.id,
      },
    });

    revalidatePath(`/dashboard/owner/${reservation.businessId}/reservations`);

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return databaseFailure(error);
  }
}
