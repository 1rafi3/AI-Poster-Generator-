import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(emailOrPhone, password);
      const redirect = (router.query.redirect as string) || '/';
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || 'লগইন ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setEmailOrPhone('admin@poster.bd');
      setPassword('admin123');
    } else {
      setEmailOrPhone('user@poster.bd');
      setPassword('user123');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-700 mx-auto flex items-center justify-center border-2 border-amber-400">
            <LogIn className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">অ্যাকাউন্টে লগইন করুন</h1>
          <p className="text-xs text-slate-400">পোস্টার জেনারেট ও সেভ করতে আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>

        {/* Quick Demo Login Auto-fill Pill */}
        <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
          <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> টেস্ট করার জন্য ডেমো অ্যাকাউন্ট:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount('user')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-left transition-colors"
            >
              👤 সাধারণ কর্মী (User)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="py-1.5 px-2 bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 rounded-lg border border-amber-600/40 text-left transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> সুপার অ্যাডমিন
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">ইমেইল অথবা ফোন নম্বর</label>
            <input
              type="text"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="user@poster.bd বা 01700000000"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">পাসওয়ার্ড</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          নতুন অ্যাকাউন্ট তৈরি করতে চান?{' '}
          <Link href="/register" className="text-emerald-400 font-bold hover:underline">
            এখানে নিবন্ধন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
