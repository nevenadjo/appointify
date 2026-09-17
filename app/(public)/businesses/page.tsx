import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publicBusinessWhere } from "@/lib/business-visibility";
import BusinessCard from "@/components/home/BusinessCard";
import MobileCategoryFilter from "@/components/businesses/MobileCategoryFilter";

type BusinessesPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string | string[];
    city?: string;
    page?: string;
  }>;
};

export default async function BusinessesPage({
  searchParams,
}: BusinessesPageProps) {
  const params = await searchParams;

  const search = params.search?.trim() || "";
  const categoriesParam = params.category;

  const selectedCategories = Array.isArray(categoriesParam)
    ? categoriesParam
    : categoriesParam
      ? [categoriesParam]
      : [];
  const city = params.city || "";

  const where = {
        ...publicBusinessWhere,
        workingHours: {
          some: {
            isOpen: true,
            startTime: {
              not: null,
            },
            endTime: {
              not: null,
            },
          },
        },

        services: {
          some: {
            isActive: true,
          },
        },
        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  services: {
                    some: {
                      OR: [
                        {
                          name: {
                            contains: search,
                            mode: "insensitive",
                          },
                        },
                        {
                          description: {
                            contains: search,
                            mode: "insensitive",
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            }
          : {}),

        ...(city
          ? {
              cityId: city,
            }
          : {}),

        ...(selectedCategories.length > 0
          ? {
              categoryId: {
                in: selectedCategories,
              },
            }
          : {}),
      } satisfies Prisma.BusinessWhereInput;
  const pageSize = 12;
  const requestedPage = Number(params.page);
  const [categories, cities, total] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.city.findMany({ orderBy: { name: "asc" } }),
    prisma.business.count({ where }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(pageCount, Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1);
  const businesses = await prisma.business.findMany({
    where,
    include: { category: true, city: true, reviews: { select: { rating: true } }, images: { orderBy: { createdAt: "desc" } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * pageSize, take: pageSize,
  });
  function pageHref(target: number) {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (city) query.set("city", city);
    selectedCategories.forEach((id) => query.append("category", id));
    query.set("page", String(target));
    return "/businesses?" + query.toString();
  }
  const pages = Array.from(new Set([1, page - 1, page, page + 1, pageCount])).filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="rounded-3xl bg-[#E9EAFF] px-6 py-8 sm:px-10 sm:py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Businesses</h1>
      <p className="mt-3 text-gray-600">Find your next appointment. Search by business, service, city or category.</p>

      <form action="/businesses" role="search" className="mt-7 space-y-3">
        <div className="grid gap-2 rounded-2xl border border-white bg-white p-2 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <input
            aria-label="Search by business or service"
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by business or service..."
            className="min-w-0 w-full rounded-xl px-4 py-3 outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-indigo-400"
          />

          <select
            aria-label="City"
            name="city"
            defaultValue={city}
            className="min-w-0 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 focus-visible:outline-indigo-500"
          >
            <option value="">All cities</option>

            {cities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          {selectedCategories.map((categoryId) => (
            <input
              key={categoryId}
              type="hidden"
              name="category"
              value={categoryId}
            />
          ))}

          <button
            type="submit"
            className="cursor-pointer rounded-xl bg-gray-900 px-7 py-3 text-sm font-medium text-white hover:bg-gray-700 focus-visible:outline-indigo-500"
          >
            Search
          </button>
        </div>
      </form>

      <MobileCategoryFilter selectedCount={categories.filter((item) => selectedCategories.includes(item.id)).length}>
        <Link
          href={`/businesses${
            search || city
              ? `?${new URLSearchParams({
                  ...(search ? { search } : {}),
                  ...(city ? { city } : {}),
                }).toString()}`
              : ""
          }`}
          className={`inline-flex min-h-11 items-center rounded-xl border px-4 py-2 text-sm font-medium focus-visible:outline-indigo-500 ${
            selectedCategories.length === 0 ? "border-gray-900 bg-gray-900 text-white" : "border-white bg-white text-gray-700 hover:border-indigo-300"
          }`}
        >
          All
        </Link>

        {categories.map((item) => {
          const isSelected = selectedCategories.includes(item.id);

          const query = new URLSearchParams();

          if (search) {
            query.set("search", search);
          }

          if (city) {
            query.set("city", city);
          }

          selectedCategories
            .filter((id) => id !== item.id)
            .forEach((id) => {
              query.append("category", id);
            });

          if (!isSelected) {
            query.append("category", item.id);
          }

          return (
            <Link
              key={item.id}
              href={`/businesses?${query.toString()}`}
              className={`inline-flex min-h-11 items-center rounded-xl border px-4 py-2 text-sm font-medium focus-visible:outline-indigo-500 ${
                isSelected ? "border-gray-900 bg-gray-900 text-white" : "border-white bg-white text-gray-700 hover:border-indigo-300"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </MobileCategoryFilter>

      </section>

      {(search || selectedCategories.length > 0 || city) && (
        <div className="mt-8 space-y-1">
          {search && (
            <p className="text-gray-600">Search results for &quot;{search}&quot;</p>
          )}

          {city && (
            <p className="text-gray-600">
              City: {cities.find((item) => item.id === city)?.name}
            </p>
          )}

          {selectedCategories.length > 0 && (
            <p className="text-gray-600">
              Categories:{" "}
              {categories
                .filter((item) => selectedCategories.includes(item.id))
                .map((item) => item.name)
                .join(", ")}
            </p>
          )}
        </div>
      )}

      <h2 className="mt-8 text-lg font-semibold">{total} {total === 1 ? "business" : "businesses"} found</h2>
      {businesses.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-[#FFF4E1]/40 px-6 py-12 text-center">
          <p className="text-lg font-medium">No businesses found</p>
          <p className="mt-2 text-sm text-gray-500">Try another search or adjust your filters.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
      {total > 0 && <nav aria-label="Results pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm">
        {page > 1 ? <Link href={pageHref(page - 1)} className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-[#E9EAFF]">Previous</Link> : <span aria-disabled="true" className="rounded-xl border border-gray-100 px-4 py-3 text-gray-400">Previous</span>}
        {pages.map((value, index) => <span key={value} className="flex items-center gap-2">
          {index > 0 && value - pages[index - 1] > 1 && <span className="px-1 text-gray-400">…</span>}
          <Link href={pageHref(value)} aria-label={`Page ${value}`} aria-current={page === value ? "page" : undefined} className={`flex min-h-11 min-w-11 items-center justify-center rounded-xl border ${page === value ? "border-indigo-200 bg-[#E9EAFF] font-semibold text-gray-900" : "border-gray-200 hover:bg-gray-50"}`}>{value}</Link>
        </span>)}
        {page < pageCount ? <Link href={pageHref(page + 1)} className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-[#E9EAFF]">Next</Link> : <span aria-disabled="true" className="rounded-xl border border-gray-100 px-4 py-3 text-gray-400">Next</span>}
      </nav>}
    </main>
  );
}
