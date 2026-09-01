import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { parseExcelWorkbook, readFileAsArrayBuffer } from '../utils/excelParser';
import type { ProcessedDashboardData } from '../types/dashboard';
import logoImg from '../assets/logo.webp';

interface UploadLandingProps {
  onDataParsed: (data: ProcessedDashboardData) => void;
  isParsing: boolean;
}

export const UploadLanding: React.FC<UploadLandingProps> = ({
  onDataParsed,
  isParsing
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!file || !file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Format file tidak didukung. Harap unggah file spreadsheet Excel (.xlsx atau .xls).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const buffer = await readFileAsArrayBuffer(file);
      const parsedData = parseExcelWorkbook(buffer, file.name);
      
      if (!parsedData.summaryOmset || parsedData.summaryOmset.length === 0) {
        throw new Error('Sheet "SUMMARY OMSET" tidak ditemukan atau kosong dalam file Excel ini.');
      }

      onDataParsed(parsedData);
      setLoading(false);
    } catch (err: any) {
      console.error('File Read/Parse error:', err);
      setError(err?.message || 'Gagal membaca file Excel. Pastikan file tidak sedang terkunci atau dibuka program lain.');
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Hero Welcome Card */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden text-center">
        
        {/* Glowing Ambient Backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Prominent Hero Logo */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <img src={logoImg} alt="DTG Analytics Logo" className="h-28 sm:h-32 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform" />
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          DTG Monthly Analytics Dashboard
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-3 max-w-xl mx-auto leading-relaxed">
          Unggah file laporan Excel bulanan Anda (<code className="text-brand-400 font-bold">.xlsx</code>) untuk menghasilkan dashboard visualisasi yang interaktif & real-time secara instan.
        </p>

        {/* Drag and Drop Zone */}
        <div className="mt-8">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !loading && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-brand-400 bg-brand-500/15 scale-[1.01] glow-brand'
                : 'border-slate-700 hover:border-brand-500/60 bg-slate-900/60 hover:bg-slate-900/90'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".xlsx, .xls"
              className="hidden"
            />

            {loading || isParsing ? (
              <div className="flex flex-col items-center py-6">
                <Loader2 className="w-12 h-12 text-brand-400 animate-spin mb-4" />
                <p className="text-base font-bold text-white">Mengekstrak Data Excel...</p>
                <p className="text-xs text-slate-400 mt-1">Memproses 11 sheet & puluhan ribu transaksi detail</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-base font-bold text-slate-100">
                  Tarik & Lepaskan file <span className="text-brand-400">.xlsx</span> di sini
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  atau klik untuk memilih file dari komputer Anda
                </p>
                
                <button
                  type="button"
                  className="mt-5 px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-cyan-500 shadow-lg shadow-brand-500/25 transition-all active:scale-95"
                >
                  Pilih File Laporan (.xlsx)
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-800/80 text-left">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-200">100% In-Memory Parsing</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Data diolah langsung di browser. Tidak disimpan di server.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-200">Analisis Instant 11 Sheet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Membaca target omset, tren harian, hingga potongan MDR bank.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-200">Export & PDF Summary</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Cetak ringkasan eksekutif untuk laporan manajemen.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
