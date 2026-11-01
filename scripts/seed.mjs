// BenComptaPro Africa - Demonstration Data Seed Script
// Populates a full-featured SYSCOHADA accounting demo for Niger & Francophone Africa

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Démarrage du peuplement des données BenComptaPro Africa...");

  // 1. Password Hashing
  const adminPasswordHash = await bcrypt.hash("Admin@2026!", 10);
  const comptablePasswordHash = await bcrypt.hash("Comptable@2026!", 10);

  // 2. Users
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@bencomptapro.com" },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: "admin@bencomptapro.com",
      passwordHash: adminPasswordHash,
      firstName: "Ibrahim",
      lastName: "Mamane",
      phone: "+227 90 12 34 56",
      isSuperAdmin: true,
      isActive: true,
    },
  });

  const comptableUser = await prisma.user.upsert({
    where: { email: "comptable@bencomptapro.com" },
    update: { passwordHash: comptablePasswordHash },
    create: {
      email: "comptable@bencomptapro.com",
      passwordHash: comptablePasswordHash,
      firstName: "Aïssatou",
      lastName: "Diallo",
      phone: "+227 96 87 65 43",
      isSuperAdmin: false,
      isActive: true,
    },
  });

  console.log("✅ Utilisateurs créés :", adminUser.email, comptableUser.email);

  // 3. Organization (Entreprise Niger)
  const org = await prisma.organization.upsert({
    where: { slug: "sahel-tech" },
    update: {},
    create: {
      name: "SAHEL TECH INNOVATIONS SARL",
      slug: "sahel-tech",
      legalName: "SAHEL TECH INNOVATIONS SARL au capital de 10 000 000 FCFA",
      nif: "34567/R",
      rccm: "NI-NIA-2023-B-1042",
      address: "Boulevard Mali Béro, Immeuble Horizon, 3ème étage",
      city: "Niamey",
      country: "Niger",
      currency: "XOF",
      phone: "+227 20 73 00 00",
      email: "contact@saheltech.ne",
      website: "https://saheltech.ne",
      taxSystem: "REEL_NORMAL",
      defaultVatRate: 19.0,
    },
  });

  console.log("✅ Entreprise créée :", org.name);

  // 4. Organization Memberships
  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: adminUser.id,
        organizationId: org.id,
      },
    },
    update: { role: "ADMIN" },
    create: {
      userId: adminUser.id,
      organizationId: org.id,
      role: "ADMIN",
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: comptableUser.id,
        organizationId: org.id,
      },
    },
    update: { role: "COMPTABLE" },
    create: {
      userId: comptableUser.id,
      organizationId: org.id,
      role: "COMPTABLE",
    },
  });

  // 5. Fiscal Year 2026
  const fiscalYear2026 = await prisma.fiscalYear.upsert({
    where: {
      organizationId_name: {
        organizationId: org.id,
        name: "Exercice 2026",
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: "Exercice 2026",
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      endDate: new Date("2026-12-31T23:59:59.000Z"),
      isClosed: false,
    },
  });

  // 6. Subscription
  await prisma.subscription.upsert({
    where: { id: `sub_${org.id}` },
    update: {},
    create: {
      id: `sub_${org.id}`,
      organizationId: org.id,
      plan: "BUSINESS",
      status: "ACTIVE",
      billingCycle: "MONTHLY",
      amount: 45000.0, // 45 000 FCFA
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      endDate: new Date("2026-12-31T23:59:59.000Z"),
      maxUsers: 15,
    },
  });

  // 7. Journals (SYSCOHADA)
  const journals = [
    { code: "VT", name: "Journal des Ventes", type: "SALES" },
    { code: "AC", name: "Journal des Achats", type: "PURCHASES" },
    { code: "BQ", name: "Journal de Banque (BOA)", type: "BANK" },
    { code: "CA", name: "Journal de Caisse Siège", type: "CASH" },
    { code: "OD", name: "Journal des Opérations Diverses", type: "GENERAL" },
  ];

  const journalMap = {};
  for (const j of journals) {
    const journalRecord = await prisma.accountingJournal.upsert({
      where: {
        organizationId_code: {
          organizationId: org.id,
          code: j.code,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        code: j.code,
        name: j.name,
        type: j.type,
      },
    });
    journalMap[j.code] = journalRecord;
  }
  console.log("✅ Journaux comptables initialisés.");

  // 8. SYSCOHADA Chart of Accounts (Classes 1 à 8)
  const accountsData = [
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
    { code: "311100", name: "Stocks de marchandises informatiques", accountClass: 3, type: "ASSET" },
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
    { code: "521100", name: "Banque BOA Niger - Compte Principal XOF", accountClass: 5, type: "ASSET", isReconcilable: true },
    { code: "521200", name: "Banque Ecobank Niger - Compte Secondaire XOF", accountClass: 5, type: "ASSET", isReconcilable: true },
    { code: "571100", name: "Caisse Principale Siège (Niamey)", accountClass: 5, type: "ASSET", isReconcilable: true },
    { code: "581100", name: "Virements internes de fonds", accountClass: 5, type: "ASSET" },

    // Classe 6 : Charges
    { code: "601100", name: "Achats de marchandises au Niger", accountClass: 6, type: "EXPENSE" },
    { code: "604100", name: "Achats d'études et prestations sous-traitées", accountClass: 6, type: "EXPENSE" },
    { code: "605100", name: "Électricité (NIGELEC) et Eau (SEEN)", accountClass: 6, type: "EXPENSE" },
    { code: "605200", name: "Carburants et lubrifiants", accountClass: 6, type: "EXPENSE" },
    { code: "605300", name: "Fournitures de bureau et consommables", accountClass: 6, type: "EXPENSE" },
    { code: "622100", name: "Locations immobilières et bureaux", accountClass: 6, type: "EXPENSE" },
    { code: "624100", name: "Entretien et réparations", accountClass: 6, type: "EXPENSE" },
    { code: "625100", name: "Assurances professionnelles", accountClass: 6, type: "EXPENSE" },
    { code: "627100", name: "Publicité, relations publiques et salons", accountClass: 6, type: "EXPENSE" },
    { code: "628100", name: "Frais de télécommunications et Internet", accountClass: 6, type: "EXPENSE" },
    { code: "631100", name: "Frais bancaires et tenue de compte", accountClass: 6, type: "EXPENSE" },
    { code: "641100", name: "Rémunérations directes du personnel", accountClass: 6, type: "EXPENSE" },
    { code: "647100", name: "Charges sociales patronales (CNSS 15.4%)", accountClass: 6, type: "EXPENSE" },
    { code: "681100", name: "Dotations aux amortissements d'exploitation", accountClass: 6, type: "EXPENSE" },

    // Classe 7 : Produits
    { code: "701100", name: "Ventes de matériels informatiques", accountClass: 7, type: "REVENUE" },
    { code: "706100", name: "Prestations de services et logiciels SaaS", accountClass: 7, type: "REVENUE" },
    { code: "707100", name: "Honoraires de formation et conseil ERP", accountClass: 7, type: "REVENUE" },
    { code: "771100", name: "Intérêts et produits financiers", accountClass: 7, type: "REVENUE" },

    // Classe 8 : Autres charges et produits (HAO)
    { code: "891000", name: "Impôt sur les bénéfices (IS 30% Niger)", accountClass: 8, type: "EXPENSE" },
  ];

  const accountMap = {};
  for (const acc of accountsData) {
    const accRecord = await prisma.accountingAccount.upsert({
      where: {
        organizationId_code: {
          organizationId: org.id,
          code: acc.code,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        code: acc.code,
        name: acc.name,
        accountClass: acc.accountClass,
        type: acc.type,
        isAuxiliary: acc.isAuxiliary || false,
        isReconcilable: acc.isReconcilable || false,
      },
    });
    accountMap[acc.code] = accRecord;
  }
  console.log(`✅ ${accountsData.length} comptes SYSCOHADA créés.`);

  // 9. Bank & Cash Accounts
  const boaAccount = await prisma.bankAccount.create({
    data: {
      organizationId: org.id,
      bankName: "Bank of Africa (BOA Niger)",
      accountName: "Compte Courant Principal XOF",
      accountNumber: "NE042 01001 02511488901 84",
      iban: "NE56NE042010010251148890184",
      rib: "04201 02511488901 84",
      currency: "XOF",
      initialBalance: 25000000.0,
      currentBalance: 32450000.0,
      glAccountCode: "521100",
      isDefault: true,
    },
  });

  const ecobankAccount = await prisma.bankAccount.create({
    data: {
      organizationId: org.id,
      bankName: "Ecobank Niger",
      accountName: "Compte Opérations Digitales",
      accountNumber: "NE058 02005 08912345001 22",
      currency: "XOF",
      initialBalance: 10000000.0,
      currentBalance: 12180000.0,
      glAccountCode: "521200",
      isDefault: false,
    },
  });

  const mainCash = await prisma.cashAccount.create({
    data: {
      organizationId: org.id,
      name: "Caisse Principale Siège (Niamey)",
      location: "Plateau, Niamey",
      currency: "XOF",
      initialBalance: 2000000.0,
      currentBalance: 1850000.0,
      glAccountCode: "571100",
      isDefault: true,
    },
  });

  // 10. Tax Rates
  await prisma.taxRate.upsert({
    where: { organizationId_code: { organizationId: org.id, code: "TVA_19" } },
    update: {},
    create: {
      organizationId: org.id,
      code: "TVA_19",
      name: "TVA Normale Niger 19%",
      ratePercent: 19.0,
      type: "STANDARD",
      glAccountCode: "443100",
      isDefault: true,
    },
  });

  await prisma.taxRate.upsert({
    where: { organizationId_code: { organizationId: org.id, code: "TVA_0" } },
    update: {},
    create: {
      organizationId: org.id,
      code: "TVA_0",
      name: "Taux Zéro (Exportation)",
      ratePercent: 0.0,
      type: "REDUCED",
      glAccountCode: "443100",
      isDefault: false,
    },
  });

  // 11. Expense Categories
  const expenseCategories = [
    { code: "LOY", name: "Loyers & Charges Locatives", defaultAccount: "622100" },
    { code: "TEL", name: "Télécom & Abonnements Internet", defaultAccount: "628100" },
    { code: "CARB", name: "Carburant & Déplacements", defaultAccount: "605200" },
    { code: "ENERGIE", name: "Électricité & Eau", defaultAccount: "605100" },
    { code: "HONO", name: "Honoraires & Services Juridiques", defaultAccount: "604100" },
    { code: "BUR", name: "Fournitures et Papeterie", defaultAccount: "605300" },
  ];

  const catMap = {};
  for (const cat of expenseCategories) {
    const catRecord = await prisma.expenseCategory.upsert({
      where: { organizationId_code: { organizationId: org.id, code: cat.code } },
      update: {},
      create: {
        organizationId: org.id,
        code: cat.code,
        name: cat.name,
        defaultAccount: cat.defaultAccount,
      },
    });
    catMap[cat.code] = catRecord;
  }

  // 12. Customers
  const customer1 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      code: "CLI-0001",
      name: "Société Nigérienne de Télécommunications (NIGER TELECOMS)",
      companyName: "NIGER TELECOMS SA",
      email: "finance@nigertelecoms.ne",
      phone: "+227 20 72 21 00",
      address: "Avenue de la Radio, BP 208",
      city: "Niamey",
      country: "Niger",
      nif: "12890/R",
      rccm: "NI-NIA-2016-B-0512",
      paymentTermsDays: 30,
      balance: 14280000.0,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      code: "CLI-0002",
      name: "Banque Sahélo-Saharienne pour le Commerce (BSIC Niger)",
      companyName: "BSIC Niger SA",
      email: "comptabilite@bsic.ne",
      phone: "+227 20 73 99 00",
      address: "Rond-Point Maourey",
      city: "Niamey",
      country: "Niger",
      nif: "23910/M",
      rccm: "NI-NIA-2004-B-0891",
      paymentTermsDays: 45,
      balance: 5950000.0,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      code: "CLI-0003",
      name: "AGENCE DE DÉVELOPPEMENT DE L'ÉCONOMIE NUMÉRIQUE",
      companyName: "ANSI Niger",
      email: "dg@ansi.ne",
      phone: "+227 20 73 34 34",
      address: "Quartier Yantala, Niamey",
      city: "Niamey",
      country: "Niger",
      nif: "45012/P",
      paymentTermsDays: 30,
      balance: 0.0,
    },
  });

  // 13. Suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      organizationId: org.id,
      code: "FOU-0001",
      name: "NIGELEC (Société Nigérienne d'Électricité)",
      companyName: "NIGELEC SA",
      email: "facturation@nigelec.ne",
      phone: "+227 20 72 26 81",
      address: "201 Avenue du Général de Gaulle",
      city: "Niamey",
      country: "Niger",
      nif: "00142/N",
      balance: 450000.0,
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      organizationId: org.id,
      code: "FOU-0002",
      name: "AIRTEL NIGER SA",
      companyName: "Airtel Niger SA",
      email: "business@ne.airtel.com",
      phone: "+227 99 00 00 00",
      address: "Boulevard Mali Béro",
      city: "Niamey",
      country: "Niger",
      nif: "09812/A",
      balance: 0.0,
    },
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      organizationId: org.id,
      code: "FOU-0003",
      name: "TOTALENERGIES MARKETING NIGER",
      companyName: "TotalEnergies Marketing Niger SA",
      email: "contact@totalenergies.ne",
      phone: "+227 20 73 38 71",
      address: "Zone Industrielle Niamey",
      city: "Niamey",
      country: "Niger",
      nif: "00318/T",
      balance: 320000.0,
    },
  });

  // 14. Products & Catalog
  const prod1 = await prisma.product.create({
    data: {
      organizationId: org.id,
      code: "PRD-001",
      name: "Abonnement BenComptaPro Enterprise Cloud (12 mois)",
      description: "Licence SaaS ERP Comptabilité SYSCOHADA Multi-utilisateurs",
      unit: "licence",
      unitPrice: 12000000.0,
      costPrice: 2000000.0,
      stockQuantity: 100,
      taxRate: 19.0,
      salesAccountCode: "706100",
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      organizationId: org.id,
      code: "PRD-002",
      name: "Formation Avancée SYSCOHADA Révisé & Clôture Fiscale",
      description: "Module de 5 jours pour équipe comptable (5 personnes)",
      unit: "session",
      unitPrice: 5000000.0,
      costPrice: 800000.0,
      stockQuantity: 20,
      taxRate: 19.0,
      salesAccountCode: "707100",
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      organizationId: org.id,
      code: "PRD-003",
      name: "Serveur d'Archivage Sécurisé Dell PowerEdge",
      description: "Serveur physique configuré pour sauvegarde comptable locale",
      unit: "unité",
      unitPrice: 4500000.0,
      costPrice: 3200000.0,
      stockQuantity: 8,
      taxRate: 19.0,
      salesAccountCode: "701100",
    },
  });

  // 15. Invoices (Facturation & Ventes)
  // Facture 1 : Partiellement payée
  const inv1 = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      customerId: customer1.id,
      invoiceNumber: "FAC-2026-0001",
      type: "INVOICE",
      date: new Date("2026-02-10T10:00:00.000Z"),
      dueDate: new Date("2026-03-12T23:59:59.000Z"),
      status: "PARTIAL",
      subtotalHT: 12000000.0,
      taxRate: 19.0,
      taxAmount: 2280000.0,
      totalTTC: 14280000.0,
      paidAmount: 7000000.0,
      balanceDue: 7280000.0,
      notes: "Déploiement logiciel SaaS BenComptaPro sur 3 sites régionaux.",
      items: {
        create: [
          {
            productId: prod1.id,
            description: "Abonnement BenComptaPro Enterprise Cloud (12 mois)",
            quantity: 1,
            unitPrice: 12000000.0,
            subtotalHT: 12000000.0,
            taxRate: 19.0,
            taxAmount: 2280000.0,
            totalTTC: 14280000.0,
          },
        ],
      },
    },
  });

  // Facture 2 : Totalement payée
  const inv2 = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      customerId: customer3.id,
      invoiceNumber: "FAC-2026-0002",
      type: "INVOICE",
      date: new Date("2026-01-15T09:00:00.000Z"),
      dueDate: new Date("2026-02-15T23:59:59.000Z"),
      status: "PAID",
      subtotalHT: 5000000.0,
      taxRate: 19.0,
      taxAmount: 950000.0,
      totalTTC: 5950000.0,
      paidAmount: 5950000.0,
      balanceDue: 0.0,
      notes: "Formation des cadres comptables au SYSCOHADA Révisé.",
      items: {
        create: [
          {
            productId: prod2.id,
            description: "Formation Avancée SYSCOHADA Révisé & Clôture Fiscale",
            quantity: 1,
            unitPrice: 5000000.0,
            subtotalHT: 5000000.0,
            taxRate: 19.0,
            taxAmount: 950000.0,
            totalTTC: 5950000.0,
          },
        ],
      },
    },
  });

  // Facture 3 : En attente / Échue
  const inv3 = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      customerId: customer2.id,
      invoiceNumber: "FAC-2026-0003",
      type: "INVOICE",
      date: new Date("2026-03-01T14:00:00.000Z"),
      dueDate: new Date("2026-04-15T23:59:59.000Z"),
      status: "SENT",
      subtotalHT: 5000000.0,
      taxRate: 19.0,
      taxAmount: 950000.0,
      totalTTC: 5950000.0,
      paidAmount: 0.0,
      balanceDue: 5950000.0,
      notes: "Mission d'assistance et paramétrage comptable bancaire.",
      items: {
        create: [
          {
            productId: prod2.id,
            description: "Assistance et paramétrage comptable bancaire",
            quantity: 1,
            unitPrice: 5000000.0,
            subtotalHT: 5000000.0,
            taxRate: 19.0,
            taxAmount: 950000.0,
            totalTTC: 5950000.0,
          },
        ],
      },
    },
  });

  // 16. Paiements reçus
  await prisma.payment.create({
    data: {
      organizationId: org.id,
      invoiceId: inv1.id,
      customerId: customer1.id,
      bankAccountId: boaAccount.id,
      paymentNumber: "REG-2026-0001",
      date: new Date("2026-02-25T11:30:00.000Z"),
      amount: 7000000.0,
      paymentMethod: "BANK_TRANSFER",
      reference: "VIR-BOA-894721",
      notes: "Acompte 50% sur facture FAC-2026-0001",
    },
  });

  await prisma.payment.create({
    data: {
      organizationId: org.id,
      invoiceId: inv2.id,
      customerId: customer3.id,
      bankAccountId: boaAccount.id,
      paymentNumber: "REG-2026-0002",
      date: new Date("2026-01-20T16:00:00.000Z"),
      amount: 5950000.0,
      paymentMethod: "BANK_TRANSFER",
      reference: "VIR-TRESOR-78190",
      notes: "Règlement intégral FAC-2026-0002",
    },
  });

  // 17. Dépenses d'exploitation
  const exp1 = await prisma.expense.create({
    data: {
      organizationId: org.id,
      categoryId: catMap["LOY"].id,
      bankAccountId: boaAccount.id,
      expenseNumber: "DEP-2026-0001",
      title: "Loyer Siège Plateau - Février 2026",
      description: "Loyer mensuel bureaux Sahel Tech",
      date: new Date("2026-02-05T09:00:00.000Z"),
      amountHT: 1500000.0,
      taxRate: 19.0,
      taxAmount: 285000.0,
      totalTTC: 1785000.0,
      paymentMethod: "BANK_TRANSFER",
      status: "PAID",
    },
  });

  const exp2 = await prisma.expense.create({
    data: {
      organizationId: org.id,
      categoryId: catMap["ENERGIE"].id,
      supplierId: supplier1.id,
      cashAccountId: mainCash.id,
      expenseNumber: "DEP-2026-0002",
      title: "Facture Électricité NIGELEC Janvier 2026",
      description: "Consommation climatisation et serveurs",
      date: new Date("2026-02-08T14:30:00.000Z"),
      amountHT: 378151.0,
      taxRate: 19.0,
      taxAmount: 71849.0,
      totalTTC: 450000.0,
      paymentMethod: "CASH",
      status: "PAID",
    },
  });

  const exp3 = await prisma.expense.create({
    data: {
      organizationId: org.id,
      categoryId: catMap["TEL"].id,
      supplierId: supplier2.id,
      bankAccountId: ecobankAccount.id,
      expenseNumber: "DEP-2026-0003",
      title: "Fibre Optique Dédiée Airtel 100 Mbps",
      description: "Abonnement internet entreprise Février 2026",
      date: new Date("2026-02-12T10:15:00.000Z"),
      amountHT: 600000.0,
      taxRate: 19.0,
      taxAmount: 114000.0,
      totalTTC: 714000.0,
      paymentMethod: "BANK_TRANSFER",
      status: "PAID",
    },
  });

  // 18. Écritures comptables en PARTIE DOUBLE (Total Débit = Total Crédit)
  // Écriture 1 : Vente FAC-2026-0001 (Journal des Ventes VT)
  const entry1 = await prisma.accountingEntry.create({
    data: {
      organizationId: org.id,
      fiscalYearId: fiscalYear2026.id,
      journalId: journalMap["VT"].id,
      entryNumber: "VT-2026-0001",
      date: new Date("2026-02-10T10:00:00.000Z"),
      description: "Facture FAC-2026-0001 - NIGER TELECOMS",
      reference: "FAC-2026-0001",
      sourceType: "INVOICE",
      sourceId: inv1.id,
      status: "POSTED",
      lines: {
        create: [
          {
            accountId: accountMap["411100"].id, // Client Débit TTC
            description: "Créance Client NIGER TELECOMS",
            debit: 14280000.0,
            credit: 0.0,
          },
          {
            accountId: accountMap["706100"].id, // Ventes de services Crédit HT
            description: "Abonnement BenComptaPro Enterprise",
            debit: 0.0,
            credit: 12000000.0,
          },
          {
            accountId: accountMap["443100"].id, // TVA Collectée 19% Crédit
            description: "TVA collectée sur ventes 19%",
            debit: 0.0,
            credit: 2280000.0,
          },
        ],
      },
    },
  });

  // Écriture 2 : Encaissement Acompte Avoir Banque BOA (Journal BQ)
  const entry2 = await prisma.accountingEntry.create({
    data: {
      organizationId: org.id,
      fiscalYearId: fiscalYear2026.id,
      journalId: journalMap["BQ"].id,
      entryNumber: "BQ-2026-0001",
      date: new Date("2026-02-25T11:30:00.000Z"),
      description: "Virement NIGER TELECOMS acompte FAC-2026-0001",
      reference: "VIR-BOA-894721",
      sourceType: "PAYMENT",
      status: "POSTED",
      lines: {
        create: [
          {
            accountId: accountMap["521100"].id, // Banque BOA Débit
            description: "Encaissement virement client BOA",
            debit: 7000000.0,
            credit: 0.0,
          },
          {
            accountId: accountMap["411100"].id, // Client Crédit
            description: "Règlement partiel créance client",
            debit: 0.0,
            credit: 7000000.0,
          },
        ],
      },
    },
  });

  // Écriture 3 : Paiement Loyer Siège via Banque BOA (Journal BQ)
  const entry3 = await prisma.accountingEntry.create({
    data: {
      organizationId: org.id,
      fiscalYearId: fiscalYear2026.id,
      journalId: journalMap["BQ"].id,
      entryNumber: "BQ-2026-0002",
      date: new Date("2026-02-05T09:00:00.000Z"),
      description: "Paiement loyer mensuel Siège Plateau",
      reference: "DEP-2026-0001",
      sourceType: "EXPENSE",
      status: "POSTED",
      lines: {
        create: [
          {
            accountId: accountMap["622100"].id, // Charge Loyer Débit HT
            description: "Loyer Plateau bureaux Sahel Tech",
            debit: 1500000.0,
            credit: 0.0,
          },
          {
            accountId: accountMap["445200"].id, // TVA Déductible Débit
            description: "TVA récupérable sur loyer commercial",
            debit: 285000.0,
            credit: 0.0,
          },
          {
            accountId: accountMap["521100"].id, // Banque BOA Crédit TTC
            description: "Règlement bancaire loyer",
            debit: 0.0,
            credit: 1785000.0,
          },
        ],
      },
    },
  });

  // Écriture 4 : Dépense Caisse NIGELEC (Journal CA)
  const entry4 = await prisma.accountingEntry.create({
    data: {
      organizationId: org.id,
      fiscalYearId: fiscalYear2026.id,
      journalId: journalMap["CA"].id,
      entryNumber: "CA-2026-0001",
      date: new Date("2026-02-08T14:30:00.000Z"),
      description: "Règlement espèces électricité NIGELEC",
      reference: "DEP-2026-0002",
      sourceType: "EXPENSE",
      status: "POSTED",
      lines: {
        create: [
          {
            accountId: accountMap["605100"].id, // Électricité Débit HT
            description: "Facture NIGELEC Janvier 2026",
            debit: 378151.0,
            credit: 0.0,
          },
          {
            accountId: accountMap["445200"].id, // TVA Déductible Débit
            description: "TVA récupérable électricité",
            debit: 71849.0,
            credit: 0.0,
          },
          {
            accountId: accountMap["571100"].id, // Caisse Crédit TTC
            description: "Sortie espèces caisse siège",
            debit: 0.0,
            credit: 450000.0,
          },
        ],
      },
    },
  });

  // 19. Transactions Bancaires
  await prisma.bankTransaction.create({
    data: {
      organizationId: org.id,
      bankAccountId: boaAccount.id,
      date: new Date("2026-02-25T11:30:00.000Z"),
      reference: "VIR-BOA-894721",
      description: "Virement client NIGER TELECOMS - Facture FAC-2026-0001",
      type: "CREDIT",
      amount: 7000000.0,
      balanceAfter: 32450000.0,
      isReconciled: true,
    },
  });

  await prisma.bankTransaction.create({
    data: {
      organizationId: org.id,
      bankAccountId: boaAccount.id,
      date: new Date("2026-02-05T09:00:00.000Z"),
      reference: "DEP-2026-0001",
      description: "Virement Loyer Siège Plateau - Horizon Immo",
      type: "DEBIT",
      amount: 1785000.0,
      balanceAfter: 25450000.0,
      isReconciled: true,
    },
  });

  // 20. Immobilisations (SYSCOHADA)
  await prisma.fixedAsset.create({
    data: {
      organizationId: org.id,
      assetCode: "IMMO-2025-001",
      name: "Véhicule Toyota Hilux Double Cabine 4x4",
      acquisitionDate: new Date("2025-01-15T00:00:00.000Z"),
      acquisitionCost: 24000000.0,
      usefulLifeYears: 5,
      depreciationMethod: "LINEAR",
      accumulatedDepr: 4800000.0,
      netBookValue: 19200000.0,
      assetAccountCode: "244100",
      deprExpenseCode: "681100",
      accumDeprCode: "284400",
      status: "ACTIVE",
    },
  });

  await prisma.fixedAsset.create({
    data: {
      organizationId: org.id,
      assetCode: "IMMO-2025-002",
      name: "Parc Informatique Serveurs & MacBook Pro (10 postes)",
      acquisitionDate: new Date("2025-06-01T00:00:00.000Z"),
      acquisitionCost: 15000000.0,
      usefulLifeYears: 3,
      depreciationMethod: "LINEAR",
      accumulatedDepr: 5000000.0,
      netBookValue: 10000000.0,
      assetAccountCode: "245200",
      deprExpenseCode: "681100",
      accumDeprCode: "284500",
      status: "ACTIVE",
    },
  });

  // 21. Déclaration TVA Démo
  await prisma.taxDeclaration.create({
    data: {
      organizationId: org.id,
      periodMonth: 1,
      periodYear: 2026,
      status: "SUBMITTED",
      totalBaseHT: 5000000.0,
      totalTvaCollectee: 950000.0,
      totalTvaDeductible: 356849.0,
      netTvaToPay: 593151.0,
      notes: "Déclaration TVA Janvier 2026 validée et déposée auprès de la DGI Niger.",
    },
  });

  // 22. Audit Logs
  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      userId: adminUser.id,
      action: "SEED_INIT",
      entity: "ORGANIZATION",
      entityId: org.id,
      details: "Initialisation complète de la comptabilité SYSCOHADA pour Sahel Tech Innovations",
    },
  });

  console.log("🎉 Seed BenComptaPro Africa terminé avec SUCCÈS !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur pendant le seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

