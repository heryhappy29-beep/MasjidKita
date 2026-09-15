import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Copy, 
  Check, 
  ShieldCheck
} from 'lucide-react';

export const QRIS_OFFICIAL_PAYLOAD = "00020101021126590014ID.LINKAJA.WWW01189360000900000000000215888120720900000303UMI51440014ID.CO.QRIS.WWW0215ID10253765461600303UMI5204549953033605802ID5916MASJID AS SHOMAD6005BATAM61052940062070703A0163048918";
export const QRIS_OFFICIAL_NMID = "ID1025376546160";

interface OfficialQrisPlacardProps {
  className?: string;
  size?: 'normal' | 'compact' | 'large';
}

export const OfficialQrisPlacard: React.FC<OfficialQrisPlacardProps> = ({
  className = '',
  size = 'normal'
}) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');

  const qrWidth = size === 'compact' ? 220 : size === 'large' ? 320 : 270;
  const containerMaxWidth = size === 'compact' ? 'max-w-[360px]' : size === 'large' ? 'max-w-[520px]' : 'max-w-[430px]';

  useEffect(() => {
    // 1. Render directly to canvas
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, QRIS_OFFICIAL_PAYLOAD, {
        width: qrWidth,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      }, (err) => {
        if (err) console.error('Canvas QR error:', err);
      });
    }

    // 2. Fallback dataURL
    QRCode.toDataURL(QRIS_OFFICIAL_PAYLOAD, {
      width: qrWidth,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    }).then(url => {
      setDataUrl(url);
    }).catch(err => {
      console.error('DataURL QR error:', err);
    });
  }, [qrWidth]);

  const handleCopyNmid = () => {
    navigator.clipboard.writeText(QRIS_OFFICIAL_NMID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* PLAKAT QRIS RESMI (100% Native Inline Render - Pasti Tampil & Tanpa Tombol Unduh) */}
      <div 
        id="qris-official-placard"
        className={`relative w-full ${containerMaxWidth} bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden select-none`}
      >
        {/* Ornamen Geometris Merah Sisi Kiri (Sesuai Plakat Asli) */}
        <div 
          className="absolute left-0 top-[26%] w-0 h-0 z-0 pointer-events-none"
          style={{
            borderTop: '55px solid transparent',
            borderBottom: '55px solid transparent',
            borderLeft: '48px solid #E11D2A'
          }}
        />

        {/* Ornamen Geometris Merah Sisi Kanan Bawah */}
        <div 
          className="absolute right-0 bottom-[14%] w-0 h-0 z-0 pointer-events-none"
          style={{
            borderTop: '45px solid transparent',
            borderRight: '55px solid #E11D2A'
          }}
        />

        {/* Lencana Terverifikasi */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-emerald-700 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
          <ShieldCheck className="w-3 h-3" />
          <span>RESMI</span>
        </div>

        {/* KONTEN UTAMA PLAKAT */}
        <div className="relative z-10 px-5 pt-5 pb-3">
          {/* HEADER PLAKAT: LOGO QRIS & LOGO GPN */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            {/* Sisi Kiri: Logo QRIS Standar Pembayaran Nasional */}
            <div className="flex items-center space-x-2">
              <div className="bg-black text-white font-black text-xs px-1.5 py-0.5 rounded-xs tracking-tighter flex items-center justify-center">
                <span className="font-mono text-sm leading-none">QRIS</span>
              </div>
              <div className="text-left leading-tight">
                <p className="text-[9px] font-black text-black uppercase tracking-tight">QR Code Standar</p>
                <p className="text-[9px] font-black text-black uppercase tracking-tight">Pembayaran Nasional</p>
              </div>
            </div>

            {/* Sisi Kanan: Lambang GPN (Gerbang Pembayaran Nasional) */}
            <div className="flex items-center space-x-1 pr-14">
              <svg className="w-5 h-5" viewBox="0 0 42 32" fill="none">
                <path d="M25 0 C32 4, 38 12, 42 22 C34 16, 26 15, 18 16 C25 20, 28 26, 30 32 C20 25, 12 25, 2 27 C10 18, 18 10, 25 0 Z" fill="#E11D2A"/>
              </svg>
              <span className="text-xs font-black text-[#0A2540] tracking-wider">GPN</span>
            </div>
          </div>

          {/* NAMA MERCHANT & NMID */}
          <div className="text-center my-3">
            <h3 className="text-base sm:text-lg font-black text-black tracking-wide uppercase font-sans">
              MASJID AS SHOMAD
            </h3>
            <p className="text-xs font-bold text-slate-800 tracking-wider mt-0.5">
              NMID : {QRIS_OFFICIAL_NMID}
            </p>
            <p className="text-xs font-extrabold text-slate-700 tracking-widest mt-0.5">
              A01
            </p>
          </div>

          {/* KOTAK KODE QR (Canvas Langsung - Dijamin Selalu Tampil) */}
          <div className="flex justify-center my-2">
            <div className="p-2 bg-white rounded-xl shadow-inner border border-slate-200 inline-block">
              <canvas 
                ref={canvasRef} 
                className="block mx-auto max-w-full h-auto rounded-lg"
              />
              {/* Fallback img bila canvas tertunda */}
              {!canvasRef.current && dataUrl && (
                <img 
                  src={dataUrl} 
                  alt="QRIS Masjid As Shomad" 
                  className="block mx-auto max-w-full h-auto rounded-lg"
                />
              )}
            </div>
          </div>

          {/* SLOGAN RESMI ASPI */}
          <div className="text-center my-3">
            <div className="inline-block bg-slate-100 px-4 py-1 rounded-md">
              <p className="text-[11px] font-black text-slate-800 tracking-wider uppercase">
                SATU QRIS UNTUK SEMUA
              </p>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Cek aplikasi penyelenggara di: <span className="font-bold text-slate-700">www.aspi-qris.id</span>
            </p>
          </div>

          {/* FOOTER INFORMASI CETAK & CARA BAYAR */}
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-end justify-between">
            {/* Kiri Bawah: Info Acquirer & Versi */}
            <div className="text-left text-[9px] text-slate-500 leading-relaxed">
              <p>Dicetak oleh : <span className="font-semibold text-slate-700">93600009</span></p>
              <p>Versi Cetak : <span className="font-semibold text-slate-700">1.0-2025.02.10</span></p>
            </div>

            {/* Kanan Bawah: Panduan Cara Bayar Segitiga Merah */}
            <div className="bg-[#E11D2A] text-white px-2.5 py-1.5 rounded-lg text-right shadow-xs">
              <p className="text-[8px] font-bold tracking-tight">Cara bayar dengan QRIS:</p>
              <div className="flex items-center gap-2 mt-0.5 text-[7.5px] font-bold text-white/95">
                <span>1. Buka Aplikasi</span>
                <span>•</span>
                <span>2. Scan QR</span>
                <span>•</span>
                <span>3. Bayar</span>
              </div>
            </div>
          </div>
        </div>

        {/* BARIS SALIN NMID (Praktis untuk Jamaah) */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">NMID:</span>
            <span className="font-mono font-bold text-slate-800">{QRIS_OFFICIAL_NMID}</span>
          </div>
          <button
            onClick={handleCopyNmid}
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition"
            title="Salin Nomor NMID"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Salin NMID</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
