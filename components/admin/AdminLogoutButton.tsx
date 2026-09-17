"use client";

import { signOut } from "next-auth/react";

export default function AdminLogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
    >
      Logout
    </button>
  );
}