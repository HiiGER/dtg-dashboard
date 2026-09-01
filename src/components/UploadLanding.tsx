import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Loader2, ShieldCheck, Zap, FolderGit2, ArrowRight } from 'lucide-react';
import { parseExcelWorkbook, readFileAsArrayBuffer } from '../utils/excelParser';
import type { ProcessedDashboardData } from '../types/dashboard';
import type { ReportItem } from '../utils/reportLoader';
import logoImg from '../assets/logo.webp';

interface UploadLandingProps {
  onDataParsed: (data: ProcessedDashboardData) => void;
  reports: ReportItem[];
  onSelectReport: (report: ReportItem) => void;
  isParsing: boolean;
}

export const UploadLanding: React.FC<UploadLandingProps> = ({
  onDataParsed,
  reports,
  onSelectReport,
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

        {/* Hero Logo */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <img src={logoImg} alt="DTG Analytics Logo" className="h-28 sm:h-32 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform" />
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          DTG Monthly Analytics Dashboard
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-3 max-w-xl mx-auto leading-relaxed">
          Pilih laporan bulanan yang tersimpan di GitHub atau unggah file Excel (<code className="text-brand-400 font-bold">.xlsx</code>) baru.
        </p>

        {/* GitHub Pre-Stored Reports Section */}
        {reports.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-amber-400" />
                Laporan Tersimpan di GitHub ({reports.length})
              </h3>
              <span className="text-[11px] text-slate-400">Klik untuk langsung membuka dashboard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  disabled={loading || isParsing}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-brand-500/50 transition-all text-left group active:scale-[0.99] disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-colors">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100 group-hover:text-brand-400 transition-colors">
                        {report.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{report.fileName}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-xs font-bold text-slate-300 text-left mb-3">Atau Upload File .XLSX Lokal:</p>

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
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-100">
                  Tarik & Lepaskan file <span className="text-brand-400">.xlsx</span> di sini
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  atau klik untuk memilih file dari komputer Anda
                </p>
                
                <button
                  type="button"
                  className="mt-4 px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all active:scale-95"
                >
                  Pilih File Laporan (.xlsx)
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 text-left">
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
