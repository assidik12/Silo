# 🤝 Panduan Kontribusi Silo

Hai! Terima kasih udah tertarik buat ikutan *develop* **Silo**! 🌿 
Karena aplikasi ini dibangun dari keresahan bersama mahasiswa, kami terbuka banget buat kontribusi lo. Biar kolaborasi kita tetep rapi, *codebase* nggak *messy*, dan *review* PR-nya enak, tolong baca panduan di bawah ini dulu ya.

---

## 1. 🏗️ Arsitektur & Aturan Main

Sebelum mulai *coding*, lo **WAJIB** baca referensi arsitektur kita di:
👉 **[`docs/adr/0001-architecture-and-tech-stack.md`](docs/adr/0001-architecture-and-tech-stack.md)**

Kami menggunakan arsitektur **Feature-First**. Artinya:
- Jangan naruh komponen UI numpuk sembarangan di *root* `components/`. Masukkan ke dalam folder fitur yang sesuai (contoh: `components/tasks/`, `components/learning/`, dsb).
- *Core logic* dan integrasi (Supabase, Google API, AI) harus diletakkan di dalam folder `lib/`.
- Perhatikan **Row Level Security (RLS)** kalau lo bikin perubahan terkait skema *database* Supabase. Jangan sampai data mahasiswa A bisa dibaca mahasiswa B.

---

## 2. 🌱 Workflow Git & Branching

Kita pakai standar *branching* yang simpel aja:
- `main` : *Branch* stabil buat *production*.
- `dev` / `development` : *Branch* utama buat nampung fitur-fitur baru sebelum rilis.

**Cara Bikin Branch Baru:**
Format penamaan *branch* lo harus jelas biar ketahuan fungsinya apa:
- `feature/nama-fitur` ➡️ Buat fitur baru (contoh: `feature/global-leaderboard`)
- `fix/nama-bug` ➡️ Buat nge-*fix* bug (contoh: `fix/streak-not-resetting`)
- `docs/nama-dokumen` ➡️ Buat *update readme* atau ADR (contoh: `docs/update-api-spec`)
- `refactor/nama-refactor` ➡️ Buat *refactoring code* (contoh: `refactor/task-card-ui`)

---

## 3. ✍️ Aturan Commit Messages

Tolong gunakan standar **Conventional Commits** biar gampang di-*track* dan *generate changelog*:

- `feat:` (Fitur baru) ➡️ `feat(ui): add dark mode toggle in preferences`
- `fix:` (Perbaikan bug) ➡️ `fix(auth): resolve google login timeout`
- `refactor:` (Perubahan kode tanpa mengubah fungsi) ➡️ `refactor(tasks): extract pomodoro timer logic`
- `docs:` (Dokumentasi) ➡️ `docs(readme): add contribution guide`
- `chore:` (Update dependensi, *config*, dll) ➡️ `chore(deps): update framer-motion to latest`

---

## 4. 🚀 Cara Mengirimkan Pull Request (PR)

1. *Fork* repositori ini ke akun GitHub lo.
2. Buat *branch* baru dari `dev` (jangan dari `main`).
3. Gas *coding* fitur atau *fix* bug lo. Pastikan lo juga udah nulis/update tesnya di folder `__tests__/`.
4. Jalankan `npm run dev` dan pastikan nggak ada *error* di konsol.
5. Jalankan `npm test` untuk memastikan lo nggak ngerusak fitur lain (*zero regressions*).
6. *Commit* dan *push* kode lo ke repositori lo sendiri.
7. Buka *Pull Request* (PR) dari *branch* lo ke *branch* `dev` repositori Silo.
8. Kasih deskripsi PR yang jelas: apa yang lo ubah, alasan perubahannya, dan *screenshot* (kalau ada perubahan UI).

---

## 5. 🤖 AI & RAG Guidelines

Kalau fitur lo melibatkan *prompt* Gemini atau *Retrieval-Augmented Generation* (RAG):
- Pastikan mematuhi filter Cosine Similarity (cek di `lib/ai/guardrails.ts`) biar pertanyaan ngaco (di luar konteks kuliah) otomatis ke-blokir tanpa menghabiskan kuota token.
- Pastikan tes untuk fungsi AI di-mock. Jangan lakukan pemanggilan LLM *real* saat *testing*! (Baca `ai_rules/TESTING_RULES.md`).

---

*Made with love, anxiety, and a lot of caffeine. Happy hacking!* 🤎
