import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { ShieldCheck, Users, FileText, Palette, Sparkles, Check, AlertTriangle, Eye, RefreshCw, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'moderation' | 'templates'>('moderation');
  const [stats, setStats] = useState<any>({ totalUsers: 0, totalPosters: 0, totalTemplates: 0, totalLogs: 0 });
  const [posters, setPosters] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin');
        return;
      }
      if (!isAdmin) {
        alert('অ্যাডমিন অ্যাক্সেস প্রয়োজন। আপনি সাধারণ ব্যবহারকারী হিসেবে লগইন করেছেন।');
        router.push('/');
        return;
      }
      loadAdminData();
    }
  }, [user, isAdmin, authLoading]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // Load posters & analytics stats
      const postersData = await apiRequest('/admin/posters');
      if (postersData.success) {
        setPosters(postersData.posters || []);
        setStats(postersData.stats || {});
      }

      // Load all templates
      const templatesData = await apiRequest('/templates');
      if (templatesData.success) {
        setTemplates(templatesData.templates || []);
      }
    } catch (err: any) {
      console.error('Admin data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerate = async (posterId: string, status: 'approved' | 'flagged') => {
    setActionLoadingId(posterId);
    try {
      const notes = status === 'flagged' ? 'কনটেন্ট বা প্রতীকে নীতিমালা লঙ্ঘন দেখা গেছে' : 'যাচাইকৃত ও অনুমোদিত';
      const data = await apiRequest(`/admin/posters/${posterId}/moderate`, {
        method: 'PATCH',
        body: JSON.stringify({ moderationStatus: status, moderationNotes: notes }),
      });

      if (data.success) {
        setPosters((prev) =>
          prev.map((p) => (p._id === posterId ? { ...p, moderationStatus: status, moderationNotes: notes } : p))
        );
      }
    } catch (err: any) {
      alert('মডারেশন আপডেট ব্যর্থ হয়েছে: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleTemplate = async (templateId: string, currentActive: boolean) => {
    try {
      const data = await apiRequest(`/admin/templates/${templateId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !currentActive }),
      });

      if (data.success) {
        setTemplates((prev) =>
          prev.map((t) => (t._id === templateId ? { ...t, isActive: !currentActive } : t))
        );
      }
    } catch (err: any) {
      alert('টেমপ্লেট আপডেট ব্যর্থ হয়েছে: ' + err.message);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-slate-400 text-sm">অ্যাডমিন ড্যাশবোর্ড লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          সুপার অ্যাডমিন কন্ট্রোল প্যানেল
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          কন্টেন্ট মডারেশন ও সিস্টেম ম্যানেজমেন্ট
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          রাজনৈতিক প্রতীক, অননুমোদিত ব্যানার মডারেশন এবং টেমপ্লেট নিয়ন্ত্রণ করুন।
        </p>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>মোট ব্যবহারকারী</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalUsers || 0}</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>জেনারেটেড পোস্টার</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalPosters || 0}</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>সক্রিয় টেমপ্লেট</span>
            <Palette className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalTemplates || 0}</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>এআই কল / রিকোয়েস্ট</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalLogs || 0}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'moderation'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          পোস্টার মডারেশন কিউ ({posters.length})
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'templates'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          টেমপ্লেট ম্যানেজমেন্ট ({templates.length})
        </button>
      </div>

      {/* TAB 1: MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          {posters.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-slate-400 text-sm">কোনো পোস্টার পর্যালোচনার জন্য নেই।</p>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">তারিখ</th>
                      <th className="p-3.5">ব্যবহারকারী</th>
                      <th className="p-3.5">শিরোনাম ও প্রার্থী</th>
                      <th className="p-3.5">দল ও এলাকা</th>
                      <th className="p-3.5">অবস্থা</th>
                      <th className="p-3.5 text-right">মডারেশন অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {posters.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 whitespace-nowrap text-slate-400">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-white">{p.userId?.name || 'অজ্ঞাত'}</p>
                          <p className="text-[11px] text-slate-400">{p.userId?.emailOrPhone}</p>
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-emerald-300">{p.formData.headline}</p>
                          <p className="text-slate-300">
                            {p.formData.name} ({p.formData.designation})
                          </p>
                        </td>
                        <td className="p-3.5">
                          <span className="font-medium text-amber-300">{p.formData.party}</span>
                          <p className="text-slate-400 text-[11px]">{p.formData.district}</p>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              p.moderationStatus === 'flagged'
                                ? 'bg-red-950 text-red-300 border-red-700'
                                : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            }`}
                          >
                            {p.moderationStatus === 'flagged' ? 'AI ফ্ল্যাগড' : 'অনুমোদিত'}
                          </span>
                          {p.moderationNotes && (
                            <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] truncate" title={p.moderationNotes}>
                              {p.moderationNotes}
                            </p>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                          <Link
                            href={`/preview/${p._id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5" /> দেখুন
                          </Link>

                          {p.moderationStatus !== 'approved' && (
                            <button
                              onClick={() => handleModerate(p._id, 'approved')}
                              disabled={actionLoadingId === p._id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-semibold"
                            >
                              <Check className="w-3.5 h-3.5" /> অনুমোদন
                            </button>
                          )}

                          {p.moderationStatus !== 'flagged' && (
                            <button
                              onClick={() => handleModerate(p._id, 'flagged')}
                              disabled={actionLoadingId === p._id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-900 hover:bg-red-800 text-red-200 font-semibold"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" /> ফ্ল্যাগ
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEMPLATE MANAGEMENT */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div key={tpl._id} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 font-medium">
                  {tpl.occasionLabelBangla}
                </span>
                <button
                  onClick={() => handleToggleTemplate(tpl._id, tpl.isActive)}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white"
                >
                  {tpl.isActive ? (
                    <>
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">সক্রিয়</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-slate-500" />
                      <span className="text-slate-500">নিষ্ক্রিয়</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="font-bold text-white text-base">{tpl.title}</h3>
              <p className="text-xs text-slate-400">ক্যাটাগরি: {tpl.occasionType}</p>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>৩টি ফটো স্লট কনফিগারেশন</span>
                <Link href={`/create?templateId=${tpl._id}`} className="text-emerald-400 hover:underline">
                  টেস্ট প্রিভিউ
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
