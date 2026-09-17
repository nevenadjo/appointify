"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

let activeDialogs = 0;
let originalOverflow = "";
let originalScrollbarGutter = "";

export default function Modal({
  children,
  titleId,
  onClose,
  pending = false,
  compact = false,
  wide = false,
}: {
  children: ReactNode;
  titleId: string;
  onClose: () => void;
  pending?: boolean;
  compact?: boolean;
  wide?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    if (activeDialogs === 0) {
      originalOverflow = document.body.style.overflow;
      const root = document.documentElement;
      originalScrollbarGutter = root.style.scrollbarGutter;
      // Reserve the existing viewport scrollbar before hiding it. Applying this
      // to html also keeps fixed/sticky content aligned, without body padding.
      // Short pages and overlay scrollbars do not need an additional gutter.
      if (
        window.innerWidth > root.clientWidth &&
        !getComputedStyle(root).scrollbarGutter.includes("stable")
      ) {
        root.style.scrollbarGutter = "stable";
      }
    }
    activeDialogs++;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      activeDialogs--;
      if (activeDialogs === 0) {
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.scrollbarGutter =
          originalScrollbarGutter;
      }
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
      onClick={(event) => {
        if (pending || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
      className={`fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_1rem)] overflow-hidden rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-xl backdrop:bg-black/45 sm:w-[calc(100%_-_2rem)] ${compact ? "max-w-lg" : wide ? "max-w-5xl" : "max-w-3xl"}`}
    >
      <div className="relative max-h-[90dvh]">
        <button
          type="button"
          disabled={pending}
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-2 top-2 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-2xl text-gray-500 hover:bg-[#E9EAFF] hover:text-gray-900 focus-visible:outline-indigo-500 disabled:opacity-40 sm:right-4 sm:top-4"
        >
          ×
        </button>
        <div className="modal-scroll-area max-h-[90dvh] overflow-y-auto overscroll-contain px-4 py-4 sm:px-8 sm:py-8">
          {children}
        </div>
      </div>
    </dialog>
  );
}
