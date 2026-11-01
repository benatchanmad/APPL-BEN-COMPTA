export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "COMPTABLE"
  | "CAISSIER"
  | "GESTIONNAIRE"
  | "AUDITEUR"
  | "LECTEUR";

export type Permission =
  | "VIEW_DASHBOARD"
  | "VIEW_ACCOUNTING"
  | "MANAGE_ACCOUNTING"
  | "POST_ENTRIES"
  | "CLOSE_YEAR"
  | "MANAGE_INVOICES"
  | "COLLECT_PAYMENTS"
  | "MANAGE_EXPENSES"
  | "APPROVE_EXPENSES"
  | "MANAGE_BANK_CASH"
  | "SUBMIT_TAX"
  | "VIEW_REPORTS"
  | "EXPORT_DATA"
  | "MANAGE_USERS"
  | "MANAGE_SETTINGS";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "VIEW_DASHBOARD",
    "VIEW_ACCOUNTING",
    "MANAGE_ACCOUNTING",
    "POST_ENTRIES",
    "CLOSE_YEAR",
    "MANAGE_INVOICES",
    "COLLECT_PAYMENTS",
    "MANAGE_EXPENSES",
    "APPROVE_EXPENSES",
    "MANAGE_BANK_CASH",
    "SUBMIT_TAX",
    "VIEW_REPORTS",
    "EXPORT_DATA",
    "MANAGE_USERS",
    "MANAGE_SETTINGS",
  ],
  ADMIN: [
    "VIEW_DASHBOARD",
    "VIEW_ACCOUNTING",
    "MANAGE_ACCOUNTING",
    "POST_ENTRIES",
    "CLOSE_YEAR",
    "MANAGE_INVOICES",
    "COLLECT_PAYMENTS",
    "MANAGE_EXPENSES",
    "APPROVE_EXPENSES",
    "MANAGE_BANK_CASH",
    "SUBMIT_TAX",
    "VIEW_REPORTS",
    "EXPORT_DATA",
    "MANAGE_USERS",
    "MANAGE_SETTINGS",
  ],
  COMPTABLE: [
    "VIEW_DASHBOARD",
    "VIEW_ACCOUNTING",
    "MANAGE_ACCOUNTING",
    "POST_ENTRIES",
    "CLOSE_YEAR",
    "MANAGE_INVOICES",
    "COLLECT_PAYMENTS",
    "MANAGE_EXPENSES",
    "APPROVE_EXPENSES",
    "MANAGE_BANK_CASH",
    "SUBMIT_TAX",
    "VIEW_REPORTS",
    "EXPORT_DATA",
  ],
  GESTIONNAIRE: [
    "VIEW_DASHBOARD",
    "MANAGE_INVOICES",
    "COLLECT_PAYMENTS",
    "MANAGE_EXPENSES",
    "VIEW_REPORTS",
    "EXPORT_DATA",
  ],
  CAISSIER: [
    "VIEW_DASHBOARD",
    "COLLECT_PAYMENTS",
    "MANAGE_EXPENSES",
    "MANAGE_BANK_CASH",
  ],
  AUDITEUR: [
    "VIEW_DASHBOARD",
    "VIEW_ACCOUNTING",
    "VIEW_REPORTS",
    "EXPORT_DATA",
  ],
  LECTEUR: [
    "VIEW_DASHBOARD",
    "VIEW_REPORTS",
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const allowed = ROLE_PERMISSIONS[role as UserRole];
  if (!allowed) return false;
  return allowed.includes(permission);
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "COMPTABLE":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "GESTIONNAIRE":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "CAISSIER":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "AUDITEUR":
      return "bg-orange-100 text-orange-800 border-orange-300";
    default:
      return "bg-slate-100 text-slate-800 border-slate-300";
  }
}

