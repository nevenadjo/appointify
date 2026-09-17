import Link from "next/link";

export function boundedPage(value: string | string[] | undefined, total: number, size: number) {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Math.min(Math.max(1, Math.ceil(total / size)), Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1);
}

export default function DetailPagination({ id, query, parameter, page, total, size, section, basePath }: {
  id: string; query: Record<string, string | string[] | undefined>;
  parameter: string; page: number; total: number; size: number; section: string;
  basePath?: string;
}) {
  if (!total) return null;
  const last = Math.max(1, Math.ceil(total / size));
  if (last <= 1) return null;
  const pages = [...new Set([1, page - 1, page, page + 1, last])].filter((n) => n > 0 && n <= last).sort((a, b) => a - b);
  function href(target: number) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
      else if (value !== undefined) params.set(key, value);
    });
    params.set(parameter, String(target));
    return `${basePath ?? `/businesses/${id}`}?${params.toString()}#${section}`;
  }
  const baseStyle = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-sm";
  const style = `${baseStyle} hover:bg-[#E9EAFF] focus-visible:outline-indigo-500`;
  const disabledStyle = `${baseStyle} cursor-default bg-gray-50 text-gray-400`;
  return <nav aria-label={`${section} pagination`} className="mt-6 flex flex-wrap items-center justify-center gap-2">
    {page > 1 ? <Link className={style} href={href(page - 1)}>Previous</Link> : <span aria-disabled="true" className={disabledStyle}>Previous</span>}
    {pages.map((n, index) => <span key={n} className="flex items-center gap-2">
      {index > 0 && n - pages[index - 1] > 1 && <span aria-hidden="true">…</span>}
      <Link href={href(n)} aria-label={`Page ${n}`} aria-current={n === page ? "page" : undefined} className={`${style} ${n === page ? "bg-[#E9EAFF] font-semibold" : "bg-white"}`}>{n}</Link>
    </span>)}
    {page < last ? <Link className={style} href={href(page + 1)}>Next</Link> : <span aria-disabled="true" className={disabledStyle}>Next</span>}
  </nav>;
}
