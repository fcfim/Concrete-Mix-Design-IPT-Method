import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Método IPT/EPUSP",
    default: "Dosagem de Concreto IPT/EPUSP | Concrete Mix Design",
  },
  description:
    "Ferramenta profissional e gratuita para dosagem de concreto pelo método IPT/EPUSP. Gere diagramas de dosagem, calcule consumos de materiais, otimize traços e visualize as Leis de Abrams, Lyse e Molinari.",
  keywords: [
    "concreto",
    "dosagem",
    "IPT",
    "EPUSP",
    "engenharia civil",
    "construção",
    "calculadora de concreto",
    "traço de concreto",
    "mix design",
    "diagrama de dosagem",
  ],
  authors: [{ name: "FCFIM" }],
  creator: "FCFIM",
  publisher: "FCFIM",
  openGraph: {
    title: "Dosagem de Concreto IPT/EPUSP",
    description:
      "Ferramenta interativa para dosagem de concreto. Calcule a proporção ideal de materiais usando o renomado método IPT/EPUSP.",
    url: "https://concrete-mix-design-ipt.vercel.app", // Placeholder, useful if known
    siteName: "Concrete Mix Design IPT",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dosagem de Concreto IPT/EPUSP",
    description: "Cálculo e diagrama de dosagem de concreto método IPT/EPUSP.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
