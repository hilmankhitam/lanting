import { AuditCategory, AuditQuestion, AuditSession, Kecamatan, SKPDUnit } from '../types';
import { DAFTAR_KECAMATAN_KOTABARU } from '../data/kecamatanData';
import { PREDIKAT_LIST } from '../data/defaultInstruments';

// 1. Export Sesi Audit Tunggal ke Excel
export async function exportSingleAuditToExcel(
  session: AuditSession,
  kecamatan: Kecamatan,
  questions: AuditQuestion[],
  categories: AuditCategory[]
) {
  const XLSX = await import('xlsx');

  const activeQuestions = questions.filter(
    (q) => q.targetUnit === session.targetUnit || q.targetUnit === 'BOTH'
  );

  const rows = activeQuestions.map((q, idx) => {
    const ans = session.answers[q.id];
    const cat = categories.find((c) => c.id === q.kategoriId);
    const selectedOpt = q.options.find((o) => o.id === ans?.selectedOptionId);

    return {
      No: idx + 1,
      'Kode Soal': q.nomor,
      Kategori: cat?.nama || '',
      Pernyataan: q.pernyataan,
      'Status Soal': ans?.isDisabled ? 'DINONAKTIFKAN (SKIP)' : 'AKTIF',
      'Pilihan Jawaban': ans?.isDisabled
        ? `N/A - ${ans?.disabledReason || ''}`
        : selectedOpt
        ? `[${selectedOpt.huruf.toUpperCase()}] ${selectedOpt.teks}`
        : 'Belum Dijawab',
      Level: ans?.level ?? 0,
      Skor: ans?.score ?? 0,
      'Bukti Dukung (Jumlah)': ans?.evidenceList?.length || 0,
      'Catatan Auditor': ans?.catatanAuditor || '-',
      'Dasar Hukum': q.dasarHukum,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Audit ${session.targetUnit}`);

  // Summary sheet
  const summaryData = [
    { Parameter: 'Kabupaten', Nilai: 'Kotabaru' },
    { Parameter: 'Kecamatan', Nilai: kecamatan.nama },
    { Parameter: 'Kode Wilayah', Nilai: kecamatan.kode },
    { Parameter: 'Unit Audit', Nilai: session.targetUnit === 'UP' ? 'Unit Pengolah (UP)' : 'Unit Kearsipan (UK)' },
    { Parameter: 'Tahun Pengawasan', Nilai: session.tahunAudit },
    { Parameter: 'Status Pengisian', Nilai: session.status },
    { Parameter: 'Total Skor', Nilai: session.totalSkor },
    { Parameter: 'Nilai Akhir (0-100)', Nilai: `${session.nilaiAkhir.toFixed(2)}%` },
    { Parameter: 'Predikat Kearsipan', Nilai: `${session.predikat} (${PREDIKAT_LIST[session.predikat]?.label || ''})` },
    { Parameter: 'Waktu Update', Nilai: new Date(session.updatedAt).toLocaleString('id-ID') },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan Nilai');

  XLSX.writeFile(
    workbook,
    `LHKK_ASKI_${kecamatan.nama.replace(/\s+/g, '_')}_${session.targetUnit}_${session.tahunAudit}.xlsx`
  );
}

// 2. Export Rekapitulasi Seluruh SKPD & 22 Kecamatan ke Excel
export async function exportAllKecamatanSummaryToExcel(
  sessions: Record<string, AuditSession>,
  tahun: number,
  skpdList?: (Kecamatan | SKPDUnit)[]
) {
  const XLSX = await import('xlsx');

  const targetList = skpdList && skpdList.length > 0 ? skpdList : DAFTAR_KECAMATAN_KOTABARU;
  const rows = targetList.map((kec, idx) => {
    const upSession = sessions[`${kec.id}_${tahun}_UP`];
    const ukSession = sessions[`${kec.id}_${tahun}_UK`];

    const upScore = upSession?.nilaiAkhir || 0;
    const ukScore = ukSession?.nilaiAkhir || 0;
    // Agregasi Nilai Entitas (Standar ANRI: UP 60%, UK 40%)
    const aggregateScore = Math.round((upScore * 0.6 + ukScore * 0.4) * 10) / 10;

    let aggregatePredikat = 'D';
    if (aggregateScore >= 90) aggregatePredikat = 'AA';
    else if (aggregateScore >= 80) aggregatePredikat = 'A';
    else if (aggregateScore >= 70) aggregatePredikat = 'BB';
    else if (aggregateScore >= 60) aggregatePredikat = 'B';
    else if (aggregateScore >= 50) aggregatePredikat = 'CC';
    else if (aggregateScore >= 30) aggregatePredikat = 'C';

    return {
      No: idx + 1,
      'Kode': kec.kode,
      'Nama Entitas / SKPD': kec.nama,
      'Kategori': kec.kategori || 'KECAMATAN',
      'Tipe Wilayah': kec.tipe || '-',
      Ibukota: kec.ibukota || '-',
      'Nilai UP (60%)': upScore.toFixed(1),
      'Predikat UP': upSession?.predikat || 'D',
      'Status UP': upSession?.status || 'DRAFT',
      'Nilai UK (40%)': ukScore.toFixed(1),
      'Predikat UK': ukSession?.predikat || 'D',
      'Status UK': ukSession?.status || 'DRAFT',
      'Nilai Komposit ASKI': aggregateScore.toFixed(1),
      'Predikat Komposit': aggregatePredikat,
      Keterangan: PREDIKAT_LIST[aggregatePredikat]?.label || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ASKI Kotabaru ${tahun}`);

  XLSX.writeFile(workbook, `REKAP_ASKI_KOTABARU_${tahun}.xlsx`);
}
