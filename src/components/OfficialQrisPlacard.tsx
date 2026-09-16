import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Maximize2, 
  Download, 
  X,
  ShieldCheck
} from 'lucide-react';

export const QRIS_OFFICIAL_PAYLOAD = "00020101021126590013ID.CO.BNI.WWW011893600009150407603202096023661830303UMI51440014ID.CO.QRIS.WWW0215ID10253765461600303UMI5204541153033605802ID5916MASJID AS SHOMAD6007KARIMUN61052966162070703A0163043519";
export const QRIS_OFFICIAL_NMID = "ID1025376546160";

interface OfficialQrisPlacardProps {
  className?: string;
  size?: 'normal' | 'compact' | 'large';
  showControls?: boolean;
}

export const OfficialQrisPlacard: React.FC<OfficialQrisPlacardProps> = ({
  className = '',
  size = 'normal',
  showControls = true
}) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const containerMaxWidth = size === 'compact' ? 'max-w-[320px]' : size === 'large' ? 'max-w-[500px]' : 'max-w-[420px]';

  const handleCopyNmid = () => {
    navigator.clipboard.writeText(QRIS_OFFICIAL_NMID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [imgSrcIndex, setImgSrcIndex] = useState(0);
  const imageCandidates = [
    '/qris-as-shomad.png',
    '/qris-as-shomad.jpg',
    '/qris-as-shomad.jpeg',
    '/Qris As Shomad.png',
    localStorage.getItem('as_shomad_official_qris_image'),
    '/qris-as-shomad.svg'
  ].filter(Boolean) as string[];

  const currentPlacardSrc = imageCandidates[imgSrcIndex] || '/qris-as-shomad.png';

  const handleImageError = () => {
    if (imgSrcIndex < imageCandidates.length - 1) {
      setImgSrcIndex(prev => prev + 1);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentPlacardSrc;
    link.download = 'QRIS-Resmi-Masjid-As-Shomad.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* PLAKAT QRIS RESMI SESUAI POSTER ASLI */}
      <div 
        id="qris-official-placard"
        className={`relative w-full ${containerMaxWidth} bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden group`}
      >
        {/* Lencana Terverifikasi */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-emerald-700/90 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs transition">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span>QRIS RESMI</span>
        </div>

        {/* Gambar Plakat QRIS Asli */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer relative overflow-hidden bg-white flex items-center justify-center p-2 sm:p-3"
          title="Klik untuk memperbesar tampilan QRIS"
        >
          <img 
            src={currentPlacardSrc}
            onError={handleImageError}
            alt="Plakat QRIS Resmi Masjid As Shomad"
            className="w-full h-auto rounded-xl object-contain shadow-xs transition-transform duration-300 group-hover:scale-[1.01]"
            referrerPolicy="no-referrer"
          />

          {/* Hover Overlay Hint */}
          <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-xl">
            <div className="bg-white/95 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Klik untuk Perbesar</span>
            </div>
          </div>
        </div>

        {/* BARIS SALIN NMID & AKSI */}
        {showControls && (
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">NMID:</span>
              <span className="font-mono font-bold text-slate-800 tracking-wide">{QRIS_OFFICIAL_NMID}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyNmid}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition shadow-2xs"
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

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition shadow-2xs"
                title="Perbesar Layar Penuh"
              >
                <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Perbesar</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition shadow-2xs"
                title="Unduh Plakat QRIS"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Unduh</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PERBESAR QRIS UNTUK SCAN NYAMAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="relative bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 flex flex-col items-center animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Tutup */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4 pr-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Scan QRIS Masjid As Shomad
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Buka aplikasi m-Banking / e-Wallet lalu arahkan kamera ke barcode berikut.
              </p>
            </div>

            {/* Gambar Plakat Besar */}
            <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-2 shadow-inner">
              <img 
                src={currentPlacardSrc}
                onError={handleImageError}
                alt="QRIS Resmi Masjid As Shomad"
                className="w-full h-auto rounded-xl object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Tombol Aksi Bawah Modal */}
            <div className="flex items-center justify-center gap-3 mt-5 w-full">
              <button
                type="button"
                onClick={handleCopyNmid}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'NMID Tersalin!' : 'Salin NMID'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Poster</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
