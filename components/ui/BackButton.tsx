'use client';

import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="w-full sm:w-auto px-10 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 border border-slate-700/50 group"
    >
      <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      Go Back
    </button>
  );
}
