import { OwnerFormProvider } from "@/components/owner/OwnerFormLink";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BusinessList from "@/components/owner/BusinessList";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const businesses = await prisma.business.findMany({
  where: {
    ownerId: session.user.id,
  },
  orderBy: {
    createdAt: "asc",
  },
  select: {
    id: true,
    name: true,
    city: true,
    isActive: true,
    isSuspended: true,
    workingHours: {
      select: {
        isOpen: true,
        startTime: true,
        endTime: true,
      },
    },
    services: {
      select: {
        isActive: true,
      },
    },
  },
});

const businessesWithStatuses = businesses.map((business) => {
  const hasWorkingHours = business.workingHours.some(
    (hour) => hour.isOpen && hour.startTime && hour.endTime,
  );

  const hasActiveServices = business.services.some(
    (service) => service.isActive,
  );

  return {
    id: business.id,
    name: business.name,
    city: business.city,
    isActive: business.isActive,
    isSuspended: business.isSuspended,
    isReady: hasWorkingHours && hasActiveServices,
  };
});

  return (
    <OwnerFormProvider><div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <BusinessList businesses={businessesWithStatuses} />

      <section className="min-w-0 flex-1">
        {children}
      </section>
    </div></OwnerFormProvider>
  );
}
