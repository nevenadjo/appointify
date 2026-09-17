import { getBusinessPublicPath } from "@/lib/business-url";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type Business = {
  id: string;
  publicId: string;
  name: string;
  address: string;
  city: { name: string };
  category: { name: string };
  images: { imageUrl: string }[];
  reviews: { rating: number }[];
};

export default function BusinessCard({ business, actions }: { business: Business; actions?: ReactNode }) {
  const count = business.reviews.length;
  const rating = count ? business.reviews.reduce((sum, review) => sum + review.rating, 0) / count : null;
  const photo = business.images[0];

  const card = (
    <Link href={getBusinessPublicPath(business.category.name, business.publicId)} className={`group flex flex-col overflow-hidden bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${actions ? "flex-1 rounded-t-2xl" : "h-full rounded-2xl border border-gray-200 transition-colors hover:border-indigo-300"}`}>
      <div className="relative aspect-[16/10] bg-gray-50">
        <Image src={photo?.imageUrl || "/business-placeholder.svg"} alt={photo ? business.name : "No business photo available"} fill unoptimized sizes="(max-width: 640px) 80vw, 300px" className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 text-xs font-medium text-gray-500">{business.category.name}</p>
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-gray-900 group-hover:text-indigo-700">{business.name}</h3>
        <p className="mt-2 text-sm text-gray-600">{business.city.name}</p>
         <p className="mt-2 text-xs text-gray-500">{business.address}</p>
        <div className="mt-auto pt-5 text-sm">
          {rating !== null ? <p className="flex flex-wrap items-center gap-1.5"><span aria-hidden="true" className="text-amber-500">★</span><span className="font-semibold">{rating.toFixed(1)}</span><span className="text-gray-500">({count} {count === 1 ? "review" : "reviews"})</span></p> : <p className="text-gray-500">No reviews yet</p>}
        </div>
      </div>
    </Link>
  );
  if (!actions) return card;
  return <article className="flex h-full min-w-0 flex-col rounded-2xl border border-gray-200 bg-white transition-colors hover:border-indigo-300">
    {card}
    <div className="px-5 pb-5">{actions}</div>
  </article>;
}
