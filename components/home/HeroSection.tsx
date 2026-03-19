import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0a0f1e] pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center relative z-10">
        {/* Left Content - Top on mobile, Left on desktop */}
        <div className="space-y-8 text-center lg:text-left order-1 lg:w-1/2">
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

        {/* Hero Image: Below on mobile, Right on desktop */}
        <div className="relative w-full lg:w-1/2 flex justify-center order-2 shrink-0">
          <div className="relative w-full max-w-md lg:max-w-lg aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/10">
            <Image
              src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80"
              alt="শিক্ষার্থী পড়াশোনা করছেন - EduMaster"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 500px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/60 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
