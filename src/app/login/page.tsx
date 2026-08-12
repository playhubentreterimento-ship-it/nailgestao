"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [configuredAdminEmail, setConfiguredAdminEmail] = useState("juliana@studioluxe.com.br");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.adminEmail) {
          setConfiguredAdminEmail(data.adminEmail);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      const role = data.user?.role;
      if (role === "PROFISSIONAL" || role === "COLABORADORA" || role === "ATENDENTE") {
        router.push("/agenda");
      } else {
        router.push("/");
      }
    } else {
      const err = await res.json();
      setError(err.error || "Credenciais inválidas. Verifique seu e-mail e senha cadastrados no painel.");
    }
  };

  const handleQuickLogin = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
      <div className="w-full max-w-md rounded-3xl border border-rose-500/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 via-rose-400 to-amber-600 text-3xl shadow-xl">
            💅
          </div>
          <h1 className="mt-3 font-serif text-2xl font-bold text-white">NAILGESTÃO Pro</h1>
          <p className="text-xs text-rose-300">Sistema Profissional de Gestão & Agendamentos</p>
        </div>

        {/* Card Informativo com Credenciais Master */}
        <div className="mb-6 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-rose-500/20 p-3.5 text-center">
          <p className="text-xs font-extrabold text-amber-300">👑 E-mail de Administradora Master Cadastrado:</p>
          <div className="mt-1.5 text-xs font-mono font-bold text-white space-y-1">
            <p className="bg-slate-900/60 py-1 px-2 rounded-lg border border-amber-400/30 text-amber-200 truncate">
              {configuredAdminEmail}
            </p>
            <p className="text-[11px] text-slate-300 font-sans font-normal">Digite a sua senha cadastrada em Configurações</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-500/20 p-3 text-xs font-bold text-rose-300 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300">E-mail Corporativo</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@salão.com"
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300">Senha</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 font-bold text-white shadow-lg shadow-rose-500/30 hover:opacity-95 text-xs flex items-center justify-center space-x-2"
          >
            <span>ENTRAR NO SISTEMA</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Atalhos Rápidos */}
        <div className="mt-6 border-t border-white/10 pt-4 text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Preencher e-mail rapidamente:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin(configuredAdminEmail, "")}
              className="rounded-xl border border-amber-400/40 bg-amber-500/10 py-2 font-bold text-amber-300 hover:bg-amber-500/20 transition"
            >
              👑 Administradora
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("selma@studioluxe.com.br", "123456")}
              className="rounded-xl border border-rose-400/40 bg-rose-500/10 py-2 font-bold text-rose-300 hover:bg-rose-500/20 transition"
            >
              💅 Colaboradora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
