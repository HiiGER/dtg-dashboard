import * as XLSX from 'xlsx';
import type {
  ProcessedDashboardData,
  SummaryOmsetRow,
  DailyOmsetBranch,
  MasterPaymentRow,
  TerjualRow,
  ProductMatrixRow,
  PromoRow
} from '../types/dashboard';

export function parseNum(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function excelSerialToDateStr(serial: any): string {
  if (!serial) return '';
  const num = Number(serial);
  if (isNaN(num) || num < 30000) return String(serial);
  
  // Excel base date is 1899-12-30
  const date = new Date(Math.round((num - 25569) * 86400 * 1000));
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    // Try standard file.arrayBuffer() first if available, fallback to FileReader
    if (typeof file.arrayBuffer === 'function') {
      file.arrayBuffer()
        .then(resolve)
        .catch(() => {
          // Fallback to FileReader if arrayBuffer() fails due to browser handle detachment
          readWithFileReader(file, resolve, reject);
        });
    } else {
      readWithFileReader(file, resolve, reject);
    }
  });
}

function readWithFileReader(file: File, resolve: (buf: ArrayBuffer) => void, reject: (err: Error) => void) {
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      resolve(e.target.result as ArrayBuffer);
    } else {
      reject(new Error('Gagal membaca file spreadsheet. Buffer kosong.'));
    }
  };
  reader.onerror = () => {
    reject(reader.error || new Error('Gagal mengakses file dari sistem penyimpanan.'));
  };
  reader.readAsArrayBuffer(file);
}

export function parseExcelWorkbook(fileBuffer: ArrayBuffer, fileName: string): ProcessedDashboardData {
  const workbook = XLSX.read(fileBuffer, { type: 'array', cellDates: false });
  
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('File Excel tidak berisi sheet apapun.');
  }

  // 1. Parse SUMMARY OMSET
  const summaryOmsetSheet = workbook.Sheets['SUMMARY OMSET'] || workbook.Sheets[workbook.SheetNames[0]];
  const summaryRowsRaw: any[] = summaryOmsetSheet ? XLSX.utils.sheet_to_json(summaryOmsetSheet, { header: 1, defval: '' }) : [];
  
  const summaryOmset: SummaryOmsetRow[] = [];
  if (summaryRowsRaw.length > 1) {
    for (let i = 1; i < summaryRowsRaw.length; i++) {
      const row = summaryRowsRaw[i];
      const branchName = String(row[0] || '').trim();
      if (!branchName) continue;
      
      summaryOmset.push({
        branch: branchName,
        target: parseNum(row[1]),
        potensiAch: parseNum(row[2]),
        totalAgustus: parseNum(row[3]),
        totalJuli: parseNum(row[4]),
        avgAgustus: parseNum(row[5]),
        avgJuli: parseNum(row[6]),
        week1Agustus: parseNum(row[7]),
        week1Juli: parseNum(row[8]),
        selisihWeek1: parseNum(row[9]),
        week2Agustus: parseNum(row[10]),
        week2Juli: parseNum(row[11]),
        selisihWeek2: parseNum(row[12]),
        week3Agustus: parseNum(row[13]),
        week3Juli: parseNum(row[14]),
        selisihWeek3: parseNum(row[15]),
        week4Agustus: parseNum(row[16]),
        week4Juli: parseNum(row[17]),
        selisihWeek4: parseNum(row[18]),
      });
    }
  }

  // Helper for Daily Omset sheets
  const parseDailyOmsetSheet = (sheetName: string): DailyOmsetBranch[] => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return [];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (rows.length < 2) return [];
    
    const headerRow = rows[0];
    const result: DailyOmsetBranch[] = [];
    
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const branch = String(row[0] || '').trim();
      if (!branch) continue;
      
      const total = parseNum(row[1]);
      const daily: { dateStr: string; dayNum: number; amount: number }[] = [];
      
      for (let c = 2; c < headerRow.length; c++) {
        const colHeader = headerRow[c];
        if (!colHeader) continue;
        const dateStr = excelSerialToDateStr(colHeader);
        const amount = parseNum(row[c]);
        daily.push({
          dateStr,
          dayNum: c - 1,
          amount
        });
      }
      
      result.push({ branch, total, daily });
    }
    return result;
  };

  const dailyOmsetAgustus = parseDailyOmsetSheet('OMSET AGUSTUS');
  const dailyOmsetJuli = parseDailyOmsetSheet('OMSET JULI');

  // Helper for Master Payment sheets
  const parseMasterPaymentSheet = (sheetName: string): MasterPaymentRow[] => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return [];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (rows.length < 2) return [];
    
    const result: MasterPaymentRow[] = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const branch = String(row[0] || '').trim();
      if (!branch) continue;
      
      result.push({
        branch,
        paymentType: String(row[2] || row[1] || 'CASH').trim(),
        paymentName: String(row[2] || 'CASH').trim(),
        transactionType: String(row[3] || 'POS').trim(),
        paymentCount: parseNum(row[4]),
        paymentAmount: parseNum(row[5]),
        mdr: parseNum(row[6]),
        netAfterMdr: parseNum(row[7]) || (parseNum(row[5]) - parseNum(row[6]))
      });
    }
    return result;
  };

  const masterPaymentAgustus = parseMasterPaymentSheet('MASTER AGUSTUS');
  const masterPaymentJuli = parseMasterPaymentSheet('MASTER JULI');

  // Helper for Terjual sheets
  const parseTerjualSheet = (sheetName: string): TerjualRow[] => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return [];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (rows.length < 2) return [];
    
    const result: TerjualRow[] = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const branch = String(row[0] || '').trim();
      if (!branch) continue;
      
      result.push({
        branch,
        salesDate: excelSerialToDateStr(row[1]),
        salesType: String(row[2] || 'Sales').trim(),
        category: String(row[3] || 'General').trim(),
        categoryDetail: String(row[4] || '').trim(),
        menuName: String(row[5] || '').trim(),
        menuCode: String(row[6] || '').trim(),
        type: String(row[7] || 'Ala Carte').trim(),
        qty: parseNum(row[8]),
        subtotal: parseNum(row[9]),
        serviceCharge: parseNum(row[10]),
        taxTotal: parseNum(row[11]),
        vatTotal: parseNum(row[12]),
        total: parseNum(row[13]) || parseNum(row[9])
      });
    }
    return result;
  };

  const terjualAgustus = parseTerjualSheet('TERJUAL AGUSTUS');
  const terjualJuli = parseTerjualSheet('TERJUAL JULI');

  // Parse Regional Product Matrices
  const parseRegionalSheet = (sheetName: string, region: 'Bantul & Gunungkidul' | 'Surakarta'): ProductMatrixRow[] => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return [];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (rows.length < 3) return [];
    
    const result: ProductMatrixRow[] = [];
    for (let r = 2; r < rows.length; r++) {
      const row = rows[r];
      const branch = String(row[0] || '').trim();
      const productName = String(row[4] || '').trim();
      if (!productName) continue;
      
      result.push({
        branch,
        category: String(row[1] || '').trim(),
        categoryDetail: String(row[2] || '').trim(),
        menuCode: String(row[3] || '').trim(),
        productName,
        price: parseNum(row[5]),
        status: String(row[6] || 'ACTIVE').trim(),
        totalJuli: parseNum(row[7]),
        totalAgustus: parseNum(row[8]),
        region
      });
    }
    return result;
  };

  const productMatrix: ProductMatrixRow[] = [
    ...parseRegionalSheet('BANTUL DAN GUNUNGKIDUL', 'Bantul & Gunungkidul'),
    ...parseRegionalSheet('SURAKARTA', 'Surakarta')
  ];

  // Parse Promo Sheet
  const promoSheet = workbook.Sheets['PROMO TERJUAL'];
  const promos: PromoRow[] = [];
  if (promoSheet) {
    const rows: any[] = XLSX.utils.sheet_to_json(promoSheet, { header: 1, defval: '' });
    for (let r = 2; r < rows.length; r++) {
      const row = rows[r];
      const branch = String(row[0] || '').trim();
      const menuName = String(row[2] || '').trim();
      if (!menuName || menuName === 'GRAND TOTAL') continue;
      
      promos.push({
        branch,
        category: String(row[1] || 'PROMO').trim(),
        menuName,
        price: parseNum(row[3]),
        status: String(row[4] || 'ACTIVE').trim(),
        terjualJuli: parseNum(row[5]),
        terjualAgustus: parseNum(row[6])
      });
    }
  }

  // Calculate Aggregates
  const grandTotalRow = summaryOmset.find(s => s.branch === 'GRAND TOTAL');
  const branchRows = summaryOmset.filter(s => s.branch !== 'GRAND TOTAL');

  const totalOmsetAgustus = grandTotalRow?.totalAgustus || branchRows.reduce((acc, b) => acc + b.totalAgustus, 0);
  const totalOmsetJuli = grandTotalRow?.totalJuli || branchRows.reduce((acc, b) => acc + b.totalJuli, 0);
  const totalTarget = grandTotalRow?.target || branchRows.reduce((acc, b) => acc + b.target, 0);
  
  const overallAchPercentage = totalTarget > 0 ? (totalOmsetAgustus / totalTarget) * 100 : 0;
  const momGrowthPercentage = totalOmsetJuli > 0 ? ((totalOmsetAgustus - totalOmsetJuli) / totalOmsetJuli) * 100 : 0;
  
  const totalTransactionsAgustus = masterPaymentAgustus.reduce((acc, p) => acc + p.paymentCount, 0);
  const totalItemsSoldAgustus = terjualAgustus.reduce((acc, t) => acc + t.qty, 0);
  const totalMdrAgustus = masterPaymentAgustus.reduce((acc, p) => acc + p.mdr, 0);
  const totalNetAgustus = masterPaymentAgustus.reduce((acc, p) => acc + p.netAfterMdr, 0);

  // Extract distinct branches and categories
  const branchSet = new Set<string>();
  branchRows.forEach(b => branchSet.add(b.branch));
  dailyOmsetAgustus.forEach(d => { if (d.branch !== 'GRAND TOTAL') branchSet.add(d.branch); });
  
  const categorySet = new Set<string>();
  terjualAgustus.forEach(t => { if (t.category) categorySet.add(t.category); });
  
  return {
    fileName,
    parsedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    summaryOmset,
    dailyOmsetAgustus,
    dailyOmsetJuli,
    masterPaymentAgustus,
    masterPaymentJuli,
    terjualAgustus,
    terjualJuli,
    productMatrix,
    promos,
    kpis: {
      totalOmsetAgustus,
      totalOmsetJuli,
      totalTarget,
      overallAchPercentage,
      momGrowthPercentage,
      totalTransactionsAgustus,
      totalItemsSoldAgustus,
      totalMdrAgustus,
      totalNetAgustus
    },
    branches: Array.from(branchSet).sort(),
    categories: Array.from(categorySet).sort(),
    regions: ['Semua Region', 'Bantul & Gunungkidul', 'Surakarta']
  };
}
