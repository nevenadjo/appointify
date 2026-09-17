"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminLogoutButton from "./AdminLogoutButton";

const menuItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/cities", label: "Cities" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold">
          Appointify
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Admin panel
        </p>
      </div>

      <nav className="space-y-2">
        {menuItems.map(({ href, label }) => {
          const isActive = pathname === href ||
            (href !== "/admin" && pathname.startsWith(`${href}/`));

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-black font-semibold text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t pt-6">
        <AdminLogoutButton />
      </div>
    </aside>
  );
}
