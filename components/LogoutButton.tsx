"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button className="cursor-pointer text-sm" onClick={() => signOut({ callbackUrl: "/login" })}>
      Logout
    </button>
  );
}