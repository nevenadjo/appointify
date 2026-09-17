import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "OWNER" | "CLIENT";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "OWNER" | "CLIENT";
  }
}