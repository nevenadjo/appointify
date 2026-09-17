"use client";
import { useId, type ReactNode } from "react";
import Modal from "@/components/ui/Modal";
export default function AdminModal({ open, title, onClose, children, pending = false }: { open: boolean; title: string; onClose: () => void; children: ReactNode; pending?: boolean }) {
 const id = useId();
 return open ? <Modal titleId={id} onClose={onClose} pending={pending} compact><h2 id={id} className="pr-10 text-xl font-semibold">{title}</h2><div className="mt-6">{children}</div></Modal> : null;
}
