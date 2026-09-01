import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { ProcessedDashboardData } from '../types/dashboard';
import { formatRupiah, formatShortRupiah, formatNumber, formatPercent } from '../utils/formatters';
import { Building2, ShoppingBag, TrendingUp } from 'lucide-react';

interface TabBranchDeepDiveProps {
  data: ProcessedDashboardData;
}

export const TabBranchDeepDive: React.FC<TabBranchDeepDiveProps> = ({ data }) => {
  const { branches, summaryOmset, dailyOmsetAgustus, masterPaymentAgustus, terjualAgustus } = data;

  const [activeBranch, setActiveBranch] = useState<string>(branches[0] || '');

  // Branch Summary Info
  const summary = summaryOmset.find(s => s.branch === activeBranch);
  const daily = dailyOmsetAgustus.find(d => d.branch === activeBranch);
  const payments = masterPaymentAgustus.filter(m => m.branch === activeBranch);
  const products = terjualAgustus.filter(t => t.branch === activeBranch);

  const target = summary?.target || 0;
  const totalAgustus = summary?.totalAgustus || 0;
  const totalJuli = summary?.totalJuli || 0;
  const achPercent = target > 0 ? (totalAgustus / target) * 100 : 0;
  const momGrowth = totalJuli > 0 ? ((totalAgustus - totalJuli) / totalJuli) * 100 : 0;

  const totalTx = payments.reduce((acc, p) => acc + p.paymentCount, 0);
  const totalMdr = payments.reduce((acc, p) => acc + p.mdr, 0);
  const totalItems = products.reduce((acc, t) => acc + t.qty, 0);

  // Daily Chart Data
  const dailyChartData = daily?.daily.map(d => ({
    day: `Tgl ${d.dayNum}`,
    Omset: d.amount
  })) || [];

  // Top 5 Products for this branch
  const productAggMap = new Map<string, { name: string; qty: number; total: number }>();
  products.forEach(p => {
    const key = p.menuName || p.menuCode;
    if (!key) return;
    const existing = productAggMap.get(key);
    if (existing) {
      existing.qty += p.qty;
      existing.total += p.total;
    } else {
      productAggMap.set(key, { name: p.menuName, qty: p.qty, total: p.total });
    }
  });
  const topBranchProducts = Array.from(productAggMap.values()).sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Branch Selector Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Analisis Mendalam Per Cabang</h3>
            <p className="text-xs text-slate-400">Pilih cabang untuk melihat performa detail, tren harian, dan menu favorit</p>
          </div>
        </div>

        <select
          value={activeBranch}
          onChange={(e) => setActiveBranch(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-brand-400 cursor-pointer w-full sm:w-auto"
        >
          {branches.map(b => (
            <option key={b} value={b} className="bg-slate-900 text-slate-200">
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Branch KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-400">TOTAL OMSET AGUSTUS</p>
          <p className="text-xl font-extrabold text-white mt-1">{formatRupiah(totalAgustus)}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${momGrowth >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {formatPercent(momGrowth)} MoM
            </span>
            <span className="text-[11px] text-slate-400">vs Juli</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-400">PENCAPAIAN TARGET</p>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">{achPercent.toFixed(1)}%</p>
          <p className="text-xs text-slate-400 mt-2">Target: {formatShortRupiah(target)}</p>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-400">TOTAL STRUK / TRANSAKSI</p>
          <p className="text-xl font-extrabold text-cyan-400 mt-1">{formatNumber(totalTx)} Struk</p>
          <p className="text-xs text-slate-400 mt-2">Biaya MDR: {formatShortRupiah(totalMdr)}</p>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-400">TOTAL UNIT TERJUAL</p>
          <p className="text-xl font-extrabold text-purple-400 mt-1">{formatNumber(totalItems)} Pcs</p>
          <p className="text-xs text-slate-400 mt-2">Kuantitas produk laku</p>
        </div>

      </div>

      {/* Daily Omset Chart for Branch */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h4 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-400" />
          Tren Pergerakan Omset Harian Cabang: <span className="text-brand-400">{activeBranch}</span>
        </h4>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="branchGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0c94e8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0c94e8" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => formatShortRupiah(v)} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [formatRupiah(Number(val)), 'Omset Harian']}
              />
              <Area type="monotone" dataKey="Omset" stroke="#0c94e8" strokeWidth={3} fill="url(#branchGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products in Branch */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h4 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          Top 5 Menu Paling Laku di {activeBranch}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topBranchProducts.map((p, idx) => (
            <div key={p.name} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition-all">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-400">
                Rank #{idx + 1}
              </span>
              <p className="text-xs font-bold text-slate-200 mt-2 truncate">{p.name}</p>
              <p className="text-xs font-extrabold text-emerald-400 mt-1">{formatRupiah(p.total)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{formatNumber(p.qty)} Pcs Terjual</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
