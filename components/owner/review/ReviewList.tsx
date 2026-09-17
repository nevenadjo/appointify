import Image from "next/image";
import RatingStars from "@/components/review/RatingStars";

type Business = {
  reviews: {
    user: {
      name: string | null;
      image: string | null;
    };
    reservation: {
      service: {
        name: string;
      } | null;
    };
    comment: string | null;
    id: string;
    rating: number;
    createdAt: Date;
    serviceRating: number | null;
    cleanlinessRating: number | null;
    valueRating: number | null;
    punctualityRating: number | null;
  }[];
};

export default function ReviewList({
  business,
}: {
  business: Business;
}) {
  return (
    <section>
      {business.reviews.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
          No reviews yet. Customer reviews will appear here
          after completed appointments.
        </p>
      ) : (
        <div className="space-y-4">
          {business.reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src={
                      review.user.image ||
                      "/uploads/avatar.png"
                    }
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />

                  <div className="min-w-0">
                    <p className="break-words font-medium">
                      {review.user.name ?? "Client"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {review.createdAt.toLocaleDateString(
                        "en-GB",
                        {
                          timeZone: "Europe/Belgrade",
                        },
                      )}
                    </p>
                  </div>
                </div>

                <p
                  aria-label={`Overall rating: ${review.rating} out of 5`}
                  className="rounded-lg bg-[#E9EAFF]/50 px-3 py-2 text-sm font-semibold"
                >
                  <span
                    aria-hidden="true"
                    className="text-amber-500"
                  >
                    &#9733;
                  </span>{" "}
                  {review.rating.toFixed(1)}
                </p>
              </div>

              {review.reservation.service && (
                <div className="mt-4">
                  <span className="inline-flex rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
                    Service:{" "}
                    {review.reservation.service.name}
                  </span>
                </div>
              )}

              {review.comment && (
                <p className="mt-5 whitespace-pre-line break-words leading-6 text-gray-700">
                  {review.comment}
                </p>
              )}

              <dl className="mt-5 grid gap-x-8 gap-y-4 rounded-xl bg-[#FFF4E1]/30 p-4 sm:grid-cols-2">
                {(
                  [
                    ["Overall", review.rating],
                    [
                      "Service quality",
                      review.serviceRating,
                    ],
                    [
                      "Cleanliness",
                      review.cleanlinessRating,
                    ],
                    [
                      "Value for money",
                      review.valueRating,
                    ],
                    [
                      "Punctuality",
                      review.punctualityRating,
                    ],
                  ] as const
                ).map(
                  ([label, value]) =>
                    value != null && (
                      <div
                        key={label}
                        className="flex flex-wrap items-center justify-between gap-2"
                      >
                        <dt className="text-sm text-gray-600">
                          {label}
                        </dt>

                        <dd>
                          <RatingStars rating={value} />
                        </dd>
                      </div>
                    ),
                )}
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}