import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "AniFindr — Platform Pencarian Anime",
    template: "%s | AniFindr",
  },
  description:
    "Platform Information Retrieval anime terdepan dengan pencarian hybrid TF-IDF + semantic ranking, detail lengkap, dan evaluasi IR terukur.",
  keywords: ["anime", "search", "information retrieval", "TF-IDF", "rekomendasi anime"],
  authors: [{ name: "AniFindr Team" }],
  openGraph: {
    title: "AniFindr",
    description: "Platform pencarian anime berbasis Information Retrieval",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
