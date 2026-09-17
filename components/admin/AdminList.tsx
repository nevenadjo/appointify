import Link from "next/link";
import type { ReactNode } from "react";
import { pageHref, PAGE_SIZE, type AdminSearchParams } from "@/lib/admin-list";

export function AdminList({ title, description, children }: {
  title: string; description: string; children: ReactNode;
}) {
  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-gray-500">{description}</p>
      {children}
    </div>
  );
}

export function ListFilters({ path, query, placeholder, children }: {
  path: string; query: string; placeholder: string; children?: ReactNode;
}) {
  return (
    <form key={`${query}-${path}`} action={path} method="get" className="mt-8 flex flex-wrap items-end gap-3">
      <label className="min-w-48 flex-1 text-sm font-medium">
        Search
        <input type="search" name="q" defaultValue={query} placeholder={placeholder}
          className="mt-1 block w-full rounded-md border bg-white px-3 py-2" />
      </label>
      {children}
      <button className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-medium text-white">Apply filters</button>
      <Link href={path} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">Reset</Link>
    </form>
  );
}

export function SelectFilter({ name, label, value, options }: {
  name: string; label: string; value: string; options: { value: string; label: string }[];
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <select key={value} name={name} defaultValue={value} className="mt-1 block rounded-md border bg-white px-3 py-2">
        <option value="">All {label.toLowerCase()}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export const activeOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export function StatusBadge({ active }: { active: boolean }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{active ? "Active" : "Inactive"}</span>;
}

export function ListTable({ headings, empty, children }: {
  headings: string[]; empty: boolean; children: ReactNode;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50"><tr>{headings.map((heading) => <th key={heading} scope="col" className="px-6 py-4 font-semibold">{heading}</th>)}</tr></thead>
          <tbody className="divide-y [&_td]:px-6 [&_td]:py-4 [&_tr]:hover:bg-gray-50">
            {empty ? <tr><td colSpan={headings.length} className="text-center text-gray-500">No results found. Try changing your search or filters.</td></tr> : children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ListPagination({ path, params, page, pages, total }: {
  path: string; params: AdminSearchParams; page: number; pages: number; total: number;
}) {
  const linkClass = "rounded-md border px-3 py-2 text-sm hover:bg-gray-50";
  return (
    <nav aria-label="Pagination" className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-gray-500">Showing {total ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, total)} of {total}</p>
      <div className="flex items-center gap-2">
        {page > 1 ? <Link className={linkClass} href={pageHref(path, params, page - 1)}>Previous</Link> : <span aria-disabled="true" className={`${linkClass} text-gray-400`}>Previous</span>}
        <span className="text-sm">Page {page} of {pages}</span>
        {page < pages ? <Link className={linkClass} href={pageHref(path, params, page + 1)}>Next</Link> : <span aria-disabled="true" className={`${linkClass} text-gray-400`}>Next</span>}
      </div>
    </nav>
  );
}
