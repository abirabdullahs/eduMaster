'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { BookOpen, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LearnClassPage() {
  const params = useParams();
  const classParam = (params.class as string)?.toUpperCase() || 'SSC';
  const [classId, setClassId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from('free_classes').select('id').eq('name', classParam).single();
      setClassId(c?.id ?? null);
      if (c?.id) {
        const { data: subj } = await supabase
          .from('free_subjects')
          .select('*')
          .eq('class_id', c.id)
          .order('order_index');
        setSubjects(subj || []);
      }
      setLoading(false);
    }
    load();
  }, [classParam, supabase]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/learn" className="text-slate-400 hover:text-white text-sm mb-6 inline-block">
          ← Back to Learn
        </Link>
        <h1 className="text-3xl font-bold text-white mb-8">{classParam} Subjects</h1>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {subjects.map((s) => (
              <Link
                key={s.id}
                href={`/learn/${classParam}/${s.id}`}
                className="flex items-center gap-4 p-6 bg-[#161b22] border border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-all"
              >
                {s.thumbnail_url ? (
                  <img src={s.thumbnail_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center">
                    <BookOpen size={24} className="text-slate-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white">{s.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{s.description || 'No description'}</p>
                </div>
                <ChevronRight size={20} className="text-slate-500" />
              </Link>
            ))}
            {subjects.length === 0 && (
              <p className="text-slate-500 col-span-2 py-12 text-center">No subjects yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
