import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { Palette, Sparkles, FolderClock, ShieldCheck, LogOut, LogIn, UserPlus } from 'lucide-react';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();

  const isActive = (path: string) => router.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0B1320]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center border-2 border-amber-400 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-4 h-4 rounded-full bg-red-600"></div>
              <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                AI পোস্টার মেকার
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-normal">
                  বাংলাদেশ
                </span>
              </span>
              <p className="text-xs text-slate-400 font-sans hidden sm:block">মুদ্রণ-উপযোগী রাজনৈতিক পোস্টার জেনারেটর</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/') ? 'bg-emerald-800/60 text-emerald-200 border border-emerald-600/50' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Palette className="w-4 h-4" />
              টেমপ্লেট গ্যালারি
            </Link>

            <Link
              href="/create"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/create') ? 'bg-emerald-800/60 text-emerald-200 border border-emerald-600/50' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              পোস্টার বানান
            </Link>

            {user && (
              <Link
                href="/history"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/history') ? 'bg-emerald-800/60 text-emerald-200 border border-emerald-600/50' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <FolderClock className="w-4 h-4" />
                আমার পোস্টার
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/admin') ? 'bg-amber-900/40 text-amber-300 border border-amber-600/50' : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                অ্যাডমিন প্যানেল
              </Link>
            )}
          </nav>

          {/* User Auth Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
                  <p className="text-xs text-amber-400/90 capitalize">{user.role === 'admin' ? 'অ্যাডমিনিস্ট্রেটর' : 'কর্মী/ব্যবহারকারী'}</p>
                </div>
                <button
                  onClick={logout}
                  title="লগআউট"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-400 transition-colors border border-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  লগইন
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow transition-colors flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  নিবন্ধন
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
