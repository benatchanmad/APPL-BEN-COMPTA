import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calculator,
  Wallet,
  Users,
  Building,
  TrendingUp,
  CreditCard,
  Layers,
  Sparkles,
} from "lucide-react";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (session && session.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 flex flex-col justify-between selection:bg-[#D4AF37] selection:text-white">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#101B35]/95 backdrop-blur-md text-white px-6 md:px-12 flex items-center justify-between border-b border-[#D4AF37]/20 h-20 shadow-lg">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#F3DE97] flex items-center justify-center border border-[#D4AF37] shadow-md shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-[#101B35]" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-wide flex items-center gap-1.5">
              <span>BenCompta</span>
              <span className="text-[#D4AF37] text-xs px-1.5 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50 font-black">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-tight">
              SYSCOHADA • AFRIQUE
            </div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <a href="#problemes" className="hover:text-[#D4AF37] transition-colors">
            Problèmes
          </a>
          <a href="#fonctionnalites" className="hover:text-[#D4AF37] transition-colors">
            Fonctionnalités
          </a>
          <a href="#comment-ca-marche" className="hover:text-[#D4AF37] transition-colors">
            Comment ça marche
          </a>
          <a href="#temoignages" className="hover:text-[#D4AF37] transition-colors">
            Témoignages
          </a>
          <a href="#tarifs" className="hover:text-[#D4AF37] transition-colors">
            Tarifs
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89425] text-white hover:brightness-105 text-xs font-bold shadow-md shadow-[#D4AF37]/25 transition-all"
          >
            Commencer gratuitement
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-[#101B35] via-[#142345] to-[#101B35] text-white py-16 md:py-24 px-6 text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Fini la comptabilité sur{" "}
            <span className="bg-gradient-to-r from-[#FFE79A] to-[#D4AF37] bg-clip-text text-transparent">
              Excel
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            La solution logicielle tout-en-un pour générer vos factures professionnelles en FCFA, calculer la TVA à 19% sans erreur et clôturer vos exercices en toute conformité OHADA.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89425] text-white hover:opacity-95 text-sm font-bold shadow-xl shadow-[#D4AF37]/30 transition-all transform hover:-translate-y-0.5"
            >
              <span>Commencer gratuitement</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold border border-white/20 transition-all"
            >
              Découvrir la démo
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Sans carte bancaire
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Essai 5 jours gratuit
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Données sécurisées
            </span>
          </div>
        </div>
      </section>

      {/* SECTION PROBLÈME */}
      <section id="problemes" className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#92731C] bg-[#FAF6E8] px-3 py-1 rounded-full border border-[#D4AF37]/30">
            Le Constat
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101B35] tracking-tight">
            Les 3 pièges qui freinent les entrepreneurs africains
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Gérer ses comptes sur des fichiers Excel partagés ou des factures Word coûte des millions en erreurs fiscales et en créances oubliées.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-white border border-red-100 shadow-sm space-y-3 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#101B35]">
              Comptabilité non professionnelle
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Des factures Word sans mentions légales (NIF, RCCM), sans numérotation continue et des écritures déséquilibrées qui font fuir les gros clients et les banques.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-red-100 shadow-sm space-y-3 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#101B35]">
              Calculs manuels & erreurs de TVA
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              La TVA à 19% calculée à la main sur tableur génère des arrondis inexacts, des redressements coûteux et des pénalités lors des contrôles de la Direction Générale des Impôts.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-red-100 shadow-sm space-y-3 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#101B35]">
              Suivi des paiements impossible
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Qui a payé ? Qui est en retard ? Impossible de connaître avec certitude l&apos;état des créances entre les virements bancaires et les paiements en espèces.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION FONCTIONNALITÉS */}
      <section id="fonctionnalites" className="py-20 px-6 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#92731C] bg-[#FAF6E8] px-3 py-1 rounded-full border border-[#D4AF37]/30">
              Fonctionnalités Clés
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101B35] tracking-tight">
              Tout ce qu&apos;il faut pour gérer vos finances avec rigueur
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Une plateforme moderne pensée pour les réalités économiques et comptables de la zone OHADA.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-[#D4AF37] hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-white text-[#101B35] group-hover:bg-[#101B35] group-hover:text-[#D4AF37] flex items-center justify-center border border-slate-200 transition-colors shadow-sm">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#101B35]">
                1. Comptabilité pro en 2 clics
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Respect strict du principe de la partie double SYSCOHADA (Classes 1 à 8). Génération instantanée du Grand Livre, de la Balance à 6 colonnes et du Bilan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-[#D4AF37] hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-white text-[#101B35] group-hover:bg-[#101B35] group-hover:text-[#D4AF37] flex items-center justify-center border border-slate-200 transition-colors shadow-sm">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#101B35]">
                2. TVA 19% calculée automatiquement
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Distinction automatique entre HT, TVA 19% et TTC. Préparation en temps réel de votre bordereau de déclaration fiscale pour la DGI.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-[#D4AF37] hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-white text-[#101B35] group-hover:bg-[#101B35] group-hover:text-[#D4AF37] flex items-center justify-center border border-slate-200 transition-colors shadow-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#101B35]">
                3. Suivi des paiements en temps réel
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enregistrez chaque encaissement (acompte ou solde), mettez à jour votre compte bancaire BOA ou votre caisse et générez l&apos;écriture comptable en un clic.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-[#D4AF37] hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-white text-[#101B35] group-hover:bg-[#101B35] group-hover:text-[#D4AF37] flex items-center justify-center border border-slate-200 transition-colors shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#101B35]">
                4. Gestion de clients intégrée
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Répertoire complet avec NIF, RCCM, délais de paiement, coordonnées et solde en direct de leurs créances en FCFA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION COMMENT ÇA MARCHE */}
      <section id="comment-ca-marche" className="py-20 px-6 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#92731C] bg-[#FAF6E8] px-3 py-1 rounded-full border border-[#D4AF37]/30">
            Processus Simple
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101B35] tracking-tight">
            Opérationnel en 3 étapes simples
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Aucune compétence comptable complexe requise au départ : l&apos;application vous guide pas à pas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#101B35] text-[#D4AF37] flex items-center justify-center font-bold text-base">
              01
            </div>
            <h3 className="text-sm font-bold text-[#101B35]">
              Inscris-toi
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Crée ton espace entreprise en renseignant ton nom et ton NIF. Le plan comptable SYSCOHADA s&apos;initialise automatiquement.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#101B35] text-[#D4AF37] flex items-center justify-center font-bold text-base">
              02
            </div>
            <h3 className="text-sm font-bold text-[#101B35]">
              Crée ta première facture
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Choisis ton client et ajoute tes articles. La TVA à 19% est calculée et l&apos;écriture au journal des ventes est immédiatement passée.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#101B35] text-[#D4AF37] flex items-center justify-center font-bold text-base">
              03
            </div>
            <h3 className="text-sm font-bold text-[#101B35]">
              Envoie et suis les paiements
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Télécharge le PDF officiel, transmets-le à ton client, encaisse le règlement et visualise ta balance et ton bilan en temps réel.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION TÉMOIGNAGES */}
      <section id="temoignages" className="py-20 px-6 bg-[#FAF6E8]/40 border-y border-[#D4AF37]/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#92731C] bg-[#FAF6E8] px-3 py-1 rounded-full border border-[#D4AF37]/30">
              Retours d&apos;Expérience
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101B35] tracking-tight">
              Adopté par les entreprises d&apos;Afrique francophone
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Découvrez les retours de directeurs financiers et chefs d&apos;entreprises au Sénégal, en Côte d&apos;Ivoire et dans l&apos;espace OHADA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="text-amber-500 text-sm">★★★★★</div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                « Avant BenComptaPro, on passait 3 jours chaque fin de mois à calculer notre TVA 19% sur Excel avec la peur constante du contrôle fiscal. Maintenant, notre déclaration DGI se fait en 1 clic ! »
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-[#101B35] text-[#D4AF37] font-bold text-xs flex items-center justify-center border border-[#D4AF37]">
                  AM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#101B35]">Amina Moussa</h4>
                  <p className="text-[10px] text-slate-500">Directrice Générale, Sahel Digital SARL</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="text-amber-500 text-sm">★★★★★</div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                « La conformité SYSCOHADA et le suivi des créances ont transformé notre trésorerie. Nos factures font enfin professionnelles devant les banques et les multinationales. »
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-[#101B35] text-[#D4AF37] font-bold text-xs flex items-center justify-center border border-[#D4AF37]">
                  MD
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#101B35]">Mamadou Diop</h4>
                  <p className="text-[10px] text-slate-500">Fondateur, Teranga Logistique • Dakar, Sénégal</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="text-amber-500 text-sm">★★★★★</div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                « Simple, rapide et taillé sur mesure pour nos réalités en FCFA. Notre expert-comptable adore la balance à 6 colonnes et le grand livre toujours équilibré. »
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-[#101B35] text-[#D4AF37] font-bold text-xs flex items-center justify-center border border-[#D4AF37]">
                  KK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#101B35]">Kouassi Konan</h4>
                  <p className="text-[10px] text-slate-500">Gérant, Bâtir Ivoire • Abidjan, Côte d&apos;Ivoire</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION TARIFICATION */}
      <section id="tarifs" className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#92731C] bg-[#FAF6E8] px-3 py-1 rounded-full border border-[#D4AF37]/30">
            Tarifs Transparents en FCFA
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101B35] tracking-tight">
            Des formules adaptées à chaque étape de votre croissance
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sans engagement. Essai de 5 jours inclus pour tester l&apos;intégralité des modules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Plan Gratuit */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#101B35]">Gratuit</h3>
              <p className="text-xs text-slate-500 mt-1">Pour démarrer et tester la conformité.</p>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-[#101B35]">0</span>
              <span className="text-xs font-semibold text-slate-500 ml-1">FCFA / mois</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>5 factures par mois</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1 utilisateur</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Calcul TVA 19%</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Export PDF des factures</span>
              </li>
            </ul>
            <Link
              href="/login"
              className="block w-full py-2.5 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-[#101B35] font-bold text-xs transition-colors"
            >
              Démarrer Gratuitement
            </Link>
          </div>

          {/* Plan Pro (Mis en avant) */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[#101B35] to-[#1D3157] text-white border-2 border-[#D4AF37] shadow-xl space-y-6 relative transform md:scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#B89425] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
              Recommandé • Le Plus Populaire
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Plan Pro</h3>
              <p className="text-xs text-slate-300 mt-1">Pour les PME et entreprises actives.</p>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-[#D4AF37]">5 000</span>
              <span className="text-xs font-semibold text-slate-300 ml-1">FCFA / mois</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-bold">Facturation illimitée</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Comptabilité SYSCOHADA complète</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Grand Livre & Balance à 6 colonnes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Gestion des comptes bancaires BOA & caisses</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Jusqu&apos;à 3 utilisateurs</span>
              </li>
            </ul>
            <Link
              href="/login"
              className="block w-full py-3 text-center rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89425] text-white font-bold text-xs shadow-md hover:brightness-105 transition-all"
            >
              Essayer 5 Jours Gratuitement
            </Link>
          </div>

          {/* Plan Business */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#101B35]">Plan Business</h3>
              <p className="text-xs text-slate-500 mt-1">Pour structures avancées & cabinets.</p>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-[#101B35]">15 000</span>
              <span className="text-xs font-semibold text-slate-500 ml-1">FCFA / mois</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">Multi-utilisateurs illimités</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Immobilisations & Amortissements</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Gestion des stocks & catalogue</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Rôles fins (Auditeur, Caissier, Admin)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Support prioritaire téléphonique & WhatsApp</span>
              </li>
            </ul>
            <Link
              href="/login"
              className="block w-full py-2.5 text-center rounded-xl bg-[#101B35] hover:bg-[#1D3157] text-white font-bold text-xs transition-colors"
            >
              Choisir le Business
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION CTA FINAL */}
      <section className="bg-gradient-to-r from-[#101B35] via-[#172745] to-[#101B35] text-white py-16 px-6 text-center border-t border-[#1D3157]">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Rejoins les africains qui comptabilisent comme des pros
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Sécurise tes factures, tes déclarations fiscales et gagne un temps précieux chaque fin de mois.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89425] text-white font-bold text-sm shadow-xl shadow-[#D4AF37]/30 hover:brightness-105 transition-all"
            >
              <span>Commencer gratuitement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#090F1E] text-slate-400 py-10 px-6 border-t border-white/5 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D4AF37] flex items-center justify-center text-[#101B35] font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-sm">
                BenCompta<span className="text-[#D4AF37]">Pro</span> Africa
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">
              Le premier logiciel comptable SaaS conforme au SYSCOHADA Révisé. Développé pour la souveraineté économique de l&apos;Afrique.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>© 2026 BenComptaPro Africa. Tous droits réservés.</div>
          <div className="text-[#D4AF37] font-bold">Fait avec fierté en Afrique 🌍</div>
        </div>
      </footer>

      {/* BOUTON FLOTTANT WHATSAPP */}
      <a
        href="https://wa.me/?text=Bonjour%2C%20je%20souhaite%20des%20informations%20sur%20BenComptaPro"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discuter sur WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-green-500/40 hover:scale-105 active:scale-95 transition-all duration-300 group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <svg
          className="w-6 h-6 fill-current transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
        <span className="font-bold text-sm tracking-wide">WhatsApp</span>
      </a>
    </div>
  );
}
