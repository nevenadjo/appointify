import BusinessCard from "@/components/home/BusinessCard";
import BusinessCarousel from "@/components/home/BusinessCarousel";
import CategoryCard from "@/components/home/CategoryCard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicBusinessWhere } from "@/lib/business-visibility";
import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import Image from "next/image";
import appointment from "@/public/appointment.jpg";

const BUSINESS_LIMIT = 12;

const availableWhere = {
  ...publicBusinessWhere,
  workingHours: { some: { isOpen: true, startTime: { not: null }, endTime: { not: null } } },
  services: { some: { isActive: true } },
} satisfies Prisma.BusinessWhereInput;

const cardInclude = {
  category: { select: { name: true } },
  city: { select: { name: true } },
  reviews: { select: { rating: true } },
  images: { orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 1, select: { imageUrl: true } },
} satisfies Prisma.BusinessInclude;

async function categoryRanking(field: "valueRating" | "serviceRating") {
  const aggregate = (minimum: number) => prisma.review.groupBy({
    by: ["businessId"],
    where: { business: availableWhere, [field]: { not: null } },
    _avg: { valueRating: true, serviceRating: true },
    _count: { valueRating: true, serviceRating: true },
    having: field === "valueRating"
      ? { valueRating: { _count: { gte: minimum } } }
      : { serviceRating: { _count: { gte: minimum } } },
    orderBy: [{ _avg: { [field]: "desc" } }, { _count: { [field]: "desc" } }, { businessId: "asc" }],
    take: 8,
  });
  const established = await aggregate(2);
  return established.length >= 4 ? established : aggregate(1);
}

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") redirect("/admin");
  if (session?.user?.role === "OWNER") redirect("/dashboard/owner");

  const [categories, ranked, newest, valueRanking, serviceRanking] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.review.groupBy({
      by: ["businessId"],
      where: { business: availableWhere },
      _avg: { rating: true },
      _count: { rating: true },
      orderBy: [{ _avg: { rating: "desc" } }, { _count: { rating: "desc" } }, { businessId: "asc" }],
      take: BUSINESS_LIMIT,
    }),
    prisma.business.findMany({ where: availableWhere, include: cardInclude, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: BUSINESS_LIMIT }),
    categoryRanking("valueRating"),
    categoryRanking("serviceRating"),
  ]);
  const recommendationIds = [...new Set([...valueRanking, ...serviceRanking].map((row) => row.businessId))];
  const [rated, unrated, recommendations] = await Promise.all([
    prisma.business.findMany({ where: { ...availableWhere, id: { in: ranked.map((row) => row.businessId) } }, include: cardInclude }),
    ranked.length < BUSINESS_LIMIT ? prisma.business.findMany({
      where: { ...availableWhere, reviews: { none: {} } }, include: cardInclude,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: BUSINESS_LIMIT - ranked.length,
    }) : Promise.resolve([]),
    recommendationIds.length ? prisma.business.findMany({
      where: { ...availableWhere, id: { in: recommendationIds } }, include: cardInclude,
    }) : Promise.resolve([]),
  ]);
  const recommendationMap = new Map(recommendations.map((business) => [business.id, business]));
  const recommendationSections = [
    { title: "Best value for money", description: "Highly rated businesses for quality and price.", ranking: valueRanking },
    { title: "Best service", description: "Businesses praised for service quality.", ranking: serviceRanking },
  ].map((section) => ({ ...section, businesses: section.ranking.flatMap((row) => {
    const business = recommendationMap.get(row.businessId);
    return business ? [business] : [];
  }) }));
  const positions = new Map(ranked.map((row, index) => [row.businessId, index]));
  const popular = [...rated.sort((a, b) => positions.get(a.id)! - positions.get(b.id)!), ...unrated];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-5 py-8 sm:space-y-14 sm:px-8 sm:py-10">
      <section className="grid items-center gap-8 rounded-3xl bg-[#E9EAFF] px-6 py-10 sm:px-12 sm:py-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-10">
        <div className="min-w-0">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-800">Make time for you</p>
        <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Find your next appointment</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600">Discover businesses and book your appointment easily.<br className="hidden sm:block" /> All your appointments, all in one place.</p>
        <form action="/businesses" role="search" className="mt-7 flex max-w-2xl flex-col gap-2 rounded-2xl border border-white bg-white p-2 shadow-sm sm:flex-row">
          <label htmlFor="business-search" className="sr-only">Search businesses</label>
          <input id="business-search" type="text" name="search" placeholder="Search by business name, service or category..." className="min-w-0 flex-1 rounded-xl px-4 py-3 text-base outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-indigo-400" />
          <button type="submit" className="cursor-pointer rounded-xl bg-gray-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Search</button>
        </form>
        </div>
        <div className="flex min-w-0 items-center justify-center">
          <Image
            src={appointment}
            alt=""
            sizes="(min-width: 1024px) 400px, 240px"
            className="h-auto max-h-48 w-full max-w-60 object-contain lg:max-h-80 lg:max-w-100 rounded-2xl"
          />
        </div>
      </section>
      <section aria-labelledby="categories-title">
        <h2 id="categories-title" className="text-2xl font-semibold tracking-tight">Categories</h2>
        <p className="mb-6 mt-2 text-sm text-gray-500">Find the right place for what you need.</p>
        {categories.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{categories.map((category) => <CategoryCard key={category.id} category={category} />)}</div> : <p className="text-sm text-gray-500">No categories available.</p>}
      </section>
      <BusinessCarousel title="Popular businesses" description="Explore the highest-rated places in our community.">
        {popular.map((business) => <BusinessCard key={business.id} business={business} />)}
      </BusinessCarousel>
      {recommendationSections.map((section) => section.businesses.length > 0 && (
        <BusinessCarousel key={section.title} title={section.title} description={section.description}>
          {section.businesses.map((business) => <BusinessCard key={business.id} business={business} />)}
        </BusinessCarousel>
      ))}
      <BusinessCarousel title="New businesses" description="Discover the latest additions to Appointify.">
        {newest.map((business) => <BusinessCard key={business.id} business={business} />)}
      </BusinessCarousel>
    </main>
  );
}
