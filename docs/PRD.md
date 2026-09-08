# PRD: Aplikasi ASKI (Audit Sistem Kearsipan Internal) Kab. Kotabaru

## 1. Latar Belakang & Masalah
Pengawasan Kearsipan Internal di lingkungan 22 Kecamatan Kabupaten Kotabaru sebelumnya menggunakan lembar kerja Microsoft Excel. Proses manual ini memiliki kendala:
- Rentan kesalahan pengisian alur soal (*skip logic* manual sering terlewat).
- Bukti dukung tercecer di folder terpisah dan sulit diverifikasi auditor.
- Perhitungan agregasi nilai UP dan UK memakan waktu lama.
- Rekapitulasi perbandingan 22 kecamatan harus dikompilasi manual.

## 2. Tujuan Produk
Membangun web aplikasi modern untuk instrumen ASKI yang memudahkan:
1. **Admin/Auditor Kearsipan:** Menyusun butir instrumen, alur ketergantungan soal (*conditional logic*), memverifikasi bukti dukung, dan menerbitkan laporan.
2. **Kecamatan (UP & UK):** Mengisi kuesioner audit secara terpandu, mengunggah bukti dukung langsung pada butir soal terkait, dan melihat simulasi nilai secara instan.

## 3. Fitur Utama

### A. Dynamic Form & Logic Builder (Admin)
- Menambah Kategori/Aspek (Pengelolaan Arsip Dinamis, Bagian Konvensional, Bagian Digital, Sumber Daya Kearsipan, dll.).
- Menambah Butir Soal dengan:
  - Kode/Nomor Soal (misal: B.1, B.2).
  - Pernyataan Induk.
  - Definisi Operasional & Panduan Bukti Dukung.
  - Dasar Hukum (SKKAAD, Permen, Perda, dsb.).
  - Pilihan Opsi Bertingkat (a, b, c, d, e) masing-masing dengan Level (0 - 5) dan Skor (0 - 100).
- **Rule Engine (Conditional Branching):**
  - Opsi penonaktifan: "Jika Soal X bernilai Opsi A / skor 0, maka Soal Y, Z otomatis Dinonaktifkan (Disabled)".
  - Nilai soal yang dinonaktifkan otomatis disesuaikan (skor N/A atau 0 dengan alasan terdokumentasi).

### B. Modul Audit Kecamatan (22 Kecamatan Kotabaru)
- Pemilihan Kecamatan (22 Kecamatan Kotabaru) dan Tahun Audit (2025/2026).
- Pemilihan Unit:
  - **Unit Pengolah (UP):** Menguji pelaksanaan penciptaan, penggunaan, pemeliharaan arsip aktif.
  - **Unit Kearsipan (UK):** Menguji pengelolaan arsip inaktif, penyusutan, SDM & sarana prasarana.
- Form Interaktif dengan indikator visual status aktif/nonaktif.
- **Evidence Management:** Upload berkas (PDF, DOCX, JPG, PNG) atau tautan Cloud Drive (Google Drive/OneDrive) per butir soal.
- Indikator kelengkapan progres audit (% pengisian dan % bukti dukung).

### C. Modul Evaluasi & Verifikasi Auditor
- Auditor dapat melihat draft pengisian kecamatan.
- Membuka & memverifikasi berkas bukti dukung.
- Memberikan catatan koreksi, persetujuan skor, atau catatan objek pengawasan.

### D. Dashboard Rekapitulasi & LHKK (Laporan Hasil Pengawasan)
- Visualisasi skor audit 22 Kecamatan (Tabel TanStack Table interaktif + Grafik).
- Kategori Predikat Standar ANRI:
  - **AA (Sangat Memuaskan):** 90 - 100
  - **A (Memuaskan):** 80 - <90
  - **BB (Sangat Baik):** 70 - <80
  - **B (Baik):** 60 - <70
  - **CC (Cukup):** 50 - <60
  - **C (Kurang):** 30 - <50
  - **D (Sangat Kurang):** <30
- Ekspor Berita Acara & LHKK ke PDF dan Excel.
