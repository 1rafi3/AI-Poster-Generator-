import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { apiRequest, uploadPhotoApi } from '../services/api';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Users,
  Eye,
  FileText,
  HelpCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface ParsedCandidate {
  id: string;
  name: string;
  designation: string;
  party: string;
  district: string;
  slogan?: string;
  headline?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  posterId?: string;
  error?: string;
}

export default function BulkGeneratorPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [candidates, setCandidates] = useState<ParsedCandidate[]>([]);
  const [commonLeader1Url, setCommonLeader1Url] = useState<string>('');
  const [commonLeader2Url, setCommonLeader2Url] = useState<string>('');
  const [photoLayout, setPhotoLayout] = useState<'3-up' | '2-up' | 'solo'>('3-up');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressCount, setProgressCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const data = await apiRequest('/templates');
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
          setSelectedTemplateId(data.templates[0]._id);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      }
    }
    loadTemplates();
  }, []);

  // Download Sample CSV template
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'Name,Designation,Party,District,Slogan,Headline\n' +
      'মো: রফিকুল ইসলাম,সহ-সভাপতি,বাংলাদেশ জাতীয়তাবাদী দল,ঢাকা উত্তর,গণতন্ত্র মুক্তি পাক ও সমৃদ্ধির প্রত্যয়,আসন্ন নির্বাচনে দোয়া প্রার্থী\n' +
      'আব্দুল করিম চৌধুরী,সাধারণ সম্পাদক,বাংলাদেশ আওয়ামী লীগ,চট্টগ্রাম মহানগর,উন্নয়ন ও শান্তির অগ্রযাত্রায় আমরা আছি সাথে,মহান বিজয় দিবস সফল হোক\n' +
      'মাহমুদুল হাসান,প্রচার সম্পাদক,জাতীয় নাগরিক কমিটি,কুমিল্লা সদর,তারুণ্যের নতুন বাংলাদেশ গড়ার অঙ্গীকার,তারুণ্যের একতা ও সংহতি\n' +
      'মোসা: নাজনীন আক্তার,যুগ্ম সাধারণ সম্পাদক,স্বতন্ত্র প্রার্থীর পক্ষে,সিলেট সদর,ন্যায্য অধিকার ও সততার প্রতীক,আসন্ন নির্বাচনে আপনার ভোট চাই\n';

    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_political_poster_candidates.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV file upload & parsing
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length <= 1) {
        alert('CSV ফাইলে পর্যাপ্ত ডেটা পাওয়া যায়নি।');
        return;
      }

      // Skip header line
      const parsed: ParsedCandidate[] = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        // Split by comma preserving values
        const cols = row.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
        if (cols[0]) {
          parsed.push({
            id: `cand-${Date.now()}-${i}`,
            name: cols[0] || 'নামহীন',
            designation: cols[1] || 'কর্মী',
            party: cols[2] || 'সাধারণ জনতা',
            district: cols[3] || 'বাংলাদেশ',
            slogan: cols[4] || '',
            headline: cols[5] || 'শুভ নববর্ষ ও শুভেচ্ছা',
            status: 'pending',
          });
        }
      }

      setCandidates(parsed);
      setStatusMessage(`সফলভাবে ${parsed.length} জন প্রার্থীর তথ্য CSV থেকে লোড হয়েছে!`);
    };

    reader.readAsText(file);
  };

  // Upload common leader photos
  const handleCommonPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadPhotoApi(file);
      if (slot === 1) setCommonLeader1Url(url);
      else setCommonLeader2Url(url);
    } catch (err: any) {
      // Local preview fallback
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (slot === 1) setCommonLeader1Url(dataUrl);
        else setCommonLeader2Url(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Batch Poster Generator
  const handleRunBatchGeneration = async () => {
    if (!user) {
      router.push('/login?redirect=/bulk');
      return;
    }

    if (candidates.length === 0) {
      alert('অনুগ্রহ করে প্রথমে একটি CSV ফাইল আপলোড করুন।');
      return;
    }

    if (!selectedTemplateId) {
      alert('অনুগ্রহ করে একটি টেমপ্লেট নির্বাচন করুন।');
      return;
    }

    setIsProcessing(true);
    setProgressCount(0);
    setStatusMessage('ব্যাচ পোস্টার জেনারেশন শুরু হচ্ছে...');

    const chosenTemplate = templates.find((t) => t._id === selectedTemplateId);
    let done = 0;

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];

      // Update item status to generating
      setCandidates((prev) =>
        prev.map((c, idx) => (idx === i ? { ...c, status: 'generating' } : c))
      );

      try {
        const payload = {
          templateId: selectedTemplateId,
          formData: {
            name: candidate.name,
            designation: candidate.designation,
            party: candidate.party,
            district: candidate.district,
            occasionType: chosenTemplate?.occasionType || 'victory_day',
            headline: candidate.headline || 'মহান বিজয় দিবস সফল হোক',
            subheadline: `${candidate.party} ও সহযোগী অঙ্গসংগঠনের পক্ষে`,
            promotedBy: `${candidate.name}-এর সমর্থক ও সচেতন এলাকাবাসী`,
            slogan: candidate.slogan || 'ঐক্য, সততা ও উন্নয়নের প্রতীক',
            leader1PhotoUrl: commonLeader1Url,
            leader2PhotoUrl: commonLeader2Url,
            photoLayout,
          },
          uploadedPhotoUrls: [commonLeader1Url, commonLeader2Url].filter(Boolean),
        };

        const res = await apiRequest('/posters', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        if (res.success && res.poster) {
          setCandidates((prev) =>
            prev.map((c, idx) =>
              idx === i
                ? { ...c, status: 'completed', posterId: res.poster._id }
                : c
            )
          );
        } else {
          throw new Error(res.message || 'Server error');
        }
      } catch (err: any) {
        console.error(`Error generating poster for ${candidate.name}:`, err);
        setCandidates((prev) =>
          prev.map((c, idx) =>
            idx === i ? { ...c, status: 'failed', error: err.message } : c
          )
        );
      }

      done += 1;
      setProgressCount(done);
      // Breathing pause between requests to ensure seamless disk writing & database stability
      await new Promise((r) => setTimeout(r, 650));
    }

    setIsProcessing(false);
    setStatusMessage(`🎉 ব্যাচ সম্পন্ন! মোট ${done}টি পোস্টার সফলভাবে প্রক্রিয়া করা হয়েছে।`);
  };

  const handleRetryCandidate = async (candidateId: string) => {
    const candidateIdx = candidates.findIndex((c) => c.id === candidateId);
    if (candidateIdx === -1) return;

    const candidate = candidates[candidateIdx];
    const chosenTemplate = templates.find((t) => t._id === selectedTemplateId);

    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: 'generating', error: undefined } : c))
    );

    try {
      const payload = {
        templateId: selectedTemplateId,
        formData: {
          name: candidate.name,
          designation: candidate.designation,
          party: candidate.party,
          district: candidate.district,
          occasionType: chosenTemplate?.occasionType || 'victory_day',
          headline: candidate.headline || 'মহান বিজয় দিবস সফল হোক',
          subheadline: `${candidate.party} ও সহযোগী অঙ্গসংগঠনের পক্ষে`,
          promotedBy: `${candidate.name}-এর সমর্থক ও সচেতন এলাকাবাসী`,
          slogan: candidate.slogan || 'ঐক্য, সততা ও উন্নয়নের প্রতীক',
          leader1PhotoUrl: commonLeader1Url,
          leader2PhotoUrl: commonLeader2Url,
          photoLayout,
        },
        uploadedPhotoUrls: [commonLeader1Url, commonLeader2Url].filter(Boolean),
      };

      const res = await apiRequest('/posters', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success && res.poster) {
        setCandidates((prev) =>
          prev.map((c) => (c.id === candidateId ? { ...c, status: 'completed', posterId: res.poster._id } : c))
        );
      } else {
        throw new Error(res.message || 'Retry failed');
      }
    } catch (err: any) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, status: 'failed', error: err.message } : c))
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>কমিটি ও গণসংযোগ সংস্করণ (Bulk Generation)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              বাল্ক রাজনৈতিক পোস্টার মেকার (CSV Batch)
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              এক ক্লিকে সকল ইউনিয়ন, থানা বা ওয়ার্ড পর্যায়ের নেতাকর্মীদের নামের পোস্টার স্বয়ংক্রিয়ভাবে তৈরি করুন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSampleCsv}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center gap-2 transition-all shadow"
            >
              <Download className="w-4 h-4" />
              নমুনা CSV ডাউনলোড করুন
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Configuration (1 Col) */}
        <div className="space-y-6">
          {/* 1. Base Template Selection */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <span>১. মূল পোস্টার টেমপ্লেট</span>
            </h2>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              {templates.map((tpl) => (
                <option key={tpl._id} value={tpl._id}>
                  {tpl.title} ({tpl.occasionLabelBangla || tpl.occasionType})
                </option>
              ))}
            </select>

            {/* Layout Mode Selector */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">ফটো গ্রিড লেআউট:</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhotoLayout('3-up')}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                    photoLayout === '3-up' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ৩-আপ গ্রিড
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoLayout('2-up')}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                    photoLayout === '2-up' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ২-আপ গ্রিড
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoLayout('solo')}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                    photoLayout === 'solo' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  সোলো প্রার্থী
                </button>
              </div>
            </div>
          </div>

          {/* 2. Common Top Leader Photos (Optional) */}
          {photoLayout !== 'solo' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                ২. শীর্ষ নেতৃবৃন্দের ছবি (সকলের জন্য অভিন্ন)
              </h2>
              <p className="text-xs text-slate-400">
                এই ছবিটি ব্যাচের সকল প্রার্থীর পোস্টারে স্বয়ংক্রিয়ভাবে শীর্ষে বসে যাবে।
              </p>

              <div className={`grid gap-3 ${photoLayout === '2-up' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {/* Leader 1 */}
                <div className="text-center">
                  <span className="text-[11px] text-slate-300 block mb-1">
                    {photoLayout === '2-up' ? 'শীর্ষ নেতা' : 'শীর্ষ নেতা ১'}
                  </span>
                  <label className="cursor-pointer block border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-2 bg-slate-950 transition-colors">
                    {commonLeader1Url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={commonLeader1Url} alt="L1" className="w-14 h-14 rounded-full mx-auto object-cover border border-amber-400" />
                    ) : (
                      <div className="py-2 text-slate-400">
                        <Upload className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                        <span className="text-[10px]">আপলোড</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCommonPhotoUpload(e, 1)} />
                  </label>
                </div>

                {/* Leader 2 */}
                {photoLayout === '3-up' && (
                  <div className="text-center">
                    <span className="text-[11px] text-slate-300 block mb-1">শীর্ষ নেতা ২</span>
                    <label className="cursor-pointer block border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-2 bg-slate-950 transition-colors">
                      {commonLeader2Url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={commonLeader2Url} alt="L2" className="w-14 h-14 rounded-full mx-auto object-cover border border-amber-400" />
                      ) : (
                        <div className="py-2 text-slate-400">
                          <Upload className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                          <span className="text-[10px]">আপলোড</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCommonPhotoUpload(e, 2)} />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. CSV File Upload Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              ৩. CSV ফাইল আপলোড
            </h2>
            <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-xl p-6 bg-slate-950/60 transition-colors">
              <FileSpreadsheet className="w-8 h-8 text-emerald-400 mb-2" />
              <span className="text-xs font-semibold text-slate-200">CSV ফাইল নির্বাচন করুন</span>
              <span className="text-[10px] text-slate-400 mt-1">.csv ফরম্যাট ড্রপ করুন</span>
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvFileUpload} />
            </label>
          </div>
        </div>

        {/* RIGHT COLUMN: Candidate List & Batch Execution (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  প্রার্থী তালিকা ({candidates.length} জন)
                </h3>
                <p className="text-xs text-slate-400">CSV থেকে প্রস্তুতকৃত প্রার্থীর বিবরণ</p>
              </div>

              {candidates.length > 0 && (
                <button
                  onClick={handleRunBatchGeneration}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      তৈরি হচ্ছে ({progressCount}/{candidates.length})...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      এক ক্লিকে সকল পোস্টার তৈরি করুন
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {candidates.length > 0 && (isProcessing || progressCount > 0) && (
              <div className="mt-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-2 font-medium">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                        পোস্টার ব্যাচ প্রক্রিয়াধীন...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ব্যাচ প্রসেসিং সমাপ্ত
                      </>
                    )}
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {Math.round((progressCount / candidates.length) * 100)}% ({progressCount}/{candidates.length})
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((progressCount / candidates.length) * 100))}%` }}
                  />
                </div>
              </div>
            )}

            {statusMessage && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {statusMessage}
              </div>
            )}

            {/* Candidates Table */}
            <div className="mt-4 overflow-x-auto">
              {candidates.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <FileSpreadsheet className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
                  <p className="text-sm font-medium">এখনো কোনো CSV ফাইল আপলোড করা হয়নি</p>
                  <p className="text-xs">বামে "নমুনা CSV ডাউনলোড করুন" থেকে ফাইল নিয়ে নেতাকর্মীদের নাম বসিয়ে আপলোড করুন।</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">প্রার্থীর নাম</th>
                      <th className="py-2.5 px-3">পদবি</th>
                      <th className="py-2.5 px-3">দল ও এলাকা</th>
                      <th className="py-2.5 px-3">স্ট্যাটাস</th>
                      <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {candidates.map((cand, idx) => (
                      <tr key={cand.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-bold text-slate-200">{cand.name}</td>
                        <td className="py-3 px-3 text-slate-300">{cand.designation}</td>
                        <td className="py-3 px-3 text-slate-400">
                          {cand.party} • {cand.district}
                        </td>
                        <td className="py-3 px-3">
                          {cand.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3" /> তৈরি সম্পন্ন
                            </span>
                          )}
                          {cand.status === 'generating' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                              <RefreshCw className="w-3 h-3 animate-spin" /> প্রক্রিয়াধীন...
                            </span>
                          )}
                          {cand.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                              অপেক্ষমাণ
                            </span>
                          )}
                          {cand.status === 'failed' && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/40"
                              title={cand.error || 'পোস্টার তৈরি ব্যর্থ'}
                            >
                              <AlertCircle className="w-3 h-3" /> ব্যর্থ
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {cand.posterId ? (
                            <Link
                              href={`/preview/${cand.posterId}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-colors"
                            >
                              <Eye className="w-3 h-3" /> প্রিভিউ
                            </Link>
                          ) : cand.status === 'failed' ? (
                            <button
                              type="button"
                              onClick={() => handleRetryCandidate(cand.id)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 transition-colors disabled:opacity-50"
                            >
                              <RotateCcw className="w-3 h-3" /> পুনরায় চেষ্টা
                            </button>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
