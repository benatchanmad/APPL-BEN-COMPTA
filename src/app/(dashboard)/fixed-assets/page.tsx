"use client";

import { useEffect, useState } from "react";
import { PackageCheck, Plus, Search, X, ShieldCheck, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { formatFCFA, formatDate } from "@/lib/utils";

export default function FixedAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  // New asset
  const [name, setName] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState(new Date().toISOString().split("T")[0]);
  const [usefulLifeYears, setUsefulLifeYears] = useState("5");
  const [assetAccountCode, setAssetAccountCode] = useState("245200");
  const [submitting, setSubmitting] = useState(false);

  // Edit asset
  const [editModal, setEditModal] = useState<{ open: boolean; asset: any | null }>({
    open: false,
    asset: null,
  });
  const [editName, setEditName] = useState("");
  const [editAcquisitionCost, setEditAcquisitionCost] = useState("");
  const [editUsefulLifeYears, setEditUsefulLifeYears] = useState("5");
  const [editing, setEditing] = useState(false);

  // Delete asset
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; asset: any | null }>({
    open: false,
    asset: null,
  });
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/fixed-assets");
      if (res.ok) {
        const d = await res.json();
        setAssets(d.assets || []);
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

  async function handleCreateAsset(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/fixed-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          acquisitionCost,
          acquisitionDate,
          usefulLifeYears,
          assetAccountCode,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName("");
        setAcquisitionCost("");
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || "Erreur création immobilisation.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(asset: any) {
    setEditModal({ open: true, asset });
    setEditName(asset.name || "");
    setEditAcquisitionCost(asset.acquisitionCost?.toString() || "0");
    setEditUsefulLifeYears(asset.usefulLifeYears?.toString() || "5");
  }

  async function handleUpdateAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!editModal.asset) return;
    setEditing(true);

    try {
      const res = await fetch("/api/fixed-assets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.asset.id,
          name: editName,
          acquisitionCost: editAcquisitionCost,
          usefulLifeYears: editUsefulLifeYears,
        }),
      });

      if (res.ok) {
        setEditModal({ open: false, asset: null });
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || "Erreur modification immobilisation.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setEditing(false);
    }
  }

  function openDelete(asset: any) {
    setDeleteModal({ open: true, asset });
  }

  async function handleDeleteAsset() {
    if (!deleteModal.asset) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/fixed-assets?id=${deleteModal.asset.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteModal({ open: false, asset: null });
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || "Erreur suppression immobilisation.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setDeleting(false);
    }
  }

  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(search.toLowerCase())
  );

  const totalBrut = assets.reduce((s, a) => s + a.acquisitionCost, 0);
  const totalAmort = assets.reduce((s, a) => s + a.accumulatedDepr, 0);
  const totalVNC = assets.reduce((s, a) => s + a.netBookValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Actif Immobilisé • Classe 2
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Immobilisations & Amortissements Linéaires
          </h1>
          <p className="text-xs text-slate-500">
            Suivi des investissements corporels et incorporels, dotations et Valeur Nette Comptable (VNC).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Ajouter une Immobilisation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Valeur Brute d&apos;Acquisition (Actif)</span>
          <p className="text-xl font-extrabold text-[#101B35] mt-1">{formatFCFA(totalBrut)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Amortissements Cumulés</span>
          <p className="text-xl font-extrabold text-slate-600 mt-1">{formatFCFA(totalAmort)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Valeur Nette Comptable (VNC)</span>
          <p className="text-xl font-extrabold text-emerald-700 mt-1">{formatFCFA(totalVNC)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par désignation ou code (IMM-0001)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Désignation du Bien</th>
                <th className="py-3 px-4">Date Acquisition</th>
                <th className="py-3 px-4 text-center">Durée</th>
                <th className="py-3 px-4 text-right">Valeur d&apos;Origine</th>
                <th className="py-3 px-4 text-right">Amortissements</th>
                <th className="py-3 px-4 text-right">V.N.C.</th>
                <th className="py-3 px-4 text-center">Méthode</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                    Chargement...
                  </td>
                </tr>
              ) : filteredAssets.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-bold text-[#101B35]">{a.assetCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{a.name}</td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(a.acquisitionDate)}</td>
                  <td className="py-3 px-4 text-center font-medium">{a.usefulLifeYears} ans</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">{formatFCFA(a.acquisitionCost)}</td>
                  <td className="py-3 px-4 text-right text-slate-600">{formatFCFA(a.accumulatedDepr)}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-800">{formatFCFA(a.netBookValue)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      Linéaire
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEdit(a)}
                        title="Modifier l'immobilisation"
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-[#D4AF37] text-amber-700 hover:text-white transition-all shadow-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDelete(a)}
                        title="Supprimer l'immobilisation"
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nouvelle Immobilisation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#101B35]">
                Créer une Immobilisation
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation du Bien *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Véhicule Toyota Hilux 4x4"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Coût d&apos;Acquisition HT (FCFA) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={acquisitionCost}
                  onChange={(e) => setAcquisitionCost(e.target.value)}
                  placeholder="24000000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date d&apos;Acquisition *</label>
                  <input
                    type="date"
                    required
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durée d&apos;Usage (Ans) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={usefulLifeYears}
                    onChange={(e) => setUsefulLifeYears(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Compte d&apos;Actif (SYSCOHADA)</label>
                <select
                  value={assetAccountCode}
                  onChange={(e) => setAssetAccountCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-medium"
                >
                  <option value="245200">245200 - Matériel de transport</option>
                  <option value="244100">244100 - Matériel et mobilier de bureau</option>
                  <option value="244200">244200 - Matériel informatique</option>
                  <option value="231100">231100 - Bâtiments industriels et commerciaux</option>
                  <option value="211100">211100 - Frais de développement & logiciels</option>
                </select>
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
                  {submitting ? "Création..." : "Enregistrer le Bien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Modifier Immobilisation */}
      {editModal.open && editModal.asset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#101B35]">
                  Modifier l&apos;Immobilisation • {editModal.asset.assetCode}
                </h3>
                <p className="text-[11px] text-slate-500">{editModal.asset.name}</p>
              </div>
              <button
                onClick={() => setEditModal({ open: false, asset: null })}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAsset} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation du Bien *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Coût d&apos;Acquisition HT (FCFA) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editAcquisitionCost}
                  onChange={(e) => setEditAcquisitionCost(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Durée d&apos;Usage (Ans) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  value={editUsefulLifeYears}
                  onChange={(e) => setEditUsefulLifeYears(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, asset: null })}
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

      {/* Modal: Supprimer Immobilisation */}
      {deleteModal.open && deleteModal.asset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Supprimer l&apos;Immobilisation</h3>
                <p className="text-[11px] text-slate-500">{deleteModal.asset.assetCode}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Êtes-vous certain de vouloir supprimer l&apos;immobilisation{" "}
              <strong className="text-slate-900">{deleteModal.asset.name}</strong> (Valeur d&apos;origine : {formatFCFA(deleteModal.asset.acquisitionCost)}) ?
              Cette action retirera ce bien du registre des immobilisations.
            </p>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, asset: null })}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteAsset}
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
