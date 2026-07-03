"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, LogIn } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/admin");
        router.refresh(); // Force refresh to update layouts
      } else {
        setError(data.error || "Login gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 150px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="glass fade-in-up" style={{
        width: "100%",
        maxWidth: 400,
        padding: "2rem",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(99,102,241,0.15)", color: "var(--accent-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem"
          }}>
            <Lock size={24} />
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "1.5rem" }}>Admin Area</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Silakan login untuk mengakses fitur administrator
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(244,63,94,0.15)",
            border: "1px solid rgba(244,63,94,0.3)",
            color: "#fb7185", padding: "0.75rem", borderRadius: "var(--radius-sm)",
            fontSize: "0.85rem", marginBottom: "1.25rem", textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              Username
            </label>
            <div style={{ position: "relative" }}>
              <User size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
                style={{
                  width: "100%", padding: "0.75rem 1rem 0.75rem 2.75rem",
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
                  outline: "none", fontSize: "0.9rem"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent-primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%", padding: "0.75rem 1rem 0.75rem 2.75rem",
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
                  outline: "none", fontSize: "0.9rem"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent-primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem", width: "100%", padding: "0.85rem",
              background: "var(--accent-primary)", color: "#fff",
              border: "none", borderRadius: "var(--radius-sm)",
              fontWeight: 600, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              opacity: loading ? 0.7 : 1, transition: "background 0.2s ease"
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--accent-secondary)" }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "var(--accent-primary)" }}
          >
            {loading ? "Memproses..." : <><LogIn size={18} /> Masuk</>}
          </button>
        </form>
      </div>
    </div>
  );
}
