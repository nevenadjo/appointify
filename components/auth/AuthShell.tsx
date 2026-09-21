import Image from "next/image";
import type { ReactNode } from "react";

export const authInputClass = "mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-[#8b86bc] focus:ring-4 focus:ring-[#E9EAFF]/70";
export const authButtonClass = "flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-[#272632] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#403e52] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8b86bc]";
export const authLinkClass = "rounded-sm font-semibold text-[#46415f] underline decoration-[#d2cfea] underline-offset-3 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8b86bc]";

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#E9EAFF] px-4 py-6 font-sans text-gray-900 sm:px-6 sm:py-10">
      <div className="grid w-full max-w-[960px] rounded-2xl border border-white/70 bg-white p-6 shadow-[0_12px_48px_-24px_rgba(46,40,79,0.28)] sm:p-9 md:grid-cols-2 md:gap-10 md:p-11 lg:gap-14 lg:p-12">
        <div className="min-w-0 border-b border-gray-100 pb-6 text-center md:flex md:flex-col md:justify-start md:border-r md:border-b-0 md:pt-1 md:pr-10 md:pb-0 md:text-left lg:pr-14">
          <p className="text-2xl font-semibold tracking-tight sm:text-[28px]">Appointify<span className="text-[#9993c6]">.</span></p>
          <p className="mx-auto mt-3 max-w-64 text-sm leading-6 text-gray-500 md:mx-0 md:text-base md:leading-7">
            All your appointments, all in one place. <a href="/" className={authLinkClass}>
              Explore↗
            </a>
          </p>
          <div className="mt-4 hidden md:block">
            <Image
              src="/booking-design.png"
              alt=""
              width={740}
              height={740}
              loading="eager"
              sizes="(max-width: 767px) 1px, (max-width: 959px) 40vw, 350px"
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
        <div className="min-w-0 pt-6 md:py-1">{children}</div>
      </div>
    </main>
  );
}

export function GoogleLogo() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.92a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02l3.34-2.59Z" />
      <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.5L18.7 4.6A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.34 2.59A5.99 5.99 0 0 1 12 5.96Z" />
    </svg>
  );
}
