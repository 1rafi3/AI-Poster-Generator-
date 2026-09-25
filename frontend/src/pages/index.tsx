import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { TemplateCard, TemplateData } from '../components/TemplateCard';
import { apiRequest } from '../services/api';
import { Sparkles, Palette, Printer, ArrowRight, ShieldCheck, Layers, Award } from 'lucide-react';

const occasions = [
  { id: 'all', label: 'সকল টেমপ্লেট' },
  { id: 'victory_day', label: '১৬ই ডিসেম্বর বিজয় দিবস' },
  { id: 'election', label: 'নির্বাচনী প্রচার' },
  { id: 'condolence', label: 'শোক ও শ্রদ্ধাঞ্জলি' },
  { id: 'greetings', label: 'শুভেচ্ছা ও অভিনন্দন' },
  { id: 'eid_festival', label: 'ঈদ ও উৎসব' },
];

export default function Home() {
  const router = useRouter();
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (router.query.occasion && typeof router.query.occasion === 'string') {
      setSelectedOccasion(router.query.occasion);
    }
  }, [router.query.occasion]);

  useEffect(() => {
    fetchTemplates(selectedOccasion);
  }, [selectedOccasion]);

  const fetchTemplates = async (occasion: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = occasion === 'all' ? '/templates' : `/templates?occasion=${occasion}`;
      const data = await apiRequest(url);
      setTemplates(data.templates || []);
    } catch (err: any) {
      console.error('Fetch templates error:', err);
      setError('টেমপ্লেট লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে ব্যাকএন্ড সার্ভার চালু রয়েছে কিনা যাচাই করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800">
        {/* Patriotic subtle radial glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>জেমিনি এআই চালিত বাংলাদেশী রাজনৈতিক পোস্টার জেনারেটর</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            তৈরি করুন প্রেস-কোয়ালিটি <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-amber-300 to-red-400 bg-clip-text text-transparent">
              মুদ্রণ-উপযোগী রাজনৈতিক পোস্টার
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            বিজয় দিবস, শোকবার্তা, নির্বাচনী প্রচারণা বা যেকোনো উৎসবের পোস্টার কয়েক ক্লিকেই প্রস্তুত।
            শীর্ষ নেতাদের ছবি, পতাকার মোটিফ, ফুলের বর্ডার এবং নির্ভুল বাংলা টাইপোগ্রাফির পারফেক্ট সমন্বয়।
          </p>

          {/* Quick CTA */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/create"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              এখনই পোস্টার বানান
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#templates-section"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Palette className="w-4 h-4 text-amber-400" />
              টেমপ্লেটগুলো দেখুন
            </a>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center mb-2">
                <Printer className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">১২০০×১৬০০ প্রিন্ট সাইজ</h4>
              <p className="text-xs text-slate-400 mt-1">প্রেস ও ডিজিটাল শেয়ারিংয়ের জন্য উপযুক্ত হাই-রেজুলেশন।</p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-red-950 text-red-400 flex items-center justify-center mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">জেমিনি এআই স্লোগান</h4>
              <p className="text-xs text-slate-400 mt-1">অনুষ্ঠান ও দলের মেজাজ অনুযায়ী আকর্ষণীয় ছন্দময় স্লোগান।</p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">নির্ভুল বাংলা ফন্ট</h4>
              <p className="text-xs text-slate-400 mt-1">কোনো ভুল বানান বা নষ্ট যুক্তবর্ণ ছাড়া নিখুঁত টেক্সট।</p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center mb-2">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">৩ জন নেতার ফ্রেম</h4>
              <p className="text-xs text-slate-400 mt-1">শীর্ষ দুই নেতা ও প্রার্থীর জন্য খাঁটি ঐতিহ্যবাহী কাটআউট ফ্রেম।</p>
            </div>
          </div>
        </div>
      </section>

      {/* TEMPLATE LIBRARY SECTION */}
      <section id="templates-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
              <Award className="w-3.5 h-3.5" />
              রেডি-মেড ডিজাইন সংকলন
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              পোস্টার টেমপ্লেট লাইব্রেরি
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              আপনার কাঙ্ক্ষিত উপলক্ষ নির্বাচন করে যেকোনো টেমপ্লেট নিয়ে কাজ শুরু করুন।
            </p>
          </div>

          {/* Occasion Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {occasions.map((occ) => (
              <button
                key={occ.id}
                onClick={() => setSelectedOccasion(occ.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedOccasion === occ.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {occ.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 bg-slate-800/50 rounded-2xl border border-slate-800" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-slate-900 border border-red-900/50 rounded-2xl text-slate-300">
            <p className="text-sm text-red-400 mb-4">{error}</p>
            <button
              onClick={() => fetchTemplates(selectedOccasion)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-white"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
            <p className="text-slate-400 text-sm">এই ক্যাটাগরিতে কোনো টেমপ্লেট পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <TemplateCard key={tpl._id} template={tpl} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
