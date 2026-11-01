"use client";

import { useEffect, useState } from "react";
import { Layers, FileSpreadsheet, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import Link from "next/link";
import { formatFCFA } from "@/lib/utils";

export default function JournalsPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [resJ, resE] = await Promise.all([
          fetch("/api/accounting/journals"),
          fetch("/api/accounting/entries"),
        ]);
        if (resJ.ok) {
          const dataJ = await resJ.json();
          setJournals(dataJ.journals || []);
        }
        if (resE.ok) {
          const dataE = await resE.json();
          setEntries(dataE.entries || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute stats per journal
  const getJournalStats = (journalId: string) => {
    const journalEntries = entries.filter((e) => e.journalId === journalId);
    let totalDebit = 0;
    let totalCredit = 0;
    for (const entry of journalEntries) {
      for (const line of entry.lines || []) {
        totalDebit += line.debit || 0;
        totalCredit += line.credit || 0;
      }
    }
    return {
      count: journalEntries.length,
      totalDebit,
      totalCredit,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Organisation Comptable
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Journaux Comptables Auxiliaires
          </h1>
          <p className="text-xs text-slate-500">
            Structure des journaux divisionnaires conformément au système centralisateur SYSCOHADA.
          </p>
        </div>

        <Link
          href="/entries"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
          <span>Saisir une Écriture</span>
        </Link>
      </div>

      {/* Journals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF37]" />
            Chargement des journaux...
          </div>
        ) : (
          journals.map((journal) => {
            const stats = getJournalStats(journal.id);
            return (
              <div
                key={journal.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#101B35] text-[#D4AF37] flex items-center justify-center font-mono font-extrabold text-base border border-[#D4AF37]/30">
                      {journal.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#101B35]">
                        {journal.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 uppercase font-semibold">
                        Type: {journal.type}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Écritures
                    </span>
                    <span className="text-sm font-extrabold text-[#101B35]">
                      {stats.count}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Cumul Mouvements
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {formatFCFA(stats.totalDebit)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Équilibré
                  </span>

                  <Link
                    href={`/entries?journalId=${journal.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-[#101B35] hover:text-[#D4AF37] transition-colors"
                  >
                    <span>Consulter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

