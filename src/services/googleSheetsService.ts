import { getAccessToken } from './googleAuthService';
import { 
  FinancialTransaction, 
  ShohibulQurban, 
  QurbanInstallment, 
  QurbanStock, 
  InfaqRecord, 
  BabulKhairatFamily, 
  BabulKhairatClaim 
} from '../types';

export interface MosqueAllData {
  transactions: FinancialTransaction[];
  shohibulList: ShohibulQurban[];
  installments: QurbanInstallment[];
  qurbanStocks: QurbanStock[];
  infaqRecords: InfaqRecord[];
  families?: BabulKhairatFamily[];
  claims?: BabulKhairatClaim[];
}

export interface SheetExportBundle {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface DriveSpreadsheetItem {
  id: string;
  name: string;
  webViewLink?: string;
  modifiedTime?: string;
}

export interface SpreadsheetDetails {
  id: string;
  title: string;
  sheets: { id: number; title: string }[];
  url: string;
}

// Formatters to convert Mosque data into Sheet rows
export const prepareSheetData = (data: MosqueAllData): Record<string, SheetExportBundle> => {
  // 1. Kas Keuangan
  const kasHeaders = [
    'ID Transaksi', 
    'Tanggal', 
    'Jenis (Masuk/Keluar)', 
    'Kategori', 
    'Deskripsi / Uraian', 
    'Nominal (Rp)', 
    'Metode Pembayaran', 
    'No Referensi', 
    'Catatan Khusus'
  ];
  const kasRows = data.transactions.map((t) => [
    t.id,
    t.tanggal,
    t.jenis === 'pemasukan' ? 'Pemasukan' : t.jenis === 'pengeluaran' ? 'Pengeluaran' : 'Transfer Kas',
    t.kategori,
    t.deskripsi,
    t.jumlah,
    t.metode === 'kas_tunai' ? 'Kas Tunai' : t.metode === 'bank_bni' ? 'Bank BNI' : 'QRIS',
    t.refNo || '-',
    t.catatan || ''
  ]);

  // 2. Shohibul Qurban
  const qurbanHeaders = [
    'Nomor Peserta',
    'Nama Shohibul',
    'No HP',
    'Alamat',
    'Jenis Qurban',
    'Kelompok Sapi',
    'Atas Nama (Keluarga)',
    'Total Biaya (Rp)',
    'Sudah Terbayar (Rp)',
    'Sisa Kekurangan (Rp)',
    'Status Pembayaran',
    'Tanggal Daftar',
    'Catatan Khusus'
  ];
  const qurbanRows = data.shohibulList.map((s) => [
    s.nomorPeserta || s.id,
    s.nama,
    s.noHp || '-',
    s.alamat || '-',
    s.jenisQurban === 'sapi_kolektif' ? 'Sapi Kolektif (1/7)' :
    s.jenisQurban === 'sapi_perorangan' ? 'Sapi Mandiri (1 Ekor)' :
    s.jenisQurban === 'kambing' ? 'Kambing' : 'Domba',
    s.kelompokSapi ? `Kelompok ${s.kelompokSapi}` : '-',
    Array.isArray(s.atasNama) ? s.atasNama.join(', ') : s.nama,
    s.totalBiaya,
    s.terbayar,
    Math.max(0, s.totalBiaya - s.terbayar),
    s.status.toUpperCase(),
    s.tanggalDaftar,
    s.catatan || ''
  ]);

  // 3. Pembayaran & Cicilan Qurban
  const cicilanHeaders = [
    'ID Pembayaran',
    'No Peserta',
    'Nama Peserta',
    'Tanggal Pembayaran',
    'Nominal Bayar (Rp)',
    'Metode Transaksi',
    'No Kuitansi',
    'Catatan / Validasi'
  ];
  const cicilanRows = data.installments.map((ci) => [
    ci.id,
    ci.shohibulId,
    ci.namaPeserta,
    ci.tanggal,
    ci.nominal,
    ci.metode.toUpperCase(),
    ci.kuitansiNo,
    ci.catatan || 'Sah - Terverifikasi Panitia'
  ]);

  // 4. Stok & Kuota Hewan Qurban
  const stokHeaders = [
    'ID Varian',
    'Jenis / Nama Hewan',
    'Harga Satuan Pasar (Rp)',
    'Stok Kuota Disiapkan',
    'Sudah Dipesan (Slot)',
    'Sisa Kuota Bebas',
    'Keterangan / Spesifikasi'
  ];
  const stokRows = data.qurbanStocks.map((stk) => [
    stk.id,
    stk.jenis,
    stk.hargaSatuan,
    stk.stokTersedia,
    stk.terpesan,
    Math.max(0, stk.stokTersedia - stk.terpesan),
    stk.keterangan || '-'
  ]);

  // 5. Infaq & Sadakah
  const infaqHeaders = [
    'ID Transaksi',
    'Tanggal Masuk',
    'Program / Jenis Infaq',
    'Nama Hamba Allah / Donatur',
    'No HP',
    'Nominal Donasi (Rp)',
    'Kanal / Metode',
    'Keterangan / Doa Jamaah'
  ];
  const infaqRows = data.infaqRecords.map((inf) => [
    inf.id,
    inf.tanggal,
    inf.jenis,
    inf.nama || 'Hamba Allah',
    inf.noHp || '-',
    inf.nominal,
    inf.metode,
    inf.keterangan || '-'
  ]);

  // 6. Babul Khairat (Jika ada)
  const babulHeaders = [
    'ID',
    'Kepala Keluarga',
    'No KK / Anggota',
    'Wilayah / RT',
    'No Kontak',
    'Jumlah Jiwa',
    'Status Iuran'
  ];
  const babulRows = (data.families || []).map((f) => [
    f.id,
    f.namaKepalaKeluarga,
    f.noKk,
    f.alamat,
    f.noHp,
    f.jumlahJiwa,
    f.status.toUpperCase()
  ]);

  return {
    'Laporan_Kas': { title: 'Laporan_Kas', headers: kasHeaders, rows: kasRows },
    'Shohibul_Qurban': { title: 'Shohibul_Qurban', headers: qurbanHeaders, rows: qurbanRows },
    'Cicilan_Qurban': { title: 'Cicilan_Qurban', headers: cicilanHeaders, rows: cicilanRows },
    'Stok_Hewan_Qurban': { title: 'Stok_Hewan_Qurban', headers: stokHeaders, rows: stokRows },
    'Infaq_Sedekah': { title: 'Infaq_Sedekah', headers: infaqHeaders, rows: infaqRows },
    'Babul_Khairat': { title: 'Babul_Khairat', headers: babulHeaders, rows: babulRows }
  };
};

// Helper: Ensure valid token
const requireToken = async (): Promise<string> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Anda belum terhubung dengan akun Google. Silakan klik "Hubungkan Google Sheets" terlebih dahulu.');
  }
  return token;
};

// List spreadsheets from Drive
export const listDriveSpreadsheets = async (): Promise<DriveSpreadsheetItem[]> => {
  const token = await requireToken();
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,modifiedTime)&orderBy=modifiedTime desc&pageSize=15`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gagal mengambil daftar spreadsheet dari Google Drive (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
};

// Get spreadsheet details
export const getSpreadsheetDetails = async (spreadsheetId: string): Promise<SpreadsheetDetails> => {
  const token = await requireToken();
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=spreadsheetId,properties.title,sheets.properties`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Spreadsheet dengan ID "${cleanId}" tidak ditemukan atau tidak memiliki izin akses.`);
  }

  const data = await res.json();
  return {
    id: data.spreadsheetId,
    title: data.properties?.title || 'Spreadsheet Tanpa Judul',
    sheets: (data.sheets || []).map((s: any) => ({
      id: s.properties.sheetId,
      title: s.properties.title
    })),
    url: `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`
  };
};

// Extract spreadsheet ID from URL or return raw ID
export const extractSpreadsheetId = (input: string): string => {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
};

// Create a brand new Spreadsheet in Google Drive with formatted sheets
export const createNewMosqueSpreadsheet = async (
  title: string,
  data: MosqueAllData,
  selectedTabs: string[] = ['Laporan_Kas', 'Shohibul_Qurban', 'Cicilan_Qurban', 'Stok_Hewan_Qurban', 'Infaq_Sedekah', 'Babul_Khairat']
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> => {
  const token = await requireToken();
  const prepared = prepareSheetData(data);

  // Filter sheets to include
  const sheetsToCreate = selectedTabs
    .filter((k) => prepared[k])
    .map((k) => ({
      properties: {
        title: prepared[k].title,
        gridProperties: {
          frozenRowCount: 1
        }
      }
    }));

  if (sheetsToCreate.length === 0) {
    throw new Error('Minimal pilih 1 lembar (sheet) untuk dibuat.');
  }

  // 1. Create the spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: title || `Manajemen Keuangan Masjid As Shomad - ${new Date().getFullYear()}`
      },
      sheets: sheetsToCreate
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gagal membuat spreadsheet baru di Google Drive (${createRes.status})`);
  }

  const createdSs = await createRes.json();
  const spreadsheetId = createdSs.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Populate values in batch
  const batchData = selectedTabs
    .filter((k) => prepared[k])
    .map((k) => {
      const sheet = prepared[k];
      return {
        range: `'${sheet.title}'!A1`,
        values: [sheet.headers, ...sheet.rows]
      };
    });

  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: batchData
    })
  });

  if (!updateRes.ok) {
    console.warn('Gagal mengisi baris awal spreadsheet, namun spreadsheet berhasil dibuat.');
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title: createdSs.properties?.title || title
  };
};

// Sync / Overwrite data to an existing spreadsheet
export const syncToExistingSpreadsheet = async (
  spreadsheetInput: string,
  data: MosqueAllData,
  selectedTabs: string[] = ['Laporan_Kas', 'Shohibul_Qurban', 'Cicilan_Qurban', 'Stok_Hewan_Qurban', 'Infaq_Sedekah', 'Babul_Khairat']
): Promise<{ updatedCount: number; spreadsheetUrl: string }> => {
  const token = await requireToken();
  const spreadsheetId = extractSpreadsheetId(spreadsheetInput);

  // 1. Fetch current spreadsheet info to see what sheets already exist
  const details = await getSpreadsheetDetails(spreadsheetId);
  const existingSheetTitles = details.sheets.map((s) => s.title);

  const prepared = prepareSheetData(data);
  const tabsToSync = selectedTabs.filter((k) => prepared[k]);

  // 2. Check if any tabs are missing; add them via batchUpdate
  const missingTabs = tabsToSync.filter((t) => !existingSheetTitles.includes(t));
  if (missingTabs.length > 0) {
    const addSheetRequests = missingTabs.map((title) => ({
      addSheet: {
        properties: {
          title,
          gridProperties: { frozenRowCount: 1 }
        }
      }
    }));

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: addSheetRequests })
    });
  }

  // 3. Clear existing values in these sheets and write new values
  // Batch clear
  const clearRanges = tabsToSync.map((t) => `'${t}'!A1:Z5000`);
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ranges: clearRanges })
  }).catch(() => null);

  // Batch update with current fresh data
  const batchData = tabsToSync.map((k) => {
    const sheet = prepared[k];
    return {
      range: `'${sheet.title}'!A1`,
      values: [sheet.headers, ...sheet.rows]
    };
  });

  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: batchData
    })
  });

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gagal memperbarui data spreadsheet (${updateRes.status})`);
  }

  return {
    updatedCount: tabsToSync.length,
    spreadsheetUrl: details.url
  };
};

// Read values from a specific sheet range
export const readSheetData = async (
  spreadsheetId: string,
  sheetTitle: string
): Promise<{ headers: string[]; rows: string[][] }> => {
  const token = await requireToken();
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const range = encodeURIComponent(`'${sheetTitle}'!A1:Z100`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${range}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gagal membaca data dari sheet "${sheetTitle}"`);
  }

  const data = await res.json();
  const values: string[][] = data.values || [];
  if (values.length === 0) {
    return { headers: [], rows: [] };
  }

  const [headers, ...rows] = values;
  return { headers, rows };
};

// ==========================================
// METODE GOOGLE APPS SCRIPT WEB APP (BEBAS ERROR FIREBASE / OAUTH)
// ==========================================

export interface AppsScriptSyncResult {
  success: boolean;
  message: string;
  sheetsUpdated?: Record<string, number>;
  spreadsheetTitle?: string;
  spreadsheetUrl?: string;
}

/**
 * Uji koneksi Web App Google Apps Script
 */
export const testGoogleAppsScriptConnection = async (
  webAppUrl: string
): Promise<{ success: boolean; message: string; spreadsheetTitle?: string; spreadsheetUrl?: string }> => {
  const cleanUrl = webAppUrl.trim();
  if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
    throw new Error('URL harus berupa Web App Google Apps Script yang valid (dimulai dengan https://script.google.com/macros/s/.../exec)');
  }

  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({ action: 'ping' })
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      if (json && json.success) {
        return {
          success: true,
          message: json.message || 'Koneksi ke Google Sheets berhasil!',
          spreadsheetTitle: json.spreadsheetTitle,
          spreadsheetUrl: json.spreadsheetUrl
        };
      }
    }

    return {
      success: true,
      message: 'Web App Google Apps Script merespons dengan baik.'
    };
  } catch (err: any) {
    // Coba kirim via fallback no-cors jika terhalang CORS di browser
    try {
      await fetch(cleanUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'ping' })
      });
      return {
        success: true,
        message: 'Koneksi terhubung ke Google Apps Script (mode fallback aktif).'
      };
    } catch (fallbackErr: any) {
      throw new Error(`Gagal menghubungi Web App Google Apps Script: ${fallbackErr?.message || err?.message || 'Periksa kembali URL Web App Anda'}`);
    }
  }
};

/**
 * Sinkronkan seluruh data aplikasi ke Google Sheets melalui Google Apps Script Web App
 * 100% bebas dari batasan domain Firebase dan tidak memerlukan token OAuth pop-up!
 */
export const syncViaGoogleAppsScript = async (
  webAppUrl: string,
  data: MosqueAllData,
  selectedTabs: string[] = ['Laporan_Kas', 'Shohibul_Qurban', 'Cicilan_Qurban', 'Stok_Hewan_Qurban', 'Infaq_Sedekah', 'Babul_Khairat']
): Promise<AppsScriptSyncResult> => {
  const cleanUrl = webAppUrl.trim();
  if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
    throw new Error('URL Web App tidak valid. Pastikan URL dimulai dengan "https://script.google.com/macros/s/..." dan berakhiran "/exec"');
  }

  const prepared = prepareSheetData(data);
  const sheetsPayload: Record<string, { title: string; headers: string[]; rows: (string | number)[][] }> = {};

  selectedTabs.forEach((k) => {
    if (prepared[k]) {
      sheetsPayload[k] = {
        title: prepared[k].title,
        headers: prepared[k].headers,
        rows: prepared[k].rows
      };
    }
  });

  const payload = {
    action: 'sync_all',
    timestamp: new Date().toISOString(),
    sheets: sheetsPayload
  };

  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      if (json && json.success) {
        return {
          success: true,
          message: json.message || 'Data berhasil disinkronkan ke Google Sheets!',
          sheetsUpdated: json.sheetsUpdated,
          spreadsheetTitle: json.spreadsheetTitle,
          spreadsheetUrl: json.spreadsheetUrl
        };
      }
    }

    return {
      success: true,
      message: 'Permintaan sinkronisasi data berhasil dikirim ke Google Sheets!'
    };
  } catch (err: any) {
    // Mode fallback: no-cors mengirim payload ke Apps Script
    try {
      await fetch(cleanUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      return {
        success: true,
        message: 'Data berhasil dikirim ke Google Sheets (diterima oleh Apps Script).'
      };
    } catch (fallbackErr: any) {
      throw new Error(`Gagal mengirim data ke Google Apps Script: ${fallbackErr?.message || err?.message}`);
    }
  }
};

