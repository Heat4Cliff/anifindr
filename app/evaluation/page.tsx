"use client";

import { useState, useEffect } from "react";
import { BarChart2, Plus, Play, Loader2, ChevronDown, ChevronUp, Info } from "lucide-react";
import { computeEvaluationReport, type EvaluationReport, type RankedResult, type RelevanceJudgment } from "@/lib/evaluation/metrics";

interface Judgment {
  queryText: string;
  animeId: string;
  animeTitle: string;
  label: number;
}

interface QueryResult {
  animeId: string;
  title: string;
  rank: number;
}

interface RunResult {
  query: string;
  mode: string;
  results: QueryResult[];
  judgments: Judgment[];
}

function MetricCard({ label, value, tooltip, color = "var(--accent-primary)" }: { label: string; value: number | string; tooltip?: string; color?: string }) {
  return (
    <div className="glass" style={{ borderRadius: "var(--radius)", padding: "1.25rem", textAlign: "center", position: "relative" }}>
      <div style={{ fontSize: "2rem", fontWeight: 800, color, fontFamily: "'Outfit', sans-serif" }}>
        {typeof value === "number" ? value.toFixed(4) : value}
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem", fontWeight: 600 }}>{label}</div>
      {tooltip && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{tooltip}</div>}
    </div>
  );
}

export default function EvaluationPage() {
  const [queries, setQueries] = useState<string[]>(["naruto", "romance school life", "dark fantasy"]);
  const [newQuery, setNewQuery] = useState("");
  const [mode, setMode] = useState<"tfidf" | "hybrid">("hybrid");
  const [k, setK] = useState(10);
  const [running, setRunning] = useState(false);
  const [runResults, setRunResults] = useState<RunResult[]>([]);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null);
  const [judgments, setJudgments] = useState<Record<string, number>>({});

  async function runEvaluation() {
    setRunning(true);
    setRunResults([]);
    setReport(null);

    const allRuns: RunResult[] = [];

    for (const q of queries) {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&mode=${mode}&limit=${k}`);
        const data = await res.json();
        if (data.success && data.data) {
          const results: QueryResult[] = data.data.map((r: { id: string; title: string }, i: number) => ({
            animeId: r.id,
            title: r.title,
            rank: i + 1,
          }));
          allRuns.push({ query: q, mode, results, judgments: [] });
        }
      } catch (e) {
        console.error(e);
      }
      // Small delay to avoid hammering
      await new Promise((r) => setTimeout(r, 100));
    }

    setRunResults(allRuns);
    setRunning(false);
  }

  function computeReport() {
    if (runResults.length === 0) return;

    const evalQueries = runResults.map((run) => {
      const relevant: RelevanceJudgment[] = run.results.map((r) => ({
        animeId: r.animeId,
        label: judgments[`${run.query}::${r.animeId}`] ?? 0,
      }));
      const results: RankedResult[] = run.results.map((r) => ({
        animeId: r.animeId,
        rank: r.rank,
      }));
      return { results, relevant };
    });

    const r = computeEvaluationReport(evalQueries);
    setReport(r);
  }

  const allAnimeForJudgment = runResults.flatMap((run) =>
    run.results.map((r) => ({ query: run.query, animeId: r.animeId, title: r.title }))
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "2rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <BarChart2 size={28} style={{ color: "var(--accent-primary)" }} />
          Dashboard Evaluasi IR
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Ukur kualitas sistem pencarian dengan metrik Precision, Recall, MAP, MRR, dan nDCG
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Config Panel */}
        <div className="glass" style={{ borderRadius: "var(--radius)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1rem" }}>Konfigurasi Evaluasi</h2>

          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem", fontWeight: 600 }}>MODE</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as "tfidf" | "hybrid")}
              id="eval-mode"
              style={{ width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", padding: "0.5rem 0.75rem" }}>
              <option value="hybrid">Hybrid</option>
              <option value="tfidf">TF-IDF Only</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem", fontWeight: 600 }}>K (TOP-K)</label>
            <input id="eval-k" type="number" min={1} max={50} value={k} onChange={(e) => setK(parseInt(e.target.value))}
              style={{ width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", padding: "0.5rem 0.75rem" }} />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem", fontWeight: 600 }}>QUERY UJI</label>
            {queries.map((q, i) => (
              <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.35rem" }}>
                <span style={{
                  flex: 1, background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", padding: "0.4rem 0.75rem", fontSize: "0.8rem", color: "var(--text-secondary)",
                }}>
                  {q}
                </span>
                <button onClick={() => setQueries(queries.filter((_, j) => j !== i))}
                  style={{ background: "transparent", border: "none", color: "var(--accent-hot)", cursor: "pointer", padding: "0.4rem" }}>
                  ✕
                </button>
              </div>
            ))}
            <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
              <input id="new-query-input" value={newQuery} onChange={(e) => setNewQuery(e.target.value)}
                placeholder="Tambah query..." onKeyDown={(e) => {
                  if (e.key === "Enter" && newQuery.trim()) {
                    setQueries([...queries, newQuery.trim()]);
                    setNewQuery("");
                  }
                }}
                style={{ flex: 1, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", padding: "0.4rem 0.75rem", fontSize: "0.8rem" }} />
              <button id="add-query-btn" onClick={() => { if (newQuery.trim()) { setQueries([...queries, newQuery.trim()]); setNewQuery(""); } }}
                style={{ background: "var(--accent-primary)", border: "none", borderRadius: "var(--radius-sm)", color: "#fff", padding: "0.4rem 0.75rem", cursor: "pointer" }}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button id="run-eval-btn" onClick={runEvaluation} disabled={running || queries.length === 0}
            style={{
              background: running ? "var(--bg-elevated)" : "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              border: "none", borderRadius: "var(--radius-sm)", color: "#fff", padding: "0.75rem",
              fontWeight: 700, cursor: running ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              opacity: running ? 0.7 : 1,
            }}>
            {running ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Menjalankan...</> : <><Play size={15} /> Jalankan Evaluasi</>}
          </button>
        </div>

        {/* Metrics Panel */}
        <div>
          {report ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>
                  Hasil Metrik ({mode.toUpperCase()}, Top-{k})
                </h2>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{report.queryCount} query</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1rem" }}>
                <MetricCard label="Precision@5" value={report.precisionAt5} color="var(--accent-primary)" tooltip="P@5" />
                <MetricCard label="Precision@10" value={report.precisionAt10} color="var(--accent-primary)" tooltip="P@10" />
                <MetricCard label="Recall@5" value={report.recallAt5} color="var(--accent-secondary)" tooltip="R@5" />
                <MetricCard label="Recall@10" value={report.recallAt10} color="var(--accent-secondary)" tooltip="R@10" />
                <MetricCard label="MAP" value={report.map} color="var(--accent-teal)" tooltip="Mean Avg Precision" />
                <MetricCard label="MRR" value={report.mrr} color="var(--accent-gold)" tooltip="Mean Reciprocal Rank" />
                <MetricCard label="DCG@10" value={report.dcgAt10} color="var(--accent-hot)" tooltip="Discounted CG" />
                <MetricCard label="nDCG@10" value={report.ndcgAt10} color="#4ade80" tooltip="Normalized DCG" />
              </div>

              <div className="glass" style={{ borderRadius: "var(--radius)", padding: "1rem", background: "rgba(99,102,241,0.05)" }}>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "flex-start" }}>
                  <Info size={15} style={{ color: "var(--accent-primary)", marginTop: 2 }} />
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Metrik dihitung berdasarkan label relevansi yang Anda berikan di bawah (0=tidak relevan, 1=sedikit, 2=relevan, 3=sangat relevan).
                    Untuk hasil akurat, berikan judgment pada semua anime di setiap query lalu tekan &ldquo;Hitung Metrik&rdquo;.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass" style={{ borderRadius: "var(--radius)", padding: "3rem 2rem", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              <BarChart2 size={48} style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Jalankan evaluasi untuk melihat metrik</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Hasil evaluasi akan tampil di sini setelah Anda memberikan relevance judgment
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Relevance Judgment Table */}
      {runResults.length > 0 && (
        <div className="glass" style={{ borderRadius: "var(--radius)", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>
              Relevance Judgment
            </h2>
            <button id="compute-metrics-btn" onClick={computeReport}
              style={{
                background: "linear-gradient(135deg, var(--accent-teal), var(--accent-primary))",
                border: "none", borderRadius: "var(--radius-sm)", color: "#fff",
                padding: "0.5rem 1rem", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem",
              }}>
              Hitung Metrik
            </button>
          </div>

          {runResults.map((run) => (
            <div key={run.query} style={{ marginBottom: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
              <button
                onClick={() => setExpandedQuery(expandedQuery === run.query ? null : run.query)}
                style={{
                  width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "0.75rem 1rem", background: "var(--bg-elevated)", border: "none",
                  cursor: "pointer", color: "var(--text-primary)", fontWeight: 700, fontSize: "0.9rem",
                }}
              >
                <span>Query: &ldquo;{run.query}&rdquo; ({run.results.length} hasil)</span>
                {expandedQuery === run.query ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedQuery === run.query && (
                <div style={{ padding: "0.75rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                    Beri label relevansi: 0=Tidak relevan, 1=Sedikit, 2=Relevan, 3=Sangat relevan
                  </p>
                  {run.results.map((r) => {
                    const key = `${run.query}::${r.animeId}`;
                    return (
                      <div key={r.animeId} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", minWidth: 24 }}>#{r.rank}</span>
                        <span style={{ flex: 1, fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</span>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          {[0, 1, 2, 3].map((label) => (
                            <button
                              key={label}
                              onClick={() => setJudgments({ ...judgments, [key]: label })}
                              style={{
                                width: 28, height: 28, borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border)",
                                background: judgments[key] === label ? "var(--accent-primary)" : "var(--bg-elevated)",
                                color: judgments[key] === label ? "#fff" : "var(--text-muted)",
                                cursor: "pointer", fontSize: "0.75rem", fontWeight: 700,
                              }}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 2fr"] { grid-template-columns: 1fr !important; }
          div[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
