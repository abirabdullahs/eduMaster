'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, X, GraduationCap } from 'lucide-react';

const STORAGE_KEY = 'edumaster_lecture_total_snap_v1';

type Snap = Record<string, number>;

function readSnap(): Snap {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Snap;
  } catch {
    return {};
  }
}

function writeSnap(s: Snap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

type DigestRow = {
  courseId: string;
  courseTitle: string;
  total: number;
  completed: number;
  remaining: number;
};

export default function StudentLectureDigestGate() {
  const { user, profile, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<DigestRow[]>([]);

  const runDigest = useCallback(async () => {
    if (!user?.id || profile?.role !== 'student') return;

    try {
      const supabase = createClient();

      const { data: enrollments, error: enrErr } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id)
        .eq('status', 'active');

      if (enrErr || !enrollments?.length) {
        setRows([]);
        return;
      }

      const courseIds = [...new Set(enrollments.map((e: any) => e.course_id).filter(Boolean))];
      if (!courseIds.length) return;

      const { data: coursesMeta } = await supabase.from('courses').select('id, title').in('id', courseIds);
      const titleMap = new Map((coursesMeta || []).map((c: any) => [c.id, c.title as string]));

      const { data: subjects } = await supabase
        .from('subjects')
        .select('course_id, chapters(lectures(id))')
        .in('course_id', courseIds);

      const lecturesByCourse = new Map<string, string[]>();
      for (const cid of courseIds) lecturesByCourse.set(cid, []);

      (subjects || []).forEach((sub: any) => {
        const cid = sub.course_id;
        const list = lecturesByCourse.get(cid) || [];
        (sub.chapters || []).forEach((ch: any) => {
          (ch.lectures || []).forEach((lec: any) => {
            if (lec?.id) list.push(lec.id);
          });
        });
        lecturesByCourse.set(cid, list);
      });

      const allLectureIds = [...new Set([...lecturesByCourse.values()].flat())];
      let completedSet = new Set<string>();
      if (allLectureIds.length) {
        const { data: prog } = await supabase
          .from('lecture_progress')
          .select('lecture_id')
          .eq('student_id', user.id)
          .in('lecture_id', allLectureIds);
        completedSet = new Set((prog || []).map((p: any) => p.lecture_id));
      }

      const snap = readSnap();
      const nextRows: DigestRow[] = [];

      for (const e of enrollments as any[]) {
        const cid = e.course_id;
        const title = titleMap.get(cid) || 'কোর্স';
        const ids = lecturesByCourse.get(cid) || [];
        const total = ids.length;
        if (total === 0) continue;
        const completed = ids.filter((id) => completedSet.has(id)).length;
        const remaining = total - completed;
        const prevTotal = snap[cid] ?? -1;
        if (remaining > 0 && total > prevTotal) {
          nextRows.push({ courseId: cid, courseTitle: title, total, completed, remaining });
        }
      }

      if (nextRows.length) {
        setRows(nextRows);
        setOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user?.id, profile?.role]);

  useEffect(() => {
    if (authLoading || !user || profile?.role !== 'student') return;
    runDigest();
  }, [authLoading, user, profile?.role, runDigest]);

  const dismiss = () => {
    const snap = readSnap();
    for (const r of rows) {
      snap[r.courseId] = r.total;
    }
    writeSnap(snap);
    setOpen(false);
    setRows([]);
  };

  if (authLoading || !user || profile?.role !== 'student') return null;
  if (!open || rows.length === 0) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-[200] backdrop-blur-sm" onClick={dismiss} />
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md bg-[#161b22] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-bengali"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400">
                <GraduationCap size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">পড়াশোনার আপডেট</h2>
                <p className="text-xs text-slate-500 mt-0.5">আপনার কোর্সে নতুন বা বাকি লেকচার আছে</p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[min(60vh,420px)] overflow-y-auto">
            {rows.map((r) => (
              <div
                key={r.courseId}
                className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-3"
              >
                <div className="flex items-start gap-2">
                  <BookOpen className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-bold text-white text-sm">{r.courseTitle}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      এই কোর্সে আরও{' '}
                      <span className="text-indigo-400 font-bold">{r.remaining}</span>টি লেকচার বাকি আছে
                      {r.total > r.remaining && (
                        <span className="text-slate-600"> ({r.completed}/{r.total} সম্পন্ন)</span>
                      )}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/student/courses/${r.courseId}`}
                  onClick={dismiss}
                  className="block w-full text-center py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
                >
                  কোর্সে যান
                </Link>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-900/30">
            <button
              type="button"
              onClick={dismiss}
              className="w-full py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors"
            >
              পরে দেখব
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
