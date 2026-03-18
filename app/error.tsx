'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#161b22] border border-slate-800 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <AlertCircle size={48} />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-white">Something went wrong</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            We encountered an unexpected error. Our team has been notified and we are working to fix it.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20"
          >
            <RotateCcw size={20} />
            Try again
          </button>
          <Link
            href="/"
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all flex items-center justify-center gap-3"
          >
            <Home size={20} />
            Back to Home
          </Link>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">
            Error ID: {error.digest || 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
}
