import Link from 'next/link';
import { BookOpen, Play, ArrowRight } from 'lucide-react';

export default function FreeLearningSection() {
  return (
    <section className="py-20 bg-[#0a0f1e] relative">
      <div className="max-w-7xl mx-auto px-6">
        <Link
          href="/learn"
          className="group block relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-indigo-600/20 border border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,_rgb(99_102_241),_transparent_50%)]" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] group-hover:bg-indigo-500/30 transition-colors" />

          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
              <BookOpen size={40} className="text-indigo-400 md:w-12 md:h-12" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-4">
              <h2 className="text-2xl md:text-4xl font-bold text-white font-hind-siliguri">
                ইন্টারেক্টিভ <span className="text-indigo-400">ফ্রি লার্নিং</span>
              </h2>
              <p className="text-slate-400 max-w-xl font-poppins">
                MCQ, ভিডিও, ফ্ল্যাশকার্ড সহ SSC ও HSC সিলেবাস অনুযায়ী বিনামূল্যে ইন্টারেক্টিভ কন্টেন্ট শিখুন
              </p>
              <span className="inline-flex items-center gap-2 text-indigo-400 font-bold group-hover:gap-3 transition-all">
                এখনই শুরু করুন
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <div className="hidden md:flex w-16 h-16 rounded-2xl bg-indigo-500/10 items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
              <Play size={32} className="text-indigo-400" fill="currentColor" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
