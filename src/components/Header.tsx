import React from 'react';
import { Upload, FileSpreadsheet, Download, Building2, FolderGit2 } from 'lucide-react';
import type { ProcessedDashboardData } from '../types/dashboard';
import type { ReportItem } from '../utils/reportLoader';
import { SearchableSelect } from './SearchableSelect';
import type { SelectOption } from './SearchableSelect';
import logoImg from '../assets/logo.webp';

interface HeaderProps {
  data: ProcessedDashboardData | null;
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  onOpenUpload: () => void;
  onExportPdf: () => void;
  reports: ReportItem[];
  selectedReportId: string;
  onSelectReport: (report: ReportItem) => void;
  isParsing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  data,
  selectedBranch,
  onSelectBranch,
  onOpenUpload,
  onExportPdf,
  reports,
  selectedReportId,
  onSelectReport,
  isParsing
}) => {
  // Format Report options for SearchableSelect
  const reportOptions: SelectOption[] = reports.map(r => ({
    value: r.id,
    label: r.name,
    sublabel: r.fileName
  }));

  // Format Branch options for SearchableSelect
  const branchOptions: SelectOption[] = data ? [
    { value: 'ALL', label: `Semua Cabang (${data.branches.length})` },
    ...data.branches.map(b => ({ value: b, label: b }))
  ] : [];

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Brand & File Info */}
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-auto flex items-center justify-center shrink-0">
            <img src={logoImg} alt="DTG Logo" className="h-full w-auto object-contain drop-shadow-md" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                DTG Analytics
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                DB-LESS
              </span>
            </div>
            
            {data ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium text-slate-300 truncate max-w-[200px] sm:max-w-[300px]">
                  {data.fileName}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Parsed: {data.parsedAt}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Pilih laporan GitHub atau unggah file .xlsx baru</p>
            )}
          </div>
        </div>

        {/* Right: Actions & Searchable Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* GitHub Report Searchable Select */}
          {reports.length > 0 && (
            <SearchableSelect
              options={reportOptions}
              value={selectedReportId}
              onChange={(reportId) => {
                const found = reports.find(r => r.id === reportId);
                if (found) onSelectReport(found);
              }}
              placeholder="Pilih Laporan GitHub..."
              searchPlaceholder="Cari nama / file laporan..."
              icon={<FolderGit2 className="w-3.5 h-3.5 text-amber-400" />}
              disabled={isParsing}
            />
          )}

          {/* Branch Searchable Select */}
          {data && (
            <SearchableSelect
              options={branchOptions}
              value={selectedBranch}
              onChange={onSelectBranch}
              placeholder="Pilih Cabang..."
              searchPlaceholder="Cari nama cabang..."
              icon={<Building2 className="w-3.5 h-3.5 text-brand-400" />}
            />
          )}

          {/* Upload XLSX Button */}
          <button
            onClick={onOpenUpload}
            disabled={isParsing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-cyan-500 shadow-md shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Custom</span>
          </button>

          {/* Export PDF Button */}
          {data && (
            <button
              onClick={onExportPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all active:scale-95 cursor-pointer"
              title="Cetak Ringkasan Dashboard / Download Snapshot"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cetak PDF</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
