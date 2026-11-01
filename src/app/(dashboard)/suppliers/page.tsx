"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Search, Mail, Phone, X, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // New Supplier State
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nif, setNif] = useState("");
  const [rccm, setRccm] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Niamey");
  const [paymentTermsDays, setPaymentTermsDays] = useState("30");
  const [submitting, setSubmitting] = useState(false);

  // Edit Supplier State
  const [editModal, setEditModal] = useState<{ open: boolean; supplier: any | null }>({
    open: false,
    supplier: null,
  });
  const [editName, setEditName] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNif, setEditNif] = useState("");
  const [editRccm, setEditRccm] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("Niamey");
  const [editPaymentTermsDays, setEditPaymentTermsDays] = useState("30");
  const [editing, setEditing] = useState(false);

  // Delete Supplier State
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; supplier: any | null }>({
    open: false,
    supplier: null,
  });
  const [deleting, setDeleting] = useState(false);

  async function loadSuppliers() {
    try {
      setLoading(true);
      const res = await fetch("/api/suppliers");
      if (res.ok) {
        const d = await res.json();
        setSuppliers(d.suppliers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function handleCreateSupplier(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          companyName,
          email,
          phone,
          nif,
          rccm,
          address,
          city,
          paymentTermsDays,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setName("");
        setCompanyName("");
        setEmail("");
        setPhone("");
        setNif("");
        setRccm("");
        setAddress("");
        loadSuppliers();
      } else {
        const d = await res.json();
        alert(d.error || "Erreur création fournisseur.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(sup: any) {
    setEditModal({ open: true, supplier: sup });
    setEditName(sup.name || "");
    setEditCompanyName(sup.companyName || "");
    setEditEmail(sup.email || "");
    setEditPhone(sup.phone || "");
    setEditNif(sup.nif || "");
    setEditRccm(sup.rccm || "");
    setEditAddress(sup.address || "");
    setEditCity(sup.city || "Niamey");
    setEditPaymentTermsDays(sup.paymentTermsDays?.toString() || "30");
  }

  async function handleUpdateSupplier(e: React.FormEvent) {
    e.preventDefault();
    if (!editModal.supplier) return;
    setEditing(true);

    try {
      const res = await fetch("/api/suppliers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.supplier.id,
          name: editName,
          companyName: editCompanyName,
          email: editEmail,
          phone: editPhone,
          nif: editNif,
          rccm: editRccm,
          address: editAddress,
          city: editCity,
          paymentTermsDays: editPaymentTermsDays,
        }),
      });

      if (res.ok) {
        setEditModal({ open: false, supplier: null });
        loadSuppliers();
      } else {
        const d = await res.json();
        alert(d.error || "Erreur modification fournisseur.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setEditing(false);
    }
  }

  function openDelete(sup: any) {
    setDeleteModal({ open: true, supplier: sup });
  }

  async function handleDeleteSupplier() {
    if (!deleteModal.supplier) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/suppliers?id=${deleteModal.supplier.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteModal({ open: false, supplier: null });
        loadSuppliers();
      } else {
        const d = await res.json();
        alert(d.error || "Impossible de supprimer ce fournisseur.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.nif && s.nif.toLowerCase().includes(search.toLowerCase())) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalDettes = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Tiers • Classe 40
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Gestion des Fournisseurs
          </h1>
          <p className="text-xs text-slate-500">
            Fichier fournisseurs, NIF, échéances de paiement et dettes d&apos;exploitation.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Nouveau Fournisseur</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Fournisseurs</span>
          <p className="text-xl font-extrabold text-[#101B35] mt-1">{suppliers.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Dettes Fournisseurs</span>
          <p className="text-xl font-extrabold text-rose-700 mt-1">{formatFCFA(totalDettes)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, code ou NIF..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Nom du Fournisseur</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Identifiants Fiscaux</th>
                <th className="py-3 px-4 text-right">Dette en Cours</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                    Chargement des fournisseurs...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucun fournisseur trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((fou) => (
                  <tr key={fou.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#101B35]">
                      {fou.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{fou.name}</div>
                      {fou.companyName && (
                        <div className="text-[11px] text-slate-400">{fou.companyName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 space-y-0.5">
                      {fou.email && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{fou.email}</span>
                        </div>
                      )}
                      {fou.phone && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{fou.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      <div>NIF: {fou.nif || "-"}</div>
                      <div>RCCM: {fou.rccm || "-"}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-700">
                      {formatFCFA(fou.balance)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEdit(fou)}
                          title="Modifier le fournisseur"
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-[#D4AF37] text-amber-700 hover:text-white transition-all shadow-sm"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDelete(fou)}
                          title="Supprimer le fournisseur"
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

      {/* Modal: Nouveau Fournisseur */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#101B35]">
                Créer un Compte Fournisseur
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Raison Sociale / Nom *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: NIGELEC (Énergie du Niger)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation commerciale</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Société Nigérienne d'Électricité"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="facturation@fournisseur.ne"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+227 20 73 XX XX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIF (Niger)</label>
                  <input
                    type="text"
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                    placeholder="54321/R"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">RCCM</label>
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
                <label className="block font-bold text-slate-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Quartier Plateau, Niamey"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
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
                  {submitting ? "Création..." : "Enregistrer Fournisseur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Modifier Fournisseur */}
      {editModal.open && editModal.supplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#101B35]">
                  Modifier le Fournisseur • {editModal.supplier.code}
                </h3>
                <p className="text-[11px] text-slate-500">{editModal.supplier.name}</p>
              </div>
              <button
                onClick={() => setEditModal({ open: false, supplier: null })}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSupplier} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Raison Sociale / Nom *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation commerciale</label>
                <input
                  type="text"
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
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
                  <label className="block font-bold text-slate-700 mb-1">NIF (Niger)</label>
                  <input
                    type="text"
                    value={editNif}
                    onChange={(e) => setEditNif(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">RCCM</label>
                  <input
                    type="text"
                    value={editRccm}
                    onChange={(e) => setEditRccm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, supplier: null })}
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

      {/* Modal: Supprimer Fournisseur */}
      {deleteModal.open && deleteModal.supplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Supprimer le Fournisseur</h3>
                <p className="text-[11px] text-slate-500">{deleteModal.supplier.code}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Êtes-vous certain de vouloir supprimer le fournisseur{" "}
              <strong className="text-slate-900">{deleteModal.supplier.name}</strong> ?
              Cette action est irréversible.
            </p>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, supplier: null })}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteSupplier}
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
