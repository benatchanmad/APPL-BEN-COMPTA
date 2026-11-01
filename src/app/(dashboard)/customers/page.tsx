"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search, Mail, Phone, MapPin, Building, X, RefreshCw, Pencil, Trash2 } from "lucide-react";
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

  // Edit customer state
  const [editModal, setEditModal] = useState<{ open: boolean; customer: any | null }>({
    open: false,
    customer: null,
  });
  const [editName, setEditName] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("Niamey");
  const [editNif, setEditNif] = useState("");
  const [editRccm, setEditRccm] = useState("");
  const [editPaymentTermsDays, setEditPaymentTermsDays] = useState("30");
  const [editing, setEditing] = useState(false);

  // Delete customer state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; customer: any | null }>({
    open: false,
    customer: null,
  });
  const [deleting, setDeleting] = useState(false);

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
      } else {
        const d = await res.json();
        alert(d.error || "Erreur création client.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(cust: any) {
    setEditModal({ open: true, customer: cust });
    setEditName(cust.name || "");
    setEditCompanyName(cust.companyName || "");
    setEditEmail(cust.email || "");
    setEditPhone(cust.phone || "");
    setEditAddress(cust.address || "");
    setEditCity(cust.city || "Niamey");
    setEditNif(cust.nif || "");
    setEditRccm(cust.rccm || "");
    setEditPaymentTermsDays(cust.paymentTermsDays?.toString() || "30");
  }

  async function handleUpdateCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!editModal.customer) return;
    setEditing(true);

    try {
      const res = await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.customer.id,
          name: editName,
          companyName: editCompanyName,
          email: editEmail,
          phone: editPhone,
          address: editAddress,
          city: editCity,
          nif: editNif,
          rccm: editRccm,
          paymentTermsDays: editPaymentTermsDays,
        }),
      });

      if (res.ok) {
        setEditModal({ open: false, customer: null });
        loadCustomers();
      } else {
        const d = await res.json();
        alert(d.error || "Erreur modification client.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setEditing(false);
    }
  }

  function openDelete(cust: any) {
    setDeleteModal({ open: true, customer: cust });
  }

  async function handleDeleteCustomer() {
    if (!deleteModal.customer) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/customers?id=${deleteModal.customer.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteModal({ open: false, customer: null });
        loadCustomers();
      } else {
        const d = await res.json();
        alert(d.error || "Impossible de supprimer ce client.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setDeleting(false);
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
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                    Chargement des clients...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
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
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEdit(cust)}
                          title="Modifier le client"
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-[#D4AF37] text-amber-700 hover:text-white transition-all shadow-sm"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDelete(cust)}
                          title="Supprimer le client"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
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
                    placeholder="+227 20 XX XX XX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIF (Niger)
                  </label>
                  <input
                    type="text"
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                    placeholder="Ex: 12345/P"
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
                    placeholder="NI-NIA-202X-B-XXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Adresse géographique
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Quartier Plateau, Niamey"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-bold"
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
                  className="px-5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold shadow-md disabled:opacity-40"
                >
                  {submitting ? "Création..." : "Enregistrer le Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Modifier Client */}
      {editModal.open && editModal.customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#101B35]">
                  Modifier la Fiche Client • {editModal.customer.code}
                </h3>
                <p className="text-[11px] text-slate-500">{editModal.customer.name}</p>
              </div>
              <button
                onClick={() => setEditModal({ open: false, customer: null })}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nom ou Raison Sociale *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nom commercial / Sous-titre
                </label>
                <input
                  type="text"
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
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
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIF (Niger)
                  </label>
                  <input
                    type="text"
                    value={editNif}
                    onChange={(e) => setEditNif(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    RCCM
                  </label>
                  <input
                    type="text"
                    value={editRccm}
                    onChange={(e) => setEditRccm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Adresse géographique
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Délai de règlement (jours)
                  </label>
                  <input
                    type="number"
                    value={editPaymentTermsDays}
                    onChange={(e) => setEditPaymentTermsDays(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, customer: null })}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="px-5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold shadow-md disabled:opacity-40"
                >
                  {editing ? "Modification..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Supprimer Client */}
      {deleteModal.open && deleteModal.customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Supprimer le Client</h3>
                <p className="text-[11px] text-slate-500">{deleteModal.customer.code}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Êtes-vous certain de vouloir supprimer le client{" "}
              <strong className="text-slate-900">{deleteModal.customer.name}</strong> ?
              Cette action est irréversible.
            </p>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, customer: null })}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-40 shadow-sm"
              >
                {deleting ? "Suppression..." : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
