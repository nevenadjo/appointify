import {
  PrismaClient,
  ReservationSource,
  ReservationStatus,
} from "@prisma/client";

const clientNames = [
  "Jelena Marković",
  "Stefan Nikolić",
  "Milica Jovanović",
  "Luka Petrović",
  "Ana Ilić",
  "Nikola Pavlović",
  "Sara Stojanović",
  "Miloš Đorđević",
  "Teodora Simić",
  "Aleksa Popović",
  "Marija Ristić",
  "Filip Lukić",
  "Sofija Kovačević",
  "Vuk Milošević",
  "Isidora Đukić",
  "Nemanja Janković",
  "Anđela Tomić",
  "Andrej Savić",
  "Una Živković",
  "Pavle Radovanović",
  "Mina Đorđević",
  "Ognjen Ilić",
  "Nina Vasić",
  "Matija Stanković",
];

const positiveComments = [
  "Great service and very friendly staff.",
  "Everything was professional and well organized.",
  "Very pleasant experience. I would definitely come again.",
  "Excellent service and a very comfortable atmosphere.",
  "The appointment started on time and everything went smoothly.",
  "Very professional and attentive service.",
  "I was very happy with the experience.",
  "Friendly staff and excellent service.",
  "The whole experience was easy and comfortable.",
  "Very clean, professional and welcoming.",
  "I would happily book another appointment.",
  "Great attention to detail and very friendly staff.",
  "Everything was exactly as expected.",
  "Excellent experience from start to finish.",
  "Very satisfied with the service.",
];

const neutralComments = [
  "Good overall experience.",
  "The service was good and the staff was polite.",
  "Everything was fine and the appointment went smoothly.",
  "Good service, although there was a short wait.",
  "Overall a positive experience.",
];

const featuredReviewCounts: Record<string, number> = {
  "Luna Hair Studio": 18,
  "Bloom Beauty Studio": 16,
  "Still Wellness": 14,
  "Motion Fitness": 12,
  "Nova Medical Center": 15,
  "Daylight Studio": 10,
  "Bright Learning Studio": 9,
  "Prime Auto Detail": 12,
};

function daysAgo(days: number, hour: number) {
  const date = new Date();

  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);

  return date;
}

function daysFromNow(days: number, hour: number) {
  const date = new Date();

  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);

  return date;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getReviewCount(
  businessName: string,
  businessIndex: number,
) {
  return (
    featuredReviewCounts[businessName] ??
    2 + (businessIndex % 6)
  );
}

function getRating(index: number) {
  const values = [5, 5, 4, 5, 4, 5, 3, 4, 5, 5];

  return values[index % values.length];
}

function getDetailedRating(
  rating: number,
  offset: number,
) {
  return Math.min(
    5,
    Math.max(3, rating + offset),
  );
}

export async function seedDemoEngagement(
  prisma: PrismaClient,
) {
  const clients = [];

  for (const [index, name] of clientNames.entries()) {
    const client = await prisma.user.upsert({
      where: {
        email: `demo-client-${index + 1}@appointify.test`,
      },
      update: {
        name,
        role: "CLIENT",
        isActive: true,
        isEmailVerified: true,
      },
      create: {
        id: `seed-demo-client-${index + 1}`,
        email: `demo-client-${index + 1}@appointify.test`,
        name,
        role: "CLIENT",
        isActive: true,
        isEmailVerified: true,
      },
    });

    clients.push(client);
  }

  const businesses = await prisma.business.findMany({
    where: {
      id: {
        startsWith: "seed-demo-business-",
      },
    },
    include: {
      services: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  let reviewTotal = 0;
  let reservationTotal = 0;
  let favoriteTotal = 0;

  for (
    const [businessIndex, business] of businesses.entries()
  ) {
    if (business.services.length === 0) {
      continue;
    }

    const reviewCount = getReviewCount(
      business.name,
      businessIndex,
    );

    for (
      let reviewIndex = 0;
      reviewIndex < reviewCount;
      reviewIndex++
    ) {
      const client =
        clients[
          (businessIndex + reviewIndex) %
            clients.length
        ];

      const service =
        business.services[
          reviewIndex %
            business.services.length
        ];

      const startTime = daysAgo(
        3 +
          ((businessIndex * 3 + reviewIndex) %
            90),
        10 + (reviewIndex % 7),
      );

      const endTime = addMinutes(
        startTime,
        service.duration,
      );

      const reservationId =
        `seed-demo-review-reservation-${business.id}-${reviewIndex + 1}`;

      const isAutoCompleted =
        reviewIndex % 4 === 0;

      const reservation =
        await prisma.reservation.upsert({
          where: {
            id: reservationId,
          },
          update: {
            businessId: business.id,
            serviceId: service.id,
            userId: client.id,
            startTime,
            endTime,
            status:
              ReservationStatus.COMPLETED,
            source:
              ReservationSource.ONLINE,
            completedAt: endTime,
            completedBy: isAutoCompleted
              ? null
              : business.ownerId,
            autoCompleted: isAutoCompleted,
            cancellationReason: null,
          },
          create: {
            id: reservationId,
            businessId: business.id,
            serviceId: service.id,
            userId: client.id,
            startTime,
            endTime,
            status:
              ReservationStatus.COMPLETED,
            source:
              ReservationSource.ONLINE,
            completedAt: endTime,
            completedBy: isAutoCompleted
              ? null
              : business.ownerId,
            autoCompleted: isAutoCompleted,
          },
        });

      const rating = getRating(
        businessIndex * 7 + reviewIndex,
      );

      const comment =
        rating >= 4
          ? positiveComments[
              (businessIndex + reviewIndex) %
                positiveComments.length
            ]
          : neutralComments[
              (businessIndex + reviewIndex) %
                neutralComments.length
            ];

      await prisma.review.upsert({
        where: {
          reservationId: reservation.id,
        },
        update: {
          businessId: business.id,
          userId: client.id,
          rating,
          comment,
          serviceRating: getDetailedRating(
            rating,
            (reviewIndex % 3) - 1,
          ),
          cleanlinessRating:
            getDetailedRating(
              rating,
              reviewIndex % 2,
            ),
          valueRating: getDetailedRating(
            rating,
            reviewIndex % 4 === 0
              ? -1
              : 0,
          ),
          punctualityRating:
            getDetailedRating(
              rating,
              reviewIndex % 3 === 0
                ? 0
                : 1,
            ),
        },
        create: {
          reservationId: reservation.id,
          businessId: business.id,
          userId: client.id,
          rating,
          comment,
          serviceRating: getDetailedRating(
            rating,
            (reviewIndex % 3) - 1,
          ),
          cleanlinessRating:
            getDetailedRating(
              rating,
              reviewIndex % 2,
            ),
          valueRating: getDetailedRating(
            rating,
            reviewIndex % 4 === 0
              ? -1
              : 0,
          ),
          punctualityRating:
            getDetailedRating(
              rating,
              reviewIndex % 3 === 0
                ? 0
                : 1,
            ),
        },
      });

      reviewTotal++;
      reservationTotal++;
    }

    const pastReservationCount =
      businessIndex % 4 === 0 ? 6 : 3;

    for (
      let pastIndex = 0;
      pastIndex < pastReservationCount;
      pastIndex++
    ) {
      const client =
        clients[
          (businessIndex + pastIndex + 9) %
            clients.length
        ];

      const service =
        business.services[
          (pastIndex + 2) %
            business.services.length
        ];

      const startTime = daysAgo(
        1 +
          ((businessIndex + pastIndex) %
            7),
        9 + (pastIndex % 8),
      );

      const endTime = addMinutes(
        startTime,
        service.duration,
      );

      const status =
        pastIndex % 5 === 0
          ? ReservationStatus.NO_SHOW
          : ReservationStatus.COMPLETED;

      const isCompleted =
        status ===
        ReservationStatus.COMPLETED;

      const isAutoCompleted =
        isCompleted &&
        pastIndex % 3 === 0;

      await prisma.reservation.upsert({
        where: {
          id: `seed-demo-past-reservation-${business.id}-${pastIndex + 1}`,
        },
        update: {
          businessId: business.id,
          serviceId: service.id,
          userId: client.id,
          startTime,
          endTime,
          status,
          source:
            ReservationSource.ONLINE,
          completedAt: isCompleted
            ? endTime
            : null,
          completedBy: isCompleted
            ? isAutoCompleted
              ? null
              : business.ownerId
            : null,
          autoCompleted: isCompleted
            ? isAutoCompleted
            : false,
          cancellationReason: null,
        },
        create: {
          id: `seed-demo-past-reservation-${business.id}-${pastIndex + 1}`,
          businessId: business.id,
          serviceId: service.id,
          userId: client.id,
          startTime,
          endTime,
          status,
          source:
            ReservationSource.ONLINE,
          completedAt: isCompleted
            ? endTime
            : null,
          completedBy: isCompleted
            ? isAutoCompleted
              ? null
              : business.ownerId
            : null,
          autoCompleted: isCompleted
            ? isAutoCompleted
            : false,
        },
      });

      reservationTotal++;
    }

    for (
      let futureIndex = 0;
      futureIndex < 4;
      futureIndex++
    ) {
      const client =
        clients[
          (businessIndex +
            futureIndex +
            4) %
            clients.length
        ];

      const service =
        business.services[
          futureIndex %
            business.services.length
        ];

      const startTime = daysFromNow(
        2 +
          futureIndex * 3 +
          (businessIndex % 4),
        10 + futureIndex * 2,
      );

      const endTime = addMinutes(
        startTime,
        service.duration,
      );

      await prisma.reservation.upsert({
        where: {
          id: `seed-demo-future-reservation-${business.id}-${futureIndex + 1}`,
        },
        update: {
          businessId: business.id,
          serviceId: service.id,
          userId: client.id,
          startTime,
          endTime,
          status:
            ReservationStatus.CONFIRMED,
          source:
            ReservationSource.ONLINE,
          completedAt: null,
          completedBy: null,
          autoCompleted: false,
          cancellationReason: null,
        },
        create: {
          id: `seed-demo-future-reservation-${business.id}-${futureIndex + 1}`,
          businessId: business.id,
          serviceId: service.id,
          userId: client.id,
          startTime,
          endTime,
          status:
            ReservationStatus.CONFIRMED,
          source:
            ReservationSource.ONLINE,
          completedAt: null,
          completedBy: null,
          autoCompleted: false,
        },
      });

      reservationTotal++;
    }

    const favoriteCount =
      2 + (businessIndex % 5);

    for (
      let favoriteIndex = 0;
      favoriteIndex < favoriteCount;
      favoriteIndex++
    ) {
      const client =
        clients[
          (businessIndex * 2 +
            favoriteIndex) %
            clients.length
        ];

      await prisma.favorite.upsert({
        where: {
          userId_businessId: {
            userId: client.id,
            businessId: business.id,
          },
        },
        update: {},
        create: {
          userId: client.id,
          businessId: business.id,
        },
      });

      favoriteTotal++;
    }
  }

  return {
    clients: clients.length,
    reservations: reservationTotal,
    reviews: reviewTotal,
    favorites: favoriteTotal,
  };
}