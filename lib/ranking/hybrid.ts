// Hybrid Ranking Engine
// Combines TF-IDF text relevance + rating quality + popularity signal
// Weights sesuai SDD section 5.3:
//   - text relevance: 0.40
//   - semantic/content similarity: 0.25
//   - user preference match: 0.15
//   - rating quality: 0.10
//   - popularity/freshness: 0.10

import type { SearchResultItem } from "@/lib/search/tfidf";

export interface HybridWeights {
  textRelevance: number;
  contentSimilarity: number;
  userPreference: number;
  ratingQuality: number;
  popularityFreshness: number;
}

const DEFAULT_WEIGHTS: HybridWeights = {
  textRelevance: 0.40,
  contentSimilarity: 0.25,
  userPreference: 0.15,
  ratingQuality: 0.10,
  popularityFreshness: 0.10,
};

// Normalize a value to [0, 1] range
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

// Content similarity based on genre overlap (Jaccard)
function genreJaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function applyHybridRanking(
  results: SearchResultItem[],
  preferredGenres: string[] = [],
  weights: HybridWeights = DEFAULT_WEIGHTS
): SearchResultItem[] {
  if (results.length === 0) return results;

  // Precompute range for normalization
  const scores = results.map((r) => r.relevanceScore);
  const maxTfIdf = Math.max(...scores);
  const minTfIdf = Math.min(...scores);

  const malScores = results.map((r) => r.score ?? 0);
  const maxScore = Math.max(...malScores);
  const minScore = Math.min(...malScores);

  const popularities = results.map((r) => r.popularity ?? 9999);
  const maxPop = Math.max(...popularities);
  const minPop = Math.min(...popularities);

  const currentYear = new Date().getFullYear();

  // Dynamically adjust weights based on active components
  let activeWeights = { ...weights };
  const isTextActive = maxTfIdf > 0;
  const isContentActive = preferredGenres.length > 0;

  if (!isTextActive) {
    // Distribute 40% text weight to rating and popularity
    activeWeights.ratingQuality += activeWeights.textRelevance * 0.5; // +20%
    activeWeights.popularityFreshness += activeWeights.textRelevance * 0.5; // +20%
    activeWeights.textRelevance = 0;
  }
  if (!isContentActive) {
    // Distribute 40% content/user weight to rating and popularity
    const unused = activeWeights.contentSimilarity + activeWeights.userPreference;
    activeWeights.ratingQuality += unused * 0.5; // +20%
    activeWeights.popularityFreshness += unused * 0.5; // +20%
    activeWeights.contentSimilarity = 0;
    activeWeights.userPreference = 0;
  }

  // Normalize weights just in case
  const sumWeights = Object.values(activeWeights).reduce((a, b) => a + b, 0);
  for (const key in activeWeights) {
    activeWeights[key as keyof HybridWeights] /= sumWeights;
  }

  const ranked = results.map((item) => {
    // 1. Text relevance (TF-IDF score)
    const textScore = isTextActive ? normalize(item.relevanceScore, minTfIdf, maxTfIdf) : 0;

    // 2. Content similarity (genre Jaccard with preferred genres)
    const contentScore = isContentActive ? genreJaccard(item.genres, preferredGenres) : 0;

    // 3. User preference match (placeholder - would use click history in production)
    const userScore = contentScore; // reuse genre match as proxy

    // 4. Rating quality (normalized MAL score)
    const ratingScore = normalize(item.score ?? 0, minScore, maxScore);

    // 5. Popularity + freshness
    const popScore = 1 - normalize(item.popularity ?? maxPop, minPop, maxPop);
    const yearScore = item.year ? normalize(item.year, 1960, currentYear) : 0;
    const popFreshnessScore = (popScore * 0.7 + yearScore * 0.3);

    // Combined hybrid score
    const hybridScore =
      textScore * activeWeights.textRelevance +
      contentScore * activeWeights.contentSimilarity +
      userScore * activeWeights.userPreference +
      ratingScore * activeWeights.ratingQuality +
      popFreshnessScore * activeWeights.popularityFreshness;

    return {
      ...item,
      relevanceScore: hybridScore,
      explanation: buildHybridExplanation(item, {
        textScore,
        contentScore,
        ratingScore,
        popFreshnessScore,
      }),
    };
  });

  return ranked.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function buildHybridExplanation(
  item: SearchResultItem,
  scores: {
    textScore: number;
    contentScore: number;
    ratingScore: number;
    popFreshnessScore: number;
  }
): string[] {
  const reasons = [...item.explanation];

  if (scores.textScore > 0.5) reasons.push("Relevansi teks tinggi");
  if (scores.contentScore > 0.4) reasons.push("Genre sangat cocok");
  if (scores.ratingScore > 0.7) reasons.push(`Skor MAL tinggi: ${item.score?.toFixed(1)}`);
  if (scores.popFreshnessScore > 0.6) reasons.push("Anime populer dan terkini");
  if (item.genres.length > 0) reasons.push(`Genre: ${item.genres.slice(0, 3).join(", ")}`);

  return [...new Set(reasons)];
}
