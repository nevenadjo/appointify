import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PostLoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (!session) {
    redirect("/login");
  }

  const safeCallbackUrl =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : null;

  if (
    safeCallbackUrl === "/dashboard/profile" &&
    (session.user.role === "CLIENT" || session.user.role === "OWNER")
  ) {
    redirect(safeCallbackUrl);
  }

  switch (session.user.role) {
    case "ADMIN":
      redirect("/admin");

    case "OWNER":
      redirect("/dashboard/owner");

    case "CLIENT":
    default:
      redirect(safeCallbackUrl || "/");
  }
}
