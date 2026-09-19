export const GOOGLE_APPS_SCRIPT_CODE_GS = `/**
 * MANAJEMEN KEUANGAN MASJID AS SHOMAD
 * Backend Google Apps Script (Code.gs)
 * Menghubungkan Google Sheets dengan Web App
 */

// Inisialisasi Spreadsheet dan Sheet yang dibutuhkan
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function initialSetup() {
  const ss = getSpreadsheet();
  const sheets = [
    {
      name: 'TRANSAKSI_KAS',
      headers: ['ID', 'Tanggal', 'Deskripsi', 'Jenis', 'Kategori', 'Jumlah', 'Metode', 'Reconciled', 'Catatan']
    },
    {
      name: 'BABUL_KHAIRAT_ANGGOTA',
      headers: ['ID', 'No KK', 'Nama Kepala Keluarga', 'Alamat', 'No HP', 'Jumlah Jiwa', 'Daftar Anggota', 'Status']
    },
    {
      name: 'BABUL_KHAIRAT_IURAN',
      headers: ['ID', 'Family ID', 'Nama KK', 'Bulan', 'Tahun', 'Nominal Per Jiwa', 'Total Nominal', 'Tanggal Bayar', 'Status']
    },
    {
      name: 'BABUL_KHAIRAT_KLAIM',
      headers: ['ID', 'Tanggal', 'Nama Almarhum', 'Ahli Waris', 'No HP', 'Biaya Ambulans', 'Biaya Kafan', 'Biaya Makam', 'Santunan', 'Total Klaim', 'Status']
    },
    {
      name: 'QURBAN_PESERTA',
      headers: ['ID', 'No Peserta', 'Nama Shohibul', 'No HP', 'Alamat', 'Jenis Qurban', 'Kelompok', 'Total Biaya', 'Terbayar', 'Status']
    },
    {
      name: 'QURBAN_PEMBAYARAN',
      headers: ['ID', 'Shohibul ID', 'Nama Shohibul', 'Tanggal', 'Nominal', 'Metode', 'No Kuitansi', 'Catatan']
    },
    {
      name: 'INFAQ_SADAKAH',
      headers: ['ID', 'Nama Donatur', 'No HP', 'Nominal', 'Jenis', 'Metode', 'Tanggal', 'Keterangan']
    },
    {
      name: 'BERITA_AGENDA',
      headers: ['ID', 'Judul', 'Kategori', 'Tanggal', 'Waktu/Lokasi', 'Isi/Deskripsi', 'Penulis/Narasumber']
    }
  ];

  sheets.forEach(function(s) {
    let sheet = ss.getSheetByName(s.name);
    if (!sheet) {
      sheet = ss.insertSheet(s.name);
      sheet.appendRow(s.headers);
      sheet.getRange(1, 1, 1, s.headers.length).setFontWeight('bold').setBackground('#065f46').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  });

  return "Inisialisasi tabel Google Sheets berhasil!";
}

// Endpoint Web App: Menampilkan Web App HTML atau Status API
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: 'Koneksi Google Apps Script Aktif & Siap!',
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Manajemen Keuangan Masjid As Shomad')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Endpoint Web App: Menerima Sinkronisasi Data dari Web App (POST)
function doPost(e) {
  try {
    const rawData = e && e.postData ? e.postData.contents : '{}';
    const payload = JSON.parse(rawData);
    const ss = getSpreadsheet();

    // 1. Uji Koneksi (Ping)
    if (payload.action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Koneksi ke Google Sheets berhasil!',
        spreadsheetTitle: ss.getName(),
        spreadsheetUrl: ss.getUrl()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Sinkronisasi Penuh Semua / Lembar Kerja Terpilih
    if (payload.action === 'sync_all' || payload.action === 'sync_tabs') {
      const sheetsData = payload.sheets || {};
      const updatedInfo = {};

      for (const sheetKey in sheetsData) {
        const item = sheetsData[sheetKey];
        const sheetTitle = item.title || sheetKey;
        let sheet = ss.getSheetByName(sheetTitle);

        if (!sheet) {
          sheet = ss.insertSheet(sheetTitle);
        } else {
          sheet.clear(); // Bersihkan isi lama untuk sinkronisasi penuh
        }

        const headers = item.headers || [];
        const rows = item.rows || [];
        const combined = [headers].concat(rows);

        if (combined.length > 0 && headers.length > 0) {
          const numRows = combined.length;
          const numCols = headers.length;
          
          sheet.getRange(1, 1, numRows, numCols).setValues(combined);

          // Format Header: Latar Hijau Emerald Masjid (#065f46), Teks Putih Tebal
          const headerRange = sheet.getRange(1, 1, 1, numCols);
          headerRange.setFontWeight('bold');
          headerRange.setBackground('#065f46');
          headerRange.setFontColor('#ffffff');
          sheet.setFrozenRows(1);

          // Auto-fit kolom
          try {
            sheet.autoResizeColumns(1, numCols);
          } catch (resizeErr) {}
        }

        updatedInfo[sheetTitle] = rows.length;
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data Masjid As Shomad berhasil disinkronkan ke Google Sheets!',
        sheetsUpdated: updatedInfo,
        spreadsheetTitle: ss.getName(),
        spreadsheetUrl: ss.getUrl(),
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Mutasi per entri
    if (payload.action === 'simpan_transaksi') {
      return ContentService.createTextOutput(JSON.stringify(simpanTransaksi(payload.data)))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (payload.action === 'simpan_shohibul') {
      return ContentService.createTextOutput(JSON.stringify(simpanShohibulQurban(payload.data)))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (payload.action === 'simpan_iuran') {
      return ContentService.createTextOutput(JSON.stringify(simpanIuranBabul(payload.data)))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Aksi tidak dikenali: ' + payload.action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// API: Ambil semua data (Read)
function getInitialData() {
  const ss = getSpreadsheet();
  return {
    transaksi: getSheetData(ss, 'TRANSAKSI_KAS'),
    babulAnggota: getSheetData(ss, 'BABUL_KHAIRAT_ANGGOTA'),
    babulIuran: getSheetData(ss, 'BABUL_KHAIRAT_IURAN'),
    babulKlaim: getSheetData(ss, 'BABUL_KHAIRAT_KLAIM'),
    qurbanPeserta: getSheetData(ss, 'QURBAN_PESERTA'),
    qurbanBayar: getSheetData(ss, 'QURBAN_PEMBAYARAN'),
    infaq: getSheetData(ss, 'INFAQ_SADAKAH'),
    berita: getSheetData(ss, 'BERITA_AGENDA')
  };
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    rows.push(obj);
  }
  return rows;
}

// API: Simpan Transaksi Keuangan Masjid
function simpanTransaksi(data) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('TRANSAKSI_KAS');
  const id = data.id || ('TX-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss'));
  sheet.appendRow([
    id,
    data.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
    data.deskripsi || '',
    data.jenis || 'pemasukan',
    data.kategori || '',
    Number(data.jumlah) || 0,
    data.metode || 'kas_tunai',
    data.reconciled ? 'YA' : 'TIDAK',
    data.catatan || ''
  ]);
  return { success: true, id: id };
}

// API: Simpan Pendaftaran Peserta Qurban
function simpanShohibulQurban(data) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('QURBAN_PESERTA');
  const id = data.id || ('QUR-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss'));
  sheet.appendRow([
    id,
    data.nomorPeserta || id,
    data.nama || '',
    data.noHp || '',
    data.alamat || '',
    data.jenisQurban || 'kambing',
    data.kelompok || '',
    Number(data.totalBiaya) || 0,
    Number(data.terbayar) || 0,
    data.status || 'belum_bayar'
  ]);
  return { success: true, id: id };
}

// API: Simpan Iuran Babul Khairat
function simpanIuranBabul(data) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('BABUL_KHAIRAT_IURAN');
  const id = data.id || ('PAY-BK-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss'));
  sheet.appendRow([
    id,
    data.familyId || '',
    data.namaKk || '',
    data.bulan || '',
    data.tahun || new Date().getFullYear(),
    Number(data.nominalPerJiwa) || 20000,
    Number(data.totalNominal) || 0,
    data.tanggalBayar || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
    data.status || 'lunas'
  ]);
  return { success: true, id: id };
}
`;

export const GOOGLE_APPS_SCRIPT_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manajemen Keuangan Masjid As Shomad</title>
  <!-- Tailwind CSS & Lucide Icons via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen">
  <!-- Header Aplikasi -->
  <header class="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-lg">AS</div>
        <div>
          <h1 class="text-lg md:text-xl font-bold tracking-tight">MANAJEMEN KEUANGAN MASJID AS SHOMAD</h1>
          <p class="text-xs text-emerald-200">Sistem Informasi Keuangan & Administrasi Transparan</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span id="userStatusBadge" class="bg-emerald-900/60 border border-emerald-700 text-emerald-200 text-xs px-2.5 py-1 rounded-full">Jama'ah / Publik</span>
        <button onclick="toggleLoginModal()" id="authBtn" class="bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition">
          Login Pengurus
        </button>
      </div>
    </div>
    <!-- Navigasi 5 Menu Utama -->
    <nav class="bg-emerald-900 border-t border-emerald-700">
      <div class="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto text-sm">
        <button onclick="switchTab('laporan')" class="nav-btn px-4 py-2.5 font-medium border-b-2 border-emerald-400 text-white whitespace-nowrap" id="tab-laporan">Laporan Keuangan</button>
        <button onclick="switchTab('babul')" class="nav-btn px-4 py-2.5 font-medium border-b-2 border-transparent text-emerald-200 hover:text-white whitespace-nowrap" id="tab-babul">Babul Khairat</button>
        <button onclick="switchTab('qurban')" class="nav-btn px-4 py-2.5 font-medium border-b-2 border-transparent text-emerald-200 hover:text-white whitespace-nowrap" id="tab-qurban">Qurban</button>
        <button onclick="switchTab('infaq')" class="nav-btn px-4 py-2.5 font-medium border-b-2 border-transparent text-emerald-200 hover:text-white whitespace-nowrap" id="tab-infaq">Infaq & Sadakah</button>
        <button onclick="switchTab('informasi')" class="nav-btn px-4 py-2.5 font-medium border-b-2 border-transparent text-emerald-200 hover:text-white whitespace-nowrap" id="tab-informasi">Informasi & Kegiatan</button>
      </div>
    </nav>
  </header>

  <!-- Konten Utama Aplikasi Dinamis -->
  <main class="max-w-7xl mx-auto px-4 py-6" id="mainContainer">
    <!-- Diisi otomatis oleh JavaScript -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
      <h2 class="text-xl font-bold text-emerald-800 mb-2">Selamat Datang di Portal Masjid As Shomad</h2>
      <p class="text-slate-600 mb-4">Silakan pilih menu di atas untuk melihat laporan keuangan kas, iuran Babul Khairat, data Qurban, dan layanan Infaq.</p>
    </div>
  </main>

  <script>
    function switchTab(tabId) {
      document.querySelectorAll('.nav-btn').forEach(b => {
        b.className = 'nav-btn px-4 py-2.5 font-medium border-b-2 border-transparent text-emerald-200 hover:text-white whitespace-nowrap';
      });
      document.getElementById('tab-' + tabId).className = 'nav-btn px-4 py-2.5 font-medium border-b-2 border-emerald-400 text-white whitespace-nowrap';
      // Load module konten
      renderTab(tabId);
    }

    function renderTab(tab) {
      const c = document.getElementById('mainContainer');
      if (tab === 'infaq') {
        c.innerHTML = \`
          <div class="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow border border-slate-200 text-center">
            <h2 class="text-2xl font-bold text-slate-800 mb-2">Infaq & Sadakah Masjid As Shomad</h2>
            <div class="my-6 flex justify-center">
              <div class="p-4 bg-white border-2 border-emerald-600 rounded-xl shadow-sm inline-block">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126590013ID.CO.BNI.WWW011893600009150407603202096023661830303UMI51440014ID.CO.QRIS.WWW0215ID10253765461600303UMI5204541153033605802ID5916MASJID+AS+SHOMAD6007KARIMUN61052966162070703A0163043519" class="w-56 h-56 mx-auto rounded" alt="QRIS Resmi Masjid As Shomad">
                <p class="mt-2 text-xs font-bold text-emerald-800 tracking-wider">QRIS RESMI MASJID AS SHOMAD</p>
                <p class="text-[10px] text-slate-500 font-mono">NMID: ID1025376546160 • A01</p>
              </div>
            </div>
            <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p class="text-xs text-emerald-700 font-semibold uppercase">Nomor Rekening Resmi Bank BNI</p>
              <p class="text-2xl font-bold text-emerald-900 tracking-wider">8881-2072-09</p>
              <p class="text-xs text-emerald-600">Atas Nama: Masjid As Shomad</p>
            </div>
          </div>\`;
      }
    }
  </script>
</body>
</html>
`;
