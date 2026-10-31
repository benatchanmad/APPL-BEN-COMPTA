/**
 * BenComptaPro Africa - Moteur Comptable SYSCOHADA Révisé
 * Norme comptable officielle des 17 pays membres de l'OHADA
 */

export interface SYSCOHADAAccountClass {
  number: number;
  label: string;
  type: "BILAN" | "GESTION";
}

export const SYSCOHADA_CLASSES: SYSCOHADAAccountClass[] = [
  { number: 1, label: "Comptes de ressources durables (Capitaux propres & Emprunts)", type: "BILAN" },
  { number: 2, label: "Comptes de l'actif immobilisé (Immobilisations & Amortissements)", type: "BILAN" },
  { number: 3, label: "Comptes de stocks (Marchandises, Matières, En-cours)", type: "BILAN" },
  { number: 4, label: "Comptes de tiers (Fournisseurs, Clients, État, Personnel)", type: "BILAN" },
  { number: 5, label: "Comptes de trésorerie (Banques, Caisses, Régies)", type: "BILAN" },
  { number: 6, label: "Comptes de charges des activités ordinaires", type: "GESTION" },
  { number: 7, label: "Comptes de produits des activités ordinaires", type: "GESTION" },
  { number: 8, label: "Comptes des autres charges et autres produits (HAO)", type: "GESTION" },
];

/**
 * Validates the fundamental double-entry rule: Total Debit === Total Credit
 */
export function validateDoubleEntry(lines: { debit: number; credit: number; accountId?: string }[]): {
  isValid: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
  errorMessage?: string;
} {
  if (!lines || lines.length < 2) {
    return {
      isValid: false,
      totalDebit: 0,
      totalCredit: 0,
      difference: 0,
      errorMessage: "Une écriture comptable doit comporter au minimum 2 lignes.",
    };
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of lines) {
    totalDebit += Number(line.debit || 0);
    totalCredit += Number(line.credit || 0);
  }

  const roundedDebit = Math.round(totalDebit * 100) / 100;
  const roundedCredit = Math.round(totalCredit * 100) / 100;
  const difference = Math.abs(roundedDebit - roundedCredit);

  if (difference > 0.01) {
    return {
      isValid: false,
      totalDebit: roundedDebit,
      totalCredit: roundedCredit,
      difference,
      errorMessage: `L'écriture n'est pas équilibrée : Total Débit (${roundedDebit.toLocaleString()} FCFA) != Total Crédit (${roundedCredit.toLocaleString()} FCFA). Écart : ${difference.toLocaleString()} FCFA.`,
    };
  }

  return {
    isValid: true,
    totalDebit: roundedDebit,
    totalCredit: roundedCredit,
    difference: 0,
  };
}

/**
 * Calcul de la Balance Générale SYSCOHADA
 */
export interface BalanceAccountRow {
  code: string;
  name: string;
  classNumber: number;
  totalDebit: number;
  totalCredit: number;
  debitBalance: number;
  creditBalance: number;
}

export function computeTrialBalance(
  accounts: { id: string; code: string; name: string; accountClass: number }[],
  lines: { accountId: string; debit: number; credit: number }[]
): {
  rows: BalanceAccountRow[];
  totalDebitSum: number;
  totalCreditSum: number;
  totalDebitBalance: number;
  totalCreditBalance: number;
} {
  const map: Record<string, { totalDebit: number; totalCredit: number }> = {};

  for (const l of lines) {
    if (!map[l.accountId]) {
      map[l.accountId] = { totalDebit: 0, totalCredit: 0 };
    }
    map[l.accountId].totalDebit += l.debit || 0;
    map[l.accountId].totalCredit += l.credit || 0;
  }

  let totalDebitSum = 0;
  let totalCreditSum = 0;
  let totalDebitBalance = 0;
  let totalCreditBalance = 0;

  const rows: BalanceAccountRow[] = [];

  for (const acc of accounts) {
    const stats = map[acc.id] || { totalDebit: 0, totalCredit: 0 };
    const diff = stats.totalDebit - stats.totalCredit;

    const debitBalance = diff > 0 ? diff : 0;
    const creditBalance = diff < 0 ? Math.abs(diff) : 0;

    totalDebitSum += stats.totalDebit;
    totalCreditSum += stats.totalCredit;
    totalDebitBalance += debitBalance;
    totalCreditBalance += creditBalance;

    rows.push({
      code: acc.code,
      name: acc.name,
      classNumber: acc.accountClass,
      totalDebit: Math.round(stats.totalDebit),
      totalCredit: Math.round(stats.totalCredit),
      debitBalance: Math.round(debitBalance),
      creditBalance: Math.round(creditBalance),
    });
  }

  // Sort by account code ascending
  rows.sort((a, b) => a.code.localeCompare(b.code));

  return {
    rows,
    totalDebitSum: Math.round(totalDebitSum),
    totalCreditSum: Math.round(totalCreditSum),
    totalDebitBalance: Math.round(totalDebitBalance),
    totalCreditBalance: Math.round(totalCreditBalance),
  };
}
