import BusinessForm from "@/components/owner/forms/BusinessForm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CreateBusinessPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const cities = await prisma.city.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/dashboard/owner"
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back to My Businesses
        </Link>

        <h1 className="mt-4 text-3xl font-bold">Add Business</h1>

        <p className="mt-2 text-gray-600">Add your business information.</p>
      </div>

      <BusinessForm categories={categories} cities={cities} />
    </main>
  );
}
