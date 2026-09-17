import { NextRequest, NextResponse } from "next/server";
import { getServiceAvailableSlots } from "@/lib/availability";
import { prisma } from "@/lib/prisma";
import { publicBusinessWhere } from "@/lib/business-visibility";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteProps
) {
  const { id } = await params;
  const business = await prisma.business.findUnique({
    where: { id, ...publicBusinessWhere }, select: { id: true },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  const serviceId = request.nextUrl.searchParams.get(
    "serviceId"
  );

  const dateParam = request.nextUrl.searchParams.get(
    "date"
  );

  if (!serviceId || !dateParam) {
    return NextResponse.json(
      { error: "Missing parameters." },
      { status: 400 }
    );
  }

  const date = new Date(`${dateParam}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return NextResponse.json(
      { error: "Invalid date." },
      { status: 400 }
    );
  }

  const slots = await getServiceAvailableSlots(
    id,
    serviceId,
    date
  );

  return NextResponse.json({
    slots,
  });
}
