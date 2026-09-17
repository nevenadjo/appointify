import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import {
  autoCompleteReservations,
  sendReservationReminders,
  sendReviewReminders,
} from "@/lib/reminder-jobs";

export const runtime = "nodejs";

// Keep local executions sequential, including across development hot reloads.
const jobState = globalThis as typeof globalThis & { reminderJobRunning?: boolean };

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Reminder job is not configured." }, { status: 503 });
  }
  const provided = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (jobState.reminderJobRunning) {
    return NextResponse.json({ error: "Reminder job is already running." }, { status: 409 });
  }
  jobState.reminderJobRunning = true;
  try {
    const completed = await autoCompleteReservations();

    const reservationReminders = await sendReservationReminders();

    const reviewReminders = await sendReviewReminders();

    return NextResponse.json({
      success: true,
      completed,
      reservationReminders,
      reviewReminders,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Reminder job failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process reminders.",
      },
      { status: 500 }
    );
  } finally {
    jobState.reminderJobRunning = false;
  }
}
