// BenComptaPro Africa - Script de Nettoyage / Vidage Intégral des Données Métier
// Supprime toutes les factures, dépenses, écritures comptables, tiers, produits et remet les soldes à 0 FCFA.
// Conserve le design, le code, les 51 comptes du plan SYSCOHADA et les comptes utilisateurs.

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("===============================================================");
  console.log("🧹 VIDAGE DES DONNÉES DE LA BASE LOCALE (SANS TOUCHER AU DESIGN)");
  console.log("===============================================================");

  // 1. Sauvegarde de sécurité préalable
  const dbPath = path.resolve("./prisma/dev.db");
  const backupDir = path.resolve("./backups");
  if (fs.existsSync(dbPath)) {
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(backupDir, `pre_wipe_${timestamp}.db`);
    fs.copyFileSync(dbPath, backupFile);
    console.log(`💾 Sauvegarde de sécurité créée : ${backupFile}`);
  }

  // 2. Suppression de toutes les données transactionnelles et métiers
  console.log("🗑️  Suppression des lignes d'écritures comptables...");
  await prisma.accountingEntryLine.deleteMany();

  console.log("🗑️  Suppression des écritures comptables...");
  await prisma.accountingEntry.deleteMany();

  console.log("🗑️  Suppression des transactions bancaires...");
  await prisma.bankTransaction.deleteMany();

  console.log("🗑️  Suppression des règlements et paiements...");
  await prisma.payment.deleteMany();

  console.log("🗑️  Suppression des lignes de factures...");
  await prisma.invoiceItem.deleteMany();

  console.log("🗑️  Suppression des factures et devis...");
  await prisma.invoice.deleteMany();

  console.log("🗑️  Suppression des dépenses...");
  await prisma.expense.deleteMany();

  console.log("🗑️  Suppression des mouvements de stocks...");
  await prisma.stockMovement.deleteMany();

  console.log("🗑️  Suppression des immobilisations...");
  await prisma.fixedAsset.deleteMany();

  console.log("🗑️  Suppression des articles et catalogue produits...");
  await prisma.product.deleteMany();

  console.log("🗑️  Suppression des clients...");
  await prisma.customer.deleteMany();

  console.log("🗑️  Suppression des fournisseurs...");
  await prisma.supplier.deleteMany();

  console.log("🗑️  Suppression des télédéclarations fiscales...");
  await prisma.taxDeclaration.deleteMany();

  console.log("🗑️  Suppression des journaux d'audit et notifications...");
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();

  // 3. Remise à zéro des soldes des banques et caisses
  console.log("🔄 Réinitialisation des soldes bancaires et caisses à 0 FCFA...");
  await prisma.bankAccount.updateMany({
    data: {
      initialBalance: 0.0,
      currentBalance: 0.0,
    },
  });

  await prisma.cashAccount.updateMany({
    data: {
      initialBalance: 0.0,
      currentBalance: 0.0,
    },
  });

  console.log("---------------------------------------------------------------");
  console.log("✅ TOUTES LES DONNÉES ONT ÉTÉ ENTIÈREMENT VIDÉES !");
  console.log("🎨 Le style design, les composants UI et les 51 comptes SYSCOHADA restent intacts.");
  console.log("===============================================================");
}

main()
  .catch((e) => {
    console.error("❌ Erreur pendant le nettoyage :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

