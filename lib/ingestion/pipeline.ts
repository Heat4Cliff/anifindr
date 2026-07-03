// Ingestion Pipeline for AniList
import prisma from "@/lib/db/prisma";
import { fetchTopAnime, fetchCurrentSeason, fetchPopularAnime } from "@/lib/ingestion/anilist";
import { normalizeAnime, buildSearchVector } from "@/lib/ingestion/normalize";

export interface PipelineResult {
  success: boolean;
  itemsTotal: number;
  itemsDone: number;
  itemsSkipped: number;
  errors: string[];
  jobId: string;
}

async function upsertGenre(name: string, slug: string) {
  const existing = await prisma.genre.findUnique({ where: { name } });
  if (existing) return existing;
  const malId = Math.floor(Math.random() * 2000000000);
  return prisma.genre.create({ data: { malId, name, slug } });
}

async function upsertStudio(name: string, slug: string) {
  const existing = await prisma.studio.findUnique({ where: { name } });
  if (existing) return existing;
  const malId = Math.floor(Math.random() * 2000000000);
  return prisma.studio.create({ data: { malId, name, slug } });
}

export async function runIngestionPipeline(
  source: "top" | "seasonal" | "current",
  maxPages = 4
): Promise<PipelineResult> {
  const job = await prisma.ingestionJob.create({
    data: {
      source: `anilist_${source}`,
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  const errors: string[] = [];
  let itemsDone = 0;
  let itemsSkipped = 0;
  let itemsTotal = 0;

  try {
    for (let page = 1; page <= maxPages; page++) {
      let data;
      try {
        if (source === "current") {
          data = await fetchCurrentSeason(page, 30);
        } else if (source === "top") {
          data = await fetchTopAnime(page, 30);
        } else {
          // 'seasonal' typically means popular of all time in our simplified mapping
          data = await fetchPopularAnime(page, 30);
        }
      } catch (err) {
        errors.push(`Page ${page} fetch failed: ${err}`);
        break;
      }

      itemsTotal += data.media.length;

      for (const raw of data.media) {
        try {
          const normalized = normalizeAnime(raw);
          
          if (!normalized) {
            itemsSkipped++;
            continue; // Skip items without MAL ID mapping
          }

          const searchVector = buildSearchVector(normalized);

          // Upsert anime
          const anime = await prisma.anime.upsert({
            where: { malId: normalized.malId },
            update: {
              title: normalized.title,
              titleEnglish: normalized.titleEnglish,
              titleJapanese: normalized.titleJapanese,
              synopsis: normalized.synopsis,
              score: normalized.score,
              rank: normalized.rank,
              popularity: normalized.popularity,
              episodes: normalized.episodes,
              status: normalized.status,
              season: normalized.season,
              year: normalized.year,
              imageUrl: normalized.imageUrl,
              trailerUrl: normalized.trailerUrl,
              airedFrom: normalized.airedFrom,
              airedTo: normalized.airedTo,
              type: normalized.type,
              duration: normalized.duration,
              rating: normalized.rating,
              source: normalized.source,
              members: normalized.members,
              favorites: normalized.favorites,
              searchVector,
              updatedAt: new Date(),
            },
            create: {
              malId: normalized.malId,
              title: normalized.title,
              titleEnglish: normalized.titleEnglish,
              titleJapanese: normalized.titleJapanese,
              synopsis: normalized.synopsis,
              score: normalized.score,
              rank: normalized.rank,
              popularity: normalized.popularity,
              episodes: normalized.episodes,
              status: normalized.status,
              season: normalized.season,
              year: normalized.year,
              imageUrl: normalized.imageUrl,
              trailerUrl: normalized.trailerUrl,
              airedFrom: normalized.airedFrom,
              airedTo: normalized.airedTo,
              type: normalized.type,
              duration: normalized.duration,
              rating: normalized.rating,
              source: normalized.source,
              members: normalized.members,
              favorites: normalized.favorites,
              searchVector,
            },
          });

          // Upsert genres
          for (const g of normalized.genres) {
            const genre = await upsertGenre(g.name, g.slug);
            await prisma.animeGenre.upsert({
              where: { animeId_genreId: { animeId: anime.id, genreId: genre.id } },
              update: {},
              create: { animeId: anime.id, genreId: genre.id },
            });
          }

          // Upsert studios
          for (const s of normalized.studios) {
            const studio = await upsertStudio(s.name, s.slug);
            await prisma.animeStudio.upsert({
              where: { animeId_studioId: { animeId: anime.id, studioId: studio.id } },
              update: {},
              create: { animeId: anime.id, studioId: studio.id },
            });
          }

          itemsDone++;
        } catch (err) {
          itemsSkipped++;
          errors.push(`Media#${raw.id} (MAL#${raw.idMal}) failed: ${err}`);
        }
      }

      if (!data.pageInfo.hasNextPage) break;
      
      // AniList has a generous rate limit (90 per min), a tiny delay is enough
      await new Promise((r) => setTimeout(r, 100));
    }

    await prisma.ingestionJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        itemsTotal,
        itemsDone,
        message: `Completed: ${itemsDone} upserted, ${itemsSkipped} skipped (due to no MAL mapping or errors)`,
      },
    });

    await prisma.auditLog.create({
      data: {
        actor: "system",
        action: "INGESTION_COMPLETE",
        target: source,
        detail: { itemsDone, itemsSkipped, errors: errors.slice(0, 10) },
      },
    });

    return { success: true, itemsTotal, itemsDone, itemsSkipped, errors, jobId: job.id };
  } catch (err) {
    await prisma.ingestionJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        message: "Pipeline failed",
        errorDetail: String(err),
      },
    });

    return {
      success: false,
      itemsTotal,
      itemsDone,
      itemsSkipped,
      errors: [...errors, String(err)],
      jobId: job.id,
    };
  }
}
