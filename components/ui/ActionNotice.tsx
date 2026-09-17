"use client";
import { useEffect, useRef } from "react";
import { useAppToast } from "./ToastProvider";
const messages: Record<string, string> = { profile_updated: "Profile updated successfully.", business_created: "Business created successfully.", business_updated: "Business updated successfully.", service_created: "Service created successfully.", service_updated: "Service updated successfully.", hours_updated: "Working hours updated successfully." };
export default function ActionNotice({ code }: { code?: string | string[] }) {
 const toast = useAppToast(); const seen = useRef<string | undefined>(undefined);
 const message = typeof code === "string" ? messages[code] : undefined;
 useEffect(() => { if (!message || seen.current === message) return; seen.current = message; toast(message); const url = new URL(window.location.href); url.searchParams.delete("notice"); window.history.replaceState(null, "", url.pathname + url.search + url.hash); }, [message, toast]);
 return message ? <noscript><p role="status" className="mb-5 rounded-xl bg-[#E9EAFF] p-4">{message}</p></noscript> : null;
}
