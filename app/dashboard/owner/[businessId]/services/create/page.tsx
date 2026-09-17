import ServiceForm from "@/components/owner/forms/ServiceForm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CreateServicePage({
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


  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href={`/dashboard/owner/${businessId}`}
        className="text-sm text-gray-500 hover:underline"
      >
        ← Back to Business
      </Link>

      <h1 className="mt-4 text-3xl font-bold">
        Add Service
      </h1>

      <ServiceForm businessId={businessId} />
    </main>
  );
}