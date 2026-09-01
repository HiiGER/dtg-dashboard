import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { parseExcelWorkbook, readFileAsArrayBuffer } from '../utils/excelParser';
import type { ProcessedDashboardData } from '../types/dashboard';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataParsed: (data: ProcessedDashboardData) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onDataParsed,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal membaca file Excel. Pastikan file memiliki struktur laporan DTG yang sesuai.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/60 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-3 glow-brand">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Unggah File Laporan Excel</h2>
          <p className="text-xs text-slate-400 mt-1">
            Proses dilakukan 100% di browser Anda (In-Memory Parsing). Data tidak dikirim ke server backend.
          </p>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !loading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-900/80'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".xlsx, .xls"
            className="hidden"
          />

          {loading ? (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="w-10 h-10 text-brand-400 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-200">Mengekstrak Data Excel (11 Sheet)...</p>
              <p className="text-xs text-slate-400 mt-1">Memproses puluhan ribu transaksi detail...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FileSpreadsheet className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-200">
                Tarik & Lepaskan file <span className="text-brand-400 font-bold">.xlsx</span> di sini, atau <span className="underline text-brand-400">Pilih File</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Mendukung format laporan bulanan DTG (misal: <code className="text-slate-300">AGUSTUS 2026.xlsx</code>)
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Expected Sheets Info */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Sheet Terdeteksi Otomatis:
          </p>
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            {['SUMMARY OMSET', 'OMSET AGUSTUS', 'MASTER AGUSTUS', 'TERJUAL AGUSTUS', 'PROMO TERJUAL'].map((s) => (
              <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {s}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
