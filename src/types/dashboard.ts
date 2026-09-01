export interface SummaryOmsetRow {
  branch: string;
  target: number;
  potensiAch: number;
  totalAgustus: number;
  totalJuli: number;
  avgAgustus: number;
  avgJuli: number;
  week1Agustus: number;
  week1Juli: number;
  selisihWeek1: number;
  week2Agustus: number;
  week2Juli: number;
  selisihWeek2: number;
  week3Agustus: number;
  week3Juli: number;
  selisihWeek3: number;
  week4Agustus: number;
  week4Juli: number;
  selisihWeek4: number;
}

export interface DailyOmsetBranch {
  branch: string;
  total: number;
  daily: { dateStr: string; dayNum: number; amount: number }[];
}

export interface MasterPaymentRow {
  branch: string;
  paymentType: string; // CASH, QRIS, EDC, POS, etc.
  paymentName: string; // Bank name / payment provider
  transactionType: string;
  paymentCount: number;
  paymentAmount: number;
  mdr: number;
  netAfterMdr: number;
}

export interface TerjualRow {
  branch: string;
  salesDate: string;
  salesType: string;
  category: string;
  categoryDetail: string;
  menuName: string;
  menuCode: string;
  type: string;
  qty: number;
  subtotal: number;
  serviceCharge: number;
  taxTotal: number;
  vatTotal: number;
  total: number;
}

export interface ProductMatrixRow {
  branch: string;
  category: string;
  categoryDetail: string;
  menuCode: string;
  productName: string;
  price: number;
  status: string;
  totalJuli: number;
  totalAgustus: number;
  region: 'Bantul & Gunungkidul' | 'Surakarta' | 'Lainnya';
}

export interface PromoRow {
  branch: string;
  category: string;
  menuName: string;
  price: number;
  status: string;
  terjualJuli: number;
  terjualAgustus: number;
}

export interface ProcessedDashboardData {
  fileName: string;
  parsedAt: string;
  summaryOmset: SummaryOmsetRow[];
  dailyOmsetAgustus: DailyOmsetBranch[];
  dailyOmsetJuli: DailyOmsetBranch[];
  masterPaymentAgustus: MasterPaymentRow[];
  masterPaymentJuli: MasterPaymentRow[];
  terjualAgustus: TerjualRow[];
  terjualJuli: TerjualRow[];
  productMatrix: ProductMatrixRow[];
  promos: PromoRow[];
  
  // Aggregate KPIs
  kpis: {
    totalOmsetAgustus: number;
    totalOmsetJuli: number;
    totalTarget: number;
    overallAchPercentage: number;
    momGrowthPercentage: number;
    totalTransactionsAgustus: number;
    totalItemsSoldAgustus: number;
    totalMdrAgustus: number;
    totalNetAgustus: number;
  };
  
  // Lists for Filter Dropdowns
  branches: string[];
  categories: string[];
  regions: string[];
}
