import Link from 'next/link';
import { GraduationCap, BookOpen, Trophy, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0a0f1e] pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left Content */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">Admission Open for 2026</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight font-hind-siliguri">
              স্বপ্ন ছোঁয়ার পথে <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">সেরা প্রস্তুতি</span> শুরু হোক আজই
            </h1>
            <p className="text-lg md:text-xl text-slate-400 font-poppins max-w-xl mx-auto lg:mx-0">
              The most advanced learning platform for SSC and HSC students in Bangladesh. Learn from top educators and excel in your exams.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link 
              href="/courses" 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              কোর্স দেখুন
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/exams/public" 
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 backdrop-blur-sm transition-all flex items-center justify-center gap-2"
            >
              ফ্রি পরীক্ষা দাও
            </Link>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0a0f1e] bg-slate-800 overflow-hidden">
                  <img src={`https://picsum.photos/seed/student${i}/100/100`} alt="Student" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-[#0a0f1e] bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                +500
              </div>
            </div>
            <p className="text-sm text-slate-500">
              <span className="text-white font-bold">৫০০+</span> শিক্ষার্থী আমাদের সাথে শিখছে
            </p>
          </div>
        </div>

        {/* Right Floating Cards */}
        <div className="relative hidden lg:block">
          <div className="relative w-full aspect-square">
            {/* Main Image or Illustration Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-3xl border border-white/5 backdrop-blur-sm flex items-center justify-center">
               <div className="w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
               <GraduationCap size={120} className="text-indigo-500/30" />
            </div>

            {/* Floating Card 1 */}
            <div className="absolute -top-4 -right-4 glass-card p-6 w-56 animate-float">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Courses</p>
                  <p className="text-lg font-bold text-white">১০+</p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-indigo-500" />
              </div>
            </div>

            {/* Floating Card 2 */}
            <div className="absolute bottom-12 -left-8 glass-card p-6 w-56 animate-float-delayed">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Success Rate</p>
                  <p className="text-lg font-bold text-white">৯৮%</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-2 h-2 bg-emerald-500 rounded-full" />
                ))}
              </div>
            </div>

            {/* Floating Card 3 */}
            <div className="absolute top-1/2 -right-12 glass-card p-4 flex items-center gap-3 animate-float-delayed">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                <span className="text-xs font-bold">LIVE</span>
              </div>
              <p className="text-xs font-medium text-white">Physics Class Started</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
