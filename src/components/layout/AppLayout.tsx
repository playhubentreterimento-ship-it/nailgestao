"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/agendar" || pathname?.startsWith("/agendar") || pathname === "/login";

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50/50 font-sans text-slate-800 antialiased dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
        {children}
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </>
  );
}
