"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Search, Tv2, BarChart2, Info } from "lucide-react";
import SearchAutocomplete from "@/components/SearchAutocomplete";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Search is now handled by SearchAutocomplete component

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
        backgroundColor: scrolled ? "rgba(248, 250, 252, 0.9)" : "rgba(248, 250, 252, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
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
          <div className="navbar-desktop-nav" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
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
                  backgroundColor: pathname === link.href ? "rgba(13,148,136,0.12)" : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search bar (desktop) */}
          <div className="navbar-desktop-search" style={{ width: 280 }}>
            <SearchAutocomplete variant="navbar" placeholder="Cari anime..." />
          </div>

          {/* Mobile menu button - Animated Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="navbar-mobile-btn"
            style={{
              display: "none",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "0.5rem",
              color: "var(--text-primary)",
              cursor: "pointer",
              width: 40,
              height: 40,
              position: "relative",
              transition: "all 0.3s ease",
            }}
            aria-label="Toggle menu"
            id="mobile-menu-btn"
          >
            <div className={`hamburger-icon ${menuOpen ? "open" : ""}`}>
              <span /><span /><span />
            </div>
          </button>
        </div>

        {/* Mobile menu - Animated slide down */}
        <div
          ref={menuRef}
          className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`}
        >
          <div style={{ padding: "0.75rem 0", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="mobile-menu-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                  color: pathname === link.href ? "var(--accent-primary)" : "var(--text-secondary)",
                  backgroundColor: pathname === link.href ? "rgba(13,148,136,0.12)" : "transparent",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {/* Mobile search */}
            <div
              className="mobile-menu-item"
              style={{
                padding: "0.75rem 0.5rem 0.5rem",
                animationDelay: "0.2s",
              }}
            >
              <SearchAutocomplete
                variant="navbar"
                placeholder="Cari anime..."
                onSearch={() => setMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ===== Animated Hamburger ===== */
        .hamburger-icon {
          width: 20px;
          height: 14px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .hamburger-icon span {
          display: block;
          position: absolute;
          height: 2px;
          width: 100%;
          background: var(--text-primary);
          border-radius: 2px;
          left: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hamburger-icon span:nth-child(1) { top: 0; }
        .hamburger-icon span:nth-child(2) { top: 6px; }
        .hamburger-icon span:nth-child(3) { top: 12px; }

        .hamburger-icon.open span:nth-child(1) {
          top: 6px;
          transform: rotate(45deg);
        }
        .hamburger-icon.open span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .hamburger-icon.open span:nth-child(3) {
          top: 6px;
          transform: rotate(-45deg);
        }

        /* ===== Mobile Menu Slide Down ===== */
        .mobile-menu {
          display: none;
          max-height: 0;
          overflow: hidden;
          border-top: 1px solid transparent;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 0.3s ease,
                      opacity 0.3s ease;
          opacity: 0;
        }
        .mobile-menu-open {
          max-height: 400px;
          border-top-color: var(--border);
          opacity: 1;
        }

        @keyframes slideInItem {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .mobile-menu-open .mobile-menu-item {
          animation: slideInItem 0.3s ease forwards;
        }

        /* ===== Mobile Responsive ===== */
        @media (max-width: 768px) {
          .navbar-desktop-nav { display: none !important; }
          .navbar-desktop-search { display: none !important; }
          .navbar-mobile-btn { display: flex !important; }
          .mobile-menu { display: block; }
        }
      `}</style>
    </nav>
  );
}
