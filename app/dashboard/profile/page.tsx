import ActionNotice from "@/components/ui/ActionNotice";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      email: true,
      phone: true,
      image: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
      <header className="rounded-3xl bg-[#E9EAFF] px-6 py-8 sm:px-10">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          My Profile
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
          Manage your personal information and account settings.
        </p>
      </header>

      <ActionNotice code={query.notice} />
      <ProfileForm user={user} />
    </main>
  );
}
