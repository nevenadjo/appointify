"use client";

import { useState } from "react";

type BusinessImage = {
  id: string;
  imageUrl: string;
};

type BusinessImageCarouselProps = {
  images: BusinessImage[];
  businessName: string;
};

export default function BusinessImageCarousel({
  images,
  businessName,
}: BusinessImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  function previousImage() {
    setCurrentIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  }

  function nextImage() {
    setCurrentIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  }

  const currentImage = images[currentIndex];

  return (
    <section aria-label={`${businessName} photos`} className="min-w-0">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
        <img
          src={currentImage.imageUrl}
          alt={`${businessName} photo ${currentIndex + 1}`}
          className="aspect-[4/3] w-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousImage}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 px-3 py-2 text-xl shadow hover:bg-white"
            >
              ←
            </button>

            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 px-3 py-2 text-xl shadow hover:bg-white"
            >
              →
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
