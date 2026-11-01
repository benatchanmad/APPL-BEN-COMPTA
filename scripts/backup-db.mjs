// BenComptaPro Africa - Script de Sauvegarde Locale SQLite
import fs from "fs";
import path from "path";

const sourceDb = path.resolve("./prisma/dev.db");
const backupDir = path.resolve("./backups");

if (!fs.existsSync(sourceDb)) {
  console.error("❌ Fichier de base de données prisma/dev.db introuvable !");
  process.exit(1);
}

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, "-");
const targetDb = path.join(backupDir, `bencomptapro_local_${timestamp}.db`);

fs.copyFileSync(sourceDb, targetDb);

const sizeMB = (fs.statSync(targetDb).size / (1024 * 1024)).toFixed(2);
console.log("===============================================================");
console.log("💾 SAUVEGARDE LOCALE RÉUSSIE !");
console.log("===============================================================");
console.log(`📁 Source      : ${sourceDb}`);
console.log(`📦 Sauvegarde  : ${targetDb} (${sizeMB} Mo)`);
console.log(`⏱️ Date        : ${now.toLocaleString("fr-FR")}`);
console.log("===============================================================");

