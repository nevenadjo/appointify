"use client";

import { useId, useState, type ReactNode } from "react";

export default function OwnerAccordion({ title, subtitle, badge, id, children }: {
  title: string; subtitle?: string; badge?: ReactNode; id?: string; children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  return <section id={id} className="mt-6 scroll-mt-6 rounded-2xl border border-gray-200 bg-white">
    <button type="button" aria-expanded={open} aria-controls={contentId} onClick={() => setOpen(!open)} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl p-5 text-left focus-visible:outline-indigo-500 sm:p-6">
      <span className="min-w-0 flex-1"><span className="block text-lg font-semibold">{title}</span>{subtitle && <span className="mt-1 block text-sm text-gray-500">{subtitle}</span>}</span>
      {badge}
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-5 w-5 shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
    </button>
    <div id={contentId} aria-hidden={!open} inert={!open} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
      <div className="min-h-0 overflow-hidden"><div className="border-t border-gray-100 px-5 pb-6 sm:px-6">{children}</div></div>
    </div>
  </section>;
}
