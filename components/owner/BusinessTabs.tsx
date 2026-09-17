import type { ReactNode } from "react";
import BusinessSectionNav from "@/components/businesses/BusinessSectionNav";
import BusinessContentPanel from "@/components/businesses/BusinessContentPanel";

export default function BusinessTabs({ services, reviews, businessId, query, active, controls, counts }: {
  services: ReactNode; reviews: ReactNode; businessId: string;
  query: Record<string, string | string[] | undefined>; active: string;
  controls?: ReactNode;
  counts: { services: number; reviews: number };
}) {
  const tabQuery = Object.fromEntries(Object.entries(query).filter(([key]) => !["servicesPage", "reviewsPage"].includes(key)));
  return <BusinessContentPanel navigation={<BusinessSectionNav id={businessId} basePath={"/dashboard/owner/" + businessId} query={tabQuery} active={active} counts={counts} />} controls={controls}>
    <div id={active} className="scroll-mt-6">{active === "reviews" ? reviews : services}</div>
  </BusinessContentPanel>;
}
