import WorkingHoursForm from "@/components/owner/forms/WorkingHoursForm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function WorkingHoursPage({
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
    include: {
      workingHours: true,
    },
  });

  if (!business) {
    redirect("/dashboard/owner");
  }


  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <Link
        href={`/dashboard/owner/${businessId}`}
        className="text-sm text-gray-500 hover:underline"
      >
        ← Back to Business
      </Link>

      <div className="mt-4">
        <h1 className="text-3xl font-bold">
          Working Hours
        </h1>

        <p className="mt-2 text-gray-600">
          Set when your business is available for appointments.
        </p>
      </div>

      <WorkingHoursForm business={business} />
    </main>
  );
}