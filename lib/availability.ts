import { prisma } from "@/lib/prisma";
import { publicBusinessWhere } from "@/lib/business-visibility";

type TimeInterval = {
  start: Date;
  end: Date;
};

function createTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);

  return result;
}

function roundUpToSlotStep(date: Date, stepMinutes: number) {
  const result = new Date(date);
  result.setSeconds(0, 0);

  const minutes = result.getMinutes();
  const remainder = minutes % stepMinutes;

  if (remainder !== 0) {
    result.setMinutes(minutes + stepMinutes - remainder);
  }

  return result;
}

export async function getBusinessAvailableIntervals(
  businessId: string,
  date: Date
): Promise<TimeInterval[]> {
  const dayOfWeek = date.getDay();

  const workingHour = await prisma.workingHour.findUnique({
    where: {
      businessId_dayOfWeek: {
        businessId,
        dayOfWeek,
      },
    },
  });

  if (
    !workingHour ||
    !workingHour.isOpen ||
    !workingHour.startTime ||
    !workingHour.endTime
  ) {
    return [];
  }

  const workingStart = createTime(date, workingHour.startTime);
  const workingEnd = createTime(date, workingHour.endTime);

  const reservations = await prisma.reservation.findMany({
    where: {
      businessId,
      startTime: {
        lt: workingEnd,
      },
      endTime: {
        gt: workingStart,
      },
      status: {
        not: "CANCELED",
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  const blockedIntervals: TimeInterval[] = reservations.map(
    (reservation) => ({
      start:
        reservation.startTime < workingStart
          ? workingStart
          : reservation.startTime,
      end:
        reservation.endTime > workingEnd
          ? workingEnd
          : reservation.endTime,
    })
  );

  if (workingHour.breakStart && workingHour.breakEnd) {
    blockedIntervals.push({
      start: createTime(date, workingHour.breakStart),
      end: createTime(date, workingHour.breakEnd),
    });
  }

  blockedIntervals.sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  const availableIntervals: TimeInterval[] = [];
  let current = workingStart;

  for (const blocked of blockedIntervals) {
    if (blocked.start > current) {
      availableIntervals.push({
        start: current,
        end: blocked.start,
      });
    }

    if (blocked.end > current) {
      current = blocked.end;
    }
  }

  if (current < workingEnd) {
    availableIntervals.push({
      start: current,
      end: workingEnd,
    });
  }

  return availableIntervals;
}

export async function hasBusinessAvailability(
  businessId: string,
  date: Date
) {
  const intervals = await getBusinessAvailableIntervals(
    businessId,
    date
  );

  const minimumDuration = 30 * 60 * 1000;

  return intervals.some(
    (interval) =>
      interval.end.getTime() - interval.start.getTime() >=
      minimumDuration
  );
}

export async function getServiceAvailableSlots(
  businessId: string,
  serviceId: string,
  date: Date
): Promise<Date[]> {
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      businessId,
      isActive: true,
      business: publicBusinessWhere,
    },
  });

  if (!service) {
    return [];
  }

  const intervals = await getBusinessAvailableIntervals(
    businessId,
    date
  );

  const slots: Date[] = [];
  const slotStep = 15 * 60 * 1000;
  const serviceDuration = service.duration * 60 * 1000;
  const now = new Date();

  for (const interval of intervals) {
   let current = roundUpToSlotStep(interval.start, 15);

    while (
      current.getTime() + serviceDuration <=
      interval.end.getTime()
    ) {
      if (current.getTime() > now.getTime()) {
        slots.push(new Date(current));
      }

      current = new Date(
        current.getTime() + slotStep
      );
    }
  }

  return slots;
}