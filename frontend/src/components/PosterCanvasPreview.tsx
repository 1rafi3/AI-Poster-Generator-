import React, { useRef, useEffect, useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import { Download, FileText, ZoomIn, ZoomOut, Check, Eye, RefreshCw } from 'lucide-react';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface PosterData {
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
}

interface PosterCanvasPreviewProps {
  posterData: PosterData;
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

interface Colors {
  primary: string;
  red: string;
  gold: string;
  bg: [string, string];
}

/* ─────────────────────────────────────────────
   CANVAS HELPERS
───────────────────────────────────────────── */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    img.src = src.startsWith('http') || src.startsWith('data:')
      ? src : `${apiOrigin}${src.startsWith('/') ? '' : '/'}${src}`;
  });
}

function drawCircleImg(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  cx: number, cy: number, r: number,
  fillColor: string,
  placeholderText: string,
  borderColor: string,
  borderWidth: number,
  font: string,
  sc: number
) {
  ctx.save();
  // background fill
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  } else {
    ctx.fillStyle = '#94a3b8';
    ctx.font = `${9 * sc}px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(placeholderText, cx, cy);
  }

  // border ring
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/* Fit text to maxWidth by reducing font size */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  baseFontStr: string // e.g. "900 22px 'Tiro Bangla'"
): string {
  ctx.font = baseFontStr;
  if (ctx.measureText(text).width <= maxWidth) return baseFontStr;
  // parse size
  const match = baseFontStr.match(/(\d+(?:\.\d+)?)px/);
  if (!match) return baseFontStr;
  let size = parseFloat(match[1]);
  while (size > 8 && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = baseFontStr.replace(/[\d.]+px/, `${size}px`);
  }
  return ctx.font;
}

/* ─────────────────────────────────────────────
   MAIN DRAW FUNCTION
   sc = 1 for preview (480×640)
   sc = 2.5 for print  (1200×1600)
───────────────────────────────────────────── */
async function drawPoster(
  ctx: CanvasRenderingContext2D,
  data: PosterData,
  colors: Colors,
  fontFamily: string,
  sc: number
): Promise<void> {
  const W = 480 * sc;
  const H = 640 * sc;
  const { primary, red, gold, bg } = colors;
  const F = `'${fontFamily}', 'Hind Siliguri', 'Noto Sans Bengali', sans-serif`;

  ctx.save();

  /* ── 1. BACKGROUND ── */
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, bg[0]);
  bgGrad.addColorStop(0.65, bg[1]);
  bgGrad.addColorStop(1, '#050C09');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  /* ── 2. BG CIRCLE MOTIF ── */
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = red;
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.26, 160 * sc, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* ── 3. GOLDEN BORDER ── */
  ctx.save();
  ctx.strokeStyle = gold + 'cc';
  ctx.lineWidth = 4 * sc;
  roundedRect(ctx, 10 * sc, 10 * sc, W - 20 * sc, H - 20 * sc, 12 * sc);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1 * sc;
  roundedRect(ctx, 17 * sc, 17 * sc, W - 34 * sc, H - 34 * sc, 8 * sc);
  ctx.stroke();
  ctx.restore();

  /* ── 4. CORNER ORNAMENTS ── */
  const corners: [number, number][] = [
    [18 * sc, 26 * sc],
    [W - 18 * sc, 26 * sc],
    [18 * sc, H - 12 * sc],
    [W - 18 * sc, H - 12 * sc],
  ];
  ctx.save();
  ctx.fillStyle = gold;
  ctx.globalAlpha = 0.85;
  ctx.font = `bold ${16 * sc}px sans-serif`;
  ctx.textBaseline = 'alphabetic';
  for (const [cx2, cy2] of corners) {
    ctx.textAlign = cx2 < W / 2 ? 'left' : 'right';
    ctx.fillText('❖', cx2, cy2);
  }
  ctx.restore();

  /* ══════════════════════════════════════
     TOP SECTION
  ══════════════════════════════════════ */
  let curY = 28 * sc;

  /* -- Bismillah strip -- */
  const bismText = 'বিসমিল্লাহির রাহমানির রাহিম';
  ctx.save();
  ctx.font = `bold ${11 * sc}px ${F}`;
  const bismTW = ctx.measureText(bismText).width;
  const bismPadX = 18 * sc, bismPadY = 4 * sc;
  const bismW = bismTW + bismPadX * 2;
  const bismH = 20 * sc;
  const bismX = (W - bismW) / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundedRect(ctx, bismX, curY, bismW, bismH, bismH / 2);
  ctx.fill();
  ctx.strokeStyle = gold + '55';
  ctx.lineWidth = 1 * sc;
  roundedRect(ctx, bismX, curY, bismW, bismH, bismH / 2);
  ctx.stroke();
  ctx.fillStyle = '#fde68a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bismText, W / 2, curY + bismH / 2);
  ctx.restore();

  curY += bismH + 10 * sc;

  /* -- Leader circles + flag emblem -- */
  const leaderR = 28 * sc;
  const flagR = 22 * sc;
  const rowCY = curY + leaderR;
  const l1x = W / 2 - 62 * sc;
  const l2x = W / 2 + 62 * sc;

  // Load photos (fail gracefully)
  let l1img: HTMLImageElement | null = null;
  let l2img: HTMLImageElement | null = null;
  let candImg: HTMLImageElement | null = null;

  if (data.leader1PhotoUrl) {
    try { l1img = await loadImg(data.leader1PhotoUrl); } catch (_) { /* no photo */ }
  }
  if (data.leader2PhotoUrl) {
    try { l2img = await loadImg(data.leader2PhotoUrl); } catch (_) { /* no photo */ }
  }
  if (data.candidatePhotoUrl) {
    try { candImg = await loadImg(data.candidatePhotoUrl); } catch (_) { /* no photo */ }
  }

  drawCircleImg(ctx, l1img, l1x, rowCY, leaderR, '#1e293b', 'নেতা ১', gold, 3 * sc, F, sc);

  // Flag emblem
  ctx.save();
  ctx.fillStyle = primary;
  ctx.beginPath(); ctx.arc(W / 2, rowCY, flagR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = red;
  ctx.beginPath(); ctx.arc(W / 2, rowCY, flagR * 0.48, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2 * sc;
  ctx.beginPath(); ctx.arc(W / 2, rowCY, flagR, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  drawCircleImg(ctx, l2img, l2x, rowCY, leaderR, '#1e293b', 'নেতা ২', gold, 3 * sc, F, sc);

  curY = rowCY + leaderR + 10 * sc;

  /* -- Headline ribbon -- */
  const ribbonPad = 22 * sc;
  const ribbonX = ribbonPad;
  const ribbonW = W - ribbonPad * 2;
  const ribbonH = 52 * sc;

  ctx.save();
  const ribbonG = ctx.createLinearGradient(ribbonX, 0, ribbonX + ribbonW, 0);
  ribbonG.addColorStop(0, red);
  ribbonG.addColorStop(1, '#B91C1C');
  ctx.fillStyle = ribbonG;
  roundedRect(ctx, ribbonX, curY, ribbonW, ribbonH, 8 * sc);
  ctx.fill();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2 * sc;
  roundedRect(ctx, ribbonX, curY, ribbonW, ribbonH, 8 * sc);
  ctx.stroke();

  const headText = data.headline || 'মহান বিজয় দিবস';
  const headFontBase = `900 ${22 * sc}px ${F}`;
  const headFont = fitText(ctx, headText, ribbonW - 16 * sc, headFontBase);
  ctx.font = headFont;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4 * sc;
  ctx.fillText(headText, W / 2, curY + ribbonH / 2);
  ctx.restore();

  curY += ribbonH + 6 * sc;

  /* -- Subheadline -- */
  if (data.subheadline) {
    ctx.save();
    ctx.font = `600 ${11 * sc}px ${F}`;
    ctx.fillStyle = '#fcd34d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 3 * sc;
    ctx.fillText(data.subheadline, W / 2, curY);
    ctx.restore();
    curY += 18 * sc;
  }

  /* ══════════════════════════════════════
     MIDDLE SECTION
  ══════════════════════════════════════ */
  const midZoneTop = curY + 8 * sc;
  const midZoneBot = H - 110 * sc; // space for footer
  const midCY = (midZoneTop + midZoneBot) / 2 - 20 * sc;
  const candR = 62 * sc;

  /* -- Candidate glow -- */
  ctx.save();
  const glow = ctx.createRadialGradient(W / 2, midCY, candR * 0.4, W / 2, midCY, candR + 22 * sc);
  glow.addColorStop(0, gold + '44');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(W / 2, midCY, candR + 22 * sc, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  /* -- Candidate photo -- */
  drawCircleImg(
    ctx, candImg, W / 2, midCY, candR,
    '#1e293b', 'প্রার্থীর ছবি',
    gold, 4 * sc, F, sc
  );

  /* -- "জনতার সেবক" badge -- */
  const badgeText = 'জনতার সেবক';
  const badgeBot = midCY + candR;
  ctx.save();
  ctx.font = `900 ${9 * sc}px ${F}`;
  const btw = ctx.measureText(badgeText).width;
  const bpx = 12 * sc, bpy = 3 * sc;
  const bw = btw + bpx * 2, bh = 15 * sc;
  const bx = W / 2 - bw / 2, by = badgeBot + 5 * sc;
  ctx.fillStyle = '#f59e0b';
  roundedRect(ctx, bx, by, bw, bh, bh / 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1 * sc;
  roundedRect(ctx, bx, by, bw, bh, bh / 2); ctx.stroke();
  ctx.fillStyle = '#0c0a09';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, W / 2, by + bh / 2);
  ctx.restore();

  /* -- Name plaque -- */
  const plaqueY = by + bh + 14 * sc;
  const plaqueH = 72 * sc;
  const plaquePadX = 44 * sc;
  const plaquePadInner = 16 * sc;
  const plaqueX = plaquePadX;
  const plaqueW = W - plaquePadX * 2;

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  roundedRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, 12 * sc); ctx.fill();
  ctx.strokeStyle = gold + '99'; ctx.lineWidth = 1 * sc;
  roundedRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, 12 * sc); ctx.stroke();

  // Name
  const nameText = data.name || 'সম্মানিত প্রার্থী';
  const nameFontBase = `700 ${20 * sc}px ${F}`;
  const nameFont = fitText(ctx, nameText, plaqueW - plaquePadInner * 2, nameFontBase);
  ctx.font = nameFont;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 3 * sc;
  ctx.fillText(nameText, W / 2, plaqueY + 10 * sc);

  // Designation
  const desigText = `${data.designation || 'পদবি'}, ${data.party || 'দল'}`;
  const desigFontBase = `600 ${11 * sc}px ${F}`;
  const desigFont = fitText(ctx, desigText, plaqueW - plaquePadInner * 2, desigFontBase);
  ctx.font = desigFont;
  ctx.fillStyle = '#fcd34d';
  ctx.shadowBlur = 2 * sc;
  ctx.fillText(desigText, W / 2, plaqueY + 34 * sc);

  // District
  ctx.font = `400 ${10 * sc}px ${F}`;
  ctx.fillStyle = '#cbd5e1';
  ctx.shadowBlur = 0;
  ctx.fillText(`📍 ${data.district || 'জেলা, বাংলাদেশ'}`, W / 2, plaqueY + 52 * sc);
  ctx.restore();

  /* -- Slogan -- */
  if (data.slogan) {
    const slY = plaqueY + plaqueH + 8 * sc;
    const slPadX = 56 * sc;
    const slW = W - slPadX * 2;
    const slH = 26 * sc;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    roundedRect(ctx, slPadX, slY, slW, slH, 8 * sc); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1 * sc;
    roundedRect(ctx, slPadX, slY, slW, slH, 8 * sc); ctx.stroke();
    ctx.font = `italic 500 ${10 * sc}px ${F}`;
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`"${data.slogan}"`, W / 2, slY + slH / 2);
    ctx.restore();
  }

  /* ══════════════════════════════════════
     BOTTOM SECTION
  ══════════════════════════════════════ */
  const ftPadX = 22 * sc;
  const ftW = W - ftPadX * 2;
  const ftH = 68 * sc;
  const ftY = H - ftH - 18 * sc;

  ctx.save();
  const ftG = ctx.createLinearGradient(ftPadX, 0, ftPadX + ftW, 0);
  ftG.addColorStop(0, '#991B1B');
  ftG.addColorStop(0.5, red);
  ftG.addColorStop(1, '#991B1B');
  ctx.fillStyle = ftG;
  roundedRect(ctx, ftPadX, ftY, ftW, ftH, 12 * sc); ctx.fill();
  ctx.strokeStyle = gold; ctx.lineWidth = 1 * sc;
  roundedRect(ctx, ftPadX, ftY, ftW, ftH, 12 * sc); ctx.stroke();

  // "প্রচারে" pill
  const pillTxt = '- প্রচারে -';
  ctx.font = `900 ${9 * sc}px ${F}`;
  const pillTW = ctx.measureText(pillTxt).width;
  const ppx2 = 10 * sc, ppy2 = 3 * sc;
  const pillW = pillTW + ppx2 * 2, pillH = 14 * sc;
  const pillX = W / 2 - pillW / 2, pillY2 = ftY + 8 * sc;
  ctx.fillStyle = '#ffffff';
  roundedRect(ctx, pillX, pillY2, pillW, pillH, pillH / 2); ctx.fill();
  ctx.fillStyle = '#B91C1C';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(pillTxt, W / 2, pillY2 + pillH / 2);

  // Promoted by name
  const promoText = data.promotedBy || 'সকল নেতাকর্মীবৃন্দ';
  const promoFontBase = `800 ${13 * sc}px ${F}`;
  const promoFont = fitText(ctx, promoText, ftW - 16 * sc, promoFontBase);
  ctx.font = promoFont;
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 2 * sc;
  ctx.fillText(promoText, W / 2, pillY2 + pillH + 8 * sc);

  // District subline
  ctx.font = `400 ${9 * sc}px ${F}`;
  ctx.fillStyle = '#fde68a';
  ctx.shadowBlur = 0;
  ctx.fillText(`${data.district || ''} | দলমত নির্বিশেষে সর্বস্তরের জনগণ`, W / 2, pillY2 + pillH + 26 * sc);
  ctx.restore();

  // Watermark
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#64748b';
  ctx.font = `400 ${8 * sc}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('AI Political Poster Maker Bangladesh • ১২০০×১৬০০ হাই-রেজুলেশন', W / 2, H - 4 * sc);
  ctx.restore();

  ctx.restore(); // global save
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const PREVIEW_W = 480;
const PREVIEW_H = 640;
const PRINT_SCALE = 2.5; // 480×640 × 2.5 = 1200×1600

export const PosterCanvasPreview: React.FC<PosterCanvasPreviewProps> = ({
  posterData,
  templateColors,
  onRegenerate,
  isRegenerating = false,
  retryCount = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayScale, setDisplayScale] = useState(0.65);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState(posterData.customBanglaFont || 'Tiro Bangla');
  const [isDrawing, setIsDrawing] = useState(false);

  const colors: Colors = {
    primary: posterData.customColorAccent || templateColors?.primary || '#006A4E',
    red: templateColors?.secondary || '#F42A41',
    gold: templateColors?.accent || '#F59E0B',
    bg: templateColors?.backgroundGradient || ['#004D38', '#00241A'],
  };

  /* Redraw preview canvas whenever anything changes */
  const redrawPreview = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    try {
      await (document as any).fonts.ready;
      await drawPoster(ctx, posterData, colors, selectedFont, 1);
    } catch (err) {
      console.error('Preview draw error:', err);
    } finally {
      setIsDrawing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posterData, templateColors, selectedFont]);

  useEffect(() => {
    redrawPreview();
  }, [redrawPreview]);

  /* Create print-resolution canvas and draw */
  const makePrintCanvas = async (): Promise<HTMLCanvasElement> => {
    const off = document.createElement('canvas');
    off.width = PREVIEW_W * PRINT_SCALE;   // 1200
    off.height = PREVIEW_H * PRINT_SCALE;  // 1600
    const ctx = off.getContext('2d')!;
    await (document as any).fonts.ready;
    await drawPoster(ctx, posterData, colors, selectedFont, PRINT_SCALE);
    return off;
  };

  const downloadPng = async () => {
    setIsExporting(true);
    setExportSuccess(null);
    try {
      const canvas = await makePrintCanvas();
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `poster-BD-${Date.now()}.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setExportSuccess('উচ্চ রেজুলেশন PNG (১২০০×১৬০০) সফলভাবে ডাউনলোড হয়েছে!');
    } catch (err: any) {
      alert('PNG এক্সপোর্ট করতে সমস্যা: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPdf = async () => {
    setIsExporting(true);
    setExportSuccess(null);
    try {
      const canvas = await makePrintCanvas();
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
              onClick={() => setDisplayScale((p) => Math.max(0.4, p - 0.1))}
              className="p-1 hover:text-white text-slate-400 transition-colors"
              title="জুম আউট"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 text-slate-300 font-mono">{Math.round(displayScale * 100)}%</span>
            <button
              onClick={() => setDisplayScale((p) => Math.min(1.0, p + 0.1))}
              className="p-1 hover:text-white text-slate-400 transition-colors"
              title="জুম ইন"
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

          {isDrawing && (
            <span className="text-xs text-amber-400 animate-pulse">রেন্ডার হচ্ছে…</span>
          )}
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
            onClick={downloadPng}
            disabled={isExporting || isDrawing}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'তৈরি হচ্ছে…' : 'PNG (১২০০×১৬০০)'}
          </button>

          <button
            onClick={downloadPdf}
            disabled={isExporting || isDrawing}
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

      {/* ── Canvas preview (zoom via CSS only — canvas pixel size never changes) ── */}
      <div
        style={{
          transform: `scale(${displayScale})`,
          transformOrigin: 'top center',
          marginBottom: `-${PREVIEW_H * (1 - displayScale)}px`,
          display: 'inline-block',
        }}
      >
        <canvas
          ref={canvasRef}
          width={PREVIEW_W}
          height={PREVIEW_H}
          style={{
            display: 'block',
            borderRadius: 16,
            border: `4px solid ${colors.gold}66`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          }}
        />
      </div>
    </div>
  );
};
