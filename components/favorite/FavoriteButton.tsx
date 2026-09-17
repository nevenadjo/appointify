"use client";

import { useTransition } from "react";
import { useAppToast } from "@/components/ui/ToastProvider";
import { toggleFavorite } from "@/lib/favorite-actions";

type FavoriteButtonProps = {
  businessId: string;
  isFavorite: boolean;
};

export default function FavoriteButton({
  businessId,
  isFavorite,
}: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const showToast = useAppToast();
  const clearToast = () => showToast("");

  function handleClick() {
    clearToast();

    startTransition(async () => {
      const result = await toggleFavorite(businessId);
      showToast(result.isFavorite ? "Added to favorites" : "Removed from favorites");
    });
  }

  return (
    <>
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
      aria-busy={isPending}
      className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-wait disabled:opacity-50 ${isFavorite ? "text-red-500 enabled:hover:text-red-600" : "text-gray-600 enabled:hover:text-gray-900"}`}
    >
      <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
      </svg>
    </button>
    </>
  );
}
