// BenComptaPro Africa - Tests de Persistance de la Base de Données Locale SQLite
import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

test("1. Fichier de base de données SQLite local 'dev.db' présent et accessible", () => {
  const dbPath = path.resolve("./prisma/dev.db");
  assert.equal(fs.existsSync(dbPath), true, "Le fichier prisma/dev.db doit exister");
  const stats = fs.statSync(dbPath);
  assert.ok(stats.size > 0, "La taille de la base SQLite doit être supérieure à 0 octet");
});

test("2. Connexion Prisma à SQLite et présence des utilisateurs", async () => {
  const userCount = await prisma.user.count();
  assert.ok(userCount >= 2, "Au moins 2 utilisateurs doivent exister");

  const admin = await prisma.user.findUnique({
    where: { email: "admin@bencomptapro.com" },
  });
  assert.ok(admin, "L'utilisateur admin@bencomptapro.com doit exister");
  assert.equal(admin.isSuperAdmin, true);
});

test("3. Intégrité des entreprises et du plan comptable SYSCOHADA (51+ comptes)", async () => {
  const orgs = await prisma.organization.findMany({
    include: {
      accounts: true,
      journals: true,
      bankAccounts: true,
      cashAccounts: true,
    },
  });

  assert.ok(orgs.length >= 1, "Au moins une entreprise doit exister");

  for (const org of orgs) {
    assert.ok(
      org.accounts.length >= 50,
      `L'entreprise ${org.name} doit posséder au moins 50 comptes SYSCOHADA (actuel: ${org.accounts.length})`
    );
    assert.ok(
      org.journals.length >= 5,
      `L'entreprise ${org.name} doit posséder les 5 journaux standards (actuel: ${org.journals.length})`
    );
    assert.ok(
      org.bankAccounts.length >= 1,
      `L'entreprise ${org.name} doit posséder au moins un compte bancaire`
    );
    assert.ok(
      org.cashAccounts.length >= 1,
      `L'entreprise ${org.name} doit posséder au moins une caisse`
    );
  }
});

test("4. Clôture de la connexion", async () => {
  await prisma.$disconnect();
  assert.ok(true);
});

