export type AdminSearchParams = Record<string, string | string[] | undefined>;

export const PAGE_SIZE = 10;

export function searchValue(params: AdminSearchParams, key: string) {
  const value = params[key];
  return typeof value === "string" ? value.trim() : "";
}

export function pagination(params: AdminSearchParams, total: number) {
  const requested = Number(searchValue(params, "page"));
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(
    Number.isSafeInteger(requested) && requested > 0 ? requested : 1,
    pages,
  );
  return { page, pages, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE };
}

export function pageHref(path: string, params: AdminSearchParams, page: number) {
  const query = new URLSearchParams();
  for (const key of Object.keys(params)) {
    const value = searchValue(params, key);
    if (key !== "page" && value) query.set(key, value);
  }
  query.set("page", String(page));
  return `${path}?${query.toString()}`;
}

export function adminDate(date: Date) {
  return date.toLocaleDateString("en-GB", { timeZone: "Europe/Belgrade" });
}

export function adminTime(date: Date) {
  return date.toLocaleTimeString("en-GB", {
    timeZone: "Europe/Belgrade", hour: "2-digit", minute: "2-digit",
  });
}
