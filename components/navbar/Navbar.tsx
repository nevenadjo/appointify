import Link from "next/link";
import MobileNav from "./MobileNav";
import { auth } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function Navbar({
  publicStyle = false,
}: {
  publicStyle?: boolean;
}) {
  const session = await auth();
  const role = session?.user?.role;

  const homeLink =
    role === "OWNER" ? "/dashboard/owner" : role === "ADMIN" ? "/admin" : "/";

  const navigationLinks = (
    <>
      {role === "CLIENT" && (
        <>
          <Link href="/" className="text-sm hover:underline">
            Explore
          </Link>

          <Link
            href="/dashboard/client/reservations"
            className="text-sm hover:underline"
          >
            My Reservations
          </Link>

          <Link
            href="/dashboard/client/favorites"
            className="text-sm hover:underline"
          >
            Favorites
          </Link>
        </>
      )}
    </>
  );
  const desktopAccountActions = (
    <>
      {session ? (
        <>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <img
              src={session.user.image || "/uploads/avatar.png"}
              alt="Profile picture"
              width={36}
              height={36}
              className={`rounded-full object-cover ${
                session.user.image ? "" : "opacity-30"
              }`}
            />
            Profile
          </Link>

          <LogoutButton />
        </>
      ) : (
        <Link
          href="/login"
          className={
            publicStyle
              ? "rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 focus-visible:outline-indigo-500"
              : "rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          }
        >
          Sign in
        </Link>
      )}
    </>
  );

  const mobileAccountActions = (
    <>
      {session ? (
        <>
          <Link href="/dashboard/profile" className="text-sm">
            Profile
          </Link>

          <LogoutButton />
        </>
      ) : (
        <Link href="/login" className="text-sm">
          Sign in
        </Link>
      )}
    </>
  );

  return (
    <nav
      aria-label="Main navigation"
      className={
        publicStyle
          ? "relative border-b border-gray-100 bg-white"
          : "border-b bg-white"
      }
    >
      <div
        className={
          publicStyle
            ? "mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 py-2 lg:min-h-20 lg:px-8 lg:py-4"
            : "mx-auto flex h-16 max-w-7xl items-center justify-between px-6"
        }
      >
        <Link
          href={homeLink}
          className={
            publicStyle
              ? "text-xl font-semibold tracking-tight text-gray-900"
              : "text-xl font-bold"
          }
        >
          Appointify<span className="text-[#9993c6]">.</span>
        </Link>

        <div
          className={
            publicStyle
              ? "hidden items-center justify-center gap-1 empty:hidden lg:flex [&>a]:rounded-lg [&>a]:px-3 [&>a]:py-2 [&>a]:text-gray-600 [&>a:hover]:bg-[#E9EAFF] [&>a:hover]:text-gray-900 [&>a:hover]:no-underline"
              : "flex items-center gap-6"
          }
        >
          {navigationLinks}
        </div>

        <div
          className={
            publicStyle
              ? "hidden items-center gap-3 lg:flex [&>button]:rounded-lg [&>button]:px-2 [&>button]:py-2 [&>button]:text-gray-500 [&>button:hover]:bg-gray-50"
              : "flex items-center gap-2"
          }
        >
          {desktopAccountActions}
        </div>

        {publicStyle && (
          <MobileNav>
            {navigationLinks}
            {mobileAccountActions}
          </MobileNav>
        )}
      </div>
    </nav>
  );
}
