import { GraduationCap, Code2, Cpu, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function FounderSection() {
  return (
    <section className="py-24 bg-[#0a0f1e] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white font-hind-siliguri mb-4">
            Founder & <span className="text-indigo-500">CEO</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">Meet the visionary behind EduMaster</p>
        </div>

        <div className="glass-card p-8 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          <div className="shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-4xl md:text-5xl font-bold shadow-2xl shadow-indigo-500/20">
              AA
            </div>
          </div>
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white font-hind-siliguri">Abir Abdullah</h3>
              <p className="text-indigo-400 font-medium mt-1">Computer Science & Engineering (CSE), BUET</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-xl text-sm font-bold">
                <BookOpen size={16} /> Chemistry, Math & ICT Instructor
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 rounded-xl text-sm font-bold">
                <Code2 size={16} /> Competitive Programmer
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-bold">
                <GraduationCap size={16} /> Web Developer
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-xl text-sm font-bold">
                <Cpu size={16} /> AI/ML Enthusiast
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Passionate about democratizing quality education for SSC and HSC students in Bangladesh.
            </p>
            <Link 
              href="https://abirabdullah.me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
            >
              Visit abirabdullah.me
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
