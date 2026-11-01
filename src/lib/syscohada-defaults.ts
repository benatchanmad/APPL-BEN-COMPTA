/**
 * BenComptaPro Africa - Données et Initialisation SYSCOHADA Standard
 * Norme officielle OHADA (Bénin, Burkina Faso, Côte d'Ivoire, Mali, Niger, Sénégal, Togo, Cameroun, etc.)
 */

export interface SYSCOHADAAccountDef {
  code: string;
  name: string;
  accountClass: number;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  isAuxiliary?: boolean;
  isReconcilable?: boolean;
}

export const DEFAULT_SYSCOHADA_ACCOUNTS: SYSCOHADAAccountDef[] = [
  // Classe 1 : Capitaux propres et dettes financières
  { code: "101100", name: "Capital souscrit, appelé et versé", accountClass: 1, type: "EQUITY" },
  { code: "111000", name: "Réserve légale", accountClass: 1, type: "EQUITY" },
  { code: "121000", name: "Report à nouveau créditeur", accountClass: 1, type: "EQUITY" },
  { code: "131000", name: "Résultat net de l'exercice (Bénéfice)", accountClass: 1, type: "EQUITY" },
  { code: "162100", name: "Emprunts bancaires à moyen et long terme", accountClass: 1, type: "LIABILITY" },

  // Classe 2 : Actif immobilisé
  { code: "215000", name: "Logiciels et brevets informatiques", accountClass: 2, type: "ASSET" },
  { code: "241100", name: "Matériel et outillage", accountClass: 2, type: "ASSET" },
  { code: "244100", name: "Matériel de transport (Véhicules)", accountClass: 2, type: "ASSET" },
  { code: "245100", name: "Mobilier de bureau", accountClass: 2, type: "ASSET" },
  { code: "245200", name: "Matériel informatique", accountClass: 2, type: "ASSET" },
  { code: "281500", name: "Amortissement des logiciels", accountClass: 2, type: "ASSET" },
  { code: "284100", name: "Amortissement du matériel", accountClass: 2, type: "ASSET" },
  { code: "284400", name: "Amortissement du matériel de transport", accountClass: 2, type: "ASSET" },
  { code: "284500", name: "Amortissement du matériel informatique", accountClass: 2, type: "ASSET" },

  // Classe 3 : Stocks
  { code: "311100", name: "Stocks de marchandises", accountClass: 3, type: "ASSET" },
  { code: "321100", name: "Matières et fournitures consommables", accountClass: 3, type: "ASSET" },

  // Classe 4 : Tiers (Clients, Fournisseurs, État, Personnel)
  { code: "401100", name: "Fournisseurs d'exploitation", accountClass: 4, type: "LIABILITY", isAuxiliary: true, isReconcilable: true },
  { code: "411100", name: "Clients ordinaires", accountClass: 4, type: "ASSET", isAuxiliary: true, isReconcilable: true },
  { code: "422000", name: "Personnel, rémunérations dues", accountClass: 4, type: "LIABILITY" },
  { code: "431000", name: "Caisse Nationale de Sécurité Sociale (CNSS)", accountClass: 4, type: "LIABILITY" },
  { code: "443100", name: "État, TVA facturée sur ventes (19%)", accountClass: 4, type: "LIABILITY" },
  { code: "443200", name: "État, TVA facturée sur services (19%)", accountClass: 4, type: "LIABILITY" },
  { code: "445100", name: "État, TVA récupérable sur immobilisations", accountClass: 4, type: "ASSET" },
  { code: "445200", name: "État, TVA récupérable sur achats et charges", accountClass: 4, type: "ASSET" },
  { code: "444100", name: "État, TVA due nette à payer", accountClass: 4, type: "LIABILITY" },
  { code: "444900", name: "État, Crédit de TVA à reporter", accountClass: 4, type: "ASSET" },
  { code: "447100", name: "État, Impôt sur les Sociétés (IS)", accountClass: 4, type: "LIABILITY" },
  { code: "447200", name: "État, IUTS et retenues à la source", accountClass: 4, type: "LIABILITY" },

  // Classe 5 : Trésorerie
  { code: "521100", name: "Banque - Compte Courant Principal", accountClass: 5, type: "ASSET", isReconcilable: true },
  { code: "521200", name: "Banque - Compte Secondaire", accountClass: 5, type: "ASSET", isReconcilable: true },
  { code: "571100", name: "Caisse Principale Siège", accountClass: 5, type: "ASSET", isReconcilable: true },
  { code: "581100", name: "Virements internes de fonds", accountClass: 5, type: "ASSET" },

  // Classe 6 : Charges
  { code: "601100", name: "Achats de marchandises", accountClass: 6, type: "EXPENSE" },
  { code: "604100", name: "Achats d'études et prestations sous-traitées", accountClass: 6, type: "EXPENSE" },
  { code: "605100", name: "Électricité (NIGELEC) et Eau", accountClass: 6, type: "EXPENSE" },
  { code: "605200", name: "Carburants et lubrifiants", accountClass: 6, type: "EXPENSE" },
  { code: "605300", name: "Fournitures de bureau et consommables", accountClass: 6, type: "EXPENSE" },
  { code: "622100", name: "Locations immobilières et bureaux", accountClass: 6, type: "EXPENSE" },
  { code: "624100", name: "Entretien et réparations", accountClass: 6, type: "EXPENSE" },
  { code: "625100", name: "Assurances professionnelles", accountClass: 6, type: "EXPENSE" },
  { code: "627100", name: "Publicité, relations publiques et salons", accountClass: 6, type: "EXPENSE" },
  { code: "628100", name: "Frais de télécommunications et Internet", accountClass: 6, type: "EXPENSE" },
  { code: "631100", name: "Frais bancaires et tenue de compte", accountClass: 6, type: "EXPENSE" },
  { code: "641100", name: "Rémunérations directes du personnel", accountClass: 6, type: "EXPENSE" },
  { code: "647100", name: "Charges sociales patronales (CNSS)", accountClass: 6, type: "EXPENSE" },
  { code: "681100", name: "Dotations aux amortissements d'exploitation", accountClass: 6, type: "EXPENSE" },

  // Classe 7 : Produits
  { code: "701100", name: "Ventes de marchandises", accountClass: 7, type: "REVENUE" },
  { code: "706100", name: "Prestations de services et facturation", accountClass: 7, type: "REVENUE" },
  { code: "707100", name: "Honoraires de conseil et formations", accountClass: 7, type: "REVENUE" },
  { code: "771100", name: "Intérêts et produits financiers", accountClass: 7, type: "REVENUE" },

  // Classe 8 : Autres charges et produits (HAO)
  { code: "891000", name: "Impôt sur les bénéfices (IS 30%)", accountClass: 8, type: "EXPENSE" },
];

export const DEFAULT_JOURNALS = [
  { code: "VT", name: "Journal des Ventes", type: "SALES" },
  { code: "AC", name: "Journal des Achats", type: "PURCHASES" },
  { code: "BQ", name: "Journal de Banque", type: "BANK" },
  { code: "CA", name: "Journal de Caisse", type: "CASH" },
  { code: "OD", name: "Journal des Opérations Diverses", type: "GENERAL" },
];

export const DEFAULT_TAX_RATES = [
  {
    code: "TVA_19",
    name: "TVA Normale Niger 19%",
    ratePercent: 19.0,
    type: "STANDARD",
    glAccountCode: "443100",
    isDefault: true,
  },
  {
    code: "TVA_0",
    name: "Taux Zéro (Exportation & Exonération)",
    ratePercent: 0.0,
    type: "REDUCED",
    glAccountCode: "443100",
    isDefault: false,
  },
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  { code: "LOY", name: "Loyers & Charges Locatives", defaultAccount: "622100" },
  { code: "TEL", name: "Télécom & Abonnements Internet", defaultAccount: "628100" },
  { code: "CARB", name: "Carburant & Déplacements", defaultAccount: "605200" },
  { code: "ENERGIE", name: "Électricité & Eau", defaultAccount: "605100" },
  { code: "HONO", name: "Honoraires & Services Juridiques", defaultAccount: "604100" },
  { code: "BUR", name: "Fournitures et Papeterie", defaultAccount: "605300" },
];

/**
 * Initialise l'ensemble de la structure comptable SYSCOHADA pour une entreprise
 * (51 comptes, 5 journaux, fiscalité TVA, catégories de dépenses, banque et caisse par défaut)
 */
export async function initializeOrganizationSYSCOHADA(
  prismaClient: any,
  organizationId: string,
  options?: { bankName?: string; cashName?: string; orgName?: string }
) {
  const currentYear = new Date().getFullYear();

  // 1. Exercice Fiscal
  const existingFY = await prismaClient.fiscalYear.findFirst({
    where: { organizationId, name: `Exercice ${currentYear}` },
  });
  if (!existingFY) {
    await prismaClient.fiscalYear.create({
      data: {
        organizationId,
        name: `Exercice ${currentYear}`,
        startDate: new Date(`${currentYear}-01-01T00:00:00.000Z`),
        endDate: new Date(`${currentYear}-12-31T23:59:59.000Z`),
        isClosed: false,
      },
    });
  }

  // 2. 5 Journaux Comptables
  for (const j of DEFAULT_JOURNALS) {
    await prismaClient.accountingJournal.upsert({
      where: { organizationId_code: { organizationId, code: j.code } },
      update: {},
      create: {
        organizationId,
        code: j.code,
        name: j.name,
        type: j.type,
      },
    });
  }

  // 3. 51 Comptes SYSCOHADA
  for (const acc of DEFAULT_SYSCOHADA_ACCOUNTS) {
    await prismaClient.accountingAccount.upsert({
      where: { organizationId_code: { organizationId, code: acc.code } },
      update: {},
      create: {
        organizationId,
        code: acc.code,
        name: acc.name,
        accountClass: acc.accountClass,
        type: acc.type,
        isAuxiliary: acc.isAuxiliary ?? false,
        isReconcilable: acc.isReconcilable ?? false,
        isActive: true,
      },
    });
  }

  // 4. Taux de TVA (19% standard, 0% exonéré)
  for (const tax of DEFAULT_TAX_RATES) {
    await prismaClient.taxRate.upsert({
      where: { organizationId_code: { organizationId, code: tax.code } },
      update: {},
      create: {
        organizationId,
        code: tax.code,
        name: tax.name,
        ratePercent: tax.ratePercent,
        type: tax.type,
        glAccountCode: tax.glAccountCode,
        isDefault: tax.isDefault,
      },
    });
  }

  // 5. Catégories de Dépenses
  for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
    await prismaClient.expenseCategory.upsert({
      where: { organizationId_code: { organizationId, code: cat.code } },
      update: {},
      create: {
        organizationId,
        code: cat.code,
        name: cat.name,
        defaultAccount: cat.defaultAccount,
      },
    });
  }

  // 6. Compte Bancaire par défaut
  const bankCount = await prismaClient.bankAccount.count({ where: { organizationId } });
  if (bankCount === 0) {
    await prismaClient.bankAccount.create({
      data: {
        organizationId,
        bankName: options?.bankName || "Banque BOA Niger",
        accountName: `Compte Courant Principal XOF`,
        accountNumber: "25102000001",
        currency: "XOF",
        initialBalance: 0.0,
        currentBalance: 0.0,
        glAccountCode: "521100",
        isDefault: true,
        isActive: true,
      },
    });
  }

  // 7. Caisse par défaut
  const cashCount = await prismaClient.cashAccount.count({ where: { organizationId } });
  if (cashCount === 0) {
    await prismaClient.cashAccount.create({
      data: {
        organizationId,
        name: options?.cashName || "Caisse Principale Siège",
        location: "Siège Niamey",
        currency: "XOF",
        initialBalance: 0.0,
        currentBalance: 0.0,
        glAccountCode: "571100",
        isDefault: true,
        isActive: true,
      },
    });
  }

  return { success: true };
}

