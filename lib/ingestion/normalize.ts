import type { AniListMedia } from "./anilist";
import type { AnimeStatus, AnimeSeason } from "@prisma/client";

export interface NormalizedAnime {
  malId: number;
  title: string;
  titleEnglish: string | null;
  titleJapanese: string | null;
  synopsis: string | null;
  score: number | null;
  rank: number | null; // Note: AniList doesn't return global rank in the simple query, we might leave it null
  popularity: number | null;
  episodes: number | null;
  status: AnimeStatus;
  season: AnimeSeason | null;
  year: number | null;
  imageUrl: string | null;
  trailerUrl: string | null;
  airedFrom: Date | null;
  airedTo: Date | null;
  type: string | null;
  duration: string | null;
  rating: string | null;
  source: string | null;
  members: number | null;
  favorites: number | null;
  genres: { malId: number; name: string; slug: string }[];
  studios: { malId: number; name: string; slug: string }[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapStatus(status: string | null): AnimeStatus {
  if (!status) return "UNKNOWN";
  switch (status) {
    case "FINISHED": return "FINISHED";
    case "RELEASING": return "AIRING";
    case "NOT_YET_RELEASED": return "NOT_YET_AIRED";
    case "CANCELLED": return "UNKNOWN";
    case "HIATUS": return "UNKNOWN";
    default: return "UNKNOWN";
  }
}

function mapSeason(season: string | null): AnimeSeason | null {
  if (!season) return null;
  const s = season.toUpperCase();
  if (s === "SPRING") return "SPRING";
  if (s === "SUMMER") return "SUMMER";
  if (s === "FALL") return "FALL";
  if (s === "WINTER") return "WINTER";
  return null;
}

function formatSource(source: string | null): string | null {
  if (!source) return null;
  // Convert "LIGHT_NOVEL" to "Light Novel", "MANGA" to "Manga"
  return source.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// Simple hash to generate a stable pseudo-ID for genres if we only have names
function hashStringToInt(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function normalizeAnime(raw: AniListMedia): NormalizedAnime | null {
  // We MUST have a malId for our DB schema. If AniList doesn't have it, skip it.
  if (!raw.idMal) return null;

  const airedFrom = (raw.startDate?.year && raw.startDate?.month && raw.startDate?.day)
    ? new Date(raw.startDate.year, raw.startDate.month - 1, raw.startDate.day)
    : null;
    
  const airedTo = (raw.endDate?.year && raw.endDate?.month && raw.endDate?.day)
    ? new Date(raw.endDate.year, raw.endDate.month - 1, raw.endDate.day)
    : null;

  return {
    malId: raw.idMal,
    title: raw.title.romaji ?? raw.title.english ?? "Unknown",
    titleEnglish: raw.title.english ?? null,
    titleJapanese: raw.title.native ?? null,
    synopsis: raw.description ?? null,
    score: raw.averageScore ? raw.averageScore / 10 : null, // AniList is 0-100, we want 0-10
    rank: null, // Not easily queried in the flat list without extra nested query, popularity is enough for Hybrid IR
    popularity: raw.popularity ?? null,
    episodes: raw.episodes ?? null,
    status: mapStatus(raw.status),
    season: mapSeason(raw.season),
    year: raw.seasonYear ?? null,
    imageUrl: raw.coverImage?.extraLarge ?? null,
    trailerUrl: (raw.trailer?.site === "youtube" && raw.trailer?.id) ? `https://www.youtube.com/watch?v=${raw.trailer.id}` : null,
    airedFrom,
    airedTo,
    type: raw.format ?? "TV",
    duration: raw.duration ? `${raw.duration} min/ep` : null,
    rating: null, // AniList doesn't easily expose PG-13/R directly on the Media object without external IDs
    source: formatSource(raw.source),
    members: raw.popularity ?? null, // Use popularity as members proxy
    favorites: null, 
    genres: (raw.genres ?? []).map((gName) => ({
      malId: hashStringToInt(gName),
      name: gName,
      slug: slugify(gName),
    })),
    studios: (raw.studios?.nodes ?? []).map((s) => ({
      malId: s.id, // Using AniList Studio ID as the malId in our DB since it's just an external ID reference
      name: s.name,
      slug: slugify(s.name),
    })),
  };
}

// Build search vector string for TF-IDF from normalized anime
export function buildSearchVector(anime: NormalizedAnime): string {
  const parts = [
    anime.title,
    anime.titleEnglish,
    anime.titleJapanese,
    anime.synopsis,
    anime.genres.map((g) => g.name).join(" "),
    anime.studios.map((s) => s.name).join(" "),
    anime.type,
    anime.source,
    anime.season,
    anime.year?.toString(),
  ]
    .filter(Boolean)
    .join(" ");

  // Remove HTML tags that might be in AniList descriptions just in case
  return parts.replace(/<[^>]*>?/gm, ' ');
}
