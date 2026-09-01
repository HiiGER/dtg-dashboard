import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUploadModal } from './components/FileUploadModal';
import { UploadLanding } from './components/UploadLanding';
import { KPIOverview } from './components/KPIOverview';
import { TabExecutive } from './components/TabExecutive';
import { TabSalesTrends } from './components/TabSalesTrends';
import { TabProducts } from './components/TabProducts';
import { TabPaymentAudit } from './components/TabPaymentAudit';
import { TabBranchDeepDive } from './components/TabBranchDeepDive';

import type { ProcessedDashboardData } from './types/dashboard';
import { parseExcelWorkbook } from './utils/excelParser';
import { fetchReportsIndex, fetchReportArrayBuffer } from './utils/reportLoader';
import type { ReportItem } from './utils/reportLoader';
import { LayoutDashboard, TrendingUp, ShoppingBag, CreditCard, Building2 } from 'lucide-react';

export function App() {
  const [data, setData] = useState<ProcessedDashboardData | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'executive' | 'trends' | 'products' | 'payments' | 'branch'>('executive');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);

  // GitHub Reports state
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');

  // Fetch index of available GitHub reports on mount
  useEffect(() => {
    fetchReportsIndex().then((items) => {
      setReports(items);
    });
  }, []);

  const handleDataParsed = (newData: ProcessedDashboardData) => {
    setData(newData);
    setSelectedBranch('ALL');
  };

  const handleSelectReport = async (report: ReportItem) => {
    try {
      setIsParsing(true);
      setSelectedReportId(report.id);
      
      const buffer = await fetchReportArrayBuffer(report.url, report.fileName);
      const parsedData = parseExcelWorkbook(buffer, report.fileName);
      
      setData(parsedData);
      setSelectedBranch('ALL');
      setIsParsing(false);
    } catch (err: any) {
      console.error('Failed to load GitHub report', err);
      alert(err?.message || 'Gagal memuat laporan dari server.');
      setIsParsing(false);
    }
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans antialiased">
      
      {/* Top Navbar */}
      <Header
        data={data}
        selectedBranch={selectedBranch}
        onSelectBranch={setSelectedBranch}
        onOpenUpload={() => setIsUploadOpen(true)}
        onExportPdf={handleExportPdf}
        reports={reports}
        selectedReportId={selectedReportId}
        onSelectReport={handleSelectReport}
        isParsing={isParsing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {data ? (
          <>
            {/* Top KPI Cards Overview */}
            <KPIOverview data={data} selectedBranch={selectedBranch} />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-6 border-b border-slate-800 scrollbar-none">
              <button
                onClick={() => setActiveTab('executive')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'executive'
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 glow-brand'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Executive Summary</span>
              </button>

              <button
                onClick={() => setActiveTab('trends')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'trends'
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 glow-brand'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Sales & Revenue Trends</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'products'
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 glow-brand'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Product & Category Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'payments'
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 glow-brand'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Payment Audit & MDR</span>
              </button>

              <button
                onClick={() => setActiveTab('branch')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'branch'
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 glow-brand'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Branch Deep-Dive</span>
              </button>
            </div>

            {/* Tab Views */}
            <div className="animate-fade-in">
              {activeTab === 'executive' && <TabExecutive data={data} selectedBranch={selectedBranch} />}
              {activeTab === 'trends' && <TabSalesTrends data={data} selectedBranch={selectedBranch} />}
              {activeTab === 'products' && <TabProducts data={data} selectedBranch={selectedBranch} />}
              {activeTab === 'payments' && <TabPaymentAudit data={data} selectedBranch={selectedBranch} />}
              {activeTab === 'branch' && <TabBranchDeepDive data={data} />}
            </div>
          </>
        ) : (
          <UploadLanding
            onDataParsed={handleDataParsed}
            reports={reports}
            onSelectReport={handleSelectReport}
            isParsing={isParsing}
          />
        )}

      </main>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataParsed={handleDataParsed}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <p>
          DTG Dashboard Analytics • Built with React, Tailwind CSS & Recharts • Vercel Ready (Serverless & DB-Less)
        </p>
      </footer>
    </div>
  );
}

export default App;
