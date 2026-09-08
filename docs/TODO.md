# Roadmap & Checklist Pengembangan Aplikasi ASKI TanStack

## Fase 1: Setup Workspace & Project Baseline [IN PROGRESS]
- [x] Siapkan file pedoman vibecoding (`GEMINI.md`, `docs/PRD.md`, `docs/SCHEMA.md`, `docs/KECAMATAN_KOTABARU.json`)
- [ ] Inisialisasi Vite + React + TypeScript di workspace
- [ ] Install TanStack Suite (`@tanstack/react-router`, `@tanstack/react-query`, `@tanstack/react-table`, `@tanstack/react-form`)
- [ ] Konfigurasi Tailwind CSS + Lucide Icons + Font Inter/Plus Jakarta Sans

## Fase 2: Master Instrumen & Conditional Logic Engine
- [ ] Buat data seed instrumen ASKI UP & UK standar ANRI/Kotabaru (termasuk butir B.1 dari gambar lampiran)
- [ ] Implementasi Logic Rule Evaluator:
  - Deteksi pilihan negatif/kondisi "Tidak/Belum ada"
  - Auto-disable & skip soal turunan
  - Notifikasi visual alasan penonaktifan
- [ ] Implementasi Scoring Engine (Kalkulasi per aspek, konversi level ke skor 0-100, agregasi bobot)

## Fase 3: Modul Form Interaktif & Bukti Dukung (Evidence)
- [ ] Form Kuesioner Audit dinamis per Unit (UP / UK)
- [ ] Komponen Pilihan Bertingkat (Radio tile ber-skor dengan badge Level & Poin)
- [ ] Komponen Definisi Operasional, Dasar Hukum, dan Accordion Bantuan
- [ ] Komponen Upload Bukti Dukung (File attachment, link Google Drive/Form, preview dokumen)
- [ ] Autosave realtime ke LocalStorage/State

## Fase 4: Dashboard Monitoring 22 Kecamatan (TanStack Table)
- [ ] Tabel interaktif Rekapitulasi 22 Kecamatan dengan filter status, unit, dan predikat (TanStack Table)
- [ ] Kartu Statistik ringkasan nilai rata-rata, capaian predikat (AA, A, BB, B, CC, C, D)
- [ ] Modal Detail Audit & Verifikasi Auditor

## Fase 5: Admin Instrumen Builder & Ekspor
- [ ] Halaman Admin untuk Menambah/Mengubah Butir Soal & Aturan Logic
- [ ] Generator Ekspor Laporan (Excel & PDF format resmi Berita Acara / LHKK)
