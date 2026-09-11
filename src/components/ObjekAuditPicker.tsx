import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { SKPDUnit } from '../types';
import {
  Building2,
  MapPin,
  Landmark,
  Search,
  ChevronsUpDown,
  Check,
  Lock,
  X,
  Layers,
} from 'lucide-react';

interface ObjekAuditPickerProps {
  skpds: SKPDUnit[];
  selectedKecamatanId: string;
  onSelectSKPD: (id: string) => void;
  disabled?: boolean;
}

type FilterCategory = 'ALL' | 'KECAMATAN' | 'SKPD';

export const ObjekAuditPicker: React.FC<ObjekAuditPickerProps> = ({
  skpds,
  selectedKecamatanId,
  onSelectSKPD,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 320,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Selected SKPD Object
  const selectedSKPD = useMemo(() => {
    return skpds.find((s) => s.id === selectedKecamatanId) || skpds[0];
  }, [skpds, selectedKecamatanId]);

  const isKecamatan = selectedSKPD?.kategori === 'KECAMATAN';

  // Calculate and update popover position (Side flyout or anchored popover)
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 360;
      const popoverHeight = 440;

      let top = Math.max(56, Math.min(rect.top - 20, window.innerHeight - popoverHeight - 16));
      let left = rect.right + 8;

      // If opening to the right would overflow the screen (mobile / narrow viewport), anchor beneath
      if (left + popoverWidth > window.innerWidth - 12) {
        left = Math.max(12, rect.left);
        if (left + popoverWidth > window.innerWidth - 12) {
          left = window.innerWidth - popoverWidth - 12;
        }
        top = Math.min(rect.bottom + 8, window.innerHeight - popoverHeight - 12);
      }

      setPopoverCoords({ top, left, width: popoverWidth });
    }
  };

  // Open popover handler
  const handleToggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
      setSearchQuery('');
      setActiveFilter('ALL');
    } else {
      setIsOpen(false);
    }
  };

  // Focus search on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key and click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  // Filtered SKPDs
  const filteredSKPDs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return skpds.filter((item) => {
      // Category filter
      if (activeFilter === 'KECAMATAN' && item.kategori !== 'KECAMATAN') return false;
      if (activeFilter === 'SKPD' && item.kategori === 'KECAMATAN') return false;

      // Search query
      if (!query) return true;
      const matchNama = item.nama.toLowerCase().includes(query);
      const matchKode = item.kode?.toLowerCase().includes(query);
      const matchTipe = item.tipe?.toLowerCase().includes(query);
      const matchIbuKota = item.ibukota?.toLowerCase().includes(query);

      return matchNama || matchKode || matchTipe || matchIbuKota;
    });
  }, [skpds, searchQuery, activeFilter]);

  // Grouped by Kecamatan vs SKPD
  const kecamatanList = useMemo(
    () => filteredSKPDs.filter((s) => s.kategori === 'KECAMATAN'),
    [filteredSKPDs]
  );
  const skpdList = useMemo(
    () => filteredSKPDs.filter((s) => s.kategori !== 'KECAMATAN'),
    [filteredSKPDs]
  );

  const totalKecamatan = useMemo(() => skpds.filter((s) => s.kategori === 'KECAMATAN').length, [skpds]);
  const totalSKPD = useMemo(() => skpds.filter((s) => s.kategori !== 'KECAMATAN').length, [skpds]);

  const handleSelect = (id: string) => {
    onSelectSKPD(id);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {/* TRIGGER BUTTON */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggleOpen}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Pilih Objek Audit atau SKPD"
        className={`w-full p-2.5 rounded-xl text-left transition-all duration-200 border flex items-center gap-2.5 shadow-2xs group ${
          disabled
            ? 'bg-slate-100/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-70 cursor-not-allowed'
            : isOpen
            ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
            : 'bg-white dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-500/60 hover:shadow-xs'
        }`}
      >
        {/* Left Icon Badge */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            disabled
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              : isKecamatan
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60'
              : 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200/70 dark:border-cyan-800/60 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/60'
          }`}
        >
          {isKecamatan ? (
            <MapPin className="w-4 h-4" />
          ) : (
            <Landmark className="w-4 h-4" />
          )}
        </div>

        {/* Center Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                isKecamatan
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
              }`}
            >
              {isKecamatan ? 'Kecamatan' : 'SKPD'}
            </span>
            {selectedSKPD?.tipe && (
              <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                • {selectedSKPD.tipe}
              </span>
            )}
            <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 ml-auto truncate">
              {selectedSKPD?.kode}
            </span>
          </div>

          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
            {selectedSKPD?.nama || 'Pilih Objek Audit'}
          </div>
        </div>

        {/* Right Toggle Icon */}
        <div className="shrink-0 text-slate-400 dark:text-slate-500">
          {disabled ? (
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronsUpDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : 'group-hover:text-slate-700 dark:group-hover:text-slate-300'
              }`}
            />
          )}
        </div>
      </button>

      {/* FLOATING DROPDOWN POPOVER & BACKDROP VIA PORTAL */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            {/* BACKDROP OVERLAY */}
            <div
              className="fixed inset-0 z-[9998] bg-slate-900/30 dark:bg-black/55 backdrop-blur-[1px] transition-opacity animate-in fade-in duration-150"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* FLOATING DROPDOWN POPOVER */}
            <div
              ref={popoverRef}
              style={{
                position: 'fixed',
                top: `${popoverCoords.top}px`,
                left: `${popoverCoords.left}px`,
                width: `${popoverCoords.width}px`,
                zIndex: 9999,
              }}
              className="rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[460px]"
            >
              {/* Header & Search Bar */}
              <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      Pilih Objek Pengawasan
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    {filteredSKPDs.length} dari {skpds.length} Entitas
                  </span>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kecamatan, dinas, kode..."
                    className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-slate-200/60 dark:bg-slate-800/80 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('ALL')}
                    className={`flex-1 py-1 rounded-md transition-all ${
                      activeFilter === 'ALL'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Semua ({skpds.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('KECAMATAN')}
                    className={`flex-1 py-1 rounded-md transition-all ${
                      activeFilter === 'KECAMATAN'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Kecamatan ({totalKecamatan})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('SKPD')}
                    className={`flex-1 py-1 rounded-md transition-all ${
                      activeFilter === 'SKPD'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    SKPD ({totalSKPD})
                  </button>
                </div>
              </div>

              {/* List Content */}
              <div className="flex-1 overflow-y-auto p-1.5 space-y-2 max-h-[260px]">
                {filteredSKPDs.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 dark:text-slate-500">
                    <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold">Objek audit tidak ditemukan</p>
                    <p className="text-[10px] mt-0.5">Tidak ada hasil cocok untuk "{searchQuery}"</p>
                  </div>
                ) : (
                  <>
                    {/* GROUP 1: KECAMATAN */}
                    {kecamatanList.length > 0 && (
                  <div className="space-y-0.5">
                    {activeFilter === 'ALL' && (
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1 flex items-center justify-between">
                        <span>22 Kecamatan</span>
                        <span>{kecamatanList.length}</span>
                      </div>
                    )}
                    {kecamatanList.map((item) => {
                      const isSelected = item.id === selectedKecamatanId;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 font-bold border-l-3 border-emerald-600 dark:border-emerald-400'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate leading-tight">
                                {item.nama}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                                <span>{item.kode}</span>
                                {item.tipe && <span>• {item.tipe}</span>}
                                {item.ibukota && <span>• {item.ibukota}</span>}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* GROUP 2: SKPD / OPD */}
                {skpdList.length > 0 && (
                  <div className="space-y-0.5 pt-1">
                    {activeFilter === 'ALL' && (
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-1">
                        <span>SKPD & Perangkat Daerah</span>
                        <span>{skpdList.length}</span>
                      </div>
                    )}
                    {skpdList.map((item) => {
                      const isSelected = item.id === selectedKecamatanId;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-950 dark:text-cyan-200 font-bold border-l-3 border-cyan-600 dark:border-cyan-400'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-cyan-600 text-white'
                                  : 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400'
                              }`}
                            >
                              <Landmark className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate leading-tight">
                                {item.nama}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                                <span>{item.kode}</span>
                                <span>• {item.kategori}</span>
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Helper */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between font-mono">
            <span>Tekan ESC untuk menutup</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      </>,
      document.body
    )}
    </div>
  );
};
