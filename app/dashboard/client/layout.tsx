import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "CLIENT") {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    }

    if (session.user.role === "OWNER") {
      redirect("/dashboard/owner");
    }

    redirect("/");
  }

  return <>{children}</>;
}
