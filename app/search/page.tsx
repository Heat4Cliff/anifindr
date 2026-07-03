import type { Metadata } from "next";
import { Suspense } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { searchAnime } from "@/lib/search/tfidf";
import { applyHybridRanking } from "@/lib/ranking/hybrid";
import AnimeCard from "@/components/AnimeCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pencarian Anime",
  description: "Cari anime berdasarkan judul, genre, sinopsis, dan metadata lainnya.",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string | string[];
    year?: string;
    status?: string;
    season?: string;
    sort?: string;
    mode?: string;
    page?: string;
    minScore?: string;
    type?: string;
  }>;
}

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "AIRING", label: "Sedang Tayang" },
  { value: "FINISHED", label: "Selesai" },
  { value: "NOT_YET_AIRED", label: "Akan Datang" },
];

const SORT_OPTIONS = [
  { value: "score", label: "Skor Tertinggi" },
  { value: "popularity", label: "Terpopuler" },
  { value: "year", label: "Terbaru" },
  { value: "title", label: "A-Z" },
  { value: "rank", label: "Ranking" },
];

const MODE_OPTIONS = [
  { value: "hybrid", label: "Hybrid" },
  { value: "tfidf", label: "TF-IDF Only" },
];

const GENRE_OPTIONS = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Thriller", "Sports",
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const genre = params.genre
    ? Array.isArray(params.genre) ? params.genre : [params.genre]
    : [];
  const year = params.year ? parseInt(params.year) : undefined;
  const status = params.status ?? "";
  const sort = params.sort ?? "score";
  const mode = (params.mode ?? "hybrid") as "tfidf" | "hybrid";
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const minScore = params.minScore ? parseFloat(params.minScore) : undefined;
  const type = params.type ?? "";

  let results = [];
  let total = 0;
  let totalPages = 0;

  if (q || genre.length > 0 || status || year || type || minScore) {
    try {
      const result = await searchAnime({
        q,
        filters: { genre, year, status: status || undefined, minScore, type: type || undefined },
        page,
        limit: 24,
        sort: sort as never,
        mode,
      });

      results = mode === "hybrid"
        ? applyHybridRanking(result.results, genre)
        : result.results;
      total = result.total;
      totalPages = result.totalPages;
    } catch (e) {
      console.error(e);
    }
  }

  const buildUrl = (overrides: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    genre.forEach((g) => p.append("genre", g));
    if (year) p.set("year", String(year));
    if (status) p.set("status", status);
    if (sort !== "score") p.set("sort", sort);
    if (mode !== "hybrid") p.set("mode", mode);
    if (minScore) p.set("minScore", String(minScore));
    if (type) p.set("type", type);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v !== undefined) p.set(k, String(v));
      else p.delete(k);
    });
    return `/search?${p.toString()}`;
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem" }}>
      {/* Page header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "1.75rem", marginBottom: "0.25rem" }}>
          {q ? (
            <>Hasil untuk <span className="gradient-text">&ldquo;{q}&rdquo;</span></>
          ) : (
            "Jelajahi Anime"
          )}
        </h1>
        {total > 0 && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {total.toLocaleString()} anime ditemukan · Halaman {page} dari {totalPages}
          </p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Filter Panel */}
        <aside>
          <form method="GET" action="/search">
            <div className="glass" style={{ borderRadius: "var(--radius)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "0.9rem" }}>
                <SlidersHorizontal size={16} style={{ color: "var(--accent-primary)" }} />
                Filter
              </div>

              {/* Query */}
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block", fontWeight: 600 }}>KATA KUNCI</label>
                <input name="q" defaultValue={q} placeholder="Cari anime..." style={{
                  width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
                  padding: "0.5rem 0.75rem", fontSize: "0.875rem", outline: "none",
                }} />
              </div>

              {/* Mode */}
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block", fontWeight: 600 }}>MODE PENCARIAN</label>
                <select name="mode" defaultValue={mode} style={{
                  width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", color: "var(--text-primary)", padding: "0.5rem 0.75rem", fontSize: "0.875rem",
                }}>
                  {MODE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block", fontWeight: 600 }}>URUTAN</label>
                <select name="sort" defaultValue={sort} style={{
                  width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", color: "var(--text-primary)", padding: "0.5rem 0.75rem", fontSize: "0.875rem",
                }}>
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block", fontWeight: 600 }}>STATUS</label>
                <select name="status" defaultValue={status} style={{
                  width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", color: "var(--text-primary)", padding: "0.5rem 0.75rem", fontSize: "0.875rem",
                }}>
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Year */}
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block", fontWeight: 600 }}>TAHUN</label>
                <input name="year" type="number" defaultValue={year} placeholder="cth: 2024" min={1960} max={2030} style={{
                  width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", color: "var(--text-primary)", padding: "0.5rem 0.75rem", fontSize: "0.875rem",
                }} />
              </div>

              {/* Min Score */}
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block", fontWeight: 600 }}>SKOR MINIMAL</label>
                <input name="minScore" type="number" step="0.1" min={0} max={10} defaultValue={minScore} placeholder="cth: 7.5" style={{
                  width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", color: "var(--text-primary)", padding: "0.5rem 0.75rem", fontSize: "0.875rem",
                }} />
              </div>

              {/* Genre chips */}
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem", display: "block", fontWeight: 600 }}>GENRE</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {GENRE_OPTIONS.map((g) => {
                    const active = genre.includes(g);
                    return (
                      <Link
                        key={g}
                        href={buildUrl({ genre: active ? undefined : g, page: undefined })}
                        style={{
                          padding: "3px 10px", borderRadius: 50, fontSize: "0.7rem", fontWeight: 600,
                          textDecoration: "none",
                          background: active ? "var(--accent-primary)" : "var(--bg-elevated)",
                          color: active ? "#fff" : "var(--text-muted)",
                          border: `1px solid ${active ? "var(--accent-primary)" : "var(--border)"}`,
                        }}
                      >
                        {g}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <button type="submit" id="filter-apply-btn" style={{
                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                border: "none", borderRadius: "var(--radius-sm)", color: "#fff",
                padding: "0.6rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              }}>
                <Search size={15} />
                Terapkan Filter
              </button>

              <Link href="/search" style={{
                textAlign: "center", color: "var(--text-muted)", textDecoration: "none", fontSize: "0.8rem",
              }}>
                Reset semua filter
              </Link>
            </div>
          </form>
        </aside>

        {/* Results */}
        <div>
          {!q && genre.length === 0 && !status && !year && !minScore && !type ? (
            <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
              <Search size={48} style={{ color: "var(--text-muted)", margin: "0 auto 1rem" }} />
              <h2 style={{ color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.5rem" }}>Mulai Pencarian</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Masukkan kata kunci atau pilih filter untuk menemukan anime</p>
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
              <Search size={48} style={{ color: "var(--text-muted)", margin: "0 auto 1rem" }} />
              <h2 style={{ color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.5rem" }}>Tidak Ada Hasil</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Coba ubah kata kunci atau filter pencarian</p>
            </div>
          ) : (
            <>
              <div className="grid-responsive-cards" style={{ marginBottom: "1.5rem" }}>
                {results.map((anime) => (
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
                    genres={anime.genres}
                    explanation={anime.explanation}
                    showExplanation={true}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  {page > 1 && (
                    <Link href={buildUrl({ page: page - 1 })} style={paginationStyle(false)}>← Prev</Link>
                  )}
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <Link key={p} href={buildUrl({ page: p })} style={paginationStyle(p === page)}>
                        {p}
                      </Link>
                    );
                  })}
                  {page < totalPages && (
                    <Link href={buildUrl({ page: page + 1 })} style={paginationStyle(false)}>Next →</Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function paginationStyle(active: boolean): React.CSSProperties {
  return {
    padding: "0.45rem 0.9rem",
    background: active ? "var(--accent-primary)" : "var(--bg-elevated)",
    border: `1px solid ${active ? "var(--accent-primary)" : "var(--border)"}`,
    borderRadius: "var(--radius-sm)",
    color: active ? "#fff" : "var(--text-secondary)",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: active ? 700 : 400,
  };
}
