import BusinessForm from "@/components/owner/forms/BusinessForm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const { businessId } = await params;

  const business = await prisma.business.findFirst({
    where: {
      id: businessId,
      ownerId: session.user.id,
    },
  });

  if (!business) {
    redirect("/dashboard/owner");
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
          href={`/dashboard/owner/${business.id}`}
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back to Business
        </Link>

        <h1 className="mt-4 text-3xl font-bold">Edit Business</h1>
      </div>

      <BusinessForm business={{ ...business, workingHours: [] }} categories={categories} cities={cities} />
    </main>
  );
}
