"use client";
import { useEffect } from "react";
import Toast from "@/components/ui/Toast";
export default function AdminToast({ message, onClose }: { message: string; type?: "success" | "error"; onClose: () => void }) {
 useEffect(() => { const timer = setTimeout(onClose, 2500); return () => clearTimeout(timer); }, [message, onClose]);
 return <Toast message={message} onClose={onClose} />;
}
