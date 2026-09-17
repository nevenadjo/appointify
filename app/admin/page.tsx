import { prisma } from "@/lib/prisma";
import AdminLineChart from "@/components/admin/AdminLineChart";

export default async function AdminDashboard() {
  const [
    totalUsers,
    totalBusinesses,
    totalReservations,
    totalReviews,
    totalClients,
    totalOwners,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: {
          in: ["CLIENT", "OWNER"],
        },
      },
    }),

    prisma.business.count(),

    prisma.reservation.count(),

    prisma.review.count(),

    prisma.user.count({
      where: {
        role: "CLIENT",
      },
    }),

    prisma.user.count({
      where: {
        role: "OWNER",
      },
    }),
  ]);

  const today = new Date();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [reservations, newClients, newOwners, newBusinesses, newReviews] =
    await Promise.all([
      prisma.reservation.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.user.findMany({
        where: {
          role: "CLIENT",
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.user.findMany({
        where: {
          role: "OWNER",
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.business.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.review.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);

  const labels: string[] = [];

  const reservationValues: number[] = [];
  const clientValues: number[] = [];
  const ownerValues: number[] = [];
  const businessValues: number[] = [];
  const reviewValues: number[] = [];

  function countForDay(items: { createdAt: Date }[], date: Date) {
    return items.filter((item) => {
      const itemDate = new Date(item.createdAt);

      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getDate() === date.getDate()
      );
    }).length;
  }

  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + i);

    labels.push(
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    );

    reservationValues.push(countForDay(reservations, date));

    clientValues.push(countForDay(newClients, date));

    ownerValues.push(countForDay(newOwners, date));

    businessValues.push(countForDay(newBusinesses, date));

    reviewValues.push(countForDay(newReviews, date));
  }

  return (
    <main className="p-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <p className="mt-2 text-gray-500">Overview of your platform.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6">
          <p className="text-sm text-gray-500">Total users</p>

          <p className="mt-2 text-3xl font-bold">{totalUsers}</p>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500">Businesses</p>

          <p className="mt-2 text-3xl font-bold">{totalBusinesses}</p>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500">Reservations</p>

          <p className="mt-2 text-3xl font-bold">{totalReservations}</p>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500">Reviews</p>

          <p className="mt-2 text-3xl font-bold">{totalReviews}</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Users</h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="flex justify-between">
              <span className="text-gray-500">Clients</span>

              <span className="font-semibold">{totalClients}</span>
            </div>

            <div className="mt-2 h-2 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{
                  width: `${
                    totalUsers ? (totalClients / totalUsers) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between">
              <span className="text-gray-500">Owners</span>

              <span className="font-semibold">{totalOwners}</span>
            </div>

            <div className="mt-2 h-2 rounded-full bg-green-500/10">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{
                  width: `${
                    totalUsers ? (totalOwners / totalUsers) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold">
            New users - Last 7 Days
          </h2>

          <AdminLineChart
            labels={labels}
            datasets={[
              {
                label: "Clients",
                values: clientValues,
              },
              {
                label: "Owners",
                values: ownerValues,
              },
            ]}
          />
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold">
            New businesses - Last 7 Days
          </h2>

          <AdminLineChart
            labels={labels}
            datasets={[
              {
                label: "Businesses",
                values: businessValues,
              },
            ]}
          />
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold">
            Reservations - Last 7 Days
          </h2>

          <AdminLineChart
            labels={labels}
            datasets={[
              {
                label: "Reservations",
                values: reservationValues,
              },
            ]}
          />
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold">Reviews - Last 7 Days</h2>

          <AdminLineChart
            labels={labels}
            datasets={[
              {
                label: "Reviews",
                values: reviewValues,
              },
            ]}
          />
        </div>
      </div>
    </main>
  );
}
