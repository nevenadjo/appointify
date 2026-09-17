import type { ReactNode } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/layout/Footer";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-gray-900">
      <Navbar publicStyle />
      {children}
      <Footer />
    </div>
  );
}
