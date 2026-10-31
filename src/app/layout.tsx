import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BenComptaPro Africa | Logiciel Comptable & Financier SaaS (SYSCOHADA)",
  description: "Solution SaaS de comptabilité et de gestion financière conforme au SYSCOHADA Révisé pour le Niger et l'Afrique Francophone.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full antialiased font-sans bg-[#F4F6FA] text-[#101B35]">
        {children}
      </body>
    </html>
  );
}
