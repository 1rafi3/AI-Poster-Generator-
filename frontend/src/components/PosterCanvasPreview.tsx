import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, FileText, ZoomIn, ZoomOut, Check, Eye, RefreshCw } from 'lucide-react';

interface PosterCanvasPreviewProps {
  posterData: {
    headline: string;
    subheadline?: string;
    name: string;
    designation: string;
    party: string;
    district: string;
    promotedBy: string;
    slogan?: string;
    candidatePhotoUrl?: string;
    leader1PhotoUrl?: string;
    leader2PhotoUrl?: string;
    customBanglaFont?: string;
    customColorAccent?: string;
  };
  serverGeneratedImageUrl?: string;
  templateColors?: {
    primary: string;
    secondary: string;
    accent: string;
    backgroundGradient: [string, string];
  };
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  retryCount?: number;
}

export const PosterCanvasPreview: React.FC<PosterCanvasPreviewProps> = ({
  posterData,
  templateColors,
  onRegenerate,
  isRegenerating = false,
  retryCount = 0,
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.65);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState<string>(
    posterData.customBanglaFont || 'Tiro Bangla'
  );

  const bgGrad = templateColors?.backgroundGradient || ['#004D38', '#00241A'];
  const primaryColor = posterData.customColorAccent || templateColors?.primary || '#006A4E';
  const redColor = templateColors?.secondary || '#F42A41';
  const goldColor = templateColors?.accent || '#F59E0B';

  const injectFonts = (clonedDoc: Document) => {
    const link = clonedDoc.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@400;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&family=Tiro+Bangla:ital@0;1&display=swap';
    clonedDoc.head.appendChild(link);
  };

  const imgSrc = (url: string) =>
    url.startsWith('http') || url.startsWith('data:') ? url : `http://localhost:5000${url}`;

  // Always use browser html2canvas — librsvg cannot shape Bangla text correctly.
  const downloadHighResPng = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    setExportSuccess(null);
    try {
      const el = posterRef.current;
      const prev = el.style.transform;
      el.style.transform = 'none';
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      const canvas = await html2canvas(el, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        onclone: (_d) => injectFonts(_d),
      });

      el.style.transform = prev;
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `poster-BD-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setExportSuccess('উচ্চ রেজুলেশন PNG (১২০০×১৬০০) সফলভাবে ডাউনলোড হয়েছে!');
    } catch (err: any) {
      alert('এক্সপোর্ট করতে সমস্যা: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPdf = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    setExportSuccess(null);
    try {
      const el = posterRef.current;
      const prev = el.style.transform;
      el.style.transform = 'none';
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (_d) => injectFonts(_d),
      });

      el.style.transform = prev;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, w, h);
      pdf.save(`poster-BD-${Date.now()}.pdf`);
      setExportSuccess('প্রিন্ট-রেডি PDF সফলভাবে ডাউনলোড হয়েছে!');
    } catch (err: any) {
      alert('PDF তৈরি করতে সমস্যা: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* ── Toolbar ── */}
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setScale((p) => Math.max(0.4, p - 0.1))}
              className="p-1 hover:text-white text-slate-400 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 text-slate-300 font-mono">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale((p) => Math.min(1.0, p + 0.1))}
              className="p-1 hover:text-white text-slate-400 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <select
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
          >
            <option value="Tiro Bangla">তিরো বাংলা</option>
            <option value="Hind Siliguri">হিন্দ শিলিগুড়ি</option>
            <option value="Anek Bangla">অনেক বাংলা</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating || retryCount >= 5}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              রি-জেনারেট ({5 - retryCount})
            </button>
          )}

          <button
            onClick={downloadHighResPng}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            PNG (১২০০×১৬০০)
          </button>

          <button
            onClick={downloadPdf}
            disabled={isExporting}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-700 hover:bg-red-600 text-white flex items-center gap-1.5 shadow transition-colors disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            PDF প্রিন্ট
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="w-full max-w-2xl mb-4 bg-emerald-950/80 border border-emerald-500/50 rounded-lg p-2.5 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          {exportSuccess}
        </div>
      )}

      {/* ── Outer zoom wrapper (display only) ── */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          marginBottom: `-${640 * (1 - scale)}px`,
          display: 'inline-block',
        }}
      >
        {/* Border shell 480×640 */}
        <div
          className="rounded-2xl shadow-2xl border-4 border-amber-400/40 overflow-hidden"
          style={{ width: '480px', height: '640px' }}
        >
          {/* posterRef captured by html2canvas */}
          <div
            ref={posterRef}
            className="relative w-full h-full text-white flex flex-col justify-between overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${bgGrad[0]} 0%, ${bgGrad[1]} 65%, #050C09 100%)`,
              fontFamily: `'${selectedFont}', 'Hind Siliguri', 'Noto Sans Bengali', sans-serif`,
            }}
          >
            {/* BG circle motif */}
            <div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-15 pointer-events-none"
              style={{ backgroundColor: redColor }}
            />

            {/* Golden border */}
            <div className="absolute inset-2.5 border-4 border-amber-400/80 rounded-xl pointer-events-none" />
            <div className="absolute inset-4 border border-white/20 rounded-lg pointer-events-none" />

            {/* Corner ornaments */}
            <div className="absolute top-3 left-3 text-amber-400 text-xl font-bold opacity-80 pointer-events-none">❖</div>
            <div className="absolute top-3 right-3 text-amber-400 text-xl font-bold opacity-80 pointer-events-none">❖</div>
            <div className="absolute bottom-3 left-3 text-amber-400 text-xl font-bold opacity-80 pointer-events-none">❖</div>
            <div className="absolute bottom-3 right-3 text-amber-400 text-xl font-bold opacity-80 pointer-events-none">❖</div>

            {/* ── TOP ── */}
            <div className="pt-4 px-5 z-10 text-center">
              <div className="inline-block bg-black/40 border border-amber-400/30 rounded-full px-4 py-0.5 text-[11px] text-amber-300 font-bold tracking-wide mb-2">
                বিসমিল্লাহির রাহমানির রাহিম
              </div>

              <div className="flex items-center justify-center gap-5 my-1">
                <div className="w-14 h-14 rounded-full border-4 border-amber-400 bg-slate-900 shadow-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                  {posterData.leader1PhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgSrc(posterData.leader1PhotoUrl)} alt="নেতা ১" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] text-slate-300 text-center leading-tight px-1">শীর্ষ নেতা ১</span>
                  )}
                </div>

                <div
                  className="w-10 h-10 rounded-full border-2 border-amber-400 flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: redColor }} />
                </div>

                <div className="w-14 h-14 rounded-full border-4 border-amber-400 bg-slate-900 shadow-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                  {posterData.leader2PhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgSrc(posterData.leader2PhotoUrl)} alt="নেতা ২" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] text-slate-300 text-center leading-tight px-1">শীর্ষ নেতা ২</span>
                  )}
                </div>
              </div>

              <div
                className="mt-2 py-2 px-4 rounded-lg shadow-xl text-center border-2 border-amber-300 mx-2"
                style={{ background: `linear-gradient(90deg, ${redColor} 0%, #B91C1C 100%)` }}
              >
                <h1 className="text-xl font-black tracking-wide drop-shadow-md text-white leading-tight">
                  {posterData.headline || 'মহান বিজয় দিবস'}
                </h1>
              </div>

              {posterData.subheadline && (
                <p className="text-[11px] text-amber-300 mt-1 font-semibold drop-shadow leading-tight">
                  {posterData.subheadline}
                </p>
              )}
            </div>

            {/* ── MIDDLE ── */}
            <div className="flex flex-col items-center justify-center z-10 flex-1 py-2">
              <div className="relative">
                <div
                  className="w-32 h-32 rounded-full border-4 border-amber-400 bg-slate-900/90 shadow-2xl overflow-hidden flex items-center justify-center"
                  style={{ boxShadow: `0 0 22px ${goldColor}55` }}
                >
                  {posterData.candidatePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgSrc(posterData.candidatePhotoUrl)} alt={posterData.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <div className="w-9 h-9 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-1">
                        <Eye className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-[10px] text-emerald-300 font-medium">প্রার্থীর ছবি</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-extrabold px-3 py-0.5 rounded-full border border-white shadow whitespace-nowrap">
                  জনতার সেবক
                </div>
              </div>

              <div className="mt-4 bg-black/60 border border-amber-400/60 rounded-xl px-5 py-2.5 text-center max-w-[88%] shadow-lg">
                <h2 className="text-lg font-bold text-white tracking-wide drop-shadow leading-tight">
                  {posterData.name || 'সম্মানিত প্রার্থী'}
                </h2>
                <p className="text-[11px] text-amber-300 font-semibold mt-0.5 leading-tight">
                  {posterData.designation || 'পদবি'}, {posterData.party || 'রাজনৈতিক দল'}
                </p>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  📍 {posterData.district || 'থানা / জেলা, বাংলাদেশ'}
                </p>
              </div>

              {posterData.slogan && (
                <div className="mt-2 px-5 py-1 bg-black/40 rounded-lg max-w-[82%] text-center border border-white/10">
                  <p className="text-[10px] text-slate-200 italic font-medium leading-tight">
                    &ldquo;{posterData.slogan}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* ── BOTTOM ── */}
            <div className="pb-3 px-5 z-10">
              <div
                className="py-2 px-4 rounded-xl border border-amber-400 text-center shadow-2xl"
                style={{ background: `linear-gradient(90deg, #991B1B 0%, ${redColor} 50%, #991B1B 100%)` }}
              >
                <div className="inline-block bg-white text-red-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider mb-0.5 shadow-sm">
                  - প্রচারে -
                </div>
                <p className="text-sm font-extrabold text-white drop-shadow leading-tight">
                  {posterData.promotedBy || 'সকল সচেতন এলাকাবাসী ও নেতাকর্মীবৃন্দ'}
                </p>
                <p className="text-[9px] text-amber-200 mt-0.5">
                  {posterData.district} | দলমত নির্বিশেষে সর্বস্তরের জনগণ
                </p>
              </div>

              <div className="text-center mt-1">
                <span className="text-[8px] text-slate-400 opacity-50">
                  AI Political Poster Maker Bangladesh • ১২০০×১৬০০ হাই-রেজুলেশন
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
