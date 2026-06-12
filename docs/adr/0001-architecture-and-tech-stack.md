# ADR 0001: Architecture & Tech Stack

**Status:** Accepted  
**Date:** 2026-06-12 (Updated)

## Context & Problem
Aplikasi Silo (Gamified Productivity App) membutuhkan arsitektur yang kuat dan bisa di-*scale* untuk mendukung fitur *multi-role*, *gamification* (XP & Streak), RAG AI Learning Hub, dan interaksi *mobile-first*. Codebase sebelumnya kurang termodularisasi dengan baik dan menghadapi kendala batasan API (*rate limits*) serta masalah latensi.

## Decision

### 1. High-Level System Topology (Serverless 3-Tier)
Kami mengadopsi Serverless 3-Tier Architecture dengan Next.js (App Router) sebagai pusat orkestrasi:
- **Client Layer:** Next.js Web UI (Tailwind CSS, Lucide, Framer Motion), Optimistic UI (React `useOptimistic`), dan PWA Service Worker (via `@serwist/next`).
- **Computation Layer:** Server Actions (Mutations & State) dan API Router (Rate Limiter, Context Routing).
- **Data & AI Layer:** Supabase (PostgreSQL + RLS), Google APIs, dan **Hybrid AI Engine** (Gemini & Groq/Llama).

### 2. Feature-First Folder Structure
Untuk mencegah *monolith component folder*, struktur folder berbasis *Feature-First*:
- `app/`: Next.js Routing Layer (termasuk Server Actions di `app/actions/`).
- `components/`: UI Components yang dikelompokkan berdasarkan fitur (`learning/`, `tasks/`, `profile/`, dll.).
- `lib/`: Core Services (Infrastruktur) seperti `lib/ai/`, `lib/google/`, dan `lib/supabase/`.

### 3. Core Tech Stack
- **Frontend & Framework**: Next.js 14/15 (App Router, Turbopack) + React 19
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Database & Auth**: Supabase (PostgreSQL, pgvector, Google OAuth)
- **PWA**: Serwist (`@serwist/next`) untuk *Offline Caching* & *Web Push API* (Streak Reminder).

### 4. Hybrid AI Architecture & Caching
Sistem AI telah diabstraksi (`lib/ai/index.ts`) untuk mendukung *multi-provider*:
- **Deterministic AI (Gemini)**: Digunakan untuk fitur berbasis dokumen (SKS Mode, Binge-Watch). Dilengkapi dengan **Caching Layer** (tabel `ai_cache`) menggunakan *SHA-256 Hashing* untuk memintas *rate limits* secara drastis untuk dokumen yang identik.
- **Fast-Inference AI (Groq - Llama 3.1)**: Digunakan untuk fitur *conversational* instan (Neko AI Assistant, Task Breakdown, Journaling) untuk latensi seminimal mungkin.

### 5. Optimistic UI & Performance
- **Optimistic Updates**: Penggunaan *hook* `useOptimistic` untuk *Task Completion* menghasilkan ilusi latensi nol milidetik bagi *user*, memisahkan *feedback* visual dengan mutasi *database*.
- **Database Indexing**: Penggunaan indeks pada kolom krusial (`user_id`, `scheduled_time`, dll.) untuk mencegah *Sequential Scan* dan memastikan *query* pada halaman *Dashboard* dimuat stabil < 1 detik.

### 6. Security Guardrails
Kami menerapkan **Row Level Security (RLS)** super ketat di sisi Supabase untuk seluruh tabel (terutama `tasks` dan `journal_entries`) untuk memastikan isolasi data *user*.

## Consequences
- **Positif:** Codebase lebih tahan banting terhadap limitasi *third-party API*, *user experience* terasa instan dan seperti *native app* berkat PWA, dan skalabilitas data terjamin lewat indeks dan RLS yang dioptimalkan.
- **Negatif:** Terdapat kompleksitas tambahan pada pemeliharaan *Service Worker* dan abstraksi penyedia AI yang perlu dipantau konfigurasinya (*environment keys*).
