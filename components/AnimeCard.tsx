import Link from "next/link";
import { Star, Tv, Clock } from "lucide-react";

interface AnimeCardProps {
  id: string;
  malId: number;
  title: string;
  titleEnglish?: string | null;
  imageUrl?: string | null;
  score?: number | null;
  episodes?: number | null;
  status?: string;
  year?: number | null;
  type?: string | null;
  genres?: string[];
  relevanceScore?: number;
  explanation?: string[];
  showExplanation?: boolean;
}

function ScoreColor(score: number) {
  if (score >= 8) return "#4ade80";
  if (score >= 7) return "#f59e0b";
  if (score >= 6) return "#fb923c";
  return "#f43f5e";
}

function StatusLabel(status: string) {
  if (status === "AIRING") return { label: "Airing", color: "#4ade80", bg: "rgba(74,222,128,0.12)" };
  if (status === "FINISHED") return { label: "Selesai", color: "#9999bb", bg: "rgba(153,153,187,0.12)" };
  if (status === "NOT_YET_AIRED") return { label: "Akan Datang", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" };
  return { label: "Unknown", color: "#5a5a7a", bg: "rgba(90,90,122,0.12)" };
}

export default function AnimeCard({
  id,
  title,
  titleEnglish,
  imageUrl,
  score,
  episodes,
  status = "UNKNOWN",
  year,
  type,
  genres = [],
  explanation = [],
  showExplanation = false,
}: AnimeCardProps) {
  const statusInfo = StatusLabel(status);

  return (
    <Link
      href={`/anime/${id}`}
      id={`anime-card-${id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        className="card-hover"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Poster */}
        <div style={{ position: "relative", aspectRatio: "2/3", overflow: "hidden", background: "var(--bg-elevated)" }}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`Poster ${title}`}
              className="poster-img"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div style={{
              width: "100%", height: "100%", display: "flex", alignItems: "center",
              justifyContent: "center", color: "var(--text-muted)", fontSize: "2rem",
            }}>
              <Tv size={40} />
            </div>
          )}

          {/* Score badge overlay */}
          {score && (
            <div style={{
              position: "absolute", top: 8, right: 8,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(8px)",
              borderRadius: 6,
              padding: "3px 8px",
              display: "flex", alignItems: "center", gap: 3,
            }}>
              <Star size={11} style={{ color: ScoreColor(score), fill: ScoreColor(score) }} />
              <span style={{ color: ScoreColor(score), fontSize: "0.75rem", fontWeight: 700 }}>
                {score.toFixed(1)}
              </span>
            </div>
          )}

          {/* Status badge */}
          <div style={{
            position: "absolute", bottom: 8, left: 8,
            background: statusInfo.bg,
            color: statusInfo.color,
            borderRadius: 5,
            padding: "2px 7px",
            fontSize: "0.7rem",
            fontWeight: 600,
            backdropFilter: "blur(8px)",
          }}>
            {statusInfo.label}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <h3 style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {titleEnglish || title}
          </h3>

          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {type && (
              <span style={{
                fontSize: "0.7rem", color: "var(--accent-primary)",
                background: "rgba(99,102,241,0.12)", borderRadius: 4, padding: "1px 6px", fontWeight: 600,
              }}>
                {type}
              </span>
            )}
            {year && (
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{year}</span>
            )}
            {episodes && (
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 2 }}>
                <Clock size={10} /> {episodes} ep
              </span>
            )}
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginTop: "auto" }}>
              {genres.slice(0, 3).map((g) => (
                <span key={g} style={{
                  fontSize: "0.65rem",
                  color: "var(--text-muted)",
                  background: "var(--bg-elevated)",
                  borderRadius: 4,
                  padding: "1px 6px",
                }}>
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Explanation (shown on search results) */}
          {showExplanation && explanation.length > 0 && (
            <div style={{
              marginTop: "0.4rem",
              fontSize: "0.65rem",
              color: "var(--accent-teal)",
              borderTop: "1px solid var(--border)",
              paddingTop: "0.4rem",
            }}>
              {explanation[0]}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
