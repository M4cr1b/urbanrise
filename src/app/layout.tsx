import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./interface.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

// Headlines — heavy weights, modern proportions, architectural feel.
const hanken = localFont({
  src: "./fonts/hanken-grotesk-latin.woff2",
  variable: "--font-hanken",
  weight: "600 800",
  display: "swap",
});

// Body — neutral and highly legible for dense sustainability reporting.
const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-inter",
  weight: "400 700",
  display: "swap",
});

// Numerals and technical labels only — geometric, emphasises precision.
const sora = localFont({
  src: "./fonts/sora-latin.woff2",
  variable: "--font-sora",
  weight: "400 600",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#003b1b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${hanken.variable} ${inter.variable} ${sora.variable} antialiased`}
    >
      <head>
        <script id="urbanrise-theme" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen"><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
