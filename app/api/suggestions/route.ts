// Search Suggestions API
// Returns anime title suggestions + genre suggestions as user types

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const queryLower = q.toLowerCase();

  try {
    // Search anime titles matching the query
    const animes = await prisma.anime.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { titleEnglish: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: [{ popularity: "asc" }],
      take: 6,
      select: {
        id: true,
        title: true,
        titleEnglish: true,
        imageUrl: true,
        score: true,
        type: true,
        year: true,
        genres: { include: { genre: true }, take: 3 },
      },
    });

    // Also match genres
    const genres = await prisma.genre.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 4,
      select: { name: true },
    });

    const suggestions = {
      animes: animes.map((a) => ({
        id: a.id,
        title: a.titleEnglish || a.title,
        titleOriginal: a.title,
        imageUrl: a.imageUrl,
        score: a.score,
        type: a.type,
        year: a.year,
        genres: a.genres.map((g) => g.genre.name),
      })),
      genres: genres
        .filter((g) => !animes.some((a) =>
          a.title.toLowerCase().includes(g.name.toLowerCase())
        ))
        .map((g) => g.name),
    };

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Suggestion error:", error);
    return NextResponse.json({ suggestions: { animes: [], genres: [] } });
  }
}
