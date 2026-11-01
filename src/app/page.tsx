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
              SYSCOHADA • NIGER & AFRIQUE
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F3DE97] text-xs font-bold uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
            <span>Conforme SYSCOHADA Révisé • TVA 19% Niger</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Fini la comptabilité sur{" "}
            <span className="bg-gradient-to-r from-[#FFE79A] to-[#D4AF37] bg-clip-text text-transparent">
              Word et Excel
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
              Découvrir la démo Niger
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Sans carte bancaire
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Essai 30 jours gratuit
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Données sécurisées
            </span>
          </div>

          {/* Styled Dashboard Mockup */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
              <div className="bg-white rounded-xl overflow-hidden shadow-inner text-left text-slate-800">
                {/* Mockup Header */}
                <div className="bg-[#101B35] px-4 py-3 flex items-center justify-between border-b border-white/10">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <span className="text-[11px] text-slate-300 font-semibold">
                    BenComptaPro Africa — Tableau de Bord Direction Financière
                  </span>
                  <div className="w-6"></div>
                </div>

                {/* Mockup Body */}
                <div className="p-5 bg-[#F8FAFC] space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Chiffre d&apos;Affaires</span>
                      <span className="text-base font-extrabold text-[#101B35]">25 230 000 FCFA</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">TVA Collectée (19%)</span>
                      <span className="text-base font-extrabold text-[#D4AF37]">3 230 000 FCFA</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Trésorerie BOA</span>
                      <span className="text-base font-extrabold text-emerald-600">32 450 000 FCFA</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Partie Double</span>
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Débit = Crédit
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400 pb-2 border-b border-slate-100">
                      <span>N° Facture / Écriture</span>
                      <span>Client / Tiers</span>
                      <span className="text-right">Montant TTC</span>
                      <span className="text-center">Statut</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50">
                      <span className="font-mono font-bold text-[#101B35]">FAC-2026-0001</span>
                      <span className="font-medium text-slate-800">NIGER TELECOMS SA</span>
                      <span className="font-extrabold text-[#101B35] text-right">14 280 000 FCFA</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                        Payé (BOA)
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1.5">
                      <span className="font-mono font-bold text-[#101B35]">FAC-2026-0002</span>
                      <span className="font-medium text-slate-800">BSIC NIGER SA</span>
                      <span className="font-extrabold text-[#101B35] text-right">5 950 000 FCFA</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                        Partiel
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              Une plateforme moderne pensée pour les réalités économiques et comptables du Niger et de la zone OHADA.
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
                Distinction automatique entre HT, TVA 19% et TTC. Préparation en temps réel de votre bordereau de déclaration fiscale pour la DGI Niger.
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
              Découvrez les retours de directeurs financiers et chefs d&apos;entreprises au Niger, Sénégal et Côte d&apos;Ivoire.
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
                  <p className="text-[10px] text-slate-500">Directrice Générale, Sahel Digital SARL • Niamey, Niger</p>
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
            Sans engagement. Essai de 30 jours inclus pour tester l&apos;intégralité des modules.
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
                <span>Calcul TVA 19% Niger</span>
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
              Essayer 30 Jours Gratuitement
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
      <footer className="bg-[#090F1E] text-slate-400 py-12 px-6 border-t border-white/5 text-xs">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D4AF37] flex items-center justify-center text-[#101B35] font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-sm">
                BenCompta<span className="text-[#D4AF37]">Pro</span> Africa
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Le premier logiciel comptable SaaS conforme au SYSCOHADA Révisé. Développé pour la souveraineté économique du Niger et de l&apos;Afrique.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Logiciel</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/login" className="hover:text-white">Tableau de Bord</Link></li>
              <li><Link href="/login" className="hover:text-white">Comptabilité SYSCOHADA</Link></li>
              <li><Link href="/login" className="hover:text-white">Facturation TVA 19%</Link></li>
              <li><Link href="/login" className="hover:text-white">Balance & Bilan</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Zone OHADA</h4>
            <ul className="space-y-2 text-[11px]">
              <li><span className="text-slate-300">Niger (Marché initial)</span></li>
              <li><span className="text-slate-500">Sénégal</span></li>
              <li><span className="text-slate-500">Côte d&apos;Ivoire</span></li>
              <li><span className="text-slate-500">Burkina Faso</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Accès</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/login" className="hover:text-white">Connexion Client</Link></li>
              <li><Link href="/register" className="hover:text-white">Créer mon Entreprise</Link></li>
              <li><a href="/landing.html" target="_blank" className="hover:text-white text-[#D4AF37]">Version HTML Standalone</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>© 2026 BenComptaPro Africa. Tous droits réservés.</div>
          <div className="text-[#D4AF37] font-bold">Fait avec fierté en Afrique 🌍</div>
        </div>
      </footer>
    </div>
  );
}
