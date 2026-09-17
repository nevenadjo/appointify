"use client";
import ConfirmAction from "@/components/ui/ConfirmAction";
import { toggleFavorite } from "@/lib/favorite-actions";
export default function RemoveFavoriteButton({ businessId }: { businessId: string }) {
 return <ConfirmAction label="Remove from favorites" title="Remove from favorites?" className="mx-auto block min-h-11 cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-indigo-300 hover:bg-[#E9EAFF]/50 hover:text-indigo-700 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40" description="You can add this business to your favorites again at any time." confirmLabel="Remove" pendingLabel="Removing..." successMessage="Removed from favorites" action={async () => { const result = await toggleFavorite(businessId); return result.isFavorite ? { success: false, error: "Your favorites changed. Please refresh and try again." } : { success: true }; }} />;
}
