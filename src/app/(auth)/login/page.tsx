"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@bencomptapro.com");
  const [password, setPassword] = useState("Admin@2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Échec de connexion.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("Erreur réseau. Veuillez réessayer.");
      setLoading(false);
    }
  }

  function fillDemo(type: "admin" | "comptable") {
    if (type === "admin") {
      setEmail("admin@bencomptapro.com");
      setPassword("Admin@2026!");
    } else {
      setEmail("comptable@bencomptapro.com");
      setPassword("Comptable@2026!");
    }
    setError(null);
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#101B35] flex items-center justify-center shadow-xl border-2 border-[#D4AF37]">
          <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
        </div>

        <h2 className="mt-4 text-3xl font-extrabold text-[#101B35] tracking-tight">
          BenCompta<span className="text-[#D4AF37]">Pro</span> Africa
        </h2>
        <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          SYSCOHADA Révisé • Niger & Afrique Francophone
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Adresse Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.ne"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Mot de passe
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-[#101B35] hover:bg-[#1D3157] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Connexion sécurisée en cours...</span>
              ) : (
                <>
                  <span>Accéder à BenComptaPro</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Accès Démonstration Rapide (Niger)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("admin")}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-[#D4AF37] hover:bg-[#FAF6E8]/30 text-left transition-all group"
              >
                <p className="text-[11px] font-bold text-[#101B35] group-hover:text-[#8C6D15]">
                  Admin Démo
                </p>
                <p className="text-[10px] text-slate-400 truncate">admin@bencomptapro.com</p>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("comptable")}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-left transition-all group"
              >
                <p className="text-[11px] font-bold text-blue-900 group-hover:text-blue-700">
                  Comptable Démo
                </p>
                <p className="text-[10px] text-slate-400 truncate">comptable@bencomptapro.com</p>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Pas encore de compte entreprise ?{" "}
            <Link
              href="/register"
              className="font-bold text-[#101B35] hover:text-[#D4AF37] transition-colors"
            >
              Créer mon espace SaaS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
