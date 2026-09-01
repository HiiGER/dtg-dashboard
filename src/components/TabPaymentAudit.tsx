import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import type { ProcessedDashboardData } from '../types/dashboard';
import { formatRupiah, formatShortRupiah, formatNumber } from '../utils/formatters';
import { CreditCard, Percent, DollarSign, Building } from 'lucide-react';

interface TabPaymentAuditProps {
  data: ProcessedDashboardData;
  selectedBranch: string;
}

export const TabPaymentAudit: React.FC<TabPaymentAuditProps> = ({ data, selectedBranch }) => {
  const { masterPaymentAgustus } = data;

  const filteredPayments = useMemo(() => {
    if (selectedBranch === 'ALL') return masterPaymentAgustus;
    return masterPaymentAgustus.filter(p => p.branch === selectedBranch);
  }, [masterPaymentAgustus, selectedBranch]);

  // Aggregate by Payment Type
  const paymentTypeAgg = useMemo(() => {
    const map = new Map<string, { type: string; count: number; amount: number; mdr: number; net: number }>();
    filteredPayments.forEach(p => {
      const type = p.paymentName || p.paymentType || 'CASH';
      const existing = map.get(type);
      if (existing) {
        existing.count += p.paymentCount;
        existing.amount += p.paymentAmount;
        existing.mdr += p.mdr;
        existing.net += p.netAfterMdr;
      } else {
        map.set(type, {
          type,
          count: p.paymentCount,
          amount: p.paymentAmount,
          mdr: p.mdr,
          net: p.netAfterMdr
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [filteredPayments]);

  const totalGross = paymentTypeAgg.reduce((acc, p) => acc + p.amount, 0);
  const totalMdr = paymentTypeAgg.reduce((acc, p) => acc + p.mdr, 0);
  const totalNet = paymentTypeAgg.reduce((acc, p) => acc + p.net, 0);

  return (
    <div className="space-y-6">
      
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Gross Revenue */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">TOTAL PENDAPATAN KOTOR (GROSS)</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{formatRupiah(totalGross)}</p>
            <p className="text-xs text-slate-400">Sebelum dipotong MDR bank</p>
          </div>
        </div>

        {/* Total MDR */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">TOTAL BIAYA MDR (POTONGAN BANK)</p>
            <p className="text-xl font-extrabold text-rose-400 mt-0.5">{formatRupiah(totalMdr)}</p>
            <p className="text-xs text-rose-300">
              Rata-rata: {totalGross > 0 ? ((totalMdr / totalGross) * 100).toFixed(2) : 0}% dari gross
            </p>
          </div>
        </div>

        {/* Net Revenue */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">PENDAPATAN BERSIH (NET REVENUE)</p>
            <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{formatRupiah(totalNet)}</p>
            <p className="text-xs text-emerald-300 font-semibold">Net setelah dikurangi MDR</p>
          </div>
        </div>

      </div>

      {/* Bar Chart: Payment Amount per Type */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-brand-400" />
          Komposisi Metode Pembayaran (Cash vs QRIS vs EDC vs POS)
        </h3>
        <p className="text-xs text-slate-400 mb-4">Total nominal dan jumlah transaksi per kanal pembayaran</p>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentTypeAgg} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="type" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} dy={5} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => formatShortRupiah(v)} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [formatRupiah(Number(val)), '']}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '15px', fontSize: '12px' }} />
              <Bar dataKey="amount" name="Nominal Pembayaran" fill="#0c94e8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mdr" name="Potongan MDR" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audit Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h4 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Building className="w-4 h-4 text-purple-400" />
          Tabel Audit Biaya MDR Per Metode Pembayaran
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
                <th className="p-3">METODE PEMBAYARAN</th>
                <th className="p-3 text-right">JUMLAH STRUK (TX)</th>
                <th className="p-3 text-right">GROSS AMOUNT</th>
                <th className="p-3 text-right">BIAYA MDR</th>
                <th className="p-3 text-right">EFEKTIF MDR (%)</th>
                <th className="p-3 text-right">NET AFTER MDR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paymentTypeAgg.map((p) => {
                const effMdr = p.amount > 0 ? (p.mdr / p.amount) * 100 : 0;
                return (
                  <tr key={p.type} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-slate-200">{p.type}</td>
                    <td className="p-3 text-right text-slate-300">{formatNumber(p.count)}</td>
                    <td className="p-3 text-right text-slate-300">{formatRupiah(p.amount)}</td>
                    <td className="p-3 text-right font-semibold text-rose-400">{formatRupiah(p.mdr)}</td>
                    <td className="p-3 text-right text-rose-300">{effMdr.toFixed(2)}%</td>
                    <td className="p-3 text-right font-extrabold text-emerald-400">{formatRupiah(p.net)}</td>
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
