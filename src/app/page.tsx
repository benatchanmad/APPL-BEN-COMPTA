import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import Link from "next/link";
import { ShieldCheck, ArrowRight, CheckCircle2, Calculator, Layers, FileSpreadsheet, Lock } from "lucide-react";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (session && session.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="h-20 bg-[#101B35] text-white px-8 flex items-center justify-between border-b border-[#1D3157]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#F3DE97] flex items-center justify-center border border-[#D4AF37]">
            <ShieldCheck className="w-6 h-6 text-[#101B35]" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-wide flex items-center gap-1.5">
              <span>BenCompta</span>
              <span className="text-[#D4AF37] text-xs px-1.5 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50 font-black">
                PRO
              </span>
              <span>Africa</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">SYSCOHADA • NIGER</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white hover:text-[#D4AF37] transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#101B35] hover:bg-[#C29F2D] text-xs font-bold transition-all shadow-md shadow-[#D4AF37]/20"
          >
            Essai Gratuit
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B35]/5 border border-[#101B35]/15 text-[#101B35] text-xs font-bold mb-6">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
          <span>Premier Logiciel SaaS de Gestion Financière Conforme SYSCOHADA Révisé</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-[#101B35] tracking-tight max-w-4xl leading-tight">
          La puissance comptable et financière conçue pour le <span className="text-[#D4AF37]">Niger</span> et l&apos;Afrique Francophone
        </h1>

        <p className="mt-4 text-sm md:text-base text-slate-600 max-w-2xl">
          Partie double rigoureuse, facturation en FCFA (XOF), TVA 19%, Grand Livre, Bilan SYSCOHADA, gestion multi-banques et caisses dans une interface SaaS ultra-rapide et sécurisée.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#101B35] hover:bg-[#1D3157] text-white text-xs font-bold shadow-lg transition-all"
          >
            <span>Accéder à l&apos;Application de Démonstration</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </Link>

          <Link
            href="/register"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#101B35] text-xs font-bold border border-slate-300 shadow-sm transition-all"
          >
            <span>Créer une Entreprise SaaS</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6E8] text-[#8C6D15] flex items-center justify-center border border-[#D4AF37]/30">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#101B35]">Comptabilité SYSCOHADA</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Classes 1 à 8 conformes au traité OHADA. Journaux Achats, Ventes, Banque, Caisse et OD avec équilibre automatique Débit = Crédit.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#101B35]">États Financiers & Fiscalité</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Génération instantanée du Grand Livre, de la Balance Générale, du Compte de Résultat (SIG) et de la déclaration de TVA Niger (19%).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#101B35]">Multi-Tenant & Sécurité SaaS</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Isolation stricte des données par entreprise, contrôle des rôles et permissions (Comptable, Caissier, Auditeur, Admin) et journal d&apos;audit.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-400">
        © 2026 BenComptaPro Africa. Conçu pour le développement économique du Niger et de l&apos;espace OHADA.
      </footer>
    </div>
  );
}
