import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import type { ProcessedDashboardData } from '../types/dashboard';
import { formatRupiah, formatShortRupiah } from '../utils/formatters';
import { TrendingUp, Calendar, Zap, Sun, Award } from 'lucide-react';

interface TabSalesTrendsProps {
  data: ProcessedDashboardData;
  selectedBranch: string;
}

export const TabSalesTrends: React.FC<TabSalesTrendsProps> = ({ data, selectedBranch }) => {
  const { dailyOmsetAgustus, dailyOmsetJuli } = data;

  // Filter out GRAND TOTAL row when summing all branches to prevent double counting
  let agustusBranchData = dailyOmsetAgustus.filter(d => d.branch !== 'GRAND TOTAL');
  let juliBranchData = dailyOmsetJuli.filter(d => d.branch !== 'GRAND TOTAL');

  if (selectedBranch !== 'ALL') {
    agustusBranchData = dailyOmsetAgustus.filter(d => d.branch === selectedBranch);
    juliBranchData = dailyOmsetJuli.filter(d => d.branch === selectedBranch);
  }

  // Combine daily totals for day 1 to 31
  const daysCount = 31;
  const combinedDaily: { day: string; Agustus: number; Juli: number }[] = [];

  for (let dayNum = 1; dayNum <= daysCount; dayNum++) {
    // Sum across individual branches for this day
    let sumAgustus = 0;
    agustusBranchData.forEach(b => {
      const dayItem = b.daily.find(d => d.dayNum === dayNum);
      if (dayItem) sumAgustus += dayItem.amount;
    });

    let sumJuli = 0;
    juliBranchData.forEach(b => {
      const dayItem = b.daily.find(d => d.dayNum === dayNum);
      if (dayItem) sumJuli += dayItem.amount;
    });

    combinedDaily.push({
      day: `Tgl ${dayNum}`,
      Agustus: sumAgustus,
      Juli: sumJuli
    });
  }

  // Find Peak Sales Day
  const sortedPeakDays = [...combinedDaily].sort((a, b) => b.Agustus - a.Agustus);
  const topPeakDay = sortedPeakDays[0];
  const avgDailyOmset = combinedDaily.reduce((acc, curr) => acc + curr.Agustus, 0) / daysCount;

  return (
    <div className="space-y-6">
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Peak Sales Day */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">HARI OMSET TERTINGGI (PEAK DAY)</p>
            <p className="text-lg font-extrabold text-white mt-0.5">
              {topPeakDay ? topPeakDay.day : '-'}
            </p>
            <p className="text-xs font-bold text-amber-400">
              {topPeakDay ? formatRupiah(topPeakDay.Agustus) : 'Rp 0'}
            </p>
          </div>
        </div>

        {/* Daily Average Omset */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">RATA-RATA OMSET PER HARI</p>
            <p className="text-lg font-extrabold text-white mt-0.5">
              {formatShortRupiah(avgDailyOmset)}
            </p>
            <p className="text-xs text-slate-400">Target Harian: {formatShortRupiah(data.kpis.totalTarget / 31)}</p>
          </div>
        </div>

        {/* Days Count */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">TOTAL PERIODE TERLAPOR</p>
            <p className="text-lg font-extrabold text-white mt-0.5">31 Hari Operasional</p>
            <p className="text-xs text-emerald-400 font-semibold">100% Data Complete</p>
          </div>
        </div>

      </div>

      {/* Main Area Chart: Daily Revenue Comparison */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Kurva Omset Harian (Agustus vs Juli)
            </h3>
            <p className="text-xs text-slate-400">
              Perbandingan tren pendapatan harian tanggal 1 s/d 31 antara bulan Agustus & Juli
            </p>
          </div>
        </div>

        <div className="h-[360px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedDaily} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorAgustus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorJuli" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => formatShortRupiah(val)} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [formatRupiah(Number(val)), '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="Agustus" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAgustus)" />
              <Area type="monotone" dataKey="Juli" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorJuli)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap Matrix of Days */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h4 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Heatmap Intensitas Omset Harian (Agustus)
        </h4>
        <p className="text-xs text-slate-400 mb-4">
          Warna ditentukan dari rasio omset harian terhadap rata-rata omset harian ({formatShortRupiah(avgDailyOmset)}/hari):
          <span className="text-emerald-400 font-bold ml-1">Hijau glowing</span> (&gt;140% rata-rata), 
          <span className="text-brand-400 font-bold ml-1">Biru</span> (&gt;100% rata-rata), 
          <span className="text-slate-400 font-bold ml-1">Slate</span> (&le;100% rata-rata).
        </p>
        <div className="grid grid-cols-7 gap-2">
          {combinedDaily.map((item, idx) => {
            const ratio = avgDailyOmset > 0 ? item.Agustus / avgDailyOmset : 0;
            let bgColor = 'bg-slate-900 border-slate-800 text-slate-400';
            if (ratio > 1.4) bgColor = 'bg-emerald-500/30 border-emerald-500/60 text-emerald-300 glow-emerald font-bold';
            else if (ratio > 1.0) bgColor = 'bg-brand-500/20 border-brand-500/40 text-brand-300 font-semibold';
            else if (ratio > 0.7) bgColor = 'bg-slate-800/80 border-slate-700 text-slate-300';

            return (
              <div key={idx} className={`p-2.5 rounded-xl border text-center transition-all ${bgColor}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{item.day}</p>
                <p className="text-xs font-extrabold mt-1">{formatShortRupiah(item.Agustus)}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
