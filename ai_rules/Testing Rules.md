# **🧪 DoJo Testing Rules & Standards**

Dokumen ini mendefinisikan standar pembuatan testing untuk DoJo guna memastikan reliabilitas fitur gamifikasi, keamanan autentikasi, dan stabilitas integrasi AI.

## **1\. Tooling & Environment**

* **Framework:** Jest (Unit & Integration) \+ React Testing Library (Component).  
* **E2E:** Playwright (untuk alur kritis seperti Login & Folder Mode).  
* **Mocking:** \- Gunakan jest.mock untuk modul eksternal (@supabase/ssr, google-auth-library).  
  * **WAJIB:** Mocking Gemini API. Dilarang melakukan real-call ke LLM saat testing untuk menghemat token.

## **2\. Struktur & Penamaan**

* File tes harus diletakkan di folder `__tests__` yang relevan dengan lokasi kodenya, dan wajib mencerminkan struktur *Feature-First* sesuai dengan referensi arsitektur `docs/adr/0001-architecture-and-tech-stack.md`.
* **Contoh:**  
  * `utils/gamification.ts` ➡️ `__tests__/gamification.test.ts`  
  * `components/tasks/TaskCard.tsx` ➡️ `components/tasks/TaskCard.test.tsx`

## **3\. Aturan Berdasarkan Kategori**

### **A. Logic & Utility Testing (Prioritas Tinggi)**

Semua fungsi kalkulasi harus memiliki cakupan tes 100%.

* **XP Calculator:** Tes semua skenario (Early bird, Clutch, Late, Abandoned).  
* **Streak Logic:** Tes transisi hari, reset streak, dan streak protection.  
* **Path:** Referensi file utils/gamification.ts.

### **B. Server Actions Testing**

* Pastikan setiap Server Action divalidasi status autentikasinya.  
* Gunakan *mocking* untuk response Supabase (success & error cases).  
* Tes *return object* harus konsisten: { success: boolean, data?: any, error?: string }.

### **C. Component & UI Testing**

* Fokus pada interaksi user, bukan sekadar render.  
* **Skenario Wajib:**  
  * Klik "Done" memicu animasi dan penambahan XP.  
  * Input URL Drive yang tidak valid memicu pesan error (Toast).  
  * Loading states saat AI sedang memproses data.

### **D. AI & RAG Testing (Mocked)**

* Karena output LLM bersifat *non-deterministic*, tes fokus pada:  
  * Apakah *prompt* yang dikirim sudah mengandung konteks yang benar.  
  * Apakah aplikasi bisa menangani berbagai format JSON dari LLM (termasuk jika JSON-nya rusak).

## **4\. Kriteria Kelulusan (Definition of Done)**

1. **Zero Regressions:** Fitur lama tidak boleh rusak karena fitur baru.  
2. **Edge Case Handling:** Tes harus mencakup input kosong, token expired, dan network timeout.  
3. **TypeScript Compliance:** File tes tidak boleh memiliki error any atau unknown. Gunakan *interface* yang sama dengan kode produksi.

## **5\. Perintah Eksekusi**

* npm test : Menjalankan semua unit tests.  
* npm run test:watch : Mode pengembangan.  
* npm run test:coverage : Melihat laporan cakupan kode.

## **🤖 Prompt untuk AI (Writing Tests)**

Gunakan prompt ini jika ingin meminta AI membuatkan tes untuk fitur baru:

*"Berdasarkan file `TESTING_RULES.md` dan struktur `docs/adr/0001-architecture-and-tech-stack.md`, buatkan unit test lengkap menggunakan Jest untuk file [path_file]. Pastikan lokasi dan struktur tesnya mengikuti arsitektur Feature-First, mencakup skenario sukses, skenario error, dan mock semua dependensi eksternal seperti Supabase atau API lainnya. Gunakan TypeScript yang ketat."*