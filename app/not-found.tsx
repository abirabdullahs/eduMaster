import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="relative">
          <h1 className="text-[12rem] font-black text-white/5 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 bg-indigo-500/20 blur-[100px] rounded-full" />
            <div className="w-32 h-32 bg-purple-600/20 blur-[80px] rounded-full -ml-12" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 rotate-12">
              <Search size={40} className="text-white" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">Page Not Found</h2>
          </div>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <p className="text-slate-400 text-lg leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/30 group"
          >
            <Home size={20} className="group-hover:scale-110 transition-transform" />
            Back to Home
          </Link>
          <BackButton />
        </div>

        <div className="pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Courses</p>
            <Link href="/courses" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Browse Catalog</Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Exams</p>
            <Link href="/exams/public" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Public Exams</Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Support</p>
            <Link href="/" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
