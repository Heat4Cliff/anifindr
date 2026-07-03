"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw, Database, Loader2, CheckCircle, XCircle,
  AlertTriangle, Clock, Activity, BarChart2, Play, LogOut
} from "lucide-react";

interface Job {
  id: string;
  source: string;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  itemsDone: number | null;
  itemsTotal: number | null;
  message: string | null;
  createdAt: string;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "SUCCESS") return <CheckCircle size={16} style={{ color: "#4ade80" }} />;
  if (status === "FAILED") return <XCircle size={16} style={{ color: "var(--accent-hot)" }} />;
  if (status === "RUNNING") return <Loader2 size={16} style={{ color: "var(--accent-primary)", animation: "spin 1s linear infinite" }} />;
  return <Clock size={16} style={{ color: "var(--text-muted)" }} />;
}

export default function AdminPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [syncSource, setSyncSource] = useState("top");
  const [syncPages, setSyncPages] = useState(4);
  const [dbStats, setDbStats] = useState<{ anime: number; genres: number; studios: number; queries: number } | null>(null);

  async function loadJobs() {
    setLoading(true);
    const res = await fetch("/api/admin/jobs").then(r => r.json()).catch(() => null);
    if (res?.data) setJobs(res.data);
    setLoading(false);
  }

  async function loadStats() {
    const res = await fetch("/api/admin/stats").then(r => r.json()).catch(() => null);
    if (res?.data) setDbStats(res.data);
  }

  async function triggerSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: syncSource, maxPages: syncPages }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncResult(`✅ Berhasil! ${data.data.itemsDone} anime disimpan dari ${data.data.itemsTotal} data.`);
        loadJobs();
        loadStats();
      } else {
        setSyncResult(`❌ Gagal: ${data.error?.message ?? "Unknown error"}`);
      }
    } catch (e) {
      setSyncResult(`❌ Error: ${String(e)}`);
    } finally {
      setSyncing(false);
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadJobs();
    loadStats();
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "2rem", marginBottom: "0.5rem" }}>
            Admin Panel
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Kelola data, sinkronisasi AniList GraphQL API, dan pantau sistem</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--text-secondary)", padding: "0.5rem 1rem",
            borderRadius: "var(--radius-sm)", cursor: "pointer",
            fontSize: "0.85rem", transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f43f5e"; e.currentTarget.style.borderColor = "rgba(244,63,94,0.5)" }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border)" }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* DB Stats */}
      {dbStats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Anime", value: dbStats.anime, color: "var(--accent-primary)" },
            { label: "Genre", value: dbStats.genres, color: "var(--accent-secondary)" },
            { label: "Studio", value: dbStats.studios, color: "var(--accent-teal)" },
            { label: "Query Log", value: dbStats.queries, color: "var(--accent-gold)" },
          ].map((s) => (
            <div key={s.label} className="glass" style={{ borderRadius: "var(--radius)", padding: "1.25rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: s.color, fontFamily: "'Outfit', sans-serif" }}>
                {s.value.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Sync Panel */}
        <div className="glass" style={{ borderRadius: "var(--radius)", padding: "1.5rem" }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Database size={18} style={{ color: "var(--accent-primary)" }} />
            Sinkronisasi Data AniList GraphQL
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block", fontWeight: 600 }}>SUMBER DATA</label>
              <select
                id="sync-source"
                value={syncSource}
                onChange={(e) => setSyncSource(e.target.value)}
                style={{
                  width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", color: "var(--text-primary)", padding: "0.5rem 0.75rem",
                }}
              >
                <option value="top">Top Anime (populer)</option>
                <option value="current">Sedang Tayang (musim ini)</option>
                <option value="seasonal">Seasonal Anime</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block", fontWeight: 600 }}>
                JUMLAH HALAMAN (30 anime/halaman)
              </label>
              <input
                id="sync-pages"
                type="number"
                min={1}
                max={10}
                value={syncPages}
                onChange={(e) => setSyncPages(parseInt(e.target.value))}
                style={{
                  width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", color: "var(--text-primary)", padding: "0.5rem 0.75rem",
                }}
              />
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {syncPages} halaman ≈ {syncPages * 30} anime | Estimasi ~{Math.round(syncPages * 30 * 0.4 / 60)} menit
              </p>
            </div>

            <button
              id="sync-btn"
              onClick={triggerSync}
              disabled={syncing}
              style={{
                background: syncing ? "var(--bg-elevated)" : "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                border: "none", borderRadius: "var(--radius-sm)", color: "#fff",
                padding: "0.75rem", fontWeight: 700, cursor: syncing ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                opacity: syncing ? 0.7 : 1,
              }}
            >
              {syncing ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Menyinkronkan...</>
              ) : (
                <><Play size={16} /> Mulai Sinkronisasi</>
              )}
            </button>

            {syncResult && (
              <div style={{
                background: syncResult.startsWith("✅") ? "rgba(74,222,128,0.1)" : "rgba(244,63,94,0.1)",
                border: `1px solid ${syncResult.startsWith("✅") ? "rgba(74,222,128,0.3)" : "rgba(244,63,94,0.3)"}`,
                borderRadius: "var(--radius-sm)", padding: "0.75rem", fontSize: "0.875rem",
                color: syncResult.startsWith("✅") ? "#4ade80" : "var(--accent-hot)",
              }}>
                {syncResult}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="glass" style={{ borderRadius: "var(--radius)", padding: "1.5rem" }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Activity size={18} style={{ color: "var(--accent-teal)" }} />
              Navigasi Cepat
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { href: "/", label: "→ Buka Homepage" },
                { href: "/search", label: "→ Cari Anime" },
                { href: "/evaluation", label: "→ Dashboard Evaluasi IR" },
                { href: "/api/anime?limit=5", label: "→ API: /api/anime" },
                { href: "/api/genres", label: "→ API: /api/genres" },
                { href: "/api/admin/jobs", label: "→ API: /api/admin/jobs" },
              ].map((item) => (
                <a key={item.href} href={item.href} target={item.href.startsWith("/api") ? "_blank" : undefined}
                  style={{ color: "var(--accent-primary)", fontSize: "0.875rem", textDecoration: "none" }}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="glass" style={{ borderRadius: "var(--radius)", padding: "1.25rem", background: "rgba(244,63,94,0.05)", borderColor: "rgba(244,63,94,0.15)" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
              <AlertTriangle size={16} style={{ color: "var(--accent-hot)", marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.25rem" }}>Catatan</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Sinkronisasi dengan banyak halaman bisa memakan waktu beberapa menit. AniList GraphQL API memiliki rate limit 90 req/menit.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="glass" style={{ borderRadius: "var(--radius)", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BarChart2 size={18} style={{ color: "var(--accent-gold)" }} />
            Riwayat Sinkronisasi
          </h2>
          <button onClick={loadJobs} style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", color: "var(--text-secondary)",
            padding: "0.4rem 0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem",
          }}>
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            <Loader2 size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : jobs.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>Belum ada job yang dijalankan</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Status", "Sumber", "Progres", "Pesan", "Waktu"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <StatusIcon status={job.status} />
                        <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{job.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>{job.source}</td>
                    <td style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>
                      {job.itemsDone ?? 0}/{job.itemsTotal ?? "?"}
                    </td>
                    <td style={{ padding: "0.75rem", color: "var(--text-muted)", maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {job.message ?? "-"}
                    </td>
                    <td style={{ padding: "0.75rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      {new Date(job.createdAt).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
