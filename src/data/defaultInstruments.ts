import { AuditCategory, AuditQuestion, PredikatInfo } from '../types';

export const PREDIKAT_LIST: Record<string, PredikatInfo> = {
  AA: { kode: 'AA', label: 'Sangat Memuaskan', range: '90 - 100', warna: 'text-emerald-400', bgWarna: 'bg-emerald-500/10 border-emerald-500/30' },
  A: { kode: 'A', label: 'Memuaskan', range: '80 - <90', warna: 'text-teal-400', bgWarna: 'bg-teal-500/10 border-teal-500/30' },
  BB: { kode: 'BB', label: 'Sangat Baik', range: '70 - <80', warna: 'text-blue-400', bgWarna: 'bg-blue-500/10 border-blue-500/30' },
  B: { kode: 'B', label: 'Baik', range: '60 - <70', warna: 'text-cyan-400', bgWarna: 'bg-cyan-500/10 border-cyan-500/30' },
  CC: { kode: 'CC', label: 'Cukup', range: '50 - <60', warna: 'text-amber-400', bgWarna: 'bg-amber-500/10 border-amber-500/30' },
  C: { kode: 'C', label: 'Kurang', range: '30 - <50', warna: 'text-orange-400', bgWarna: 'bg-orange-500/10 border-orange-500/30' },
  D: { kode: 'D', label: 'Sangat Kurang', range: '< 30', warna: 'text-rose-400', bgWarna: 'bg-rose-500/10 border-rose-500/30' },
};

export const DEFAULT_CATEGORIES: AuditCategory[] = [
  {
    id: 'KAT-A',
    kode: 'A',
    nama: 'Penciptaan Arsip Dinamis',
    targetUnit: 'UP',
    bobotPersentase: 25,
    urutan: 1,
  },
  {
    id: 'KAT-B',
    kode: 'B',
    nama: 'Bagian Konvensional (Penggunaan & Pemeliharaan)',
    targetUnit: 'UP',
    bobotPersentase: 35,
    urutan: 2,
  },
  {
    id: 'KAT-C',
    kode: 'C',
    nama: 'Penyusutan Arsip & Pemindahan',
    targetUnit: 'UP',
    bobotPersentase: 20,
    urutan: 3,
  },
  {
    id: 'KAT-D',
    kode: 'D',
    nama: 'Sumber Daya & Sarana Prasarana Kearsipan',
    targetUnit: 'UP',
    bobotPersentase: 20,
    urutan: 4,
  },
  {
    id: 'KAT-UK-A',
    kode: 'A',
    nama: 'Pengelolaan Arsip Inaktif (UK)',
    targetUnit: 'UK',
    bobotPersentase: 40,
    urutan: 1,
  },
  {
    id: 'KAT-UK-B',
    kode: 'B',
    nama: 'Pemusnahan & Penyerahan Arsip Statis (UK)',
    targetUnit: 'UK',
    bobotPersentase: 30,
    urutan: 2,
  },
  {
    id: 'KAT-UK-C',
    kode: 'C',
    nama: 'Pembinaan & Pengawasan Kearsipan Internal',
    targetUnit: 'UK',
    bobotPersentase: 30,
    urutan: 3,
  },
];

export const DEFAULT_QUESTIONS: AuditQuestion[] = [
  // --- KATEGORI A: Penciptaan Arsip (UP) ---
  {
    id: 'Q-UP-A1',
    nomor: 'A.1',
    kategoriId: 'KAT-A',
    targetUnit: 'UP',
    pernyataan: 'Unit Pengolah melakukan pembuatan naskah dinas sesuai dengan Tata Naskah Dinas yang berlaku di instansi.',
    definisiOperasional: `Bukti dukung yang disampaikan berupa:
1. Sampel naskah dinas keluar (surat dinas, nota dinas, surat keputusan) yang sesuai dengan format tata naskah dinas.
2. Register penomoran surat keluar yang tertib.`,
    dasarHukum: 'Peraturan Bupati Kotabaru tentang Pedoman Tata Naskah Dinas.',
    bobotMaksimal: 100,
    options: [
      { id: 'a', huruf: 'a', teks: 'Belum menerapkan tata naskah dinas dalam pembuatan surat/naskah.', level: 0, skor: 0, isNegativeTrigger: true },
      { id: 'b', huruf: 'b', teks: 'Menerapkan tata naskah dinas namun belum konsisten pada semua jenis naskah.', level: 2, skor: 50 },
      { id: 'c', huruf: 'c', teks: 'Telah menerapkan tata naskah dinas secara konsisten dan terdokumentasi dalam buku register penomoran.', level: 4, skor: 100 },
    ],
    logicRules: [],
  },

  // --- KATEGORI B: BAGIAN KONVENSIONAL (UP) (SESUAI GAMBAR LAMPIRAN) ---
  {
    id: 'Q-UP-B1',
    nomor: 'B.1',
    kategoriId: 'KAT-B',
    targetUnit: 'UP',
    pernyataan: 'Unit pengolah melayankan arsip aktif konvensional berdasarkan Sistem Klasifikasi Keamanan dan Akses Arsip Dinamis (SKKAAD).',
    definisiOperasional: `Bukti dukung yang disampaikan berupa:
1. "Daftar Arsip Aktif" hasil pemberkasan dari naskah dinas konvensional yang dihasilkan.
2. Sarana pencatatan layanan arsip dapat berupa formulir daring (contoh: Google Form, Zoho Form, dsb.), buku pencatatan secara manual, maupun out indicator.

Daftar naskah masuk dan/atau daftar naskah keluar tidak termasuk ke dalam "Daftar Arsip Aktif".

Apabila tidak terdapat kolom Klasifikasi Keamanan, untuk melihat layanan arsip berdasarkan SKKAAD dapat dilakukan pengambilan sampel layanan arsip dan membandingkan secara manual dengan kebijakan SKKAAD yang berlaku.

Pelayanan dilihat pada saat masa audit. (Contoh: Pengawasan internal dilaksanakan tahun 2025, maka masa audit arsip yang dijadikan bukti dukung adalah arsip yang dilayankan pada kurun waktu tahun 2024).

Contoh bentuk pelayanan arsip aktif konvensional:
1. Meminjam fisik arsip.
2. Meminta copy file.
3. Mengakses informasi pada file tertentu.`,
    dasarHukum: 'SKKAAD yang berlaku di masing-masing instansi.',
    bobotMaksimal: 100,
    options: [
      {
        id: 'a',
        huruf: 'a',
        teks: 'Belum terdapat daftar arsip aktif untuk kegiatan layanan arsip aktif.',
        level: 0,
        skor: 0,
        isNegativeTrigger: true,
      },
      {
        id: 'b',
        huruf: 'b',
        teks: 'Terdapat daftar arsip aktif untuk kegiatan layanan arsip aktif.',
        level: 1,
        skor: 25,
      },
      {
        id: 'c',
        huruf: 'c',
        teks: 'Terdapat daftar arsip aktif untuk kegiatan layanan arsip aktif berdasarkan SKKAAD.',
        level: 2,
        skor: 50,
      },
      {
        id: 'd',
        huruf: 'd',
        teks: 'Terdapat daftar arsip aktif untuk kegiatan layanan arsip aktif berdasarkan SKKAAD dan sarana pencatatan layanan arsip.',
        level: 3,
        skor: 75,
      },
      {
        id: 'e',
        huruf: 'e',
        teks: 'Terdapat daftar arsip aktif untuk kegiatan layanan arsip aktif berdasarkan SKKAAD dan melaksanakan layanan yang dicatat pada sarana pencatatan layanan arsip yang tersedia.',
        level: 4,
        skor: 100,
      },
    ],
    // CONDITIONAL LOGIC: Jika jawaban 'a' (Belum ada daftar arsip aktif), maka soal B.2 (Penggunaan Sarana Peminjaman Arsip) & B.3 (Evaluasi Pengembalian Arsip Aktif) otomatis dinonaktifkan!
    logicRules: [
      {
        id: 'RULE-B1-DISABLE-B2B3',
        sourceQuestionId: 'Q-UP-B1',
        triggerOptionIds: ['a'],
        targetQuestionIds: ['Q-UP-B2', 'Q-UP-B3'],
        action: 'DISABLE',
        reasonMessage: 'Dinonaktifkan otomatis karena Unit Pengolah belum memiliki Daftar Arsip Aktif pada butir B.1 (Opsi a).',
      },
    ],
  },
  {
    id: 'Q-UP-B2',
    nomor: 'B.2',
    kategoriId: 'KAT-B',
    targetUnit: 'UP',
    pernyataan: 'Unit Pengolah menggunakan sarana peminjaman arsip aktif (out sheet / out guide / buku peminjaman) yang terintegrasi dengan daftar arsip aktif.',
    definisiOperasional: `Bukti dukung yang disampaikan berupa:
1. Formulir / Lembar Peminjaman Arsip (Out Sheet) atau Buku Peminjaman Arsip Aktif.
2. Foto fisik out indicator pada boks/folder arsip aktif.`,
    dasarHukum: 'Pedoman Penyelenggaraan Kearsipan Daerah Kabupaten Kotabaru.',
    bobotMaksimal: 100,
    options: [
      { id: 'a', huruf: 'a', teks: 'Tidak menggunakan sarana peminjaman sama sekali.', level: 0, skor: 0, isNegativeTrigger: true },
      { id: 'b', huruf: 'b', teks: 'Menggunakan buku peminjaman manual sederhana tanpa penanda fisik out sheet.', level: 2, skor: 50 },
      { id: 'c', huruf: 'c', teks: 'Menggunakan sarana peminjaman lengkap (buku peminjaman & out indicator) dan tertib administrasi.', level: 4, skor: 100 },
    ],
    logicRules: [
      {
        id: 'RULE-B2-DISABLE-B3',
        sourceQuestionId: 'Q-UP-B2',
        triggerOptionIds: ['a'],
        targetQuestionIds: ['Q-UP-B3'],
        action: 'DISABLE',
        reasonMessage: 'Dinonaktifkan karena tidak menggunakan sarana peminjaman arsip (B.2 Opsi a).',
      },
    ],
  },
  {
    id: 'Q-UP-B3',
    nomor: 'B.3',
    kategoriId: 'KAT-B',
    targetUnit: 'UP',
    pernyataan: 'Unit Pengolah melakukan kontrol pengembalian arsip aktif sesuai batas waktu yang ditetapkan dalam SOP.',
    definisiOperasional: `Bukti dukung yang disampaikan berupa:
1. Lembar tanda terima pengembalian arsip.
2. Catatan monitoring pengembalian berkas yang telah dipinjam unit kerja lain.`,
    dasarHukum: 'SOP Pelayanan dan Penggunaan Arsip Dinamis.',
    bobotMaksimal: 100,
    options: [
      { id: 'a', huruf: 'a', teks: 'Tidak ada kontrol waktu pengembalian arsip.', level: 0, skor: 0 },
      { id: 'b', huruf: 'b', teks: 'Ada batas waktu peminjaman namun pencatatan pengembalian belum tertib.', level: 2, skor: 50 },
      { id: 'c', huruf: 'c', teks: 'Terdapat catatan monitoring pengembalian yang tertib dan seluruh arsip kembali tepat waktu.', level: 4, skor: 100 },
    ],
    logicRules: [],
  },

  // --- KATEGORI C: Penyusutan Arsip (UP) ---
  {
    id: 'Q-UP-C1',
    nomor: 'C.1',
    kategoriId: 'KAT-C',
    targetUnit: 'UP',
    pernyataan: 'Unit Pengolah melakukan pemindahan arsip inaktif ke Unit Kearsipan (UK) Kecamatan secara berkala disertai Berita Acara.',
    definisiOperasional: `Bukti dukung yang disampaikan berupa:
1. Berita Acara Pemindahan Arsip Inaktif dari UP ke UK Kecamatan.
2. Daftar Arsip Inaktif yang Dipindahkan.`,
    dasarHukum: 'Jadwal Retensi Arsip (JRA) dan Tata Cara Penyusutan Arsip Pemerintah Kabupaten Kotabaru.',
    bobotMaksimal: 100,
    options: [
      { id: 'a', huruf: 'a', teks: 'Belum pernah melakukan pemindahan arsip inaktif ke Unit Kearsipan.', level: 0, skor: 0, isNegativeTrigger: true },
      { id: 'b', huruf: 'b', teks: 'Melakukan pemindahan arsip inaktif namun tanpa Berita Acara resmi.', level: 2, skor: 50 },
      { id: 'c', huruf: 'c', teks: 'Melakukan pemindahan arsip inaktif secara berkala dilengkapi Berita Acara dan Daftar Arsip Pindahan.', level: 4, skor: 100 },
    ],
    logicRules: [],
  },

  // --- KATEGORI D: Sumber Daya & Sarana Prasarana (UP) ---
  {
    id: 'Q-UP-D1',
    nomor: 'D.1',
    kategoriId: 'KAT-D',
    targetUnit: 'UP',
    pernyataan: 'Unit Pengolah memiliki sarana penyimpanan arsip aktif yang memadai (filling cabinet, folder, hanging folder, sekat guide).',
    definisiOperasional: `Bukti dukung berupa foto sarana kearsipan aktif pada Unit Pengolah:
1. Foto fisik Filling Cabinet / Lemari Arsip.
2. Foto folder dan sekat penunjuk (guide) primer, sekunder, tersier.`,
    dasarHukum: 'Standar Sarana dan Prasarana Pengelolaan Arsip Dinamis.',
    bobotMaksimal: 100,
    options: [
      { id: 'a', huruf: 'a', teks: 'Sarana penyimpanan belum memadai (arsip bertumpuk tanpa map/boks/lemari khusus).', level: 0, skor: 0 },
      { id: 'b', huruf: 'b', teks: 'Tersedia lemari/filling cabinet namun belum dilengkapi folder dan guide berlabel.', level: 2, skor: 50 },
      { id: 'c', huruf: 'c', teks: 'Sarana lengkap, tertata rapi sesuai kode klasifikasi, dan bersih.', level: 4, skor: 100 },
    ],
    logicRules: [],
  },

  // --- UNIT KEARSIPAN (UK) QUESTIONS ---
  {
    id: 'Q-UK-A1',
    nomor: 'UK.1',
    kategoriId: 'KAT-UK-A',
    targetUnit: 'UK',
    pernyataan: 'Unit Kearsipan (UK) Kecamatan mengelola Record Center / Ruang Arsip Inaktif sesuai standar keamanan dan preservasi.',
    definisiOperasional: `Bukti dukung berupa:
1. Foto ruang penyimpanan arsip inaktif (Record Center).
2. Daftar arsip inaktif yang tersimpan di Record Center.
3. Sarana pengatur suhu/kelembaban (AC/Hygrometer) dan alat pemadam api (APAR).`,
    dasarHukum: 'Peraturan Kepala ANRI tentang Standar Ruang Penyimpanan Arsip Inaktif.',
    bobotMaksimal: 100,
    options: [
      { id: 'a', huruf: 'a', teks: 'Belum memiliki ruang khusus penyimpanan arsip inaktif (Record Center).', level: 0, skor: 0, isNegativeTrigger: true },
      { id: 'b', huruf: 'b', teks: 'Memiliki ruang arsip namun belum memenuhi standar keamanan dan penataan.', level: 2, skor: 50 },
      { id: 'c', huruf: 'c', teks: 'Memiliki Record Center tertata rapi dengan rak arsip, boks arsip berlabel, dan sarana proteksi.', level: 4, skor: 100 },
    ],
    logicRules: [
      {
        id: 'RULE-UK1-DISABLE-UK2',
        sourceQuestionId: 'Q-UK-A1',
        triggerOptionIds: ['a'],
        targetQuestionIds: ['Q-UK-A2'],
        action: 'DISABLE',
        reasonMessage: 'Dinonaktifkan karena UK Kecamatan belum memiliki Record Center (UK.1 Opsi a).',
      },
    ],
  },
  {
    id: 'Q-UK-A2',
    nomor: 'UK.2',
    kategoriId: 'KAT-UK-A',
    targetUnit: 'UK',
    pernyataan: 'Unit Kearsipan memiliki Daftar Arsip Inaktif yang telah diklasifikasikan dan dilengkapi lokasi simpan pada rak & boks.',
    definisiOperasional: `Bukti dukung berupa Daftar Arsip Inaktif Kecamatan dengan kolom: No, Kode Klasifikasi, Uraian Informasi, Kurun Waktu, Jumlah, Nomor Boks, dan Nomor Rak.`,
    dasarHukum: 'Pedoman Penataan Arsip Inaktif.',
    bobotMaksimal: 100,
    options: [
      { id: 'a', huruf: 'a', teks: 'Belum dibuat daftar arsip inaktif.', level: 0, skor: 0 },
      { id: 'b', huruf: 'b', teks: 'Terdapat daftar arsip inaktif sederhana tanpa informasi nomor boks/rak.', level: 2, skor: 50 },
      { id: 'c', huruf: 'c', teks: 'Terdapat Daftar Arsip Inaktif lengkap dengan nomor boks dan lokasi rak simpan.', level: 4, skor: 100 },
    ],
    logicRules: [],
  },
  {
    id: 'Q-UK-B1',
    nomor: 'UK.3',
    kategoriId: 'KAT-UK-B',
    targetUnit: 'UK',
    pernyataan: 'Unit Kearsipan memfasilitasi usul pemusnahan arsip yang telah habis retensinya dan tidak memiliki nilai guna sesuai ketentuan JRA.',
    definisiOperasional: `Bukti dukung berupa:
1. SK Tim Penilai Pemusnahan Arsip.
2. Daftar Arsip Usul Musnah.
3. Berita Acara Pemusnahan Arsip dan Surat Persetujuan Bupati/Lembaga Kearsipan Daerah.`,
    dasarHukum: 'Peraturan tentang Tata Cara Pemusnahan Arsip di Lingkungan Pemkab Kotabaru.',
    bobotMaksimal: 100,
    options: [
      { id: 'a', huruf: 'a', teks: 'Belum pernah melaksanakan prosedur usul pemusnahan arsip.', level: 0, skor: 0 },
      { id: 'b', huruf: 'b', teks: 'Telah menyusun daftar arsip usul musnah namun belum terbit persetujuan resmi.', level: 2, skor: 50 },
      { id: 'c', huruf: 'c', teks: 'Pemusnahan arsip dilaksanakan sesuai prosedur lengkap dengan Berita Acara dan persetujuan tertulis.', level: 4, skor: 100 },
    ],
    logicRules: [],
  },
  {
    id: 'Q-UK-C1',
    nomor: 'UK.4',
    kategoriId: 'KAT-UK-C',
    targetUnit: 'UK',
    pernyataan: 'Unit Kearsipan Kecamatan memiliki Pengelola Arsip / Arsiparis yang telah mengikuti bimbingan teknis / pelatihan kearsipan.',
    definisiOperasional: `Bukti dukung berupa:
1. SK Penetapan Pengelola Arsip Kecamatan.
2. Sertifikat Pelatihan / Bimtek Kearsipan dari Dinas Perpustakaan & Kearsipan Kotabaru atau ANRI.`,
    dasarHukum: 'Peraturan tentang Standar Kompetensi Pengelola Kearsipan.',
    bobotMaksimal: 100,
    options: [
      { id: 'a', huruf: 'a', teks: 'Belum ada SK penunjukan pengelola arsip dan belum pernah mengikuti bimtek.', level: 0, skor: 0 },
      { id: 'b', huruf: 'b', teks: 'Sudah ada penunjukan pengelola arsip namun belum pernah mengikuti pelatihan/bimtek kearsipan.', level: 2, skor: 50 },
      { id: 'c', huruf: 'c', teks: 'Terdapat SK pengelola arsip dan telah bersertifikat bimtek kearsipan resmi.', level: 4, skor: 100 },
    ],
    logicRules: [],
  },
];
