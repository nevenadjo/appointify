"use client";

import { Children, useEffect, useId, useRef, useState, type ReactNode } from "react";

export default function BusinessCarousel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const id = useId();
  const [edges, setEdges] = useState({ start: true, end: true });
  const items = Children.toArray(children);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => setEdges({ start: element.scrollLeft <= 1, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 1 });
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => { element.removeEventListener("scroll", update); observer.disconnect(); };
  }, [children]);

  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return (
    <section aria-labelledby={`${id}-title`}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div><h2 id={`${id}-title`} className="text-2xl font-semibold tracking-tight">{title}</h2><p className="mt-2 text-sm text-gray-500">{description}</p></div>
        {items.length > 0 && <div className="hidden shrink-0 gap-2 sm:flex">
          <button type="button" aria-label={`Previous ${title.toLowerCase()}`} aria-controls={id} disabled={edges.start} onClick={() => move(-1)} className="h-10 w-10 cursor-pointer rounded-full border border-gray-500 text-xl font-semibold hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-default disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-500">←</button>
          <button type="button" aria-label={`Next ${title.toLowerCase()}`} aria-controls={id} disabled={edges.end} onClick={() => move(1)} className="h-10 w-10 cursor-pointer rounded-full border border-gray-500 text-xl font-semibold hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-default disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-500">→</button>
        </div>}
      </div>
      {items.length ? <div ref={track} id={id} role="region" aria-label={title} tabIndex={0} className="grid auto-cols-[82%] grid-flow-col gap-5 overflow-x-auto overscroll-x-contain scroll-px-1 snap-x snap-mandatory p-1 pb-4 focus-visible:outline-indigo-500 sm:auto-cols-[46%] lg:auto-cols-[calc((100%-60px)/4)]">
        {items.map((item, index) => <div key={index} className="min-w-0 snap-start">{item}</div>)}
      </div> : <p className="rounded-2xl border border-dashed border-gray-200 p-8 text-sm text-gray-500">No businesses available yet. Check back soon.</p>}
    </section>
  );
}
