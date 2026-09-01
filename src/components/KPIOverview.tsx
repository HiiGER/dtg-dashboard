import React from 'react';
import { DollarSign, TrendingUp, Target, ShoppingBag, CreditCard, Percent } from 'lucide-react';
import type { ProcessedDashboardData } from '../types/dashboard';
import { formatShortRupiah, formatPercent, formatNumber, formatRupiah } from '../utils/formatters';

interface KPIOverviewProps {
  data: ProcessedDashboardData;
  selectedBranch: string;
}

export const KPIOverview: React.FC<KPIOverviewProps> = ({ data, selectedBranch }) => {
  let { kpis, summaryOmset, masterPaymentAgustus, terjualAgustus } = data;

  let totalOmsetAgustus = kpis.totalOmsetAgustus;
  let totalOmsetJuli = kpis.totalOmsetJuli;
  let totalTarget = kpis.totalTarget;
  let totalTx = kpis.totalTransactionsAgustus;
  let totalItems = kpis.totalItemsSoldAgustus;
  let totalMdr = kpis.totalMdrAgustus;

  // Filter if branch selected
  if (selectedBranch !== 'ALL') {
    const bSummary = summaryOmset.find(s => s.branch === selectedBranch);
    if (bSummary) {
      totalOmsetAgustus = bSummary.totalAgustus;
      totalOmsetJuli = bSummary.totalJuli;
      totalTarget = bSummary.target;
    }
    const bPayment = masterPaymentAgustus.filter(m => m.branch === selectedBranch);
    totalTx = bPayment.reduce((acc, p) => acc + p.paymentCount, 0);
    totalMdr = bPayment.reduce((acc, p) => acc + p.mdr, 0);

    const bTerjual = terjualAgustus.filter(t => t.branch === selectedBranch);
    totalItems = bTerjual.reduce((acc, t) => acc + t.qty, 0);
  }

  const achPercent = totalTarget > 0 ? (totalOmsetAgustus / totalTarget) * 100 : 0;
  const momGrowth = totalOmsetJuli > 0 ? ((totalOmsetAgustus - totalOmsetJuli) / totalOmsetJuli) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      
      {/* Card 1: Total Omset */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-all text-brand-400">
          <DollarSign className="w-16 h-16" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <span>TOTAL OMSET (AGUSTUS)</span>
        </div>
        <div className="text-xl lg:text-2xl font-extrabold text-white mt-1 tracking-tight">
          {formatShortRupiah(totalOmsetAgustus)}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
            momGrowth >= 0 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            <TrendingUp className={`w-3 h-3 ${momGrowth < 0 ? 'rotate-180' : ''}`} />
            {formatPercent(momGrowth)} MoM
          </span>
          <span className="text-[11px] text-slate-400">vs Juli</span>
        </div>
      </div>

      {/* Card 2: Target Achievement */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-all text-emerald-400">
          <Target className="w-16 h-16" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Target className="w-3.5 h-3.5" />
          </div>
          <span>TARGET ACHIEVED</span>
        </div>
        <div className="text-xl lg:text-2xl font-extrabold text-emerald-400 mt-1 tracking-tight flex items-baseline gap-1">
          {achPercent.toFixed(1)}%
          <span className="text-xs font-normal text-slate-400">
            ({formatShortRupiah(totalTarget)})
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(achPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Card 3: Items Sold */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-all text-cyan-400">
          <ShoppingBag className="w-16 h-16" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <span>PRODUK TERJUAL</span>
        </div>
        <div className="text-xl lg:text-2xl font-extrabold text-white mt-1 tracking-tight">
          {formatNumber(totalItems)} <span className="text-xs font-semibold text-slate-400">Pcs</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-2">
          Total kuantitas barang laku
        </div>
      </div>

      {/* Card 4: Transactions Count */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-all text-purple-400">
          <CreditCard className="w-16 h-16" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <span>JUMLAH TRANSAKSI</span>
        </div>
        <div className="text-xl lg:text-2xl font-extrabold text-white mt-1 tracking-tight">
          {formatNumber(totalTx)} <span className="text-xs font-semibold text-slate-400">Struk</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-2">
          Rata-rata: {totalTx > 0 ? formatRupiah(totalOmsetAgustus / totalTx) : 'Rp 0'} / Struk
        </div>
      </div>

      {/* Card 5: MDR Bank Fee */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-all text-rose-400">
          <Percent className="w-16 h-16" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Percent className="w-3.5 h-3.5" />
          </div>
          <span>BIAYA MDR BANK</span>
        </div>
        <div className="text-xl lg:text-2xl font-extrabold text-rose-400 mt-1 tracking-tight">
          {formatShortRupiah(totalMdr)}
        </div>
        <div className="text-[11px] text-slate-400 mt-2">
          Potongan MDR EDC & QRIS
        </div>
      </div>

    </div>
  );
};
