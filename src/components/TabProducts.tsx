import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import type { ProcessedDashboardData } from '../types/dashboard';
import { formatRupiah, formatShortRupiah, formatNumber } from '../utils/formatters';
import { ShoppingBag, Search, Filter, Layers } from 'lucide-react';

interface TabProductsProps {
  data: ProcessedDashboardData;
  selectedBranch: string;
}

const COLORS = ['#0c94e8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#64748b'];

export const TabProducts: React.FC<TabProductsProps> = ({ data, selectedBranch }) => {
  const { terjualAgustus, categories } = data;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Filter transactions
  const filteredTerjual = useMemo(() => {
    return terjualAgustus.filter(t => {
      const matchBranch = selectedBranch === 'ALL' || t.branch === selectedBranch;
      const matchCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
      const matchSearch = !searchTerm || 
        t.menuName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.menuCode.toLowerCase().includes(searchTerm.toLowerCase());
      return matchBranch && matchCategory && matchSearch;
    });
  }, [terjualAgustus, selectedBranch, selectedCategory, searchTerm]);

  // Aggregate Category Breakdown
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTerjual.forEach(t => {
      const cat = t.category || 'Lainnya';
      map.set(cat, (map.get(cat) || 0) + t.total);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTerjual]);

  // Aggregate Top Products by Menu Name
  const topProducts = useMemo(() => {
    const map = new Map<string, { menuName: string; category: string; qty: number; total: number }>();
    filteredTerjual.forEach(t => {
      const key = t.menuName || t.menuCode;
      if (!key) return;
      const existing = map.get(key);
      if (existing) {
        existing.qty += t.qty;
        existing.total += t.total;
      } else {
        map.set(key, {
          menuName: t.menuName,
          category: t.category,
          qty: t.qty,
          total: t.total
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filteredTerjual]);

  return (
    <div className="space-y-6">
      
      {/* Category Chart & Top 5 Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Share Donut Chart */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-400" />
            Proporsi Penjualan Berdasarkan Kategori
          </h3>
          <p className="text-xs text-slate-400 mb-4">Kontribusi omset per kelompok produk (Alcohol, Beer, Wine, dll)</p>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [formatRupiah(Number(val)), 'Omset']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Products Leaderboard */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            Top 5 Produk Terlaris (Revenue)
          </h3>
          <p className="text-xs text-slate-400 mb-4">Menu dengan omset penjualan tertinggi bulan ini</p>

          <div className="space-y-3">
            {topProducts.slice(0, 5).map((p, idx) => (
              <div key={p.menuName} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center border border-emerald-500/30">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-200 truncate max-w-[200px] sm:max-w-[280px]">
                      {p.menuName}
                    </p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {p.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-emerald-400">{formatRupiah(p.total)}</p>
                  <p className="text-[11px] text-slate-400">{formatNumber(p.qty)} Pcs Terjual</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Interactive Products Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-base font-bold text-slate-100">Daftar Lengkap Penjualan Produk</h4>
            <p className="text-xs text-slate-400">Pencarian dan filter dari total {formatNumber(filteredTerjual.length)} data transaksi</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama menu / kode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-400 w-48 sm:w-64"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c} value={c} className="bg-slate-900">{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[420px] scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-900/90 backdrop-blur text-slate-300 border-b border-slate-800 z-10">
              <tr>
                <th className="p-3">KODE & NAMA MENU</th>
                <th className="p-3">KATEGORI</th>
                <th className="p-3">CABANG</th>
                <th className="p-3 text-right">QTY TERJUAL</th>
                <th className="p-3 text-right">SUBTOTAL</th>
                <th className="p-3 text-right">TOTAL NETT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topProducts.slice(0, 100).map((p, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <p className="font-bold text-slate-200">{p.menuName}</p>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-semibold border border-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{selectedBranch === 'ALL' ? 'Multi Cabang' : selectedBranch}</td>
                  <td className="p-3 text-right font-semibold text-slate-200">{formatNumber(p.qty)}</td>
                  <td className="p-3 text-right text-slate-300">{formatShortRupiah(p.total)}</td>
                  <td className="p-3 text-right font-extrabold text-brand-400">{formatRupiah(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
