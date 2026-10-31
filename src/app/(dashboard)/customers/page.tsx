"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search, Mail, Phone, MapPin, Building, X, RefreshCw } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // New customer state
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Niamey");
  const [nif, setNif] = useState("");
  const [rccm, setRccm] = useState("");
  const [paymentTermsDays, setPaymentTermsDays] = useState("30");
  const [submitting, setSubmitting] = useState(false);

  async function loadCustomers() {
    try {
      setLoading(true);
      const res = await fetch("/api/customers");
      if (res.ok) {
        const d = await res.json();
        setCustomers(d.customers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          companyName,
          email,
          phone,
          address,
          city,
          nif,
          rccm,
          paymentTermsDays,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName("");
        setCompanyName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setNif("");
        setRccm("");
        loadCustomers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.nif && c.nif.toLowerCase().includes(search.toLowerCase())) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalReceivables = customers.reduce((sum, c) => sum + (c.balance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Tiers • Classe 41
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Gestion du Portefeuille Clients
          </h1>
          <p className="text-xs text-slate-500">
            Fichier clients, NIF, RCCM, conditions de règlement et créances en cours.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Clients Enregistrés</span>
          <p className="text-xl font-extrabold text-[#101B35] mt-1">{customers.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Créances Clients en Cours</span>
          <p className="text-xl font-extrabold text-[#D4AF37] mt-1">{formatFCFA(totalReceivables)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Délai Moyen de Règlement</span>
          <p className="text-xl font-extrabold text-slate-700 mt-1">30 Jours</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, code (CLI-0001) ou NIF..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Raison Sociale / Nom</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">NIF & RCCM</th>
                <th className="py-3 px-4">Conditions</th>
                <th className="py-3 px-4 text-right">Créance en Cours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                    Chargement des clients...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#101B35]">
                      {cust.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{cust.name}</div>
                      {cust.companyName && (
                        <div className="text-[11px] text-slate-400">{cust.companyName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 space-y-0.5">
                      {cust.email && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{cust.email}</span>
                        </div>
                      )}
                      {cust.phone && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{cust.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      <div>NIF: {cust.nif || "-"}</div>
                      <div>RCCM: {cust.rccm || "-"}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-[11px]">
                        {cust.paymentTermsDays} jours
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#101B35]">
                      {formatFCFA(cust.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Customer */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#101B35]">
                Créer une Fiche Client
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nom ou Raison Sociale *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Société Nigérienne de Transit (NITRA)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@client.ne"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+227 20 00 00 00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIF (Numéro Fiscal Niger)
                  </label>
                  <input
                    type="text"
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                    placeholder="Ex: 56789/R"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    RCCM
                  </label>
                  <input
                    type="text"
                    value={rccm}
                    onChange={(e) => setRccm(e.target.value)}
                    placeholder="NI-NIA-2024-B-..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Niamey"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Délai de règlement (jours)
                  </label>
                  <input
                    type="number"
                    value={paymentTermsDays}
                    onChange={(e) => setPaymentTermsDays(e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold"
                >
                  {submitting ? "Enregistrement..." : "Enregistrer le client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
