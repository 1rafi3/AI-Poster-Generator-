import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Image as ImageIcon } from 'lucide-react';

export interface TemplateData {
  _id: string;
  title: string;
  occasionType: string;
  occasionLabelBangla: string;
  thumbnailUrl?: string;
  layoutConfig: {
    colorScheme: {
      primary: string;
      secondary: string;
      accent: string;
      backgroundGradient: [string, string];
    };
    decorations?: {
      hasFlagMotif?: boolean;
      hasFloralBorder?: boolean;
      bannerStyle?: string;
    };
  };
}

interface TemplateCardProps {
  template: TemplateData;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const getBadgeColor = (occasion: string) => {
    switch (occasion) {
      case 'victory_day':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700';
      case 'condolence':
        return 'bg-slate-900 text-slate-300 border-slate-700';
      case 'election':
        return 'bg-red-950 text-red-300 border-red-700';
      case 'greetings':
        return 'bg-amber-950 text-amber-300 border-amber-700';
      case 'eid_festival':
        return 'bg-teal-950 text-teal-300 border-teal-700';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const bgGrad = template.layoutConfig?.colorScheme?.backgroundGradient || ['#004D38', '#00241A'];
  const primary = template.layoutConfig?.colorScheme?.primary || '#006A4E';
  const secondary = template.layoutConfig?.colorScheme?.secondary || '#F42A41';
  const accent = template.layoutConfig?.colorScheme?.accent || '#F59E0B';

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col border border-slate-800">
      {/* Visual Graphical Poster Miniature */}
      <div
        className="relative h-64 p-4 flex flex-col justify-between overflow-hidden shadow-inner"
        style={{
          background: `linear-gradient(135deg, ${bgGrad[0]} 0%, ${bgGrad[1]} 100%)`,
        }}
      >
        {/* Background Decorative Flag Circle */}
        <div
          className="absolute -right-8 -top-8 w-44 h-44 rounded-full opacity-20 pointer-events-none"
          style={{ backgroundColor: secondary }}
        />
        <div
          className="absolute right-12 top-10 w-24 h-24 rounded-full opacity-10 pointer-events-none"
          style={{ backgroundColor: accent }}
        />

        {/* Top Badges */}
        <div className="flex items-center justify-between z-10">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border shadow-sm ${getBadgeColor(template.occasionType)}`}>
            {template.occasionLabelBangla}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/30 flex items-center gap-1 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-amber-400" /> ১২০০×১৬০০ প্রিন্ট
          </span>
        </div>

        {/* Miniature Mockup Representation */}
        <div className="my-auto text-center z-10 space-y-2">
          {/* Top 2 mini leader circles */}
          <div className="flex justify-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900/80 border-2 border-amber-400 shadow flex items-center justify-center text-[8px] text-slate-300">
              নেতা ১
            </div>
            <div
              className="w-9 h-9 rounded-full border-2 border-amber-400 shadow flex items-center justify-center text-[8px] text-white font-bold"
              style={{ backgroundColor: primary }}
            >
              পতাকা
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-900/80 border-2 border-amber-400 shadow flex items-center justify-center text-[8px] text-slate-300">
              নেতা ২
            </div>
          </div>

          {/* Headline Ribbon */}
          <div
            className="py-1 px-3 rounded shadow mx-auto max-w-[85%] text-xs font-bold text-white tracking-wide"
            style={{ backgroundColor: secondary }}
          >
            {template.title}
          </div>

          {/* Candidate Placeholder */}
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/80 border-2 border-amber-400 shadow-md flex items-center justify-center text-[9px] text-emerald-300">
            <ImageIcon className="w-4 h-4 text-amber-300" />
          </div>

          {/* Footer Promoted by bar */}
          <div className="bg-black/50 border border-white/10 rounded px-2 py-0.5 text-[9px] text-slate-300 max-w-[80%] mx-auto truncate">
            প্রচারে: এলাকাবাসী ও সমর্থকবৃন্দ
          </div>
        </div>
      </div>

      {/* Content & Action */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-slate-900/90">
        <div>
          <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1">
            {template.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Bangla headline, 3-photo cutouts, flag motifs, and customizable footer credit lines.
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            প্রস্তুত টেমপ্লেট
          </div>

          <Link
            href={`/create?templateId=${template._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all hover:gap-2"
          >
            পোস্টার বানান <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
