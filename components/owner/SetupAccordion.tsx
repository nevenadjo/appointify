import type { ReactNode } from "react";
import OwnerAccordion from "./OwnerAccordion";

export default function SetupAccordion({ ready, children }: { ready: boolean; children: ReactNode }) {
  return <OwnerAccordion title="Business setup" subtitle="Complete the setup before making your business available to clients." badge={<span className={"shrink-0 rounded-full px-3 py-1 text-xs font-medium " + (ready ? "bg-green-50 text-green-700" : "bg-[#FFF4E1] text-amber-800")}>{ready ? "Ready" : "Not ready"}</span>}>{children}</OwnerAccordion>;
}
