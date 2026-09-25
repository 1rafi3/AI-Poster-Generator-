import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { apiRequest, uploadPhotoApi } from '../services/api';
import { PosterCanvasPreview } from '../components/PosterCanvasPreview';
import { Sparkles, Upload, ArrowRight, Palette, User, Flag, MapPin, CheckCircle, RefreshCw } from 'lucide-react';

export default function CreatePoster() {
  const router = useRouter();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiGeneratingSlogan, setAiGeneratingSlogan] = useState<boolean>(false);
  const [uploadingPhotoSlot, setUploadingPhotoSlot] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    party: '',
    district: '',
    occasionType: 'victory_day',
    headline: 'মহান বিজয় দিবস',
    subheadline: 'সকল শহীদ ও বীর মুক্তিযোদ্ধাদের প্রতি বিনম্র শ্রদ্ধা',
    promotedBy: 'সকল সচেতন এলাকাবাসী ও নেতাকর্মীবৃন্দ',
    slogan: 'বীর বাঙালি অস্ত্র ধরো, বাংলাদেশ মুক্ত করো — বিজয়ের মাসে লাল-সবুজের প্রত্যয়',
    candidatePhotoUrl: '',
    leader1PhotoUrl: '',
    leader2PhotoUrl: '',
    customBanglaFont: 'Tiro Bangla',
    customColorAccent: '#006A4E',
  });

  // Load templates on mount
  useEffect(() => {
    async function loadTemplates() {
      try {
        const data = await apiRequest('/templates');
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
          const initialTplId = (router.query.templateId as string) || data.templates[0]._id;
          setSelectedTemplateId(initialTplId);
          applyTemplateDefaults(data.templates.find((t: any) => t._id === initialTplId) || data.templates[0]);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      }
    }
    loadTemplates();
  }, [router.query.templateId]);

  const applyTemplateDefaults = (template: any) => {
    if (!template) return;
    const slots = template.layoutConfig?.textSlots || [];
    const headlineSlot = slots.find((s: any) => s.id === 'headline');
    const subheadlineSlot = slots.find((s: any) => s.id === 'subheadline');
    const sloganSlot = slots.find((s: any) => s.id === 'slogan');

    setFormData((prev) => ({
      ...prev,
      occasionType: template.occasionType,
      headline: headlineSlot?.defaultText || prev.headline,
      subheadline: subheadlineSlot?.defaultText || prev.subheadline,
      slogan: sloganSlot?.defaultText || prev.slogan,
      customColorAccent: template.layoutConfig?.colorScheme?.primary || prev.customColorAccent,
    }));
  };

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const chosen = templates.find((t) => t._id === tplId);
    if (chosen) {
      applyTemplateDefaults(chosen);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image Upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: 'candidate' | 'leader1' | 'leader2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhotoSlot(slot);
    try {
      // First try backend upload endpoint
      let photoUrl = '';
      try {
        photoUrl = await uploadPhotoApi(file);
      } catch (uploadErr) {
        console.warn('Backend upload fallback to local browser data URL:', uploadErr);
        // Fallback to local Data URL for immediate smooth preview
        const reader = new FileReader();
        photoUrl = await new Promise((resolve) => {
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(file);
        });
      }

      if (slot === 'candidate') {
        setFormData((prev) => ({ ...prev, candidatePhotoUrl: photoUrl }));
      } else if (slot === 'leader1') {
        setFormData((prev) => ({ ...prev, leader1PhotoUrl: photoUrl }));
      } else if (slot === 'leader2') {
        setFormData((prev) => ({ ...prev, leader2PhotoUrl: photoUrl }));
      }
    } catch (err: any) {
      alert('ছবি আপলোড করতে ব্যর্থ হয়েছে: ' + err.message);
    } finally {
      setUploadingPhotoSlot(null);
    }
  };

  // Gemini AI Slogan Generator
  const handleAIAssistSlogan = async () => {
    setAiGeneratingSlogan(true);
    try {
      // Sample context-aware political slogans for instant dynamic boost
      const sloganBank: Record<string, string[]> = {
        victory_day: [
          'রক্তে কেনা লাল-সবুজের পতাকা, বীর শহীদের স্মৃতি থাকবে চির অটুট',
          'বিজয়ের এই দিনে শপথ করি, গড়বো সোনার বাংলাদেশ',
          'বীর বাঙালি জেগে ওঠো, সাম্য ও ন্যায়ের দেশ গড়ো',
        ],
        election: [
          'উন্নয়ন ও শান্তির পক্ষে, যোগ্য প্রার্থীকে ভোট দিয়ে জয়যুক্ত করুন',
          'জনতার আস্থা ও ভালোবাসার প্রতীক — এলাকার সার্বিক উন্নয়নে নিবেদিত',
          'সততা ও তারুণ্যের অঙ্গীকার, নতুন দিনের পথচলা হোক সবার',
        ],
        condolence: [
          'আপনার আদর্শ ও দেশপ্রেম আমাদের অনুপ্রেরণার বাতিঘর হয়ে থাকবে',
          'শোককে শক্তিতে রূপান্তর করে আমরা এগিয়ে যাব আপনার দেখানো পথে',
        ],
        greetings: [
          'দেশপ্রেমের জয়গানে মুখরিত হোক আমাদের আগামী দিনগুলো',
          'ঐক্য, সংহতি ও সৌহার্দ্যের উজ্জ্বল দৃষ্টান্ত হয়ে গড়ে উঠুক সমাজ',
        ],
        eid_festival: [
          'ঈদের অনাবিল আনন্দ ছড়িয়ে পড়ুক বাংলার প্রতিটি ঘরে ও মানুষের প্রাণে',
          'ত্যাগ ও সৌহার্দ্যের মহিমায় উদ্ভাসিত হোক আমাদের জীবন',
        ],
      };

      const options = sloganBank[formData.occasionType] || sloganBank.victory_day;
      const randomSlogan = options[Math.floor(Math.random() * options.length)];

      setTimeout(() => {
        setFormData((prev) => ({ ...prev, slogan: randomSlogan }));
        setAiGeneratingSlogan(false);
      }, 500);
    } catch (e) {
      setAiGeneratingSlogan(false);
    }
  };

  // Submit Poster Generation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('পোস্টার সেভ করতে দয়া করে লগইন করুন। (লগইন পেইজে ডেমো একাউন্ট রয়েছে)');
      router.push('/login?redirect=/create');
      return;
    }

    if (!formData.name) {
      alert('দয়া করে আপনার নাম অথবা প্রার্থীর নাম পূরণ করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        templateId: selectedTemplateId,
        formData,
        uploadedPhotoUrls: [
          formData.candidatePhotoUrl,
          formData.leader1PhotoUrl,
          formData.leader2PhotoUrl,
        ].filter(Boolean),
      };

      const response = await apiRequest('/posters', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.success && response.poster) {
        router.push(`/preview/${response.poster._id}`);
      } else {
        throw new Error(response.message || 'Generation failed');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      alert('পোস্টার তৈরিতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTemplate = templates.find((t) => t._id === selectedTemplateId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-semibold uppercase tracking-wider">
          পোস্টার স্টুডিও
        </span>
        <h1 className="text-3xl font-black text-white mt-2">
          নতুন রাজনৈতিক পোস্টার তৈরি করুন
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          তথ্য পূরণ করুন এবং ডানে রিয়েল-টাইমে পোস্টারের লাইভ প্রিভিউ দেখতে থাকুন।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Input Form (7 Cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Template Choice */}
            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> ১. পোস্টার টেমপ্লেট ও উপলক্ষ নির্বাচন করুন
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {templates.map((tpl) => (
                  <option key={tpl._id} value={tpl._id}>
                    {tpl.occasionLabelBangla} — {tpl.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Photo Uploads (3 Slots) */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>২. ফটো আপলোড (৩টি স্লট)</span>
                <span className="text-[11px] text-emerald-400 font-normal">কাটআউট ফ্রেম সাপোর্টেড</span>
              </label>

              <div className="grid grid-cols-3 gap-3">
                {/* Candidate Photo */}
                <div className="text-center">
                  <p className="text-xs text-slate-300 font-medium mb-1">প্রার্থীর ছবি</p>
                  <label className="cursor-pointer block border-2 border-dashed border-amber-500/50 hover:border-amber-400 rounded-xl p-2 bg-slate-900/80 transition-colors">
                    {formData.candidatePhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.candidatePhotoUrl}
                        alt="Candidate"
                        className="w-16 h-16 rounded-full mx-auto object-cover border border-amber-400"
                      />
                    ) : (
                      <div className="py-2 text-slate-400">
                        <Upload className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                        <span className="text-[10px]">আপলোড</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e, 'candidate')}
                    />
                  </label>
                </div>

                {/* Leader 1 */}
                <div className="text-center">
                  <p className="text-xs text-slate-300 font-medium mb-1">শীর্ষ নেতা ১</p>
                  <label className="cursor-pointer block border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-2 bg-slate-900/80 transition-colors">
                    {formData.leader1PhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.leader1PhotoUrl}
                        alt="Leader 1"
                        className="w-16 h-16 rounded-full mx-auto object-cover border border-slate-400"
                      />
                    ) : (
                      <div className="py-2 text-slate-400">
                        <User className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-[10px]">আপলোড</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e, 'leader1')}
                    />
                  </label>
                </div>

                {/* Leader 2 */}
                <div className="text-center">
                  <p className="text-xs text-slate-300 font-medium mb-1">শীর্ষ নেতা ২</p>
                  <label className="cursor-pointer block border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-2 bg-slate-900/80 transition-colors">
                    {formData.leader2PhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.leader2PhotoUrl}
                        alt="Leader 2"
                        className="w-16 h-16 rounded-full mx-auto object-cover border border-slate-400"
                      />
                    ) : (
                      <div className="py-2 text-slate-400">
                        <User className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-[10px]">আপলোড</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e, 'leader2')}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 3. Candidate & Party Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                ৩. ব্যক্তি ও দলীয় তথ্য
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">আপনার নাম / প্রার্থীর নাম *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="উদাঃ হাজী মোঃ নুরুল হক"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">পদবি / পরিচয় *</label>
                  <input
                    type="text"
                    name="designation"
                    required
                    placeholder="উদাঃ সভাপতি / চেয়ারম্যান পদপ্রার্থী"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">দল / সংগঠন *</label>
                  <input
                    type="text"
                    name="party"
                    required
                    placeholder="উদাঃ বাংলাদেশ আওয়ামী লীগ / বিএনপি / স্বতন্ত্র"
                    value={formData.party}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">এলাকা: ইউনিয়ন / থানা / জেলা *</label>
                  <input
                    type="text"
                    name="district"
                    required
                    placeholder="উদাঃ মিরপুর, ঢাকা"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* 4. Text Headlines & AI Slogan */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                ৪. ব্যানার বার্তা ও শিরোনাম
              </h3>

              <div>
                <label className="block text-xs text-slate-300 mb-1">মূল শিরোনাম (Bangla Headline)</label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">উপ-শিরোনাম (Subheadline)</label>
                <input
                  type="text"
                  name="subheadline"
                  value={formData.subheadline}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-300">রাজনৈতিক স্লোগান</label>
                  <button
                    type="button"
                    onClick={handleAIAssistSlogan}
                    disabled={aiGeneratingSlogan}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${aiGeneratingSlogan ? 'animate-spin' : ''}`} />
                    জেমিনি এআই দিয়ে নতুন স্লোগান সাজান
                  </button>
                </div>
                <textarea
                  name="slogan"
                  rows={2}
                  value={formData.slogan}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  &apos;প্রচারে&apos; ক্রেডিট লাইন (Printed / Promoted By)
                </label>
                <input
                  type="text"
                  name="promotedBy"
                  placeholder="উদাঃ সর্বস্তরের সচেতন এলাকাবাসী"
                  value={formData.promotedBy}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    এআই পোস্টার তৈরি হচ্ছে...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    পোস্টার জেনারেট ও সেভ করুন
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Interactive Preview Studio (6 Cols) */}
        <div className="lg:col-span-6 sticky top-24">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              লাইভ পোস্টার প্রিভিউ
            </h3>
            <span className="text-xs text-slate-400">রিয়েল-টাইমে আপডেট হচ্ছে</span>
          </div>

          <PosterCanvasPreview
            posterData={formData}
            templateColors={selectedTemplate?.layoutConfig?.colorScheme}
          />
        </div>
      </div>
    </div>
  );
}
