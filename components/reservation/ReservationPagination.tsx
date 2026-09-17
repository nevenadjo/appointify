import Link from "next/link";

export default function ReservationPagination({
  page,
  pages,
  filter,
  basePath = "/dashboard/client/reservations",
  view,
}: {
  page: number;
  pages: number;
  filter: string;
  basePath?: string;
  view?: string;
}) {
  if (pages <= 1) return null;

  const numbers = [
    ...new Set([1, page - 1, page, page + 1, pages]),
  ]
    .filter((n) => n > 0 && n <= pages)
    .sort((a, b) => a - b);

  const href = (n: number) => {
    const params = new URLSearchParams({
      filter,
      page: String(n),
    });

    if (view) {
      params.set("view", view);
    }

    return `${basePath}?${params.toString()}`;
  };

  const base =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-sm";

  const disabled =
    `${base} cursor-default bg-gray-50 text-gray-400`;

  return (
    <nav
      aria-label="Reservations pagination"
      className="mt-8 flex flex-wrap justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className={`${base} hover:bg-[#E9EAFF]`}
        >
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={disabled}>
          Previous
        </span>
      )}

      {numbers.map((n, index) => (
        <span key={n} className="flex items-center gap-2">
          {index > 0 && n - numbers[index - 1] > 1 && (
            <span>…</span>
          )}

          <Link
            href={href(n)}
            aria-label={`Page ${n}`}
            aria-current={n === page ? "page" : undefined}
            className={`${base} hover:bg-[#E9EAFF] ${
              n === page
                ? "bg-[#E9EAFF] font-semibold"
                : ""
            }`}
          >
            {n}
          </Link>
        </span>
      ))}

      {page < pages ? (
        <Link
          href={href(page + 1)}
          className={`${base} hover:bg-[#E9EAFF]`}
        >
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className={disabled}>
          Next
        </span>
      )}
    </nav>
  );
}