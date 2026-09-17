import { Prisma, ReservationSource, ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDate, adminTime, pagination, searchValue, type AdminSearchParams } from "@/lib/admin-list";
import { AdminList, ListFilters, SelectFilter, ListTable, ListPagination } from "@/components/admin/AdminList";

const statusColors: Record<ReservationStatus, string> = {
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  NO_SHOW: "bg-yellow-100 text-yellow-800",
  CANCELED: "bg-red-100 text-red-700",
};

export default async function AdminReservationsPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = searchValue(params, "q");
  const status = searchValue(params, "status");
  const source = searchValue(params, "source");
  const contains: Prisma.StringFilter = { contains: q, mode: "insensitive" };
  const where: Prisma.ReservationWhereInput = {
    ...(q && { OR: [
      { id: contains }, { business: { name: contains } },
      { service: { name: contains } }, { user: { name: contains } },
      { user: { email: contains } }, { notes: contains },
    ] }),
    ...(Object.values(ReservationStatus).includes(status as ReservationStatus) && { status: status as ReservationStatus }),
    ...(Object.values(ReservationSource).includes(source as ReservationSource) && { source: source as ReservationSource }),
  };
  const total = await prisma.reservation.count({ where });
  const paging = pagination(params, total);
  const reservations = await prisma.reservation.findMany({
    where, skip: paging.skip, take: paging.take,
    orderBy: [{ startTime: "desc" }, { id: "desc" }],
    select: {
      id: true, startTime: true, endTime: true, status: true, source: true, notes: true,
      business: { select: { name: true } },
      service: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <AdminList title="Reservations" description="Browse and filter reservations. Times are shown in Europe/Belgrade time.">
      <ListFilters path="/admin/reservations" query={q} placeholder="ID, business, service, customer or notes">
        <SelectFilter name="status" label="Statuses" value={status} options={Object.values(ReservationStatus).map((value) => ({ value, label: value.replaceAll("_", " ") }))} />
        <SelectFilter name="source" label="Sources" value={source} options={Object.values(ReservationSource).map((value) => ({ value, label: value }))} />
      </ListFilters>
      <ListTable headings={["Reservation", "Business", "Service", "Customer", "Start", "End", "Status", "Source", "Notes"]} empty={reservations.length === 0}>
        {reservations.map((reservation) => (
          <tr key={reservation.id}>
            <td className="max-w-40 break-all text-xs text-gray-500">{reservation.id}</td>
            <td className="font-medium">{reservation.business.name}</td>
            <td>{reservation.service?.name || "—"}</td>
            <td><p>{reservation.user?.name || (reservation.source === "MANUAL" ? "Manual booking" : "—")}</p><p className="text-gray-500">{reservation.user?.email}</p></td>
            <td className="whitespace-nowrap"><p>{adminDate(reservation.startTime)}</p><p className="text-gray-500">{adminTime(reservation.startTime)}</p></td>
            <td className="whitespace-nowrap"><p>{adminDate(reservation.endTime)}</p><p className="text-gray-500">{adminTime(reservation.endTime)}</p></td>
            <td><span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${statusColors[reservation.status]}`}>{reservation.status.replaceAll("_", " ")}</span></td>
            <td className="text-xs">{reservation.source}</td>
            <td className="min-w-40 max-w-xs whitespace-pre-wrap break-words text-gray-600">{reservation.notes || "—"}</td>
          </tr>
        ))}
      </ListTable>
      <ListPagination path="/admin/reservations" params={params} page={paging.page} pages={paging.pages} total={total} />
    </AdminList>
  );
}
