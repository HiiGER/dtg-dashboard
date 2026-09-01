export const formatRupiah = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatShortRupiah = (amount: number): string => {
  if (isNaN(amount) || amount === 0) return 'Rp 0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2)} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1)} Jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${(abs / 1_000).toFixed(0)} Rb`;
  }
  return `${sign}Rp ${abs.toFixed(0)}`;
};

export const formatPercent = (percent: number, includeSign: boolean = true): string => {
  if (isNaN(percent) || percent === null || percent === undefined) return '0%';
  const sign = includeSign && percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}%`;
};

export const formatNumber = (num: number): string => {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
};
