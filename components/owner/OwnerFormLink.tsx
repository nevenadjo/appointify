"use client";
import { createContext, useContext, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { useAppToast } from "@/components/ui/ToastProvider";
import { getOwnerFormData } from "@/lib/owner-form-actions";
import BusinessForm from "./forms/BusinessForm";
import ServiceForm from "./forms/ServiceForm";
import WorkingHoursForm from "./forms/WorkingHoursForm";
const OpenForm = createContext<((href: string) => void) | null>(null);
export function OwnerFormProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<{ href: string; kind: string; businessId?: string; serviceId?: string } | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof getOwnerFormData>> | null>(null);
  const [pending, setPending] = useState(false);
  const sequence = useRef(0);
  const id = useId(); const router = useRouter(); const toast = useAppToast();
  function close() { setPending(false); sequence.current++; setRequest(null); setData(null); }
  async function open(href: string) {
    const parts = href.split("/").filter(Boolean);
    const businessId = parts[2] === "create" ? undefined : parts[2];
    const kind = parts.includes("services") ? "service" : parts.includes("working-hours") ? "hours" : "business";
    const serviceId = kind === "service" && parts[4] !== "create" ? parts[4] : undefined;
    const ticket = ++sequence.current; setData(null); setRequest({ href, kind, businessId, serviceId });
    try { const result = await getOwnerFormData(kind, businessId, serviceId); if (ticket === sequence.current) setData(result); }
    catch { if (ticket === sequence.current) setData({ error: "Unable to load this form. Please try the standalone page." }); }
  }
  const editing = request?.kind === "service" ? !!request.serviceId : !!request?.businessId;
  const entity = request?.kind === "hours" ? "Working hours" : request?.kind === "service" ? "Service" : "Business";
  const title = request?.kind === "hours" ? "Edit working hours" : (editing ? "Edit " : "Create ") + entity.toLowerCase();
  function success() { close(); router.refresh(); toast(entity + (editing || request?.kind === "hours" ? " updated successfully." : " created successfully.")); }
  return <OpenForm.Provider value={open}>{children}{request && <Modal wide={request.kind === "hours"} pending={pending} titleId={id} onClose={close}>
    <h2 id={id} className="pr-12 text-xl font-semibold">{title}</h2>
    {!data ? <p role="status" className="py-6">Loading...</p> : data.error ? <p role="alert" className="mt-6 text-red-600">{data.error} <a href={request.href} className="underline">Open page</a></p> : <>
      {request.kind === "business" && <BusinessForm business={data.business || undefined} categories={data.categories || []} cities={data.cities || []} modal onPendingChange={setPending} onCancel={close} onSuccess={success} />}
      {request.kind === "service" && request.businessId && <ServiceForm businessId={request.businessId} service={data.service || undefined} modal onPendingChange={setPending} onCancel={close} onSuccess={success} />}
      {request.kind === "hours" && data.business && <WorkingHoursForm business={data.business} modal onPendingChange={setPending} onCancel={close} onSuccess={success} />}
    </>}
  </Modal>}</OpenForm.Provider>;
}
export default function OwnerFormLink({ href, onClick, ...props }: ComponentProps<"a"> & { href: string }) {
  const open = useContext(OpenForm);
  return <a {...props} href={href} onClick={event => {
    if (!open || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); open(href); onClick?.(event);
  }} />;
}
