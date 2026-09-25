import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiRequest } from '../../services/api';
import { PosterCanvasPreview } from '../../components/PosterCanvasPreview';
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, Share2, Sparkles, Layers } from 'lucide-react';

export default function PosterPreviewPage() {
  const router = useRouter();
  const { id } = router.query;

  const [poster, setPoster] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Editable fields for regeneration
  const [tweakForm, setTweakForm] = useState({
    headline: '',
    subheadline: '',
    name: '',
    designation: '',
    party: '',
    district: '',
    promotedBy: '',
    slogan: '',
    customBanglaFont: 'Tiro Bangla',
    customColorAccent: '#006A4E',
  });

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchPoster(id);
    }
  }, [id]);

  const fetchPoster = async (posterId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/posters/${posterId}`);
      if (data.poster) {
        setPoster(data.poster);
        setTweakForm({
          headline: data.poster.formData.headline || '',
          subheadline: data.poster.formData.subheadline || '',
          name: data.poster.formData.name || '',
          designation: data.poster.formData.designation || '',
          party: data.poster.formData.party || '',
          district: data.poster.formData.district || '',
          promotedBy: data.poster.formData.promotedBy || '',
          slogan: data.poster.formData.slogan || '',
          customBanglaFont: data.poster.formData.customBanglaFont || 'Tiro Bangla',
          customColorAccent: data.poster.formData.customColorAccent || '#006A4E',
        });
      }
    } catch (err: any) {
      console.error('Fetch poster error:', err);
      setError('পোস্টার লোড করা যায়নি: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!id) return;
    setIsRegenerating(true);
    try {
      const data = await apiRequest(`/posters/${id}/regenerate`, {
        method: 'POST',
        body: JSON.stringify({ formData: tweakForm }),
      });
      if (data.poster) {
        setPoster(data.poster);
        alert('পোস্টার সফলভাবে এআই দিয়ে রি-জেনারেট করা হয়েছে!');
      }
    } catch (err: any) {
      alert('রি-জেনারেট ব্যর্থ হয়েছে: ' + err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-slate-300 text-sm">পোস্টার তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error || !poster) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-slate-900 border border-red-900/60 rounded-2xl text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">সমস্যা দেখা দিয়েছে</h2>
        <p className="text-sm text-slate-400 mb-6">{error || 'পোস্টার পাওয়া যায়নি'}</p>
        <Link
          href="/create"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold text-white inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> নতুন পোস্টার বানান
        </Link>
      </div>
    );
  }

  const combinedPosterData = {
    ...poster.formData,
    ...tweakForm,
    candidatePhotoUrl: poster.formData.candidatePhotoUrl,
    leader1PhotoUrl: poster.formData.leader1PhotoUrl,
    leader2PhotoUrl: poster.formData.leader2PhotoUrl,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/history"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{poster.formData.headline || 'পোস্টার ফলাফল'}</h1>
              <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-700 font-medium">
                সম্পূর্ণ প্রস্তুত
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              প্রস্তুতকারক: {poster.formData.name} • রি-ট্রাই বাকি: {5 - (poster.retryCount || 0)} বার
            </p>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={copyShareLink}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          {copiedShareLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
          {copiedShareLink ? 'লিঙ্ক কপি হয়েছে!' : 'শেয়ার লিঙ্ক কপি করুন'}
        </button>
      </div>

      {/* Main Layout: Left Editor Tweaks, Right High-Res Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Quick Tweak & Regenerate Form (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> লেখা ও রঙ পরিবর্তন করুন (Tweak)
            </h3>
            <span className="text-[11px] text-slate-400">লাইভ আপডেট</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">মূল শিরোনাম (Headline)</label>
              <input
                type="text"
                value={tweakForm.headline}
                onChange={(e) => setTweakForm({ ...tweakForm, headline: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">উপ-শিরোনাম (Subheadline)</label>
              <input
                type="text"
                value={tweakForm.subheadline}
                onChange={(e) => setTweakForm({ ...tweakForm, subheadline: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">প্রার্থীর নাম</label>
                <input
                  type="text"
                  value={tweakForm.name}
                  onChange={(e) => setTweakForm({ ...tweakForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">পদবি</label>
                <input
                  type="text"
                  value={tweakForm.designation}
                  onChange={(e) => setTweakForm({ ...tweakForm, designation: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">দল / সংগঠন</label>
                <input
                  type="text"
                  value={tweakForm.party}
                  onChange={(e) => setTweakForm({ ...tweakForm, party: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">থানা / জেলা</label>
                <input
                  type="text"
                  value={tweakForm.district}
                  onChange={(e) => setTweakForm({ ...tweakForm, district: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">রাজনৈতিক স্লোগান</label>
              <textarea
                rows={2}
                value={tweakForm.slogan}
                onChange={(e) => setTweakForm({ ...tweakForm, slogan: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">&apos;প্রচারে&apos; ক্রেডিট লাইন</label>
              <input
                type="text"
                value={tweakForm.promotedBy}
                onChange={(e) => setTweakForm({ ...tweakForm, promotedBy: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            {/* AI Slogan suggestions generated from Gemini */}
            {poster.aiSuggestions?.sloganSuggestion && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
                <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1">
                  💡 জেমিনি এআই পরামর্শ
                </span>
                <p className="text-slate-300 text-xs italic">&ldquo;{poster.aiSuggestions.sloganSuggestion}&rdquo;</p>
                <button
                  type="button"
                  onClick={() => setTweakForm({ ...tweakForm, slogan: poster.aiSuggestions.sloganSuggestion })}
                  className="mt-2 text-[11px] text-amber-300 hover:text-white font-semibold underline"
                >
                  এই স্লোগানটি ব্যবহার করুন
                </button>
              </div>
            )}

            <button
              onClick={handleRegenerate}
              disabled={isRegenerating || (poster.retryCount || 0) >= 5}
              className="w-full py-2.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center justify-center gap-2 transition-all shadow disabled:opacity-50 mt-4"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              সার্ভার রি-জেনারেট করুন ({5 - (poster.retryCount || 0)} বার বাকি)
            </button>
          </div>
        </div>

        {/* RIGHT: Live High-Resolution Canvas Preview (7 Cols) */}
        <div className="lg:col-span-7">
          <PosterCanvasPreview
            posterData={combinedPosterData}
            serverGeneratedImageUrl={poster.generatedImageUrl}
            templateColors={poster.templateId?.layoutConfig?.colorScheme}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
            retryCount={poster.retryCount || 0}
          />
        </div>
      </div>
    </div>
  );
}
