import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  switch (session.user.role) {
    case "OWNER":
      redirect("/dashboard/owner");

    case "ADMIN":
      redirect("/admin");

    case "CLIENT":
    default:
      redirect("/");
  }
}