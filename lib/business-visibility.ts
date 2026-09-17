// Shared by public listings, detail pages and client booking checks.
export const publicBusinessWhere = {
  isActive: true,
  isSuspended: false,
} as const;

export function isBusinessPublic(business: { isActive: boolean; isSuspended: boolean }) {
  return business.isActive && !business.isSuspended;
}
