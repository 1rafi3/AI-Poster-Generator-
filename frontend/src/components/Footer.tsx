import React from 'react';
import Link from 'next/link';
import { Sparkles, Printer, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070D18] border-t border-slate-800 text-slate-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center border border-amber-400">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
              </div>
              <span className="font-bold text-lg text-white">AI Political Poster Maker Bangladesh</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              বাংলাদেশের রাজনৈতিক কর্মী, প্রচার সম্পাদক ও সংগঠনসমূহের জন্য উন্নত কৃত্রিম বুদ্ধিমত্তা (Gemini AI) চালিত
              প্রেস-কোয়ালিটি (১২০০×১৬০০+ পিক্সেল) পোস্টার ও ব্যানার তৈরির ডিজিটাল প্ল্যাটফর্ম।
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1"><Printer className="w-3.5 h-3.5 text-emerald-400" /> প্রিন্ট-রেডি কালার ফরম্যাট</span>
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-amber-400" /> বিশুদ্ধ বাংলা ফন্ট ও বানান</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-3">ক্যাটাগরি</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/?occasion=victory_day" className="hover:text-emerald-400 transition-colors">১৬ই ডিসেম্বর বিজয় দিবস</Link></li>
              <li><Link href="/?occasion=condolence" className="hover:text-emerald-400 transition-colors">শোক ও স্মরণ শ্রদ্ধাঞ্জলি</Link></li>
              <li><Link href="/?occasion=election" className="hover:text-emerald-400 transition-colors">আসন্ন নির্বাচনী গণসংযোগ</Link></li>
              <li><Link href="/?occasion=greetings" className="hover:text-emerald-400 transition-colors">অভিনন্দন ও শুভেচ্ছা বার্তা</Link></li>
              <li><Link href="/?occasion=eid_festival" className="hover:text-emerald-400 transition-colors">পবিত্র ঈদ মোবারক</Link></li>
            </ul>
          </div>

          {/* Platform Info */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-3">ফিচারস</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> জেমিনি এআই স্লোগান জেনারেটর</li>
              <li>৩ জন নেতার কাটআউট ফটো ফ্রেম</li>
              <li>ঐতিহ্যবাহী লাল-সবুজ ও সোনালী বর্ডার</li>
              <li>উচ্চ-রেজুলেশন PNG ও PDF ডাউনলোড</li>
              <li>অটোমেটিক &apos;প্রচারে&apos; ফুটনোট লেআউট</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AI Political Poster Maker. সকল স্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            দেশপ্রেম ও প্রযুক্তির সমন্বয়ে নির্মিত <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
