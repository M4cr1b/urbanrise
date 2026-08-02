import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, Sora } from "next/font/google";
import "./globals.css";

// Headlines — heavy weights, modern proportions, architectural feel.
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

// Body — neutral and highly legible for dense sustainability reporting.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Numerals and technical labels only — geometric, emphasises precision.
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "UrbanRise Ghana — Residential Property & Market Intelligence",
    template: "%s · UrbanRise Ghana",
  },
  description:
    "Ghana's integrated residential property information and market intelligence platform. Verified listings, comparable evidence for valuation, estate professionals and a green building materials hub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${inter.variable} ${sora.variable} antialiased`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
