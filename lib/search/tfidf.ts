// TF-IDF Search Engine
// Uses PostgreSQL full-text search (tsvector/tsquery) as primary + custom TF-IDF scoring

import prisma from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export interface SearchFilter {
  genre?: string | string[];
  year?: number;
  status?: string;
  season?: string;
  minScore?: number;
  type?: string;
}

export interface SearchOptions {
  q: string;
  filters?: SearchFilter;
  page?: number;
  limit?: number;
  sort?: "score" | "rank" | "popularity" | "year" | "title";
  mode?: "tfidf" | "fulltext" | "hybrid";
}

export interface SearchResultItem {
  id: string;
  malId: number;
  title: string;
  titleEnglish: string | null;
  synopsis: string | null;
  score: number | null;
  rank: number | null;
  popularity: number | null;
  imageUrl: string | null;
  status: string;
  year: number | null;
  season: string | null;
  episodes: number | null;
  type: string | null;
  genres: string[];
  studios: string[];
  relevanceScore: number;
  explanation: string[];
}

// Compute TF-IDF relevance score from search vector text
function computeTfIdf(text: string, query: string): number {
  if (!text || !query) return 0;

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const docWords = text.toLowerCase().split(/\s+/);
  const docLength = docWords.length;

  if (docLength === 0) return 0;

  let score = 0;
  for (const term of terms) {
    // TF: term frequency in document
    const tf = docWords.filter((w) => w.includes(term)).length / docLength;
    // IDF approximation (fixed for now — we don't have corpus-level IDF in memory)
    const idf = Math.log(1000 / (1 + 1)); // assume 1000 docs, term appears in ~1
    score += tf * idf;
  }

  return score;
}

// Build explanation for why an anime matched
function buildExplanation(
  anime: {
    title: string;
    titleEnglish: string | null;
    synopsis: string | null;
    searchVector: string | null;
  },
  query: string
): string[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const reasons: string[] = [];

  for (const term of terms) {
    if (anime.title?.toLowerCase().includes(term)) {
      reasons.push(`Judul cocok: "${term}"`);
    } else if (anime.titleEnglish?.toLowerCase().includes(term)) {
      reasons.push(`Judul Inggris cocok: "${term}"`);
    } else if (anime.synopsis?.toLowerCase().includes(term)) {
      reasons.push(`Sinopsis mengandung: "${term}"`);
    } else if (anime.searchVector?.toLowerCase().includes(term)) {
      reasons.push(`Metadata cocok: "${term}"`);
    }
  }

  if (reasons.length === 0) reasons.push("Hasil dari full-text index");
  return reasons;
}

export async function searchAnime(
  options: SearchOptions
): Promise<{ results: SearchResultItem[]; total: number; page: number; totalPages: number }> {
  const { q, filters = {}, page = 1, limit = 20, sort = "score" } = options;
  const offset = (page - 1) * limit;
  const safeLimit = Math.min(limit, 50);

  // Build WHERE conditions
  const where: Prisma.AnimeWhereInput = {};

  // Text search using PostgreSQL LIKE on searchVector (simple approach, works without pg_trgm)
  if (q && q.trim()) {
    const terms = q.trim().toLowerCase().split(/\s+/);
    where.OR = [
      ...terms.map((t) => ({ title: { contains: t, mode: "insensitive" as const } })),
      ...terms.map((t) => ({ titleEnglish: { contains: t, mode: "insensitive" as const } })),
      ...terms.map((t) => ({ synopsis: { contains: t, mode: "insensitive" as const } })),
      ...terms.map((t) => ({ searchVector: { contains: t, mode: "insensitive" as const } })),
    ];
  }

  // Filters
  if (filters.genre) {
    const genres = Array.isArray(filters.genre) ? filters.genre : [filters.genre];
    where.genres = {
      some: {
        genre: {
          OR: genres.map((g) => ({ name: { equals: g, mode: "insensitive" as const } })),
        },
      },
    };
  }

  if (filters.year) where.year = filters.year;
  if (filters.status) where.status = filters.status as never;
  if (filters.season) where.season = filters.season.toUpperCase() as never;
  if (filters.minScore) where.score = { gte: filters.minScore };
  if (filters.type) where.type = { equals: filters.type, mode: Prisma.QueryMode.insensitive };

  // Determine sort order
  const orderBy: Prisma.AnimeOrderByWithRelationInput[] = [];
  if (sort === "score") orderBy.push({ score: "desc" });
  else if (sort === "rank") orderBy.push({ rank: "asc" });
  else if (sort === "popularity") orderBy.push({ popularity: "asc" });
  else if (sort === "year") orderBy.push({ year: "desc" });
  else if (sort === "title") orderBy.push({ title: "asc" });
  orderBy.push({ score: "desc" }); // secondary sort

  const [animes, total] = await Promise.all([
    prisma.anime.findMany({
      where,
      orderBy,
      skip: offset,
      take: safeLimit,
      include: {
        genres: { include: { genre: true } },
        studios: { include: { studio: true } },
      },
    }),
    prisma.anime.count({ where }),
  ]);

  const results: SearchResultItem[] = animes.map((anime) => {
    const searchVec = anime.searchVector ?? "";
    const relevanceScore = computeTfIdf(searchVec, q);

    return {
      id: anime.id,
      malId: anime.malId,
      title: anime.title,
      titleEnglish: anime.titleEnglish,
      synopsis: anime.synopsis,
      score: anime.score,
      rank: anime.rank,
      popularity: anime.popularity,
      imageUrl: anime.imageUrl,
      status: anime.status,
      year: anime.year,
      season: anime.season,
      episodes: anime.episodes,
      type: anime.type,
      genres: anime.genres.map((ag) => ag.genre.name),
      studios: anime.studios.map((as_) => as_.studio.name),
      relevanceScore,
      explanation: buildExplanation(anime, q),
    };
  });

  // Re-sort by relevance score for TF-IDF mode
  if (options.mode === "tfidf" || !options.mode) {
    results.sort((a, b) => b.relevanceScore - a.relevanceScore || (b.score ?? 0) - (a.score ?? 0));
  }

  return {
    results,
    total,
    page,
    totalPages: Math.ceil(total / safeLimit),
  };
}

export async function getAnimeById(id: string) {
  return prisma.anime.findUnique({
    where: { id },
    include: {
      genres: { include: { genre: true } },
      studios: { include: { studio: true } },
      watchLinks: true,
    },
  });
}

export async function getSimilarAnime(animeId: string, limit = 12): Promise<SearchResultItem[]> {
  const source = await prisma.anime.findUnique({
    where: { id: animeId },
    include: { genres: { include: { genre: true } } },
  });

  if (!source) return [];

  const genreNames = source.genres.map((ag) => ag.genre.name);
  const query = [source.title, ...genreNames.slice(0, 3)].join(" ");

  const result = await searchAnime({
    q: query,
    filters: {},
    page: 1,
    limit: limit + 1,
    sort: "score",
  });

  // Filter out the source anime itself
  return result.results.filter((r) => r.id !== animeId).slice(0, limit);
}
