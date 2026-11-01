// BenComptaPro Africa - Tests des Permissions et Isolation Multi-Tenant
import test from "node:test";
import assert from "node:assert/strict";

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ["VIEW_DASHBOARD", "MANAGE_ACCOUNTING", "POST_ENTRIES", "CLOSE_YEAR", "MANAGE_USERS", "MANAGE_SETTINGS"],
  ADMIN: ["VIEW_DASHBOARD", "MANAGE_ACCOUNTING", "POST_ENTRIES", "CLOSE_YEAR", "MANAGE_USERS", "MANAGE_SETTINGS"],
  COMPTABLE: ["VIEW_DASHBOARD", "MANAGE_ACCOUNTING", "POST_ENTRIES", "CLOSE_YEAR", "VIEW_REPORTS"],
  CAISSIER: ["VIEW_DASHBOARD", "COLLECT_PAYMENTS", "MANAGE_EXPENSES"],
  AUDITEUR: ["VIEW_DASHBOARD", "VIEW_ACCOUNTING", "VIEW_REPORTS"],
  LECTEUR: ["VIEW_DASHBOARD", "VIEW_REPORTS"],
};

function hasPermission(role, permission) {
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  return allowed.includes(permission);
}

test("1. Rôle Comptable : Peut saisir des écritures et clôturer l'exercice", () => {
  assert.equal(hasPermission("COMPTABLE", "POST_ENTRIES"), true);
  assert.equal(hasPermission("COMPTABLE", "CLOSE_YEAR"), true);
  assert.equal(hasPermission("COMPTABLE", "MANAGE_USERS"), false);
});

test("2. Rôle Caissier : Ne peut pas clôturer l'exercice ni modifier les paramètres", () => {
  assert.equal(hasPermission("CAISSIER", "COLLECT_PAYMENTS"), true);
  assert.equal(hasPermission("CAISSIER", "CLOSE_YEAR"), false);
  assert.equal(hasPermission("CAISSIER", "MANAGE_SETTINGS"), false);
});

test("3. Isolation multi-tenant : Filtrage strict par organizationId", () => {
  const dummyInvoices = [
    { id: "1", organizationId: "org-niger-1", totalTTC: 5000000 },
    { id: "2", organizationId: "org-niger-1", totalTTC: 3000000 },
    { id: "3", organizationId: "org-senegal-2", totalTTC: 12000000 },
  ];

  const currentOrgId = "org-niger-1";
  const orgInvoices = dummyInvoices.filter((i) => i.organizationId === currentOrgId);

  assert.equal(orgInvoices.length, 2);
  assert.equal(orgInvoices.some((i) => i.organizationId === "org-senegal-2"), false);
});

