import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicBusinessWhere } from "@/lib/business-visibility";
import Link from "next/link";
import RemoveFavoriteButton from "@/components/favorite/RemoveFavoritesButton";
import BusinessCard from "@/components/home/BusinessCard";

export default async function ClientFavoritesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "CLIENT") {
    redirect("/login");
  }

  const favorites = await prisma.favorite.findMany({
    where: {
      userId: session.user.id,
      business: publicBusinessWhere,
    },
    include: {
      business: {
        include: {
          category: true,
          city: true,
          reviews: { select: { rating: true } },
          images: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 font-sans text-gray-900 sm:px-8 sm:py-10">
      <header className="rounded-3xl bg-[#E9EAFF] px-6 py-8 sm:px-10">
        <h1 className="text-3xl font-semibold tracking-tight">Favorites</h1>
        <p className="mt-3 text-gray-600">Businesses you&apos;ve saved for later.</p>
      </header>

      {favorites.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-gray-200 bg-[#FFF4E1]/40 px-6 py-12 text-center">
          <h2 className="text-xl font-semibold">No favorite businesses yet.</h2>
          <p className="mt-3 text-sm text-gray-600">Explore businesses and save the ones you like.</p>
          <Link href="/businesses" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-700 focus-visible:outline-indigo-500">Explore businesses</Link>
        </section>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {favorites.map((favorite) => (
            <BusinessCard key={favorite.id} business={favorite.business}
              actions={<RemoveFavoriteButton businessId={favorite.business.id} />} />
          ))}
        </div>
      )}
    </main>
  );
}
