"use client";

import { useId, useState, type ReactNode } from "react";

export default function MobileCategoryFilter({ selectedCount, children }: {
  selectedCount: number;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();

  return (
    <div className="mt-8">
      <button type="button" aria-expanded={expanded} aria-controls={id}
        onClick={() => setExpanded((value) => !value)}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 md:hidden">
        <span className="flex items-center gap-2">Categories
          {selectedCount > 0 && <span className="rounded-full bg-[#E9EAFF] px-2 py-0.5 text-xs">({selectedCount})</span>}
        </span>
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={expanded ? "rotate-180" : ""}>
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div id={id} className={`${expanded ? "flex" : "hidden"} mt-3 flex-wrap gap-3 md:mt-0 md:flex`}>
        {children}
      </div>
    </div>
  );
}
