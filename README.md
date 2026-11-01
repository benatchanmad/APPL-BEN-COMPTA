# BenComptaPro Africa
## Logiciel SaaS de Comptabilité et de Gestion Financière pour l'Afrique Francophone (SYSCOHADA Révisé)

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![Standard](https://img.shields.io/badge/Norme-SYSCOHADA%20R%C3%A9vis%C3%A9-gold.svg)](https://ohada.org)
[![Pays Initial](https://img.shields.io/badge/March%C3%A9%20Initial-Niger%20(TVA%2019%25)-green.svg)](#)
[![Stack](https://img.shields.io/badge/Next.js-14%20App%20Router-black.svg)](https://nextjs.org)
[![Licence](https://img.shields.io/badge/Licence-Propri%C3%A9taire%20SaaS-101B35.svg)](#)

---

## 1. Présentation du Projet

**BenComptaPro Africa** est une solution logicielle SaaS professionnelle de comptabilité générale, analytique et de gestion financière spécialement conçue pour les entreprises, cabinets d'expertise comptable et PME de l'espace **OHADA**, avec une configuration initiale de référence pour la **République du Niger**.

Développé selon les exigences rigoureuses du **SYSCOHADA Révisé**, le logiciel applique le principe inviolable de la **partie double** (Total Débit = Total Crédit), intègre la **TVA normale à 19% du Niger** (Comptes 443 et 445), et génère automatiquement l'ensemble des états financiers officiels (**Grand Livre, Balance Générale à 6 colonnes, Bilan Actif/Passif, Compte de Résultat et Soldes Intermédiaires de Gestion - SIG**).

---

## 2. Identifiants de Démonstration (Environnement de Développement)

Pour tester immédiatement l'application sans configuration préalable :

| Rôle | Adresse Email | Mot de passe | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Administrateur** | `admin@bencomptapro.com` | `Admin@2026!` | Accès complet, paramétrage, clôture, utilisateurs, abonnements |
| **Chef Comptable** | `comptable@bencomptapro.com` | `Comptable@2026!` | Saisie d'écritures, validation, TVA, Grand Livre, Balance, Bilan |

> **Entreprise de Démonstration pré-configurée :**
> - **Raison Sociale :** SAHEL TECH INNOVATIONS SARL (au capital de 10 000 000 FCFA)
> - **Siège :** Boulevard Mali Béro, Immeuble Horizon, Quartier Plateau, Niamey (Niger)
> - **NIF (Numéro Fiscal Niger) :** 34567/R
> - **RCCM :** NI-NIA-2023-B-1042
> - **Devise :** FCFA (XOF)
> - **Régime Fiscal :** Réel Normal (TVA 19%)

---

## 3. Technologies & Architecture

L'application repose sur une architecture moderne, modulaire, sécurisée et évolutive :

- **Frontend :** Next.js 14 avec App Router, TypeScript, Tailwind CSS, shadcn/ui design tokens, Lucide React Icons, Recharts pour la datavisualisation financière.
- **Backend & API :** Next.js Route Handlers, Server Actions, Zod pour la validation stricte des données d'entrée.
- **ORM & Base de Données :** Prisma ORM avec schéma relationnel optimisé. Prêt pour **PostgreSQL** en production Cloud (Neon, Supabase, Railway, AWS RDS, Docker) et fonctionnel immédiatement en local avec SQLite zéro-dépendance.
- **Authentification & Sécurité :** Sessions sécurisées chiffrées par cookie HTTP-Only (`bencomptapro_session`), hashage des mots de passe en `bcrypt` (10 rounds), protection CSRF/XSS, journalisation d'audit systématique (`AuditLog`).
- **Export & Impression :** Exportation native Excel (.xlsx via SheetJS), génération de factures et états conformes pour impression PDF.

---

## 4. Charte Graphique & Design Premium

- **Bleu Nuit (Primaire) :** `#101B35`
- **Bleu Secondaire :** `#1D3157`
- **Or (Accent Prestige) :** `#D4AF37`
- **Blanc Épuré :** `#FFFFFF`
- **Gris Clair de Fond :** `#F4F6FA`

---

## 5. Modules Fonctionnels Clés

### A. Comptabilité Générale SYSCOHADA (Classes 1 à 8)
- Plan comptable complet de référence SYSCOHADA révisé (51+ comptes types de classe 1 à 8).
- Gestion des 5 journaux divisionnaires :
  - **VT** : Journal des Ventes
  - **AC** : Journal des Achats
  - **BQ** : Journal de Banque (Bank of Africa BOA Niger, Ecobank)
  - **CA** : Journal de Caisse Siège
  - **OD** : Journal des Opérations Diverses
- Saisie assistée d'écritures en partie double avec équilibrage dynamique en direct.
- **Inviolabilité comptable & Traçabilité :** Interdiction stricte de modification directe d'une écriture validée. Module de **contrepassation traçable** générant automatiquement une écriture inverse horodatée avec motif d'audit.

### B. Facturation, Ventes & Gestion des Tiers
- Création de factures clients avec numérotation continue (`FAC-2026-0001`).
- Calcul automatisé de la TVA nigérienne (19%) et du total TTC.
- Génération automatique de l'écriture de vente au journal VT :
  - `Débit 411100 (Client TTC)` = `Crédit 706100 (Produits HT)` + `Crédit 443100 (TVA Collectée 19%)`.
- Encaissement de règlements partiels ou totaux avec mise à jour du compte bancaire/caisse et écriture automatique au journal BQ ou CA.
- Modèle d'impression de facture professionnelle conforme aux exigences fiscales du Niger.

### C. Dépenses d'Exploitation & Achats
- Saisie des charges (Classe 6) par catégorie (Loyers 622, Carburant 6052, Électricité NIGELEC 6051, Télécom Airtel 628).
- Récupération de la **TVA Déductible (Compte 445200)**.
- Imputation instantanée en compte bancaire ou caisse physique.

### D. Trésorerie, Banques & Caisses
- Vue globale consolidée des liquidités disponibles en FCFA.
- Gestion multi-banques (Bank of Africa, Ecobank) avec IBAN, RIB et état de rapprochement bancaire.
- Gestion des caisses physiques d'espèces (Caisse principale siège Niamey, régies d'avances).
- Historique complet des transactions débit/crédit.

### E. Fiscalité & Déclaration de TVA (DGI Niger)
- Synthèse automatique :
  - `TVA Facturée / Collectée (Compte 443)`
  - `TVA Récupérable / Déductible (Compte 445)`
  - `Net TVA Due à Décaisser (Compte 444100)` ou `Crédit de TVA (Compte 444900)`.
- Préparation du bordereau de télédéclaration mensuelle DGI.

### F. Immobilisations & Stocks
- Tableaux d'amortissement linéaire SYSCOHADA (Véhicules 5 ans, Matériel informatique 3 ans).
- Calcul automatique de la Valeur Nette Comptable (VNC = Coût d'acquisition - Amortissements cumulés).
- Gestion de stock au coût moyen pondéré et alertes automatiques de seuil de réapprovisionnement.

### G. États Financiers & Rapports Officiels
- **Balance Générale à 6 colonnes** (Numéro, Intitulé, Cumul Débit, Cumul Crédit, Solde Débiteur, Solde Créditeur).
- **Compte de Résultat** avec Soldes Intermédiaires de Gestion (SIG : Chiffre d'affaires, Marge brute, Valeur ajoutée, EBE, Résultat Net).
- **Bilan SYSCOHADA** structuré :
  - *Actif* : Actif immobilisé, Actif circulant (Stocks + Créances clients), Trésorerie Actif.
  - *Passif* : Capitaux propres, Résultat net, Passif circulant (Dettes d'exploitation), Trésorerie Passif.
- Exportation immédiate au format **Excel (.xlsx)** et format imprimable PDF.

### H. Multi-Tenant SaaS & Contrôle des Rôles
- Isolation stricte des données par `organizationId`.
- Gestion fine des rôles :
  - `SUPER_ADMIN`
  - `ADMIN`
  - `COMPTABLE`
  - `CAISSIER`
  - `GESTIONNAIRE`
  - `AUDITEUR`
  - `LECTEUR`
- Formules d'abonnement SaaS paramétrables : **STARTER**, **BUSINESS** (45 000 FCFA/mois), **ENTERPRISE**.

---

## 6. Installation & Démarrage Local

### Prérequis
- **Node.js** >= 18.x (testé et validé sous Node v24.21.0)
- **npm** >= 9.x

### Procédure pas à pas

1. **Cloner ou ouvrir le dossier du projet :**
   ```bash
   cd "APPL BEN COMPTA"
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Générer le client Prisma & synchroniser la base :**
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

4. **Peupler la base de données avec les données de démonstration du Niger :**
   ```bash
   npm run prisma:seed
   ```

5. **Exécuter la suite de tests unitaires et comptables :**
   ```bash
   npm test
   ```
   *(Tous les 7 tests de partie double, calcul TVA, contrepassation et isolation des rôles doivent réussir).*

6. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```
   Ouvrez votre navigateur à l'adresse : **[http://localhost:3000](http://localhost:3000)**

---

## 7. Guide de Déploiement Cloud (Production SaaS)

Pour déployer BenComptaPro Africa sur une infrastructure Cloud professionnelle avec **PostgreSQL** :

### Option A : Déploiement Vercel + PostgreSQL Cloud (Neon / Supabase)

1. **Créer une base de données PostgreSQL managée :**
   - Créez un projet sur [Neon.tech](https://neon.tech) ou [Supabase.com](https://supabase.com).
   - Récupérez la chaîne de connexion (ex: `postgresql://postgres:password@ep-xyz.neon.tech/bencomptapro?sslmode=require`).

2. **Configurer Prisma pour PostgreSQL :**
   Dans `prisma/schema.prisma`, remplacez :
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   *(Un fichier prêt à l'emploi `prisma/schema.postgresql.prisma` est également fourni).*

3. **Variables d'environnement dans le Dashboard Cloud :**
   - `DATABASE_URL` = chaîne de connexion PostgreSQL ci-dessus
   - `JWT_SECRET` = clé aléatoire sécurisée de 64 caractères
   - `NEXT_PUBLIC_APP_NAME` = "BenComptaPro Africa"
   - `NEXT_PUBLIC_DEFAULT_CURRENCY` = "FCFA"
   - `NEXT_PUBLIC_DEFAULT_VAT_RATE` = 19

4. **Exécuter les migrations & le seed en production :**
   ```bash
   npx prisma db push
   node scripts/seed.mjs
   ```

### Option B : Déploiement Docker & Docker Compose
Un environnement conteneurisé standard Next.js + PostgreSQL peut être exécuté avec :
```bash
docker-compose up -d --build
```

---

## 8. Sécurité & Conformité Réglementaire

- **Isolation des locataires (Tenancy) :** Toutes les requêtes API appliquent un filtre strict sur `session.organization.id`. Aucune fuite inter-entreprises n'est possible.
- **Mots de passe :** Aucun mot de passe n'est stocké en clair (chiffrage bcrypt avec salage automatique).
- **Audit Trail :** Chaque opération sensible (connexion, passation d'écriture, contrepassation, émission de facture) est journalisée dans la table `AuditLog` avec l'identifiant de l'utilisateur et l'horodatage.
- **Conformité OHADA :** Respect scrupuleux des nomenclatures de comptes à 6 chiffres et interdiction des écritures orphelines.

---

## 9. Support & Contact

Développé pour l'expansion et la souveraineté numérique et financière des entreprises du Niger et de l'Afrique de l'Ouest.
Pour toute question ou contribution : **contact@bencomptapro.com**

