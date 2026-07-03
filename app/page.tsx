import Link from "next/link";
import { Search, Zap, TrendingUp, Sparkles } from "lucide-react";
import prisma from "@/lib/db/prisma";
import AnimeCard from "@/components/AnimeCard";
import TypewriterText from "@/components/TypewriterText";

async function getHomeData() {
  try {
    const [topAnime, airingAnime, animeCount, genreCount] = await Promise.all([
      prisma.anime.findMany({
        where: { score: { not: null } },
        orderBy: { score: "desc" },
        take: 12,
        include: { genres: { include: { genre: true } }, studios: { include: { studio: true } } },
      }),
      prisma.anime.findMany({
        where: { status: "AIRING" },
        orderBy: { popularity: "asc" },
        take: 6,
        include: { genres: { include: { genre: true } }, studios: { include: { studio: true } } },
      }),
      prisma.anime.count(),
      prisma.genre.count(),
    ]);
    return { topAnime, airingAnime, animeCount, genreCount };
  } catch {
    return { topAnime: [], airingAnime: [], animeCount: 0, genreCount: 0 };
  }
}

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <div className="glass" style={{
      borderRadius: "var(--radius)",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.5rem",
      textAlign: "center",
    }}>
      <div style={{ color: "var(--accent-primary)", marginBottom: "0.25rem" }}>{icon}</div>
      <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: "var(--text-primary)" }}>
        {value.toLocaleString()}
      </div>
      <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{label}</div>
    </div>
  );
}

export default async function HomePage() {
  const { topAnime, airingAnime, animeCount, genreCount } = await getHomeData();
  const isEmpty = animeCount === 0;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <section style={{
        position: "relative",
        padding: "6rem 1.5rem 4rem",
        textAlign: "center",
        overflow: "hidden",
      }}>
        {/* Background gradient orbs */}
        <div style={{
          position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0,
        }}>
          <div style={{
            position: "absolute", top: "-20%", left: "30%",
            width: 600, height: 600,
            background: "radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
          <div style={{
            position: "absolute", top: "10%", right: "20%",
            width: 400, height: 400,
            background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(13,148,136,0.12)", border: "1px solid rgba(13,148,136,0.3)",
            borderRadius: 50, padding: "0.35rem 1rem",
            fontSize: "0.8rem", color: "var(--accent-primary)", fontWeight: 600,
            marginBottom: "1.5rem",
          }}>
            <Sparkles size={14} />
            Information Retrieval Platform
          </div>

          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            lineHeight: 1.1,
            marginBottom: "1rem",
          }}>
            Temukan Anime{" "}
            <span className="gradient-text">Sempurna</span>
            {" "}untuk Kamu
          </h1>

          <TypewriterText
            text="Sistem pencarian cerdas berbasis TF-IDF dan hybrid ranking. Temukan, bandingkan, dan eksplorasi ribuan anime dengan presisi tinggi."
            delay={40}
            style={{
              fontSize: "1.1rem", color: "var(--text-secondary)",
              maxWidth: 520, margin: "0 auto 2.5rem",
              lineHeight: 1.7,
              minHeight: "3.4em" /* Prevent layout shift while typing */
            }}
          />

          {/* Search form */}
          <form
            action="/search"
            style={{
              display: "flex", gap: "0.5rem", maxWidth: 560, margin: "0 auto 2rem",
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "0.4rem",
            }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={18} style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", color: "var(--text-muted)",
                pointerEvents: "none",
              }} />
              <input
                id="hero-search"
                type="text"
                name="q"
                placeholder="Cari berdasarkan judul, genre, sinopsis..."
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-primary)",
                  padding: "0.6rem 1rem 0.6rem 2.8rem",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
            <button
              type="submit"
              id="hero-search-btn"
              style={{
                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                border: "none",
                borderRadius: "var(--radius-sm)",
                color: "#fff",
                padding: "0.6rem 1.5rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Cari Sekarang
            </button>
          </form>

          {/* Quick genre filters */}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            {["Action", "Romance", "Fantasy", "Sci-Fi", "Slice of Life", "Horror"].map((genre) => (
              <Link
                key={genre}
                href={`/search?genre=${genre}`}
                className="genre-chip"
              >
                {genre}
              </Link>
            ))}
          </div>
          <style>{`
            .genre-chip {
              padding: 0.35rem 0.85rem;
              background: var(--bg-elevated);
              border: 1px solid var(--border);
              border-radius: 50px;
              color: var(--text-secondary);
              font-size: 0.8rem;
              text-decoration: none;
              transition: all 0.2s ease;
            }
            .genre-chip:hover {
              border-color: var(--accent-primary);
              color: var(--accent-primary);
            }
          `}</style>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
        }}>
          <StatCard value={animeCount} label="Anime Terindeks" icon={<TrendingUp size={24} />} />
          <StatCard value={genreCount} label="Genre Tersedia" icon={<Zap size={24} />} />
          <StatCard value="TF-IDF" label="Algoritma Baseline" icon={<Search size={24} />} />
          <StatCard value="Hybrid" label="Mode Ranking" icon={<Sparkles size={24} />} />
        </div>
      </section>

      {/* Empty state - guide user to sync */}
      {isEmpty && (
        <section style={{ padding: "3rem 1.5rem", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "3rem 2rem" }}>
            <Zap size={48} style={{ color: "var(--accent-primary)", margin: "0 auto 1rem" }} />
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, marginBottom: "0.75rem" }}>
              Database Kosong
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Sinkronisasi data anime dari AniList GraphQL API untuk mulai menggunakan sistem pencarian.
            </p>
            <Link
              href="/admin"
              id="goto-admin-btn"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                color: "#fff",
                textDecoration: "none",
                padding: "0.75rem 2rem",
                borderRadius: "var(--radius-sm)",
                fontWeight: 700,
              }}
            >
              Buka Admin Panel → Sync Data
            </Link>
          </div>
        </section>
      )}

      {/* Currently Airing */}
      {airingAnime.length > 0 && (
        <section style={{ padding: "2rem 1.5rem", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "#4ade80", display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80", animation: "pulseGlow 2s infinite" }} />
              Sedang Tayang
            </h2>
            <Link href="/search?status=airing" style={{ color: "var(--accent-primary)", textDecoration: "none", fontSize: "0.875rem" }}>Lihat Semua →</Link>
          </div>
          <div className="grid-responsive-cards">
            {airingAnime.map((anime) => (
              <AnimeCard
                key={anime.id}
                id={anime.id}
                malId={anime.malId}
                title={anime.title}
                titleEnglish={anime.titleEnglish}
                imageUrl={anime.imageUrl}
                score={anime.score}
                episodes={anime.episodes}
                status={anime.status}
                year={anime.year}
                type={anime.type}
                genres={anime.genres.map((ag) => ag.genre.name)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Top Rated */}
      {topAnime.length > 0 && (
        <section style={{ padding: "2rem 1.5rem 4rem", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp size={20} style={{ color: "var(--accent-gold)" }} />
              Top Rated Anime
            </h2>
            <Link href="/search?sort=score" style={{ color: "var(--accent-primary)", textDecoration: "none", fontSize: "0.875rem" }}>Lihat Semua →</Link>
          </div>
          <div className="grid-responsive-cards">
            {topAnime.map((anime) => (
              <AnimeCard
                key={anime.id}
                id={anime.id}
                malId={anime.malId}
                title={anime.title}
                titleEnglish={anime.titleEnglish}
                imageUrl={anime.imageUrl}
                score={anime.score}
                episodes={anime.episodes}
                status={anime.status}
                year={anime.year}
                type={anime.type}
                genres={anime.genres.map((ag) => ag.genre.name)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
