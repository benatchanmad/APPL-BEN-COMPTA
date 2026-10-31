"use client";

import {
  Bell,
  Search,
  Plus,
  Calendar,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  Receipt,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface HeaderProps {
  organization?: any;
  user?: any;
}

export default function Header({ organization, user }: HeaderProps) {
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between shadow-sm">
      {/* Left: Organization Context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-[#101B35]" />
          <div>
            <h1 className="text-sm font-bold text-[#101B35] leading-tight">
              {organization?.name || "SAHEL TECH INNOVATIONS SARL"}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>NIF: {organization?.nif || "34567/R"}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                SYSCOHADA Révisé
              </span>
            </div>
          </div>
        </div>

        {/* Fiscal Year Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Exercice 2026 (Ouvert)</span>
        </div>
      </div>

      {/* Right: Quick Actions, Search & Notifications */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-semibold shadow-sm transition-all border border-[#101B35]"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Action rapide</span>
          </button>

          {showQuickMenu && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 text-xs animate-in fade-in-50 duration-150"
              onMouseLeave={() => setShowQuickMenu(false)}
            >
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Créer rapidement
              </div>
              <Link
                href="/invoices"
                className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#101B35] transition-colors"
                onClick={() => setShowQuickMenu(false)}
              >
                <Receipt className="w-4 h-4 text-[#D4AF37]" />
                <span>Nouvelle Facture Client</span>
              </Link>
              <Link
                href="/entries"
                className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#101B35] transition-colors"
                onClick={() => setShowQuickMenu(false)}
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Nouvelle Écriture Comptable</span>
              </Link>
              <Link
                href="/expenses"
                className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#101B35] transition-colors"
                onClick={() => setShowQuickMenu(false)}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Enregistrer une Dépense</span>
              </Link>
            </div>
          )}
        </div>

        {/* Currency Badge */}
        <div className="hidden sm:flex items-center px-2.5 py-1 rounded bg-[#FAF6E8] text-[#8C6D15] border border-[#D4AF37]/30 text-xs font-bold">
          FCFA (XOF)
        </div>

        {/* Notifications */}
        <div className="p-2 text-slate-500 hover:text-[#101B35] hover:bg-slate-100 rounded-lg cursor-pointer transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] absolute top-1.5 right-1.5 ring-2 ring-white"></span>
        </div>
      </div>
    </header>
  );
}
