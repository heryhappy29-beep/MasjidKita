export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
  } catch {
    return dateStr;
  }
}

export function createWhatsAppUrl(phone: string, message: string): string {
  // Format Indonesian phone number: 08xxx -> 628xxx
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('62')) {
    cleanPhone = '62' + cleanPhone;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function exportToCSV(filename: string, rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) => {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) {
        result = '"' + result + '"';
      }
      if (j > 0) finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  let csvContent = '\uFEFF'; // UTF-8 BOM for Microsoft Excel compatibility
  for (let i = 0; i < rows.length; i++) {
    csvContent += processRow(rows[i]);
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Convert numbers to Indonesian words for Kwitansi (Terbilang)
export function angkaTerbilang(nilai: number): string {
  const angka = Math.floor(Math.abs(nilai));
  const huruf = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  function bagi(bilangan: number): string {
    if (bilangan < 12) {
      return huruf[bilangan];
    } else if (bilangan < 20) {
      return bagi(bilangan - 10) + ' Belas';
    } else if (bilangan < 100) {
      return bagi(Math.floor(bilangan / 10)) + ' Puluh ' + bagi(bilangan % 10);
    } else if (bilangan < 200) {
      return 'Seratus ' + bagi(bilangan - 100);
    } else if (bilangan < 1000) {
      return bagi(Math.floor(bilangan / 100)) + ' Ratus ' + bagi(bilangan % 100);
    } else if (bilangan < 2000) {
      return 'Seribu ' + bagi(bilangan - 1000);
    } else if (bilangan < 1000000) {
      return bagi(Math.floor(bilangan / 1000)) + ' Ribu ' + bagi(bilangan % 1000);
    } else if (bilangan < 1000000000) {
      return bagi(Math.floor(bilangan / 1000000)) + ' Juta ' + bagi(bilangan % 1000000);
    } else if (bilangan < 1000000000000) {
      return bagi(Math.floor(bilangan / 1000000000)) + ' Milyar ' + bagi(bilangan % 1000000000);
    }
    return '';
  }

  const hasil = bagi(angka).trim().replace(/\s+/g, ' ');
  return hasil ? hasil + ' Rupiah' : 'Nol Rupiah';
}
