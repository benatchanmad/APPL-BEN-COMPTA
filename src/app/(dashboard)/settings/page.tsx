"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Building,
  Calendar,
  CreditCard,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatFCFA, formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [nif, setNif] = useState("");
  const [rccm, setRccm] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Niamey");
  const [country, setCountry] = useState("Niger");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [defaultVatRate, setDefaultVatRate] = useState("19");

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const d = await res.json();
        const o = d.organization;
        setOrg(o);
        if (o) {
          setName(o.name || "");
          setLegalName(o.legalName || "");
          setNif(o.nif || "");
          setRccm(o.rccm || "");
          setAddress(o.address || "");
          setCity(o.city || "Niamey");
          setCountry(o.country || "Niger");
          setPhone(o.phone || "");
          setEmail(o.email || "");
          setWebsite(o.website || "");
          setDefaultVatRate(o.defaultVatRate?.toString() || "19");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          legalName,
          nif,
          rccm,
          address,
          city,
          country,
          phone,
          email,
          website,
          defaultVatRate: parseFloat(defaultVatRate) || 19,
        }),
      });

      if (res.ok) {
        setSuccessMsg("Paramètres de l'entreprise mis à jour avec succès.");
        setTimeout(() => setSuccessMsg(null), 4000);
        loadData();
      } else {
        alert("Erreur lors de la mise à jour des paramètres.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    } finally {
      setSaving(false);
    }
  }

  const activeSub = org?.subscriptions?.[0] || {
    plan: "BUSINESS",
    status: "ACTIVE",
    amount: 45000,
    maxUsers: 15,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Configuration Système
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Paramètres de l&apos;Entreprise & Abonnement SaaS
          </h1>
          <p className="text-xs text-slate-500">
            Identifiants fiscaux NIF/RCCM (Niger), devise FCFA, exercices comptables et formules SaaS.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Company Details + SaaS Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Settings Form (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-[#101B35]" />
            <h3 className="text-sm font-bold text-[#101B35]">
              Identité Juridique & Fiscale de l&apos;Entreprise
            </h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom Commercial *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Raison Sociale Complète</label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="SARL au capital de..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Numéro d&apos;Identification Fiscale (NIF Niger)</label>
                <input
                  type="text"
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                  placeholder="34567/R"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">RCCM (Registre du Commerce)</label>
                <input
                  type="text"
                  value={rccm}
                  onChange={(e) => setRccm(e.target.value)}
                  placeholder="NI-NIA-2023-B-1042"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Adresse Siège</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Boulevard Mali Béro, Plateau"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Niamey"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pays</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Niger"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+227 20 73 00 00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Officiel</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@saheltech.ne"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Taux TVA par Défaut (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={defaultVatRate}
                  onChange={(e) => setDefaultVatRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold shadow-md transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#D4AF37]" />
                <span>{saving ? "Enregistrement..." : "Enregistrer les modifications"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* SaaS Subscription Info (1 col) */}
        <div className="space-y-6">
          {/* Active Plan Card */}
          <div className="bg-gradient-to-br from-[#101B35] to-[#1D3157] rounded-2xl text-white p-6 shadow-xl border border-[#1D3157] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#E5C76B] border border-[#D4AF37]/40 uppercase tracking-wider">
                Formule SaaS
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                {activeSub.status === "ACTIVE" ? "Actif" : "Essai"}
              </span>
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-white">
                PLAN {activeSub.plan || "BUSINESS"}
              </h4>
              <p className="text-2xl font-black text-[#D4AF37] mt-1">
                {formatFCFA(activeSub.amount || 45000)} <span className="text-xs font-normal text-slate-300">/ mois</span>
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Multi-utilisateurs (jusqu&apos;à {activeSub.maxUsers || 15} collaborateurs)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Comptabilité SYSCOHADA Révisé complète</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Bilan, Grand Livre & Balance Générale</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Déclarations TVA 19% Niger</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Sauvegardes automatiques sécurisées</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => alert("Portail de facturation & paiement Mobile Money / Carte bancaire prêt pour intégration.")}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89425] text-[#101B35] font-bold text-xs shadow-md hover:opacity-95 transition-opacity"
              >
                Gérer l&apos;Abonnement
              </button>
            </div>
          </div>

          {/* Fiscal Year status card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#101B35] font-bold text-xs">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>Exercice Comptable 2026</span>
            </div>
            <p className="text-xs text-slate-500">
              Période : 01/01/2026 au 31/12/2026 • Statut : <strong className="text-emerald-700">Ouvert</strong>.
            </p>
            <p className="text-[11px] text-slate-400">
              La clôture comptable génère automatiquement les écritures de bilan d&apos;ouverture et transfère le résultat au compte 12/13.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
