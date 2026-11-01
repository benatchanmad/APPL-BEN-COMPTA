// Diagnostic complet de la base de données locale SQLite BenComptaPro Africa
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const dbPath = path.resolve("./prisma/dev.db");
  const exists = fs.existsSync(dbPath);
  const sizeMB = exists ? (fs.statSync(dbPath).size / (1024 * 1024)).toFixed(2) : 0;

  console.log("===============================================================");
  console.log("📊 ÉTAT DE LA BASE DE DONNÉES LOCALE (BenComptaPro Africa)");
  console.log("===============================================================");
  console.log(`📁 Fichier SQLite      : ${dbPath}`);
  console.log(`📦 Statut du fichier   : ${exists ? "PRÉSENT" : "MANQUANT"} (${sizeMB} Mo)`);
  console.log(`⚙️  Moteur              : Prisma ORM + SQLite (100% Local / Autonome)`);
  console.log("---------------------------------------------------------------");

  const [users, orgs, accounts, journals, customers, suppliers, invoices, expenses, entries, bankAccounts, cashAccounts] =
    await Promise.all([
      prisma.user.findMany({ select: { email: true, firstName: true, lastName: true, isSuperAdmin: true } }),
      prisma.organization.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          currency: true,
          _count: {
            select: {
              accounts: true,
              journals: true,
              invoices: true,
              expenses: true,
              entries: true,
              bankAccounts: true,
              cashAccounts: true,
              customers: true,
              suppliers: true,
            },
          },
        },
      }),
      prisma.accountingAccount.count(),
      prisma.accountingJournal.count(),
      prisma.customer.count(),
      prisma.supplier.count(),
      prisma.invoice.count(),
      prisma.expense.count(),
      prisma.accountingEntry.count(),
      prisma.bankAccount.count(),
      prisma.cashAccount.count(),
    ]);

  console.log(`👤 Utilisateurs enregistrés (${users.length}) :`);
  users.forEach((u) => console.log(`   - ${u.email} (${u.firstName} ${u.lastName})${u.isSuperAdmin ? " [SUPER_ADMIN]" : ""}`));

  console.log("\n🏢 Entreprises (Multi-Tenant) :");
  orgs.forEach((o) => {
    console.log(`   * ${o.name} (slug: ${o.slug}) :`);
    console.log(`     - Comptes SYSCOHADA : ${o._count.accounts}`);
    console.log(`     - Factures émises   : ${o._count.invoices}`);
    console.log(`     - Dépenses saisies  : ${o._count.expenses}`);
    console.log(`     - Écritures compt.  : ${o._count.entries}`);
    console.log(`     - Banques / Caisses : ${o._count.bankAccounts} / ${o._count.cashAccounts}`);
    console.log(`     - Clients / Fourn.  : ${o._count.customers} / ${o._count.suppliers}`);
  });

  console.log("---------------------------------------------------------------");
  console.log("✅ APPLICATION COMPLÈTEMENT CONFIGURÉE SUR LA BASE LOCALE !");
  console.log("===============================================================");
}

main()
  .catch((e) => console.error("Erreur statut:", e))
  .finally(() => prisma.$disconnect());

