# Konvensi & Pedoman Pengembangan ASKI (Audit Sistem Kearsipan Internal) Kotabaru

## 1. Domain & Konteks Bisnis
- **Aplikasi:** Sistem Informasi Audit Sistem Kearsipan Internal (ASKI) Kabupaten Kotabaru.
- **Objek Audit:** 22 Kecamatan di Kabupaten Kotabaru, terbagi dalam 2 Unit:
  1. **UP (Unit Pengolah)** - Seksi/Subbag operasional di kecamatan.
  2. **UK (Unit Kearsipan)** - Sekretariat / Pengelola arsip induk kecamatan.
- **Fitur Kunci:**
  - Dynamic Form Builder dengan **Conditional Branching / Logic Engine** (jika soal A dijawab opsi tertentu/tidak, soal B dinonaktifkan).
  - Skala Skor Bertingkat (Opsi a - e, Level 0 - 5, Skor 0 - 100).
  - Evidence Upload (Bukti Dukung dokumen/foto/link sesuai Definisi Operasional & Dasar Hukum SKKAAD).
  - Rekapitulasi Otomatis Nilai ASKI 22 Kecamatan, Klasifikasi Predikat, dan Ekspor LHKK (PDF/Excel).

## 2. Tech Stack (TanStack Suite)
- **Framework:** React 18+ dengan TypeScript dan Vite.
- **Routing:** `@tanstack/react-router` (Type-safe router).
- **Data Fetching & Cache:** `@tanstack/react-query` (TanStack Query).
- **Tabel & Rekapitulasi Data:** `@tanstack/react-table` (TanStack Table).
- **Form & Input Management:** `@tanstack/react-form` + Custom Conditional Logic Engine.
- **Styling:** Tailwind CSS, `clsx`, `tailwind-merge`.
- **Icon:** `lucide-react`.
- **Ekspor:** `xlsx`, `jspdf`, `jspdf-autotable`.

## 3. Prinsip Desain & UI/UX
- Menggunakan tema modern kearsipan: palet Emerald / Cyan / Slate yang bersih, berstandar dashboard pemerintahan modern.
- Indikator status jelas: Hijau (Memenuhi/Memuaskan), Kuning (Cukup/Perlu Bukti), Merah (Belum Ada/Kurang), Abu-abu (Dinonaktifkan oleh Logic).
- Setiap butir soal menampilkan Definisi Operasional, Dasar Hukum, Opsi Skor, dan Upload Bukti Dukung yang rapi.
- Aksesibilitas cepat, responsif, dan mendukung autosave realtime.
