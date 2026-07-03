// AniList GraphQL API Client
// Docs: https://anilist.gitbook.io/anilist-apiv2-docs/

const ANILIST_URL = "https://graphql.anilist.co";

export interface AniListMedia {
  id: number;
  idMal: number | null;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
  description: string | null;
  averageScore: number | null;
  popularity: number | null;
  episodes: number | null;
  status: string | null;
  season: string | null;
  seasonYear: number | null;
  coverImage: {
    extraLarge: string | null;
  };
  trailer: {
    site: string | null;
    id: string | null;
  } | null;
  startDate: { year: number | null; month: number | null; day: number | null };
  endDate: { year: number | null; month: number | null; day: number | null };
  format: string | null;
  duration: number | null;
  source: string | null;
  genres: string[];
  studios: {
    nodes: Array<{ id: number; name: string }>;
  };
}

export interface AniListPaginatedResponse {
  pageInfo: {
    hasNextPage: boolean;
    lastPage: number;
    currentPage: number;
  };
  media: AniListMedia[];
}

const animeQuery = `
  query ($page: Int, $perPage: Int, $sort: [MediaSort], $season: MediaSeason, $seasonYear: Int, $type: MediaType) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        lastPage
        currentPage
      }
      media(type: $type, sort: $sort, season: $season, seasonYear: $seasonYear, isAdult: false) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        description(asHtml: false)
        averageScore
        popularity
        episodes
        status
        season
        seasonYear
        coverImage {
          extraLarge
        }
        trailer {
          site
          id
        }
        startDate { year month day }
        endDate { year month day }
        format
        duration
        source
        genres
        studios(isMain: true) {
          nodes { id name }
        }
      }
    }
  }
`;

async function fetchAniList(variables: any): Promise<AniListPaginatedResponse> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: animeQuery,
      variables,
    }),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`AniList fetch failed: ${res.status} ${errorText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`AniList GraphQL Error: ${json.errors.map((e: any) => e.message).join(", ")}`);
  }

  return json.data.Page;
}

export async function fetchTopAnime(page = 1, perPage = 25) {
  return fetchAniList({ page, perPage, type: "ANIME", sort: ["SCORE_DESC", "POPULARITY_DESC"] });
}

export async function fetchPopularAnime(page = 1, perPage = 25) {
  return fetchAniList({ page, perPage, type: "ANIME", sort: ["POPULARITY_DESC"] });
}

export async function fetchSeasonalAnime(year: number, season: string, page = 1, perPage = 25) {
  return fetchAniList({ page, perPage, type: "ANIME", season: season.toUpperCase(), seasonYear: year, sort: ["POPULARITY_DESC"] });
}

export async function fetchCurrentSeason(page = 1, perPage = 25) {
  const now = new Date();
  const year = now.getFullYear();
  const seasonMap = ["WINTER", "SPRING", "SUMMER", "FALL"];
  const season = seasonMap[Math.floor((now.getMonth() / 12) * 4)];
  return fetchSeasonalAnime(year, season, page, perPage);
}
