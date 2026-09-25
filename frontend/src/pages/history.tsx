import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { FolderClock, ArrowRight, Download, Trash2, Eye, Sparkles, AlertCircle, Plus } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [posters, setPosters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/history');
      return;
    }

    if (user) {
      fetchUserPosters();
    }
  }, [user, authLoading]);

  const fetchUserPosters = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/posters/user/${user.id}`);
      setPosters(data.posters || []);
    } catch (err: any) {
      console.error('History fetch error:', err);
      setError('পোস্টার হিস্টোরি লোড করা যায়নি: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই পোস্টারটি মুছে ফেলতে চান?')) return;
    try {
      await apiRequest(`/posters/${id}`, { method: 'DELETE' });
      setPosters((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      alert('পোস্টার মুছতে সমস্যা হয়েছে: ' + err.message);
    }
  };

  if (authLoading || (isLoading && !posters.length)) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">আপনার সংরক্ষিত পোস্টার লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <FolderClock className="w-3.5 h-3.5" />
            ব্যবহারকারী হিস্টোরি
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">আমার তৈরি পোস্টারসমূহ</h1>
          <p className="text-sm text-slate-400 mt-1">আপনার সেভ করা পোস্টারগুলো দেখুন এবং যেকোনো সময় পুনরায় ডাউনলোড করুন।</p>
        </div>

        <Link
          href="/create"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> নতুন পোস্টার বানান
        </Link>
      </div>

      {error ? (
        <div className="p-8 text-center bg-slate-900 border border-red-900/50 rounded-2xl text-slate-300">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchUserPosters}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-white"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : posters.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">এখনও কোনো পোস্টার তৈরি করেননি</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            আমাদের রেডিমেড টেমপ্লেট ও জেমিনি এআই ব্যবহার করে খুব সহজেই আপনার প্রথম পোস্টার তৈরি করে ফেলুন।
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow"
          >
            পোস্টার বানানো শুরু করুন <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posters.map((poster) => (
            <div
              key={poster._id}
              className="glass-card glass-card-hover rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between"
            >
              {/* Poster Card Header */}
              <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-medium">
                    {poster.status === 'completed' ? 'সম্পূর্ণ' : poster.status}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(poster.createdAt).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <h3 className="font-bold text-base text-white line-clamp-1">
                  {poster.formData.headline || 'রাজনৈতিক পোস্টার'}
                </h3>
                <p className="text-xs text-amber-400 mt-0.5">
                  প্রার্থী: {poster.formData.name} ({poster.formData.designation})
                </p>
              </div>

              {/* Poster Body Details */}
              <div className="p-5 space-y-2 text-xs text-slate-400 flex-1">
                <p className="line-clamp-1">
                  <span className="text-slate-500">দল/সংগঠন:</span> {poster.formData.party}
                </p>
                <p className="line-clamp-1">
                  <span className="text-slate-500">এলাকা:</span> {poster.formData.district}
                </p>
                {poster.formData.slogan && (
                  <p className="line-clamp-2 italic text-slate-300 pt-1 border-t border-slate-800/50">
                    &ldquo;{poster.formData.slogan}&rdquo;
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(poster._id)}
                  title="মুছে ফেলুন"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/preview/${poster._id}`}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> দেখুন ও ডাউনলোড করুন
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
