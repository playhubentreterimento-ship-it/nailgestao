"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isPublicPage = pathname === "/agendar" || pathname?.startsWith("/agendar") || pathname === "/login";

  useEffect(() => {
    if (isPublicPage) {
      setCheckingAuth(false);
      return;
    }

    fetch("/api/auth/session")
      .then((res) => {
        if (!res.ok) throw new Error("Não autenticado");
        return res.json();
      })
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.push("/login");
          return;
        }
        const role = data.user.role || "PROFISSIONAL";
        setUserRole(role);

        // Se for colaboradora / profissional, restringir rotas exclusivamente para /agenda e /caixa
        if (role === "PROFISSIONAL" || role === "COLABORADORA" || role === "ATENDENTE") {
          if (pathname !== "/agenda" && pathname !== "/caixa") {
            router.push("/agenda");
          }
        }
        setCheckingAuth(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [pathname, isPublicPage, router]);

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF3F0] via-[#F6EBE5] to-[#EFE0D5] font-sans text-slate-800 antialiased dark:from-[#0F172A] dark:to-[#020617] dark:text-slate-100">
        {children}
      </div>
    );
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FAF3F0] via-[#F6EBE5] to-[#EFE0D5] dark:from-[#0F172A] dark:to-[#020617]">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 text-white text-2xl font-bold animate-pulse">
            💅
          </div>
          <p className="text-xs font-bold text-rose-900 dark:text-rose-200">Autenticando acesso do salão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#FAF3F0] via-[#F6EBE5] to-[#EFE0D5] dark:from-[#0F172A] dark:to-[#020617] text-slate-900 dark:text-slate-100">
      <Header userRole={userRole} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar userRole={userRole} />
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav userRole={userRole} />
    </div>
  );
}
