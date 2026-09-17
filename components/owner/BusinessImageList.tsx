"use client";

import ConfirmAction from "@/components/ui/ConfirmAction";
import { deleteBusinessImage } from "@/lib/business-actions";

export default function BusinessImageList({
  images,
}: {
  images: { id: string; imageUrl: string }[];
}) {
  if (!images.length) {
    return (
      <p className="mt-4 text-sm text-gray-500">
        No images added yet.
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {images.map((image) => (
        <div
          key={image.id}
          className="overflow-hidden rounded-xl border"
        >
          <img
            src={image.imageUrl}
            alt="Business"
            className="h-48 w-full object-cover"
          />

          <div className="p-3">
            <ConfirmAction
              label="Delete image"
              title="Delete image?"
              description="Are you sure you want to delete this image? This action cannot be undone."
              destructive
              pendingLabel="Deleting..."
              successMessage="Image deleted successfully."
              className="min-h-11 cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              action={() => deleteBusinessImage(image.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}