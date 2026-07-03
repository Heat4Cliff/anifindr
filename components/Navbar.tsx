"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Menu, X, Tv2, BarChart2, Settings, Info } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchQ("");
      setMenuOpen(false);
    }
  }

  const navLinks = [
    { href: "/", label: "Home", icon: <Tv2 size={16} /> },
    { href: "/search", label: "Cari", icon: <Search size={16} /> },
    { href: "/evaluation", label: "Evaluasi IR", icon: <BarChart2 size={16} /> },
    { href: "/about", label: "Tentang", icon: <Info size={16} /> },
  ];

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "all 0.3s ease",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        backgroundColor: scrolled ? "rgba(248, 250, 252, 0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: "1.2rem",
              color: "var(--text-primary)",
            }}
          >
            <Image
              src="/logo.png"
              alt="AniFindr Logo"
              width={36}
              height={36}
              style={{ objectFit: "contain" }}
            />
            <span className="gradient-text">AniFindr</span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} className="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.45rem 0.9rem",
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: pathname === link.href ? "var(--accent-primary)" : "var(--text-secondary)",
                  backgroundColor: pathname === link.href ? "rgba(99,102,241,0.12)" : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search bar (desktop) */}
          <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                }}
              />
              <input
                id="navbar-search"
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Cari anime..."
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  padding: "0.45rem 1rem 0.45rem 2.2rem",
                  fontSize: "0.875rem",
                  width: 200,
                  transition: "border-color 0.2s ease, width 0.2s ease",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--accent-primary)";
                  e.target.style.width = "240px";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.width = "200px";
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                border: "none",
                borderRadius: "var(--radius-sm)",
                color: "#fff",
                padding: "0.45rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Cari
            </button>
          </form>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: "none",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "0.5rem",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
            aria-label="Toggle menu"
            id="mobile-menu-btn"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            style={{
              borderTop: "1px solid var(--border)",
              padding: "1rem 0",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                  color: pathname === link.href ? "var(--accent-primary)" : "var(--text-secondary)",
                  backgroundColor: pathname === link.href ? "rgba(99,102,241,0.12)" : "transparent",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <form onSubmit={handleSearch} style={{ padding: "0.5rem 0.5rem 0" }}>
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Cari anime..."
                style={{
                  width: "100%",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  padding: "0.6rem 1rem",
                  fontSize: "0.9rem",
                }}
              />
            </form>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
          form { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
