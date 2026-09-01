import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import type { ProcessedDashboardData } from '../types/dashboard';
import { formatShortRupiah, formatRupiah } from '../utils/formatters';
import { Award, AlertTriangle, Calendar, Building } from 'lucide-react';

interface TabExecutiveProps {
  data: ProcessedDashboardData;
  selectedBranch: string;
}

export const TabExecutive: React.FC<TabExecutiveProps> = ({ data, selectedBranch }) => {
  const { summaryOmset } = data;

  // Filter out GRAND TOTAL
  const allBranchesData = summaryOmset.filter(s => s.branch !== 'GRAND TOTAL');

  // ALWAYS calculate Global Top 5 and Global Bottom 5 across ALL branches
  const sortedBranchesByOmset = [...allBranchesData].sort((a, b) => b.totalAgustus - a.totalAgustus);
  const topBranches = [...sortedBranchesByOmset].slice(0, 5);

  const sortedBranchesByAch = [...allBranchesData].sort((a, b) => {
    const achA = a.target > 0 ? a.totalAgustus / a.target : 0;
    const achB = b.target > 0 ? b.totalAgustus / b.target : 0;
    return achA - achB;
  });
  const bottomAchBranches = [...sortedBranchesByAch].slice(0, 5);

  // Bar Chart Data (Filtered if branch selected, or All)
  let chartBranchesData = allBranchesData;
  if (selectedBranch !== 'ALL') {
    chartBranchesData = allBranchesData.filter(s => s.branch === selectedBranch);
  }

  const chartData = chartBranchesData.map(b => ({
    name: b.branch.replace('DTG JOG - ', '').replace('DTG SOLO - ', ''),
    fullName: b.branch,
    Target: b.target,
    'Realisasi (Agustus)': b.totalAgustus,
    'Realisasi (Juli)': b.totalJuli,
    Ach: b.target > 0 ? ((b.totalAgustus / b.target) * 100).toFixed(1) : '0'
  }));

  return (
    <div className="space-y-6">
      
      {/* Target vs Realisasi Bar Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-400" />
              Target vs Realisasi Omset Cabang (Agustus vs Juli)
            </h3>
            <p className="text-xs text-slate-400">
              {selectedBranch === 'ALL' 
                ? 'Perbandingan pencapaian target dan realisasi omset seluruh cabang' 
                : `Menampilkan data omset khusus cabang: ${selectedBranch}`}
            </p>
          </div>
        </div>

        <div className="h-[420px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 95 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                angle={-45}
                textAnchor="end"
                interval={0}
                dy={8}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(val) => formatShortRupiah(val)}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(value: any) => [formatRupiah(Number(value)), '']}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }} />
              <Bar dataKey="Target" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.6} />
              <Bar dataKey="Realisasi (Agustus)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Realisasi (Juli)" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top vs Bottom Performers Row (Always calculated across all branches) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 Performers */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Top 5 Cabang Omset Tertinggi</h4>
              <p className="text-xs text-slate-400">Peringkat 5 besar cabang omset nominal terbesar se-perusahaan</p>
            </div>
          </div>

          <div className="space-y-3">
            {topBranches.map((b, idx) => {
              const ach = b.target > 0 ? (b.totalAgustus / b.target) * 100 : 0;
              const isSelected = b.branch === selectedBranch;
              return (
                <div 
                  key={b.branch} 
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-brand-500/20 border-2 border-brand-400 glow-brand' 
                      : 'bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        {b.branch}
                        {isSelected && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-brand-500 text-white rounded font-bold">Terpilih</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Target: {formatShortRupiah(b.target)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-emerald-400">{formatShortRupiah(b.totalAgustus)}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      {ach.toFixed(1)}% Ach
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom 5 / Need Focus (Always calculated across all branches) */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">5 Cabang Perlu Evaluasi (Pencapaian Target Terendah)</h4>
              <p className="text-xs text-slate-400">Peringkat 5 terendah % pencapaian target (% Achieved) se-perusahaan</p>
            </div>
          </div>

          <div className="space-y-3">
            {bottomAchBranches.map((b, idx) => {
              const ach = b.target > 0 ? (b.totalAgustus / b.target) * 100 : 0;
              const isSelected = b.branch === selectedBranch;
              return (
                <div 
                  key={b.branch} 
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-rose-500/20 border-2 border-rose-400 glow-rose' 
                      : 'bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center border border-rose-500/30">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        {b.branch}
                        {isSelected && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-rose-500 text-white rounded font-bold">Terpilih</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Target: {formatShortRupiah(b.target)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-slate-300">{formatShortRupiah(b.totalAgustus)}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      ach < 95 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {ach.toFixed(1)}% Ach
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Weekly Breakdown Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <div>
            <h4 className="text-sm font-bold text-slate-100">Breakdown Omset Per Minggu (Week 1 - Week 4)</h4>
            <p className="text-xs text-slate-400">
              {selectedBranch === 'ALL' 
                ? 'Perbandingan pergerakan omset mingguan seluruh cabang (Agustus vs Juli)' 
                : `Breakdown mingguan khusus cabang: ${selectedBranch}`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-slate-300 border-b border-slate-800">
                <th className="p-3">CABANG / BRANCH</th>
                <th className="p-3 text-right">WEEK 1 AGUSTUS</th>
                <th className="p-3 text-right">WEEK 2 AGUSTUS</th>
                <th className="p-3 text-right">WEEK 3 AGUSTUS</th>
                <th className="p-3 text-right">WEEK 4 AGUSTUS</th>
                <th className="p-3 text-right">TOTAL AGUSTUS</th>
                <th className="p-3 text-right">TOTAL JULI</th>
                <th className="p-3 text-right">SELISIH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {chartBranchesData.map((b) => {
                const diff = b.totalAgustus - b.totalJuli;
                return (
                  <tr key={b.branch} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-slate-200">{b.branch}</td>
                    <td className="p-3 text-right text-slate-300">{formatShortRupiah(b.week1Agustus)}</td>
                    <td className="p-3 text-right text-slate-300">{formatShortRupiah(b.week2Agustus)}</td>
                    <td className="p-3 text-right text-slate-300">{formatShortRupiah(b.week3Agustus)}</td>
                    <td className="p-3 text-right text-slate-300">{formatShortRupiah(b.week4Agustus)}</td>
                    <td className="p-3 text-right font-extrabold text-brand-400">{formatShortRupiah(b.totalAgustus)}</td>
                    <td className="p-3 text-right text-slate-400">{formatShortRupiah(b.totalJuli)}</td>
                    <td className={`p-3 text-right font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {diff >= 0 ? '+' : ''}{formatShortRupiah(diff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
