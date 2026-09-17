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
  AddCategoryButton,
  EditCategoryButton,
} from "@/components/admin/CategoryActions";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const q = searchValue(params, "q");

  const where: Prisma.CategoryWhereInput = q
    ? {
        name: {
          contains: q,
          mode: "insensitive",
        },
      }
    : {};

  const total = await prisma.category.count({ where });
  const paging = pagination(params, total);

  const categories = await prisma.category.findMany({
    where,
    skip: paging.skip,
    take: paging.take,
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      icon: true,
      _count: {
        select: {
          businesses: true,
        },
      },
    },
  });

  return (
    <AdminList
      title="Categories"
      description="Manage business categories available across Appointify."
    >
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <form
          action="/admin/categories"
          method="get"
          className="flex min-w-0 flex-1 flex-wrap items-end gap-3"
        >
          <label className="min-w-48 flex-1 text-sm font-medium">
            Search
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search categories"
              className="mt-1 block w-full rounded-md border bg-white px-3 py-2"
            />
          </label>

          <button className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
            Search
          </button>

          {q && (
            <Link
              href="/admin/categories"
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Reset
            </Link>
          )}
        </form>

        <AddCategoryButton />
      </div>

      <ListTable
        headings={["Category", "Icon", "Businesses", "Actions"]}
        empty={categories.length === 0}
      >
        {categories.map((category) => (
          <tr key={category.id}>
            <td className="font-medium">{category.name}</td>

            <td className="text-gray-500">
              {category.icon || "—"}
            </td>

            <td>
              {category._count.businesses}
            </td>

            <td>
              <EditCategoryButton
                category={{
                  id: category.id,
                  name: category.name,
                  icon: category.icon,
                  businessCount: category._count.businesses,
                }}
              />
            </td>
          </tr>
        ))}
      </ListTable>

      <ListPagination
        path="/admin/categories"
        params={params}
        page={paging.page}
        pages={paging.pages}
        total={total}
      />
    </AdminList>
  );
}