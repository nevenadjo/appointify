import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function isActiveAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return false;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true },
  });
  return user?.role === "ADMIN" && user.isActive;
}

export async function requireAdmin() {
  if (!(await isActiveAdmin())) redirect("/login");
}
