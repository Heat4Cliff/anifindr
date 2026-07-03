# Anime IR Enterprise

Paket dokumen ultimate untuk sistem web information retrieval anime berbasis Next.js, PostgreSQL, Prisma, Docker, dan Cloudflare Tunnel.

## Isi paket

- 01_PRD.md
- 02_SDD.md
- 03_DDD.md
- 04_UI_UX.md
- 05_API_SPEC.md
- 06_SECURITY.md
- 07_DEVOPS_DEPLOYMENT.md
- 08_IR_EVALUATION.md
- 09_DATABASE_SCHEMA.md
- 10_ROADMAP.md
- deployment/docker-compose.yml
- deployment/.env.example
- infra/cloudflared-config.yml
- infra/cloudflared-tunnel.example.yml

## Ringkasan arsitektur

- Frontend dan fullstack app: Next.js App Router
- Styling: Tailwind CSS + design system components + motion animation
- Database: PostgreSQL
- ORM: Prisma
- Data source: Jikan API
- Search: hybrid retrieval, TF-IDF baseline + semantic ranking + re-ranking
- Deployment: Debian Server via Docker Compose
- Public access: Cloudflare Tunnel untuk frontend domain sendiri

## Catatan implementasi

Dokumen ini disusun untuk kebutuhan tugas akhir Information Retrieval. Fokus utama ada pada:
- indexing
- ranking
- evaluation
- relevance judgment
- experiment tracking

Bukan hanya pada UI katalog anime.
