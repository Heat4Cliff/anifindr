import Image from "next/image";
import { Server, Zap, Database, Search, Code, Layout } from "lucide-react";

export const metadata = {
  title: "Tentang Kami",
  description: "Pelajari lebih lanjut tentang sistem Information Retrieval dan teknologi di balik AniFindr.",
};

export default function AboutPage() {
  const technologies = [
    {
      name: "Information Retrieval (TF-IDF)",
      description: "Mesin pencari inti kami menggunakan algoritma Term Frequency-Inverse Document Frequency untuk menganalisis dan mencocokkan kata kunci pencarian Anda dengan sinopsis, judul, dan genre anime secara akurat.",
      icon: <Search size={24} className="text-teal-600" style={{ color: "var(--accent-primary)" }} />,
    },
    {
      name: "Next.js 15 (App Router)",
      description: "Dibangun dengan framework React modern Next.js 15 yang memanfaatkan App Router dan Server Components untuk memastikan rendering yang sangat cepat dan optimasi SEO terbaik.",
      icon: <Server size={24} className="text-teal-600" style={{ color: "var(--accent-primary)" }} />,
    },
    {
      name: "Prisma ORM",
      description: "Manajemen database modern yang *type-safe* menggunakan Prisma untuk memproses ribuan data anime dengan struktur relasional yang kompleks secara efisien.",
      icon: <Database size={24} className="text-teal-600" style={{ color: "var(--accent-primary)" }} />,
    },
    {
      name: "TypeScript",
      description: "Pengembangan *end-to-end* yang kuat dan meminimalisir *runtime error* berkat penggunaan *static typing* dari TypeScript.",
      icon: <Code size={24} className="text-teal-600" style={{ color: "var(--accent-primary)" }} />,
    },
    {
      name: "Tailwind CSS & Glassmorphism",
      description: "Desain antarmuka (UI) dibangun dengan utilitas CSS modern serta efek *glassmorphism* untuk memberikan estetika web aplikasi kekinian yang responsif dan elegan.",
      icon: <Layout size={24} className="text-teal-600" style={{ color: "var(--accent-primary)" }} />,
    },
    {
      name: "AniList GraphQL API",
      description: "Sumber data anime di sinkronisasikan secara *real-time* dari AniList menggunakan GraphQL untuk menjaga direktori kami agar selalu *up-to-date*.",
      icon: <Zap size={24} className="text-teal-600" style={{ color: "var(--accent-primary)" }} />,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: "4rem 1.5rem", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
          <Image
            src="/logo.png"
            alt="AniFindr Logo Besar"
            width={120}
            height={120}
            style={{ objectFit: "contain", filter: "drop-shadow(0 10px 15px rgba(13,148,136,0.2))" }}
          />
        </div>
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 900,
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          color: "var(--text-primary)",
          marginBottom: "1rem"
        }}>
          Tentang <span className="gradient-text">AniFindr</span>
        </h1>
        <p style={{
          fontSize: "1.1rem",
          color: "var(--text-secondary)",
          maxWidth: 600,
          margin: "0 auto",
          lineHeight: 1.7,
        }}>
          AniFindr adalah proyek sistem temu kembali informasi (Information Retrieval) yang dirancang khusus untuk mempermudah penggemar anime mencari tontonan berdasarkan relevansi konteks sinopsis, judul, maupun genre dengan menggunakan metode komputasi teks modern.
        </p>
      </div>

      <div style={{ marginBottom: "4rem" }}>
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "2rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "2rem",
          textAlign: "center"
        }}>
          Teknologi di Balik Layar
        </h2>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem"
        }}>
          {technologies.map((tech, idx) => (
            <div key={idx} className="glass card-hover" style={{
              padding: "2rem",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "var(--radius)",
                background: "rgba(13,148,136,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {tech.icon}
              </div>
              <h3 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--text-primary)"
              }}>
                {tech.name}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass" style={{
        padding: "3rem 2rem",
        borderRadius: "var(--radius-lg)",
        textAlign: "center",
        background: "linear-gradient(135deg, rgba(248,250,252,0.9), rgba(255,255,255,0.9))",
        border: "1px solid var(--border-focus)",
      }}>
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "1.75rem",
          fontWeight: 800,
          color: "var(--text-primary)",
          marginBottom: "1rem"
        }}>
          Siap Mencari Anime?
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: 500, margin: "0 auto 2rem" }}>
          Mulai ketikkan judul, genre, atau sinopsis anime yang Anda ingat, dan biarkan algoritma Information Retrieval kami mencarikannya untuk Anda!
        </p>
        <a href="/search" className="card-hover" style={{
          display: "inline-flex",
          background: "var(--accent-primary)",
          color: "#fff",
          padding: "0.75rem 2rem",
          borderRadius: "var(--radius-sm)",
          fontWeight: 700,
          textDecoration: "none",
        }}>
          Mulai Pencarian
        </a>
      </div>
    </div>
  );
}
