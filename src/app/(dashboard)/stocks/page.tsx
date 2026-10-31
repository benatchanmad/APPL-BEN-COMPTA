"use client";

import { useEffect, useState } from "react";
import { Boxes, Plus, Search, AlertTriangle, CheckCircle2, X, RefreshCw } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function StocksPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("unité");
  const [unitPrice, setUnitPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [minStockLevel, setMinStockLevel] = useState("5");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/stocks");
      if (res.ok) {
        const d = await res.json();
        setProducts(d.products || []);
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

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          unit,
          unitPrice,
          costPrice,
          stockQuantity,
          minStockLevel,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName("");
        setUnitPrice("");
        setCostPrice("");
        setStockQuantity("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const totalStockValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockLevel).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Stocks & Marchandises • Classe 3
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Gestion des Stocks & Articles
          </h1>
          <p className="text-xs text-slate-500">
            Inventaire permanent, valorisation au coût d&apos;achat et alertes de réapprovisionnement.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Nouvel Article</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Références Articles</span>
          <p className="text-xl font-extrabold text-[#101B35] mt-1">{products.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Valeur Totale du Stock (Actif 311)</span>
          <p className="text-xl font-extrabold text-[#D4AF37] mt-1">{formatFCFA(totalStockValue)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Articles en Alerte Stock</span>
          <p className="text-xl font-extrabold text-amber-700 mt-1">{lowStockCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 space-y-4">
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-4 text-center">Unité</th>
                <th className="py-3 px-4 text-right">Prix Vente HT</th>
                <th className="py-3 px-4 text-right">Coût Achat</th>
                <th className="py-3 px-4 text-center">Stock Actuel</th>
                <th className="py-3 px-4 text-right">Valeur Stock</th>
                <th className="py-3 px-4 text-center">État</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                    Chargement du catalogue...
                  </td>
                </tr>
              ) : products.map((p) => {
                const isLow = p.stockQuantity <= p.minStockLevel;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-[#101B35]">{p.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 text-center text-slate-500">{p.unit}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">{formatFCFA(p.unitPrice)}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{formatFCFA(p.costPrice)}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">{p.stockQuantity}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#101B35]">
                      {formatFCFA(p.stockQuantity * p.costPrice)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isLow ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isLow ? "Alerte Réappro" : "Disponible"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#101B35]">
                Créer un Article de Stock
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation de l&apos;Article *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Routeur Cisco Gigabit Entreprise"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prix de Vente HT (FCFA) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="120000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coût d&apos;Achat Unitaire (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="85000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantité Initiale en Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Seuil Minimum d&apos;Alerte</label>
                  <input
                    type="number"
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(e.target.value)}
                    placeholder="5"
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
                  className="px-5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold"
                >
                  {submitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
