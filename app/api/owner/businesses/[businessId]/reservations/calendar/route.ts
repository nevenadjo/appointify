import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseDate(value: string | null) {
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

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      businessId: string;
    }>;
  },
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  const { businessId } = await context.params;

  const business = await prisma.business.findFirst({
    where: {
      id: businessId,
      ownerId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!business) {
    return NextResponse.json(
      { error: "Business not found." },
      { status: 404 },
    );
  }

  const requestedWeek = parseDate(
    request.nextUrl.searchParams.get("week"),
  );

  if (!requestedWeek) {
    return NextResponse.json(
      { error: "Invalid week." },
      { status: 400 },
    );
  }

  const weekStart = startOfWeek(requestedWeek);
  const weekEnd = addDays(weekStart, 7);

  const reservations =
    await prisma.reservation.findMany({
      where: {
        businessId: business.id,
        status: {
          not: "CANCELED",
        },
        startTime: {
          lt: weekEnd,
        },
        endTime: {
          gt: weekStart,
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
    });

  return NextResponse.json({
    reservations: reservations.map(
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
    ),
  });
}