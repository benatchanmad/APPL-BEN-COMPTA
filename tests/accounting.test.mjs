// BenComptaPro Africa - Tests des Opérations Comptables SYSCOHADA
import test from "node:test";
import assert from "node:assert/strict";

// Double-entry validation logic
function validateDoubleEntry(lines) {
  if (!lines || lines.length < 2) {
    return { isValid: false, errorMessage: "Minimum 2 lignes requises." };
  }
  let totalDebit = 0;
  let totalCredit = 0;
  for (const l of lines) {
    totalDebit += Number(l.debit || 0);
    totalCredit += Number(l.credit || 0);
  }
  const roundedDebit = Math.round(totalDebit * 100) / 100;
  const roundedCredit = Math.round(totalCredit * 100) / 100;
  const diff = Math.abs(roundedDebit - roundedCredit);
  return {
    isValid: diff < 0.01 && roundedDebit > 0,
    totalDebit: roundedDebit,
    totalCredit: roundedCredit,
    difference: diff,
  };
}

// TVA Niger 19% calculation
function calculateVat(subtotalHT, vatRate = 19.0) {
  const taxAmount = Math.round(subtotalHT * (vatRate / 100));
  const totalTTC = subtotalHT + taxAmount;
  return { subtotalHT, vatRate, taxAmount, totalTTC };
}

test("1. Règle de la partie double : Écriture équilibrée (Vente client)", () => {
  const lines = [
    { account: "411100", debit: 1190000, credit: 0 }, // Client TTC
    { account: "706100", debit: 0, credit: 1000000 }, // Prestation HT
    { account: "443100", debit: 0, credit: 190000 },  // TVA Collectée 19%
  ];

  const result = validateDoubleEntry(lines);
  assert.equal(result.isValid, true);
  assert.equal(result.totalDebit, 1190000);
  assert.equal(result.totalCredit, 1190000);
  assert.equal(result.difference, 0);
});

test("2. Règle de la partie double : Rejet strict des écritures déséquilibrées", () => {
  const lines = [
    { account: "411100", debit: 1000000, credit: 0 },
    { account: "706100", debit: 0, credit: 800000 }, // 200 000 FCFA d'écart !
  ];

  const result = validateDoubleEntry(lines);
  assert.equal(result.isValid, false);
  assert.equal(result.difference, 200000);
});

test("3. Calcul de la TVA conforme au Niger (19%)", () => {
  const result = calculateVat(10000000, 19.0);
  assert.equal(result.subtotalHT, 10000000);
  assert.equal(result.taxAmount, 1900000);
  assert.equal(result.totalTTC, 11900000);
});

test("4. Contrepassation : Inversion rigoureuse Débit/Crédit pour annulation traçable", () => {
  const original = [
    { account: "622100", debit: 1500000, credit: 0 },
    { account: "445200", debit: 285000, credit: 0 },
    { account: "521100", debit: 0, credit: 1785000 },
  ];

  // Counterpass reverses debits and credits
  const reversed = original.map((l) => ({
    account: l.account,
    debit: l.credit,
    credit: l.debit,
  }));

  const validationReversed = validateDoubleEntry(reversed);
  assert.equal(validationReversed.isValid, true);
  assert.equal(validationReversed.totalDebit, 1785000);
  assert.equal(validationReversed.totalCredit, 1785000);
});
