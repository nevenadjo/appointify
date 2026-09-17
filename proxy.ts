import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const role = req.auth?.user?.role;

  if (
    isLoggedIn &&
    (pathname.startsWith("/login") || pathname.startsWith("/register"))
  ) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    const url = new URL("/post-login", req.nextUrl);

    if (callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")) {
      url.searchParams.set("callbackUrl", callbackUrl);
    }

    return NextResponse.redirect(url);
  }

  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set(
      "callbackUrl",
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
    );

    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/dashboard/client") && role !== "CLIENT") {
    return NextResponse.redirect(new URL("/post-login", req.nextUrl));
  }

  if (pathname.startsWith("/dashboard/owner") && role !== "OWNER") {
    return NextResponse.redirect(new URL("/post-login", req.nextUrl));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/post-login", req.nextUrl));
  }

  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/post-login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*", "/admin/:path*"],
};
