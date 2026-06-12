# ADR 0001: Architecture & Tech Stack

**Status:** Accepted  
**Date:** 2026-06-06  

## Context & Problem
Aplikasi Silo (Gamified Productivity App) membutuhkan arsitektur yang kuat dan bisa di-*scale* untuk mendukung fitur *multi-role* (student, lecturer), *gamification* (XP & Streak), sinkronisasi kalender, serta sistem *Retrieval-Augmented Generation* (RAG) untuk AI Learning Hub (SKS Mode). Codebase sebelumnya mencampuradukkan *layering* dan sulit dimaintain.

## Decision

### 1. High-Level System Topology (Serverless 3-Tier)
Kami mengadopsi Serverless 3-Tier Architecture dengan Next.js 14 sebagai pusat orkestrasi:
- **Client Layer:** Next.js Web UI (Tailwind CSS, Lucide Icons, Framer Motion) dan Google Calendar Widget.
- **Computation Layer:** Next.js App Router (Renders Canvas), Server Actions (Mutations & State), dan API Router (Rate Limiter, Context Routing).
- **Data & LLM Layer:** Supabase (PostgreSQL + RLS), Google APIs (Drive, GCal, Picker), dan AI Engine (Gemini API, Vector RAG Layer).

### 2. Feature-First Folder Structure
Untuk mencegah *monolith component folder*, struktur folder diubah menjadi *Feature-First*:
- `app/`: Next.js Routing Layer (termasuk Server Actions di `app/actions/`).
- `components/`: UI Components yang dikelompokkan berdasarkan fitur (`learning/`, `tasks/`, `profile/`, `dashboard/`, `shared/`, dll.).
- `lib/`: Core Services (Infrastruktur) seperti `lib/ai/`, `lib/google/`, dan `lib/supabase/`.
- `utils/`: Pure helper functions seperti `gamification.ts`.

### 3. Core Tech Stack
- **Frontend & Framework**: Next.js 14 (App Router) + React
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Database & Auth**: Supabase (PostgreSQL, pgvector, Google OAuth)
- **External API**: Google Calendar API & Google Drive Picker API

### 4. Database & Vector Search
- Penggunaan **pgvector** di PostgreSQL untuk mendukung *similarity search* menggunakan *Cosine Similarity* pada modul mata kuliah (RAG).
- Multi-tenancy & Social Loop difasilitasi dengan relasi tabel `profiles`, `squads`, dan `squad_members`.

### 5. Security Guardrails
Kami menerapkan **Row Level Security (RLS)** ketat di sisi Supabase untuk mengamankan data *journal entries* dan *squads* masing-masing *user*, menghindari bocornya data antar mahasiswa.

## Consequences
- **Positif:** Codebase lebih modular, mudah dipahami *onboarding developer*, batas antara UI dan Logic lebih jelas, keamanan data terjamin.
- **Negatif:** Proses *refactoring* awal membutuhkan waktu dan pemindahan/pengelompokan *file*. Komponen *shared* harus ditaruh di `components/shared/` untuk mencegah sirkular dependensi.
