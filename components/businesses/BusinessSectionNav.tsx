import Link from "next/link";

type BusinessSectionNavProps = {
  id: string;
  query: Record<string, string | string[] | undefined>;
  active: string;
  basePath?: string;
  counts?: { services: number; reviews: number };
};

export default function BusinessSectionNav({
  id,
  query,
  active,
  basePath,
  counts,
}: BusinessSectionNavProps) {
  function href(tab: string) {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else if (value !== undefined) {
        params.set(key, value);
      }
    });

    params.set("tab", tab);

    return `${basePath ?? `/businesses/${id}`}?${params.toString()}`;
  }

  return (
    <nav aria-label="Business sections" className="flex w-full gap-6 border-b border-[#E5E7EB] sm:gap-8">
      {(["services", "reviews"] as const).map(tab => (
        <Link key={tab} href={href(tab)} scroll={false} aria-current={active === tab ? "page" : undefined}
          className={"-mb-px inline-flex min-h-12 items-center gap-1.5 whitespace-nowrap border-b-2 px-1 py-3 text-sm transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1] " + (active === tab ? "border-[#6366F1] font-semibold text-[#6366F1]" : "border-transparent font-medium text-gray-600 hover:text-[#6366F1]")}>
          {tab === "services" ? "Services" : "Reviews"}
          {counts && <span className="text-xs font-normal text-gray-500">({counts[tab]})</span>}
        </Link>
      ))}
    </nav>
  );
}
