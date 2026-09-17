import { getBusinessPublicPath } from "@/lib/business-url";
import Link from "next/link";

type BusinessCardProps = {
  business: {
    id: string;
    publicId: string;
    name: string;
    city: {
      id: string;
      name: string;
    };
    category: {
      name: string;
    };
    reviews: {
      rating: number;
    }[];
  };
};

export default function BusinessCard({ business }: BusinessCardProps) {
  const averageRating =
    business.reviews.length > 0
      ? (
          business.reviews.reduce((sum, review) => sum + review.rating, 0) /
          business.reviews.length
        ).toFixed(1)
      : null;

  return (
    <Link
      href={getBusinessPublicPath(business.category.name, business.publicId)}
      className="block rounded-xl border p-5 transition hover:shadow-md"
    >
      <h2 className="text-xl font-semibold">{business.name}</h2>

      <p className="mt-1 text-sm text-gray-500">{business.category.name}</p>

      <p className="mt-3">{business.city.name}</p>

      {averageRating ? (
        <p className="mt-3">
          ⭐ {averageRating}{" "}
          <span className="text-sm text-gray-500">
            ({business.reviews.length} reviews)
          </span>
        </p>
      ) : (
        <p className="mt-3 text-sm text-gray-500">No reviews yet</p>
      )}
    </Link>
  );
}
