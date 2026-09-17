import { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import {
  pagination,
  searchValue,
  type AdminSearchParams,
} from "@/lib/admin-list";
import {
  AdminList,
  ListTable,
  ListPagination,
} from "@/components/admin/AdminList";
import {
  AddCityButton,
  EditCityButton,
} from "@/components/admin/CityActions";

export default async function AdminCitiesPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const q = searchValue(params, "q");

  const where: Prisma.CityWhereInput = q
    ? {
        name: {
          contains: q,
          mode: "insensitive",
        },
      }
    : {};

  const total = await prisma.city.count({ where });
  const paging = pagination(params, total);

  const cities = await prisma.city.findMany({
    where,
    skip: paging.skip,
    take: paging.take,
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          businesses: true,
        },
      },
    },
  });

  return (
    <AdminList
      title="Cities"
      description="Manage cities available when businesses are created or edited."
    >
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <form
          action="/admin/cities"
          method="get"
          className="flex min-w-0 flex-1 flex-wrap items-end gap-3"
        >
          <label className="min-w-48 flex-1 text-sm font-medium">
            Search
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search cities"
              className="mt-1 block w-full rounded-md border bg-white px-3 py-2"
            />
          </label>

          <button className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
            Search
          </button>

          {q && (
            <Link
              href="/admin/cities"
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Reset
            </Link>
          )}
        </form>

        <AddCityButton />
      </div>

      <ListTable
        headings={["City", "Businesses", "Actions"]}
        empty={cities.length === 0}
      >
        {cities.map((city) => (
          <tr key={city.id}>
            <td className="font-medium">{city.name}</td>

            <td>{city._count.businesses}</td>

            <td>
              <EditCityButton
                city={{
                  id: city.id,
                  name: city.name,
                  businessCount: city._count.businesses,
                }}
              />
            </td>
          </tr>
        ))}
      </ListTable>

      <ListPagination
        path="/admin/cities"
        params={params}
        page={paging.page}
        pages={paging.pages}
        total={total}
      />
    </AdminList>
  );
}