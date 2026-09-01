export interface ReportItem {
  id: string;
  name: string;
  fileName: string;
  url: string;
}

export async function fetchReportsIndex(): Promise<ReportItem[]> {
  try {
    const res = await fetch('/reports/index.json');
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch reports index', e);
    return [];
  }
}

export async function fetchReportArrayBuffer(url: string, fileName: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Gagal mengambil file laporan "${fileName}" dari server.`);
  }
  return await res.arrayBuffer();
}
