import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OwnerDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const business = await prisma.business.findFirst({
    where: {
      ownerId: session.user.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (business) {
    redirect(`/dashboard/owner/${business.id}`);
  }

  redirect("/dashboard/owner/create");
}