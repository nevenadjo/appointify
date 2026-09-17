export default function RatingStars({ rating }: { rating: number }) {
  return (
    <span role="img" aria-label={`${rating} out of 5 stars`} className="inline-flex shrink-0 gap-0.5 text-lg leading-none">
      {[1, 2, 3, 4, 5].map((position) => (
        <span key={position} aria-hidden="true" className={position <= rating ? "text-amber-500" : "text-gray-300"}>★</span>
      ))}
    </span>
  );
}
