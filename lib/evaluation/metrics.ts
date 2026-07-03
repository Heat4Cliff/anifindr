// IR Evaluation Metrics
// Implements: Precision@k, Recall@k, MAP, MRR, DCG, nDCG
// Sesuai 08_IR_EVALUATION.md

export interface RelevanceJudgment {
  animeId: string;
  label: number; // 0-3
}

export interface RankedResult {
  animeId: string;
  rank: number;
}

// ==================== PRECISION@K ====================
export function precisionAtK(
  results: RankedResult[],
  relevant: RelevanceJudgment[],
  k: number,
  threshold = 1 // label >= threshold = relevant
): number {
  const topK = results.slice(0, k);
  const relevantIds = new Set(
    relevant.filter((r) => r.label >= threshold).map((r) => r.animeId)
  );

  const hits = topK.filter((r) => relevantIds.has(r.animeId)).length;
  return k === 0 ? 0 : hits / k;
}

// ==================== RECALL@K ====================
export function recallAtK(
  results: RankedResult[],
  relevant: RelevanceJudgment[],
  k: number,
  threshold = 1
): number {
  const topK = results.slice(0, k);
  const relevantIds = new Set(
    relevant.filter((r) => r.label >= threshold).map((r) => r.animeId)
  );

  if (relevantIds.size === 0) return 0;
  const hits = topK.filter((r) => relevantIds.has(r.animeId)).length;
  return hits / relevantIds.size;
}

// ==================== AVERAGE PRECISION (AP) ====================
export function averagePrecision(
  results: RankedResult[],
  relevant: RelevanceJudgment[],
  threshold = 1
): number {
  const relevantIds = new Set(
    relevant.filter((r) => r.label >= threshold).map((r) => r.animeId)
  );

  if (relevantIds.size === 0) return 0;

  let hits = 0;
  let sumPrecision = 0;

  for (let i = 0; i < results.length; i++) {
    if (relevantIds.has(results[i].animeId)) {
      hits++;
      sumPrecision += hits / (i + 1);
    }
  }

  return hits === 0 ? 0 : sumPrecision / relevantIds.size;
}

// ==================== MAP (Mean Average Precision) ====================
export function meanAveragePrecision(
  queries: Array<{ results: RankedResult[]; relevant: RelevanceJudgment[] }>,
  threshold = 1
): number {
  if (queries.length === 0) return 0;
  const aps = queries.map((q) => averagePrecision(q.results, q.relevant, threshold));
  return aps.reduce((a, b) => a + b, 0) / queries.length;
}

// ==================== MRR (Mean Reciprocal Rank) ====================
export function meanReciprocalRank(
  queries: Array<{ results: RankedResult[]; relevant: RelevanceJudgment[] }>,
  threshold = 1
): number {
  if (queries.length === 0) return 0;

  const rrs = queries.map(({ results, relevant }) => {
    const relevantIds = new Set(
      relevant.filter((r) => r.label >= threshold).map((r) => r.animeId)
    );

    const firstHitIndex = results.findIndex((r) => relevantIds.has(r.animeId));
    return firstHitIndex === -1 ? 0 : 1 / (firstHitIndex + 1);
  });

  return rrs.reduce((a, b) => a + b, 0) / queries.length;
}

// ==================== DCG ====================
export function dcg(
  results: RankedResult[],
  relevant: RelevanceJudgment[],
  k: number
): number {
  const judgeMap = new Map(relevant.map((r) => [r.animeId, r.label]));
  const topK = results.slice(0, k);

  return topK.reduce((sum, result, i) => {
    const rel = judgeMap.get(result.animeId) ?? 0;
    return sum + rel / Math.log2(i + 2); // log2(rank+1), rank is 1-indexed
  }, 0);
}

// ==================== IDCG (Ideal DCG) ====================
export function idealDcg(relevant: RelevanceJudgment[], k: number): number {
  const sortedLabels = relevant
    .map((r) => r.label)
    .sort((a, b) => b - a)
    .slice(0, k);

  return sortedLabels.reduce((sum, rel, i) => {
    return sum + rel / Math.log2(i + 2);
  }, 0);
}

// ==================== nDCG ====================
export function ndcg(
  results: RankedResult[],
  relevant: RelevanceJudgment[],
  k: number
): number {
  const dcgScore = dcg(results, relevant, k);
  const idcgScore = idealDcg(relevant, k);
  return idcgScore === 0 ? 0 : dcgScore / idcgScore;
}

// ==================== FULL EVALUATION REPORT ====================
export interface EvaluationReport {
  queryCount: number;
  precisionAt5: number;
  precisionAt10: number;
  recallAt5: number;
  recallAt10: number;
  map: number;
  mrr: number;
  dcgAt10: number;
  ndcgAt10: number;
}

export function computeEvaluationReport(
  queries: Array<{ results: RankedResult[]; relevant: RelevanceJudgment[] }>
): EvaluationReport {
  const avgMetric = (fn: (q: typeof queries[0]) => number) =>
    queries.length === 0 ? 0 : queries.map(fn).reduce((a, b) => a + b, 0) / queries.length;

  return {
    queryCount: queries.length,
    precisionAt5: avgMetric((q) => precisionAtK(q.results, q.relevant, 5)),
    precisionAt10: avgMetric((q) => precisionAtK(q.results, q.relevant, 10)),
    recallAt5: avgMetric((q) => recallAtK(q.results, q.relevant, 5)),
    recallAt10: avgMetric((q) => recallAtK(q.results, q.relevant, 10)),
    map: meanAveragePrecision(queries),
    mrr: meanReciprocalRank(queries),
    dcgAt10: avgMetric((q) => dcg(q.results, q.relevant, 10)),
    ndcgAt10: avgMetric((q) => ndcg(q.results, q.relevant, 10)),
  };
}
