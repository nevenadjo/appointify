import type { ReactNode } from "react";

export default function BusinessContentPanel({ navigation, controls, children }: {
  navigation: ReactNode; controls?: ReactNode; children: ReactNode;
}) {
  return <section aria-label="Services and reviews" className="mt-8 min-w-0">
    {navigation}
    {controls && <div className="mt-5 min-w-0">{controls}</div>}
    <div className="mt-5 min-w-0">{children}</div>
  </section>;
}
