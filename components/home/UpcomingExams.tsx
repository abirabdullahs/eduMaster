import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function UpcomingExams() {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data: exams } = await supabase
    .from('exams')
    .select('*')
    .eq('exam_type', 'public')
    .eq('status', 'published')
    .gt('start_time', now)
    .order('start_time', { ascending: true })
    .limit(4);

  return (
    <section className="py-24 bg-[#0a0f1e] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 space-y-16 relative z-10">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white font-hind-siliguri">
            আসন্ন <span className="text-purple-500">পাবলিক</span> পরীক্ষাসমূহ
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto font-poppins">
            Join our upcoming public exams to test your knowledge and compete with students nationwide.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {exams?.map((exam) => (
            <div key={exam.id} className="glass-card p-8 group hover:border-purple-500/50 transition-all duration-300 flex flex-col sm:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-110 transition-transform duration-500">
                <FileText size={32} />
              </div>
              
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <h3 className="text-xl font-bold text-white font-hind-siliguri group-hover:text-purple-400 transition-colors">
                  {exam.title}
                </h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-purple-500" />
                    <span>{formatDate(exam.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-purple-500" />
                    <span>{exam.duration_minutes} Minutes</span>
                  </div>
                </div>
              </div>

              <Link 
                href={`/exam/${exam.access_link}`}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 whitespace-nowrap"
              >
                পরীক্ষা দাও
              </Link>
            </div>
          ))}
          {!exams?.length && (
            <div className="col-span-full py-20 text-center glass-card border-dashed">
              <p className="text-slate-500">No upcoming public exams at the moment.</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link 
            href="/exams/public" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-medium transition-colors"
          >
            সব পরীক্ষা দেখুন
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
