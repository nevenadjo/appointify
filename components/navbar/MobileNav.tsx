"use client";

import { useId, useRef, useState, type ReactNode } from "react";

export default function MobileNav({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);

  return (
    <div className="lg:hidden" onKeyDown={(event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        button.current?.focus();
      }
    }}>
      <button ref={button} type="button" aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-900 hover:bg-[#E9EAFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>
      <div id={id} hidden={!open}
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest("a, button")) setOpen(false);
        }}
        className="absolute inset-x-0 top-full z-50 border-b border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 [&>a]:flex [&>a]:min-h-11 [&>a]:items-center [&>a]:rounded-xl [&>a]:px-4 [&>a]:py-3 [&>a:hover]:bg-[#E9EAFF] [&>a:hover]:text-gray-900 [&>a:hover]:no-underline [&>button]:min-h-11 [&>button]:rounded-xl [&>button]:px-4 [&>button]:py-3 [&>button]:text-left [&>button]:text-gray-900 [&>a]:focus-visible:outline-indigo-500 [&>button]:focus-visible:outline-indigo-500">
          {children}
        </div>
      </div>
    </div>
  );
}
