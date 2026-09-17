import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-[#E9EAFF]/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div><Link href="/" className="text-lg font-semibold tracking-tight">Appointify<span className="text-[#9993c6]">.</span></Link><p className="mt-1 text-sm text-gray-500">All your appointments, all in one place.</p></div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500"><Link href="/businesses" className="hover:text-gray-900 underline underline-offset-3">Explore businesses</Link><span>© {new Date().getFullYear()} Appointify</span></div>
      </div>
    </footer>
  );
}
