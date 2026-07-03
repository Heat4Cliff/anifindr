"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{
      background: "var(--bg-elevated)",
      borderTop: "1px solid var(--border)",
      padding: "3rem 1rem",
      marginTop: "auto"
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "2rem"
      }}>
        <div>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", marginBottom: "1rem" }}>
            <Image src="/logo.png" alt="AniFindr Logo" width={32} height={32} style={{ objectFit: "contain" }} />
            <span className="gradient-text" style={{ fontSize: "1.25rem", fontWeight: 800 }}>AniFindr</span>
          </Link>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: 300, lineHeight: 1.6 }}>
            Platform pencarian anime modern dengan teknologi Information Retrieval yang cepat dan akurat.
          </p>
        </div>
        
        <div>
          <h3 style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "1rem" }}>Tautan</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li>
              <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/search" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
                Cari Anime
              </Link>
            </li>
            <li>
              <Link href="/evaluation" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
                Evaluasi IR
              </Link>
            </li>
            <li>
              <Link href="/about" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
                Tentang Kami
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div style={{
        maxWidth: 1200,
        margin: "2rem auto 0",
        paddingTop: "1.5rem",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          © {new Date().getFullYear()} AniFindr. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
