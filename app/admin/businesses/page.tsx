import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDate, pagination, searchValue, type AdminSearchParams } from "@/lib/admin-list";
import { AdminList, ListFilters, SelectFilter, ListTable, ListPagination, StatusBadge, activeOptions } from "@/components/admin/AdminList";
import BusinessStatusButton from "@/components/admin/BusinessStatusButton";

export default async function AdminBusinessesPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = searchValue(params, "q");
  const status = searchValue(params, "status");
  const suspension = searchValue(params, "suspension");
  const contains: Prisma.StringFilter = { contains: q, mode: "insensitive" };
  const where: Prisma.BusinessWhereInput = {
    ...(q && { OR: [
      { name: contains }, { address: contains },
      { owner: { name: contains } }, { owner: { email: contains } },
      { city: { name: contains } }, { category: { name: contains } },
    ] }),
    ...((status === "active" || status === "inactive") && { isActive: status === "active" }),
    ...((suspension === "suspended" || suspension === "clear") && { isSuspended: suspension === "suspended" }),
  };
  const total = await prisma.business.count({ where });
  const paging = pagination(params, total);
  const businesses = await prisma.business.findMany({
    where, skip: paging.skip, take: paging.take,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true, name: true, address: true, isActive: true, isSuspended: true, createdAt: true,
      owner: { select: { name: true, email: true } },
      city: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <AdminList title="Businesses" description="Manage businesses registered on the platform.">
      <ListFilters path="/admin/businesses" query={q} placeholder="Business, owner, city or category">
        <SelectFilter name="status" label="Statuses" value={status} options={activeOptions} />
        <SelectFilter name="suspension" label="Suspensions" value={suspension} options={[
          { value: "suspended", label: "Suspended" }, { value: "clear", label: "Not suspended" },
        ]} />
      </ListFilters>
      <ListTable headings={["Business", "Owner", "Category", "Location", "Registered", "Status", "Actions"]} empty={businesses.length === 0}>
        {businesses.map((business) => (
          <tr key={business.id}>
            <td className="font-medium">{business.name}</td>
            <td><p>{business.owner.name || "—"}</p><p className="text-gray-500">{business.owner.email}</p></td>
            <td>{business.category.name}</td>
            <td><p>{business.city.name}</p><p className="text-gray-500">{business.address}</p></td>
            <td className="whitespace-nowrap text-gray-600">{adminDate(business.createdAt)}</td>
            <td><StatusBadge active={business.isActive} />{business.isSuspended && <p className="mt-2 text-xs font-semibold text-red-700">Suspended</p>}</td>
            <td><BusinessStatusButton businessId={business.id} isSuspended={business.isSuspended} /></td>
          </tr>
        ))}
      </ListTable>
      <ListPagination path="/admin/businesses" params={params} page={paging.page} pages={paging.pages} total={total} />
    </AdminList>
  );
}
