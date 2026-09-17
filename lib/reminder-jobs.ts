import "server-only";

import { prisma } from "@/lib/prisma";
import { emailDate, emailTime } from "@/lib/email-time";
import { sendReservationReminderEmail, sendReviewReminderEmail } from "./email";

export async function autoCompleteReservations() {
  const now = new Date();
  const autoCompleteBefore = new Date(
    now.getTime() - 24 * 60 * 60 * 1000
  );

  const result = await prisma.reservation.updateMany({
    where: {
      status: "CONFIRMED",
      source: "ONLINE",
      endTime: { lte: autoCompleteBefore },
    },
    data: {
      status: "COMPLETED",
      completedAt: now,
      completedBy: null,
      autoCompleted: true,
    },
  });

  return { completed: result.count };
}

export async function sendReservationReminders() {
  const now = new Date();

  const reminderEnd = new Date(
    now.getTime() + 24 * 60 * 60 * 1000
  );

  const reservations = await prisma.reservation.findMany({
    where: {
      status: "CONFIRMED",
      reminderSent: false,
      startTime: {
        gt: now,
        lte: reminderEnd,
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

  let sent = 0;

  for (const reservation of reservations) {
    if (!reservation.user?.email) {
      continue;
    }

    if (!reservation.service) {
      continue;
    }

    try {
      await sendReservationReminderEmail({
        to: reservation.user.email,
        clientName: reservation.user.name,
        businessName: reservation.business.name,
        serviceName: reservation.service.name,
        date: emailDate(reservation.startTime),
        startTime: emailTime(reservation.startTime),
        endTime: emailTime(reservation.endTime),
      });

      await prisma.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          reminderSent: true,
        },
      });

      sent++;
    } catch (error) {
      console.error(
        `Failed to send reminder for reservation ${reservation.id}:`,
        error
      );
    }
  }

  return {
    found: reservations.length,
    sent,
  };
}

export async function sendReviewReminders() {
  const now = new Date();

  const reminderStart = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000
  );

  const reminderEnd = new Date(
    now.getTime() - 24 * 60 * 60 * 1000
  );

  const reservations = await prisma.reservation.findMany({
    where: {
      status: "COMPLETED",
      reviewReminderSent: false,
      endTime: {
        gte: reminderStart,
        lte: reminderEnd,
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
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      review: {
        select: {
          id: true,
        },
      },
    },
  });

  let sent = 0;

  for (const reservation of reservations) {
    if (!reservation.user?.email) {
      continue;
    }

    if (!reservation.service) {
      continue;
    }

    if (reservation.review) {
      await prisma.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          reviewReminderSent: true,
        },
      });

      continue;
    }

    try {
      await sendReviewReminderEmail({
        to: reservation.user.email,
        clientName: reservation.user.name,
        businessName: reservation.business.name,
        serviceName: reservation.service.name,
      });

      await prisma.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          reviewReminderSent: true,
        },
      });

      sent++;
    } catch (error) {
      console.error(
        `Failed to send review reminder for reservation ${reservation.id}:`,
        error
      );
    }
  }

  return {
    found: reservations.length,
    sent,
  };
}
