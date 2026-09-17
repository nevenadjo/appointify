function normalizeCategoryName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getBusinessPublicPath(
  categoryName: string,
  publicId: string
) {
  const normalizedCategory = normalizeCategoryName(categoryName);

  if (normalizedCategory === "other") {
    return `/businesses/${publicId}`;
  }

  return `/businesses/${normalizedCategory}-${publicId}`;
}

export function getBusinessPublicIdFromPath(value: string) {
  const parts = value.split("-");

  return parts[parts.length - 1];
}