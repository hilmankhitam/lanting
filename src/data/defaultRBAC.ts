import { SKPDUnit, UserAccount, PermissionMatrix } from '../types';
import { DAFTAR_KECAMATAN_KOTABARU } from './kecamatanData';

// 1. Initial SKPD & Kecamatan Master List
export const DEFAULT_SKPD_LIST: SKPDUnit[] = [
  // 22 Kecamatan Kabupaten Kotabaru
  ...DAFTAR_KECAMATAN_KOTABARU.map((kec) => ({
    ...kec,
    kategori: 'KECAMATAN' as const,
    kontak: kec.kontakOperator || '0812-5500-0000',
    alamat: `Kantor Kecamatan ${kec.nama}, Kotabaru`,
  })),

  // Organisasi Perangkat Daerah (OPD / SKPD) Tingkat Kabupaten Kotabaru (29 SKPD)
  {
    id: 'skpd-dlh',
    kode: '2.11.01',
    nama: 'Dinas Lingkungan Hidup Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21101',
    alamat: 'Jl. Hasan Basri, Kotabaru',
  },
  {
    id: 'skpd-dpmptsp',
    kode: '2.18.01',
    nama: 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21102',
    alamat: 'Jl. Surya Gandamana, Kotabaru',
  },
  {
    id: 'skpd-inspektorat',
    kode: '4.01.03',
    nama: 'Inspektorat Kabupaten Kotabaru',
    kategori: 'INSPEKTORAT',
    kontak: '(0518) 21455',
    alamat: 'Jl. Brigjen H. Hasan Basri, Kotabaru',
  },
  {
    id: 'skpd-disdukcapil',
    kode: '2.12.01',
    nama: 'Dinas Kependudukan dan Pencatatan Sipil Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21103',
    alamat: 'Jl. Pangeran Kusuma Negara, Kotabaru',
  },
  {
    id: 'skpd-bapperida',
    kode: '4.01.01',
    nama: 'Badan Perencanaan Pembangunan, Riset dan Inovasi Daerah Kabupaten Kotabaru',
    kategori: 'BADAN',
    kontak: '(0518) 21876',
    alamat: 'Kompleks Perkantoran Sebelimbingan, Kotabaru',
  },
  {
    id: 'skpd-bakesbangpol',
    kode: '8.01.01',
    nama: 'Badan Kesatuan Bangsa dan Politik Kabupaten Kotabaru',
    kategori: 'BADAN',
    kontak: '(0518) 21104',
    alamat: 'Jl. Hasan Basri, Kotabaru',
  },
  {
    id: 'skpd-disparpora',
    kode: '2.19.01',
    nama: 'Dinas Pariwisata, Pemuda dan Olahraga Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21105',
    alamat: 'Jl. Raya Stagen, Kotabaru',
  },
  {
    id: 'skpd-bpbd',
    kode: '1.05.02',
    nama: 'Badan Penanggulangan Bencana Daerah Kabupaten Kotabaru',
    kategori: 'BADAN',
    kontak: '(0518) 21106',
    alamat: 'Jl. Veteran No. 45, Kotabaru',
  },
  {
    id: 'skpd-diskominfo',
    kode: '2.16.01',
    nama: 'Dinas Komunikasi dan Informatika Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21107',
    alamat: 'Jl. Pangeran Kusuma Negara, Kotabaru',
  },
  {
    id: 'skpd-rsud-pjs',
    kode: '1.02.02',
    nama: 'RSUD Pangeran Jaya Sumitra Kabupaten Kotabaru',
    kategori: 'RUMAH_SAKIT',
    kontak: '(0518) 21118',
    alamat: 'Jl. Pembangunan No. 1, Kotabaru',
  },
  {
    id: 'skpd-setda',
    kode: '4.01.02',
    nama: 'Sekretariat Daerah Kabupaten Kotabaru',
    kategori: 'SETDA',
    kontak: '(0518) 21001',
    alamat: 'Jl. Pangeran Kusuma Negara, Kotabaru',
  },
  {
    id: 'skpd-bpkad',
    kode: '4.02.01',
    nama: 'Badan Pengelola Keuangan dan Aset Daerah Kabupaten Kotabaru',
    kategori: 'BADAN',
    kontak: '(0518) 21108',
    alamat: 'Jl. Pangeran Kusuma Negara, Kotabaru',
  },
  {
    id: 'skpd-disnakertrans',
    kode: '2.07.01',
    nama: 'Dinas Ketenagakerjaan dan Transmigrasi Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21109',
    alamat: 'Jl. Raya Berangas, Kotabaru',
  },
  {
    id: 'skpd-pupr',
    kode: '1.03.01',
    nama: 'Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21110',
    alamat: 'Jl. Raya Sebelimbingan, Kotabaru',
  },
  {
    id: 'skpd-disdikbud',
    kode: '1.01.01',
    nama: 'Dinas Pendidikan dan Kebudayaan Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21544',
    alamat: 'Jl. Veteran No. 88, Kotabaru',
  },
  {
    id: 'skpd-setwan',
    kode: '4.01.04',
    nama: 'Sekretariat DPRD Kabupaten Kotabaru',
    kategori: 'SETWAN',
    kontak: '(0518) 21111',
    alamat: 'Jl. H. Agussalim No. 1, Kotabaru',
  },
  {
    id: 'skpd-bapenda',
    kode: '4.02.02',
    nama: 'Badan Pendapatan Daerah Kabupaten Kotabaru',
    kategori: 'BADAN',
    kontak: '(0518) 21112',
    alamat: 'Jl. Pangeran Kusuma Negara, Kotabaru',
  },
  {
    id: 'skpd-dispersip',
    kode: '2.17.01',
    nama: 'Dinas Perpustakaan dan Kearsipan Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21155',
    alamat: 'Jl. Hasan Basri No. 12, Kotabaru',
  },
  {
    id: 'skpd-diskoperindag',
    kode: '2.15.01',
    nama: 'Dinas Koperasi, Perindustrian dan Perdagangan Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21113',
    alamat: 'Jl. Surya Gandamana, Kotabaru',
  },
  {
    id: 'skpd-satpolpp-damkar',
    kode: '1.05.01',
    nama: 'Satuan Polisi Pamong Praja dan Pemadam Kebakaran Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21114',
    alamat: 'Jl. Hasan Basri, Kotabaru',
  },
  {
    id: 'skpd-perikanan',
    kode: '3.25.01',
    nama: 'Dinas Perikanan Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21115',
    alamat: 'Jl. Raya Stagen Km. 5, Kotabaru',
  },
  {
    id: 'skpd-dpmd',
    kode: '2.13.01',
    nama: 'Dinas Pemberdayaan Masyarakat dan Desa Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21116',
    alamat: 'Jl. Pangeran Diponegoro, Kotabaru',
  },
  {
    id: 'skpd-dishub',
    kode: '2.15.02',
    nama: 'Dinas Perhubungan Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21117',
    alamat: 'Jl. Raya Stagen Km. 7, Kotabaru',
  },
  {
    id: 'skpd-dinkes',
    kode: '1.02.01',
    nama: 'Dinas Kesehatan Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21321',
    alamat: 'Jl. Surya Gandamana No. 45, Kotabaru',
  },
  {
    id: 'skpd-dinsos',
    kode: '1.06.01',
    nama: 'Dinas Sosial Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21119',
    alamat: 'Jl. Hasan Basri, Kotabaru',
  },
  {
    id: 'skpd-dp3ap2kb',
    kode: '2.08.01',
    nama: 'Dinas Pemberdayaan Perempuan, Perlindungan Anak, Pengendalian Penduduk dan Keluarga Berencana Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21120',
    alamat: 'Jl. Veteran, Kotabaru',
  },
  {
    id: 'skpd-disperkimtan',
    kode: '1.04.01',
    nama: 'Dinas Perumahan Rakyat Permukiman dan Pertanahan Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21121',
    alamat: 'Jl. Raya Sebelimbingan, Kotabaru',
  },
  {
    id: 'skpd-bkpsdm',
    kode: '4.03.01',
    nama: 'Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Kotabaru',
    kategori: 'BADAN',
    kontak: '(0518) 21122',
    alamat: 'Kompleks Perkantoran Sebelimbingan, Kotabaru',
  },
  {
    id: 'skpd-dkpp',
    kode: '3.27.01',
    nama: 'Dinas Ketahanan Pangan dan Pertanian Kabupaten Kotabaru',
    kategori: 'DINAS',
    kontak: '(0518) 21123',
    alamat: 'Jl. Raya Stagen Km. 4, Kotabaru',
  },
];

// 2. Initial User Accounts
export const DEFAULT_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-superadmin',
    username: 'superadmin',
    namaLengkap: 'Drs. H. M. Zulkifli, M.AP',
    nip: '19750812 199803 1 004',
    role: 'SUPERADMIN',
    unitKerjaId: 'ALL',
    email: 'admin.aski@kotabarukab.go.id',
    isActive: true,
    createdAt: '2025-01-01T08:00:00.000Z',
  },
  {
    id: 'user-auditor-1',
    username: 'auditor_dispersip',
    namaLengkap: 'Hj. Noor Asiah, S.Sos',
    nip: '19810315 200501 2 008',
    role: 'AUDITOR',
    unitKerjaId: 'ALL',
    email: 'noor.asiah@kotabarukab.go.id',
    isActive: true,
    createdAt: '2025-01-02T09:00:00.000Z',
  },
  {
    id: 'user-auditor-2',
    username: 'auditor_lapangan',
    namaLengkap: 'Ahmad Fauzi, A.Md',
    nip: '19920410 201802 1 003',
    role: 'AUDITOR',
    unitKerjaId: 'ALL',
    email: 'fauzi.arsip@kotabarukab.go.id',
    isActive: true,
    createdAt: '2025-01-03T09:30:00.000Z',
  },
  {
    id: 'user-op-sigam',
    username: 'operator_sigam',
    namaLengkap: 'Budi Hartono, S.STP',
    nip: '19890522 201101 1 002',
    role: 'OPERATOR',
    unitKerjaId: 'kec-21', // Pulau Laut Sigam
    email: 'kec.sigam@kotabarukab.go.id',
    isActive: true,
    createdAt: '2025-01-05T10:00:00.000Z',
  },
  {
    id: 'user-op-utara',
    username: 'operator_utara',
    namaLengkap: 'Rina Marlina, S.AP',
    nip: '19910714 201402 2 006',
    role: 'OPERATOR',
    unitKerjaId: 'kec-04', // Pulau Laut Utara
    email: 'kec.plutara@kotabarukab.go.id',
    isActive: true,
    createdAt: '2025-01-06T10:00:00.000Z',
  },
  {
    id: 'user-op-dinkes',
    username: 'operator_dinkes',
    namaLengkap: 'dr. Suryani Fitri',
    nip: '19881105 201503 2 001',
    role: 'OPERATOR',
    unitKerjaId: 'skpd-dinkes', // Dinas Kesehatan
    email: 'dinkes.arsip@kotabarukab.go.id',
    isActive: true,
    createdAt: '2025-01-07T11:00:00.000Z',
  },
];

// 3. Initial Role Permissions Matrix with Toggle Switches
export const DEFAULT_ROLE_PERMISSIONS: PermissionMatrix = {
  SUPERADMIN: {
    canManageSKPD: true,
    canManageUsers: true,
    canConfigurePermissions: true,
    canManageInstruments: true,
    canEvaluateAudits: true,
    canFillAuditForm: true,
    canUploadEvidence: true,
    canViewAllRekap: true,
    canExportReports: true,
  },
  AUDITOR: {
    canManageSKPD: false,
    canManageUsers: false,
    canConfigurePermissions: false,
    canManageInstruments: true, // Bisa membuat soal untuk dikerjakan operator
    canEvaluateAudits: true, // Membaca hasil pekerjaan & memberi catatan/rekomendasi
    canFillAuditForm: false, // Tim audit tidak mengisi sebagai operator
    canUploadEvidence: false,
    canViewAllRekap: true, // Membaca hasil pekerjaan semua SKPD/Kecamatan
    canExportReports: true,
  },
  OPERATOR: {
    canManageSKPD: false,
    canManageUsers: false,
    canConfigurePermissions: false,
    canManageInstruments: false, // Tidak bisa ubah/buat soal
    canEvaluateAudits: false,
    canFillAuditForm: true, // Hanya bisa mengerjakan soal
    canUploadEvidence: true, // Upload bukti dukung
    canViewAllRekap: false, // Terkunci pada unit kerja sendiri
    canExportReports: true, // Bisa unduh LHKK lembar kerjanya
  },
};

// Descriptions for permission toggles in Super Admin panel
export const PERMISSION_DEFINITIONS: {
  key: keyof PermissionMatrix['SUPERADMIN'];
  label: string;
  deskripsi: string;
}[] = [
  {
    key: 'canManageSKPD',
    label: 'Kelola Master SKPD & Kecamatan',
    deskripsi: 'Menambah, mengedit, dan menghapus daftar SKPD/OPD dan 22 Kecamatan.',
  },
  {
    key: 'canManageUsers',
    label: 'Manajemen Akun Pengguna',
    deskripsi: 'Membuat dan mengelola akun Tim Audit serta Operator SKPD/Kecamatan.',
  },
  {
    key: 'canConfigurePermissions',
    label: 'Pengaturan Matriks Izin Role',
    deskripsi: 'Mengubah sakelar toggle hak akses untuk setiap peran pengguna.',
  },
  {
    key: 'canManageInstruments',
    label: 'Pembuat Soal & Alur Logika (Instrument Builder)',
    deskripsi: 'Membuat butir soal audit baru, mengubah opsi skor, dan mengatur branching logic.',
  },
  {
    key: 'canEvaluateAudits',
    label: 'Pemeriksaan & Catatan Auditor',
    deskripsi: 'Memberikan catatan pemeriksaan lapangan dan memvalidasi skor akhir audit.',
  },
  {
    key: 'canFillAuditForm',
    label: 'Mengerjakan Soal Formulir Audit',
    deskripsi: 'Memilih opsi kriteria (a - e) pada butir pertanyaan instrumen kearsipan.',
  },
  {
    key: 'canUploadEvidence',
    label: 'Unggah & Tautkan Berkas Bukti Dukung',
    deskripsi: 'Melampirkan dokumen otentik (PDF/Foto) dan menyematkan link cloud folder.',
  },
  {
    key: 'canViewAllRekap',
    label: 'Melihat Rekapitulasi Seluruh Unit Kerja',
    deskripsi: 'Mengakses tabel komparasi capaian nilai audit 22 Kecamatan dan SKPD.',
  },
  {
    key: 'canExportReports',
    label: 'Ekspor LHKK (PDF / Excel)',
    deskripsi: 'Mengunduh lembar hasil pengawasan kearsipan resmi dalam format cetak.',
  },
];
