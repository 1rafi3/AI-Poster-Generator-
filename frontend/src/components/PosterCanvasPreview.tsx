import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, FileText, Sparkles, RefreshCw, ZoomIn, ZoomOut, Check, Eye } from 'lucide-react';

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
  serverGeneratedImageUrl,
  templateColors,
  onRegenerate,
  isRegenerating = false,
  retryCount = 0,
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.65);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState<string>(posterData.customBanglaFont || 'Tiro Bangla');

  const bgGrad = templateColors?.backgroundGradient || ['#004D38', '#00241A'];
  const primaryColor = posterData.customColorAccent || templateColors?.primary || '#006A4E';
  const redColor = templateColors?.secondary || '#F42A41';
  const goldColor = templateColors?.accent || '#F59E0B';

  const downloadHighResPng = async () => {
    setIsExporting(true);
    setExportSuccess(null);

    // If server generated image exists, we can offer direct high-res download
    if (serverGeneratedImageUrl) {
      try {
        const link = document.createElement('a');
        link.href = serverGeneratedImageUrl.startsWith('http')
          ? serverGeneratedImageUrl
          : `http://localhost:5000${serverGeneratedImageUrl}`;
        link.download = `political-poster-${Date.now()}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportSuccess('উচ্চ রেজুলেশন প্রিন্ট PNG সফলভাবে ডাউনলোড হয়েছে!');
        setIsExporting(false);
        return;
      } catch (e) {
        console.warn('Direct server download fallback to client canvas render:', e);
      }
    }

    // Client-side HTML2Canvas high-resolution render (1200x1600 standard)
    if (!posterRef.current) {
      setIsExporting(false);
      return;
    }

    try {
      const element = posterRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5, // Crisp 1200x1600+ print resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `political-poster-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess('উচ্চ রেজুলেশন প্রিন্ট PNG সফলভাবে প্রস্তুত হয়েছে!');
    } catch (err: any) {
      console.error('Export error:', err);
      alert('এক্সপোর্ট করার সময় সমস্যা হয়েছে: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPdf = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    setExportSuccess(null);

    try {
      const element = posterRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      // Create standard portrait PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`political-poster-${Date.now()}.pdf`);

      setExportSuccess('প্রিন্ট-রেডি PDF সফলভাবে ডাউনলোড হয়েছে!');
    } catch (err: any) {
      console.error('PDF Export error:', err);
      alert('PDF তৈরি করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Control Action Toolbar */}
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Zoom Controls & Font Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setScale((prev) => Math.max(0.4, prev - 0.1))}
              className="p-1 hover:text-white text-slate-400 transition-colors"
              title="জুম আউট"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 text-slate-300 font-mono">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale((prev) => Math.min(1.0, prev + 0.1))}
              className="p-1 hover:text-white text-slate-400 transition-colors"
              title="জুম ইন"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Bangla Font Selector */}
          <select
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
          >
            <option value="Tiro Bangla">ফন্ট: তিরো বাংলা (Tiro Bangla)</option>
            <option value="Hind Siliguri">ফন্ট: হিন্দ শিলিগুড়ি (Hind Siliguri)</option>
            <option value="Anek Bangla">ফন্ট: অনেক বাংলা (Anek Bangla)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating || retryCount >= 5}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              এআই রি-জেনারেট ({5 - retryCount} বাকি)
            </button>
          )}

          <button
            onClick={downloadHighResPng}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            PNG ডাউনলোড (১২০০×১৬০০)
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
        <div className="w-full max-w-2xl mb-4 bg-emerald-950/80 border border-emerald-500/50 rounded-lg p-2.5 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          {exportSuccess}
        </div>
      )}

      {/* Main Poster Preview Canvas Wrapper */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl border-4 border-amber-400/40 p-1 bg-slate-950"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          width: '600px',
          height: '800px',
          marginBottom: `-${800 * (1 - scale)}px`,
        }}
      >
        <div
          ref={posterRef}
          className="relative w-full h-full text-white flex flex-col justify-between overflow-hidden shadow-2xl"
          style={{
            background: `linear-gradient(180deg, ${bgGrad[0]} 0%, ${bgGrad[1]} 65%, #050C09 100%)`,
            fontFamily: selectedFont,
          }}
        >
          {/* Subtle Background Watermark Flag Motif */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-15 pointer-events-none"
            style={{ backgroundColor: redColor }}
          />

          {/* Golden Outer Decorative Border */}
          <div className="absolute inset-2.5 border-4 border-amber-400/80 rounded-xl pointer-events-none" />
          <div className="absolute inset-4 border border-white/20 rounded-lg pointer-events-none" />

          {/* Four Corner Floral Ornaments */}
          <div className="absolute top-3 left-3 text-amber-400 text-xl font-bold opacity-80 pointer-events-none">❖</div>
          <div className="absolute top-3 right-3 text-amber-400 text-xl font-bold opacity-80 pointer-events-none">❖</div>
          <div className="absolute bottom-3 left-3 text-amber-400 text-xl font-bold opacity-80 pointer-events-none">❖</div>
          <div className="absolute bottom-3 right-3 text-amber-400 text-xl font-bold opacity-80 pointer-events-none">❖</div>

          {/* TOP SECTION: Motto & Leaders */}
          <div className="pt-5 px-6 z-10 text-center">
            {/* Religious / Patriotic Motto */}
            <div className="inline-block bg-black/40 border border-amber-400/30 rounded-full px-5 py-1 text-xs text-amber-300 font-bold tracking-wider mb-3">
              বিসমিল্লাহির রাহমানির রাহিম
            </div>

            {/* Top Leaders Row */}
            <div className="flex items-center justify-center gap-6 my-1">
              {/* Leader 1 */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-4 border-amber-400 bg-slate-900 shadow-lg overflow-hidden flex items-center justify-center relative">
                  {posterData.leader1PhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        posterData.leader1PhotoUrl.startsWith('http') || posterData.leader1PhotoUrl.startsWith('data:')
                          ? posterData.leader1PhotoUrl
                          : `http://localhost:5000${posterData.leader1PhotoUrl}`
                      }
                      alt="নেতা ১"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-300 font-semibold">শীর্ষ নেতা ১</span>
                  )}
                </div>
              </div>

              {/* Central Flag Emblem */}
              <div
                className="w-12 h-12 rounded-full border-2 border-amber-400 flex items-center justify-center shadow-lg relative group"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: redColor }} />
              </div>

              {/* Leader 2 */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-4 border-amber-400 bg-slate-900 shadow-lg overflow-hidden flex items-center justify-center relative">
                  {posterData.leader2PhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        posterData.leader2PhotoUrl.startsWith('http') || posterData.leader2PhotoUrl.startsWith('data:')
                          ? posterData.leader2PhotoUrl
                          : `http://localhost:5000${posterData.leader2PhotoUrl}`
                      }
                      alt="নেতা ২"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-300 font-semibold">শীর্ষ নেতা ২</span>
                  )}
                </div>
              </div>
            </div>

            {/* Main Headline Ribbon Banner */}
            <div className="mt-2 relative">
              <div
                className="py-2.5 px-6 rounded-lg shadow-xl text-center border-2 border-amber-300"
                style={{
                  background: `linear-gradient(90deg, ${redColor} 0%, #B91C1C 100%)`,
                }}
              >
                <h1 className="text-2xl font-black tracking-wide drop-shadow-md text-white">
                  {posterData.headline || 'মহান বিজয় দিবস'}
                </h1>
              </div>
              {posterData.subheadline && (
                <p className="text-xs text-amber-300 mt-1 font-semibold drop-shadow">
                  {posterData.subheadline}
                </p>
              )}
            </div>
          </div>

          {/* MIDDLE SECTION: Candidate Photo Cutout & Plaque */}
          <div className="flex flex-col items-center justify-center z-10 my-auto py-2">
            {/* Candidate Frame */}
            <div className="relative">
              <div
                className="w-36 h-36 rounded-full border-4 border-amber-400 bg-slate-900/90 shadow-2xl overflow-hidden flex items-center justify-center relative"
                style={{
                  boxShadow: `0 0 25px ${goldColor}55`,
                }}
              >
                {posterData.candidatePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      posterData.candidatePhotoUrl.startsWith('http') || posterData.candidatePhotoUrl.startsWith('data:')
                        ? posterData.candidatePhotoUrl
                        : `http://localhost:5000${posterData.candidatePhotoUrl}`
                    }
                    alt={posterData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2">
                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-1">
                      <Eye className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-[11px] text-emerald-300 font-medium">প্রার্থীর ছবি</span>
                  </div>
                )}
              </div>

              {/* Decorative Laurel Ribbon Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-full border border-white shadow">
                জনতার সেবক
              </div>
            </div>

            {/* Candidate Name & Designation Plaque */}
            <div className="mt-3.5 bg-black/60 border border-amber-400/60 rounded-xl px-6 py-2 text-center max-w-[85%] shadow-lg backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white tracking-wide drop-shadow">
                {posterData.name || 'সম্মানিত প্রার্থী/নেতৃবৃন্দ'}
              </h2>
              <p className="text-xs text-amber-300 font-semibold mt-0.5">
                {posterData.designation || 'পদবি'}, {posterData.party || 'রাজনৈতিক দল'}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                📍 {posterData.district || 'থানা / জেলা, বাংলাদেশ'}
              </p>
            </div>

            {/* AI Enhanced Slogan */}
            {posterData.slogan && (
              <div className="mt-2.5 px-6 py-1 bg-black/40 rounded-lg max-w-[80%] text-center border border-white/10">
                <p className="text-[11px] text-slate-200 italic font-medium leading-tight">
                  &ldquo;{posterData.slogan}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* BOTTOM SECTION: "প্রচারে" (Promoted By) Footer Bar */}
          <div className="pb-4 px-6 z-10">
            <div
              className="py-2.5 px-4 rounded-xl border border-amber-400 text-center shadow-2xl relative overflow-hidden"
              style={{
                background: `linear-gradient(90deg, #991B1B 0%, ${redColor} 50%, #991B1B 100%)`,
              }}
            >
              <div className="inline-block bg-white text-red-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 shadow-sm">
                - প্রচারে -
              </div>
              <p className="text-sm font-extrabold text-white drop-shadow leading-tight">
                {posterData.promotedBy || 'সকল সচেতন এলাকাবাসী ও নেতাকর্মীবৃন্দ'}
              </p>
              <p className="text-[10px] text-amber-200 mt-0.5">
                {posterData.district} | দলমত নির্বিশেষে সর্বস্তরের জনগণ
              </p>
            </div>

            {/* Footer tiny watermark */}
            <div className="text-center mt-1">
              <span className="text-[9px] text-slate-400 opacity-60">
                AI Political Poster Maker Bangladesh • ১২০০×১৬০০ হাই-রেজুলেশন
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
