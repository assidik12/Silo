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

### 7. File Naming Convention

Untuk menjaga konsistensi dan *readability* di seluruh codebase, kami menerapkan aturan penamaan berkas berikut:

#### 7.1. Server Actions (`app/actions/`)
**Pattern:** `[domain].actions.ts`
| File | Deskripsi |
|---|---|
| `task.actions.ts` | CRUD & mutasi task |
| `blog.actions.ts` | CRUD & publish artikel blog |
| `user.actions.ts` | Profil & pengaturan user |
| `learning.actions.ts` | AI Learning Hub (SKS Mode, Binge-Watch) |
| `journal.actions.ts` | Journaling & AI Reflection |
| `feedback.actions.ts` | Feedback submission & milestone check |
| `calendar.actions.ts` | Google Calendar sync |
| `chatbot.actions.ts` | Neko AI Chatbot interactions |

#### 7.2. Components (`components/[feature]/`)
**Pattern:** `PascalCase.tsx` — setiap komponen menggunakan PascalCase sesuai nama komponen React-nya.
| Contoh | Penjelasan |
|---|---|
| `components/tasks/TaskCard.tsx` | Komponen kartu task |
| `components/tasks/TaskForm.tsx` | Formulir pembuatan/edit task |
| `components/admin/AdminSidebar.tsx` | Sidebar navigasi admin |
| `components/admin/BlogEditor.tsx` | Tiptap rich text editor wrapper |
| `components/blog/BlogCard.tsx` | Kartu artikel publik |
| `components/dashboard/Sidebar.tsx` | Sidebar utama dashboard |
| `components/profile/ProfileForm.tsx` | Formulir profil user |

**Pengecualian — `kebab-case.tsx`:** Khusus komponen kecil yang bersifat *atomic/utility* dalam satu fitur diizinkan menggunakan kebab-case (contoh existing: `journal-input.tsx`, `mental-energy-widget.tsx`). Namun untuk komponen baru, **PascalCase adalah standar utama**.

#### 7.3. Core Services / Library (`lib/`)
**Pattern:** `[nama-deskriptif].ts` dalam subfolder fitur.
| File | Deskripsi |
|---|---|
| `lib/ai/index.ts` | Entry point abstraksi multi-provider AI |
| `lib/ai/config.ts` | Konfigurasi model & provider AI |
| `lib/ai/guardrails.ts` | AI safety guardrails & validation |
| `lib/ai/journaling.ts` | AI logic khusus fitur journaling |
| `lib/google/calendar.ts` | Google Calendar API integration |
| `lib/supabase/limiter.ts` | Rate limiter untuk Supabase calls |
| `lib/utils.ts` | Utility functions umum (cn, dll.) |

#### 7.4. Utilities (`utils/`)
**Pattern:** `[nama-deskriptif].ts` — camelCase, mendeskripsikan fungsi utamanya.
| File | Deskripsi |
|---|---|
| `utils/gamification.ts` | Kalkulasi XP, level, dan streak |
| `utils/audio.ts` | Sound effect helpers |
| `utils/pdfParser.ts` | PDF parsing utility |
| `utils/wellness.ts` | Wellness/mental health helpers |
| `utils/supabase/client.ts` | Supabase client-side instance |
| `utils/supabase/server.ts` | Supabase server-side instance |
| `utils/supabase/middleware.ts` | Supabase auth middleware helper |

#### 7.5. Custom Hooks (`hooks/`)
**Pattern:** `use[NamaHook].ts` — mengikuti konvensi React hooks.
| File | Deskripsi |
|---|---|
| `hooks/useTasks.ts` | Hook untuk fetch & manage tasks |

#### 7.6. Type Definitions (`types/`)
**Pattern:** `[domain].ts` atau `index.ts` untuk tipe global.
| File | Deskripsi |
|---|---|
| `types/index.ts` | Tipe global: `Task`, `ActionResponse`, `UserProfile`, dll. |
| `types/blog.ts` | Tipe khusus fitur blog: `Post`, `PostStatus` |

#### 7.7. Tests (`__tests__/`)
**Pattern:** Subfolder mirror struktur utama (`actions/`, `components/`, `lib/`, `routes/`), dengan nama file mengikuti file yang diuji + `.test.ts(x)`.
```
__tests__/
├── actions/         # Test untuk server actions
├── components/      # Test untuk komponen UI
├── lib/             # Test untuk core services
└── routes/          # Test untuk route handlers / API
```

#### 7.8. Database Migrations (`supabase/migrations/`)
**Pattern:** `[YYYYMMDD][seq]_[deskripsi_snake_case].sql`
| File | Deskripsi |
|---|---|
| `00_schema.sql` | Skema awal database |
| `20260610000000_link_task_learning.sql` | Migrasi link task-learning |
| `20260702000000_create_posts_table.sql` | Migrasi tabel posts |

#### Ringkasan Cepat (Cheat Sheet)

| Modul | Pattern | Contoh |
|---|---|---|
| Server Actions | `[domain].actions.ts` | `task.actions.ts` |
| Components | `PascalCase.tsx` | `TaskCard.tsx` |
| Lib / Services | `[deskriptif].ts` | `guardrails.ts` |
| Utilities | `camelCase.ts` | `gamification.ts` |
| Hooks | `use[Nama].ts` | `useTasks.ts` |
| Types | `[domain].ts` | `blog.ts` |
| Tests | `[target].test.ts(x)` | `task.actions.test.ts` |
| Migrations | `[date]_[snake_case].sql` | `20260702000000_create_posts_table.sql` |

## Consequences
- **Positif:** Codebase lebih tahan banting terhadap limitasi *third-party API*, *user experience* terasa instan dan seperti *native app* berkat PWA, dan skalabilitas data terjamin lewat indeks dan RLS yang dioptimalkan.
- **Negatif:** Terdapat kompleksitas tambahan pada pemeliharaan *Service Worker* dan abstraksi penyedia AI yang perlu dipantau konfigurasinya (*environment keys*).
