'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { BookOpen, Loader2 } from 'lucide-react';

export default function LearnPage() {
  const [stats, setStats] = useState<{ ssc: number; hsc: number }>({ ssc: 0, hsc: 0 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: classes } = await supabase.from('free_classes').select('id, name');
      let ssc = 0, hsc = 0;
      for (const c of classes || []) {
        const { count } = await supabase.from('free_subjects').select('*', { count: 'exact', head: true }).eq('class_id', c.id);
        if (c.name === 'SSC') ssc = count ?? 0;
        else if (c.name === 'HSC') hsc = count ?? 0;
      }
      setStats({ ssc, hsc });
      setLoading(false);
    }
    load();
  }, [supabase]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">বিনামূল্যে শিখুন</h1>
          <p className="text-slate-400 text-lg">SSC এবং HSC সিলেবাস অনুযায়ী বিনামূল্যে কন্টেন্ট শিখুন</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/learn/SSC"
              className="group bg-[#161b22] border border-slate-800 rounded-3xl p-12 hover:border-indigo-500/50 transition-all"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30">
                <BookOpen size={40} className="text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">SSC</h2>
              <p className="text-slate-400 mb-4">Secondary School Certificate</p>
              <p className="text-indigo-400 font-bold">{stats.ssc} Subjects</p>
            </Link>
            <Link
              href="/learn/HSC"
              className="group bg-[#161b22] border border-slate-800 rounded-3xl p-12 hover:border-indigo-500/50 transition-all"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30">
                <BookOpen size={40} className="text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">HSC</h2>
              <p className="text-slate-400 mb-4">Higher Secondary Certificate</p>
              <p className="text-indigo-400 font-bold">{stats.hsc} Subjects</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
