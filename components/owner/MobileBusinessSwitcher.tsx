"use client";
import OwnerFormLink from "@/components/owner/OwnerFormLink";


import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export default function MobileBusinessSwitcher({ businesses, selectedId }: {
  businesses: { id: string; name: string; city: { name: string } }[];
  selectedId?: string | string[];
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const selected = businesses.find(business => business.id === selectedId);

  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return <div className="px-5 pt-5 sm:px-8 lg:hidden">
    <div ref={root} className="relative" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button ref={trigger} type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2 text-left focus-visible:outline-2 focus-visible:outline-indigo-500">
        <span className="min-w-0 flex-1"><span className="block text-xs text-gray-500">Business</span><span className="mt-1 block truncate text-sm font-medium text-gray-900">{selected?.name ?? "Choose business"}</span></span>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && <nav id={id} aria-label="Choose business" className="absolute inset-x-0 top-full z-30 mt-2 max-h-[min(60dvh,24rem)] overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white p-2 shadow-md">
        <p className="px-3 py-2 text-xs font-medium text-gray-500">Choose business</p>
        {businesses.map(business => <Link key={business.id} href={`/dashboard/owner/${business.id}`} aria-current={selectedId === business.id ? "page" : undefined} onClick={() => setOpen(false)} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-3 text-sm focus-visible:outline-indigo-500 ${selectedId === business.id ? "bg-[#FFF4E1] font-semibold" : "hover:bg-gray-50"}`}>
          <span className="min-w-0 flex-1"><span className="block break-words">{business.name}</span><span className="mt-1 block text-xs font-normal text-gray-500">{business.city.name}</span></span>
          {selectedId === business.id && <span aria-hidden="true" className="shrink-0 text-indigo-500">✓</span>}
        </Link>)}
        {businesses.length === 0 && <p className="px-3 py-2 text-sm text-gray-500">No businesses yet.</p>}
        <OwnerFormLink href="/dashboard/owner/create" onClick={() => setOpen(false)} className="mt-2 flex min-h-11 items-center rounded-lg border-t border-gray-100 px-3 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 focus-visible:outline-indigo-500">+ Add Business</OwnerFormLink>
      </nav>}
    </div>
  </div>;
}
