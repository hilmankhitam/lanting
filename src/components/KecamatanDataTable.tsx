import React, { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { AuditSession, Kecamatan, SKPDUnit } from '../types';
import { DAFTAR_KECAMATAN_KOTABARU } from '../data/kecamatanData';
import { PREDIKAT_LIST } from '../data/defaultInstruments';
import { exportAllKecamatanSummaryToExcel } from '../services/exportService';
import {
  Search,
  FileSpreadsheet,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Building2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';

interface KecamatanRowData {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  tipe: 'Daratan' | 'Kepulauan';
  ibukota: string;
  upScore: number;
  upPredikat: string;
  upStatus: string;
  ukScore: number;
  ukPredikat: string;
  ukStatus: string;
  kompositScore: number;
  kompositPredikat: string;
}

interface KecamatanDataTableProps {
  sessions: Record<string, AuditSession>;
  selectedYear: number;
  onSelectKecamatanAndUnit: (kecamatanId: string, unit: 'UP' | 'UK') => void;
  skpds?: SKPDUnit[];
}

const columnHelper = createColumnHelper<KecamatanRowData>();

export const KecamatanDataTable: React.FC<KecamatanDataTableProps> = ({
  sessions,
  selectedYear,
  onSelectKecamatanAndUnit,
  skpds,
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'kompositScore', desc: true },
  ]);
  const [filterTipe, setFilterTipe] = useState<'ALL' | 'Daratan' | 'Kepulauan'>('ALL');
  const [filterKategori, setFilterKategori] = useState<string>('ALL');

  // Compute table data
  const data = useMemo<KecamatanRowData[]>(() => {
    const listToRender = skpds && skpds.length > 0 ? skpds : DAFTAR_KECAMATAN_KOTABARU;
    return listToRender.map((kec) => {
      const upSession = sessions[`${kec.id}_${selectedYear}_UP`];
      const ukSession = sessions[`${kec.id}_${selectedYear}_UK`];

      const upScore = upSession?.nilaiAkhir || 0;
      const ukScore = ukSession?.nilaiAkhir || 0;
      const kompositScore = Math.round((upScore * 0.6 + ukScore * 0.4) * 10) / 10;

      let kompositPredikat = 'D';
      if (kompositScore >= 90) kompositPredikat = 'AA';
      else if (kompositScore >= 80) kompositPredikat = 'A';
      else if (kompositScore >= 70) kompositPredikat = 'BB';
      else if (kompositScore >= 60) kompositPredikat = 'B';
      else if (kompositScore >= 50) kompositPredikat = 'CC';
      else if (kompositScore >= 30) kompositPredikat = 'C';

      const kat = (kec as any).kategori || 'KECAMATAN';
      return {
        id: kec.id,
        kode: kec.kode,
        nama: kec.nama,
        kategori: kat,
        tipe: (kec.tipe as 'Daratan' | 'Kepulauan') || 'Daratan',
        ibukota: kec.ibukota || kat,
        upScore,
        upPredikat: upSession?.predikat || 'D',
        upStatus: upSession?.status || 'DRAFT',
        ukScore,
        ukPredikat: ukSession?.predikat || 'D',
        ukStatus: ukSession?.status || 'DRAFT',
        kompositScore,
        kompositPredikat,
      };
    }).filter((item) => {
      const matchTipe = filterTipe === 'ALL' || item.tipe === filterTipe;
      const matchKat = filterKategori === 'ALL' || item.kategori === filterKategori;
      return matchTipe && matchKat;
    });
  }, [sessions, selectedYear, filterTipe, filterKategori, skpds]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = data.length;
    const avgScore = total > 0
      ? Math.round((data.reduce((acc, curr) => acc + curr.kompositScore, 0) / total) * 10) / 10
      : 0;
    const submittedCount = data.filter(
      (d) => d.upStatus !== 'DRAFT' || d.ukStatus !== 'DRAFT'
    ).length;

    return {
      total,
      avgScore,
      submittedCount,
      percentSubmitted: total > 0 ? Math.round((submittedCount / total) * 100) : 0,
    };
  }, [data]);

  // TanStack Table Columns definition
  const columns = useMemo(
    () => [
      columnHelper.accessor('kode', {
        header: 'Kode',
        cell: (info) => (
          <span className="font-mono text-xs text-slate-400 font-medium">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('nama', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-white"
          >
            <span>Nama Entitas / SKPD</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => {
          const row = info.row.original;
          const badgeColor =
            row.kategori === 'KECAMATAN'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
              : row.kategori === 'DINAS'
              ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30'
              : row.kategori === 'BADAN'
              ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30'
              : row.kategori === 'INSPEKTORAT'
              ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30'
              : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30';

          return (
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 flex flex-wrap items-center gap-1.5">
                <span>{info.getValue()}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badgeColor}`}>
                  {row.kategori}
                </span>
                {row.tipe === 'Kepulauan' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-100 text-cyan-800 border border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30">
                    Kepulauan
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                <span>{row.kategori === 'KECAMATAN' ? `Ibukota: ${row.ibukota}` : `Alamat: Kotabaru`}</span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('upScore', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
          >
            <span>Nilai UP (60%)</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => {
          const row = info.row.original;
          const pred = PREDIKAT_LIST[row.upPredikat] || PREDIKAT_LIST['D'];
          return (
            <div className="flex items-center gap-2">
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{info.getValue()}%</div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${pred.bgWarna} ${pred.warna}`}>
                {row.upPredikat}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('ukScore', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
          >
            <span>Nilai UK (40%)</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => {
          const row = info.row.original;
          const pred = PREDIKAT_LIST[row.ukPredikat] || PREDIKAT_LIST['D'];
          return (
            <div className="flex items-center gap-2">
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{info.getValue()}%</div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${pred.bgWarna} ${pred.warna}`}>
                {row.ukPredikat}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('kompositScore', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
          >
            <span>Nilai Komposit ASKI</span>
            <ArrowUpDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          </button>
        ),
        cell: (info) => {
          const row = info.row.original;
          const pred = PREDIKAT_LIST[row.kompositPredikat] || PREDIKAT_LIST['D'];
          return (
            <div className="flex items-center gap-2.5">
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {info.getValue()}
              </span>
              <div className={`px-2 py-0.5 rounded-lg border text-center ${pred.bgWarna}`}>
                <span className={`text-xs font-black ${pred.warna}`}>
                  {pred.kode}
                </span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aksi Audit',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onSelectKecamatanAndUnit(row.id, 'UP')}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:hover:bg-emerald-800 dark:text-emerald-300 dark:border-emerald-500/40 rounded text-xs font-semibold transition flex items-center gap-1"
                title="Buka Form Audit Unit Pengolah"
              >
                <span>Audit UP</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectKecamatanAndUnit(row.id, 'UK')}
                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 dark:bg-teal-950/60 dark:hover:bg-teal-800 dark:text-teal-300 dark:border-teal-500/40 rounded text-xs font-semibold transition flex items-center gap-1"
                title="Buka Form Audit Unit Kearsipan"
              >
                <span>Audit UK</span>
              </button>
            </div>
          );
        },
      }),
    ],
    [onSelectKecamatanAndUnit]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-5">
      {/* Top Stat Cards (Official Performance Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="gov-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Objek Audit</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">{stats.total} Entitas</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">22 Kecamatan & 29 SKPD Kotabaru</div>
          </div>
        </div>

        <div className="gov-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Rata-Rata Komposit Kabupaten</div>
            <div className="text-2xl font-black text-cyan-800 dark:text-cyan-300 font-mono tabular-nums">
              {stats.avgScore} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ 100</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Target ANRI: Predikat B (≥ 60.00)</div>
          </div>
        </div>

        <div className="gov-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tingkat Partisipasi Pengawasan</div>
            <div className="text-2xl font-black text-purple-800 dark:text-purple-300 font-mono tabular-nums">
              {stats.submittedCount} / {stats.total}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{stats.percentSubmitted}% telah mengirimkan lembar kerja</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filter & Bulk Export */}
      <div className="gov-card p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl">
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kecamatan, dinas, badan, kode..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Kategori Filter */}
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer shrink-0 font-medium"
          >
            <option value="ALL">Semua Kategori (51)</option>
            <option value="KECAMATAN">Kecamatan (22)</option>
            <option value="DINAS">Dinas Daerah (18)</option>
            <option value="BADAN">Badan Daerah (6)</option>
            <option value="SETDA">Sekretariat Daerah</option>
            <option value="SETWAN">Sekretariat DPRD</option>
            <option value="INSPEKTORAT">Inspektorat Daerah</option>
            <option value="RUMAH_SAKIT">RSUD PJS</option>
          </select>

          {/* Tipe Wilayah Filter (Kecamatan only) */}
          {filterKategori === 'KECAMATAN' && (
            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer shrink-0 font-medium"
            >
              <option value="ALL">Semua Wilayah</option>
              <option value="Daratan">Daratan</option>
              <option value="Kepulauan">Kepulauan</option>
            </select>
          )}
        </div>

        {/* Export All Excel Button */}
        <button
          type="button"
          onClick={() => exportAllKecamatanSummaryToExcel(sessions, selectedYear, skpds)}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Ekspor Rekap Excel</span>
        </button>
      </div>

      {/* TanStack Data Table */}
      <div className="gov-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-[11px]">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-10 text-slate-500 italic">
                    Tidak ada kecamatan yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition group bg-white dark:bg-slate-950/20"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle tabular-nums">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div>
            Menampilkan halaman{' '}
            <strong className="text-slate-900 dark:text-slate-200 font-mono">
              {table.getState().pagination.pageIndex + 1}
            </strong>{' '}
            dari <strong className="text-slate-900 dark:text-slate-200 font-mono">{table.getPageCount()}</strong> (Total {data.length} Kecamatan)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
