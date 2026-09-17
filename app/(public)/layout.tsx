import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user?.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <AppShell>{children}</AppShell>
  );
}
