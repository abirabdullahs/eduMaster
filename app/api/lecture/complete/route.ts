import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface McqAnswer {
  question_id: string;
  selected_option: 'a' | 'b' | 'c' | 'd';
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { lecture_id, mcq_answers } = body as { lecture_id: string; mcq_answers: McqAnswer[] };

    if (!lecture_id) {
      return NextResponse.json({ error: 'lecture_id required' }, { status: 400 });
    }

    const { data: questions, error: qErr } = await supabase
      .from('questions')
      .select('id, correct_answer, correct_option')
      .eq('lecture_id', lecture_id)
      .order('order_index', { ascending: true });

    if (qErr || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'No MCQs found for this lecture' },
        { status: 400 }
      );
    }

    const total = questions.length;
    const answersMap = new Map(
      (mcq_answers || []).map((a) => [a.question_id, a.selected_option])
    );

    let correct = 0;
    for (const q of questions) {
      const sel = answersMap.get(q.id)?.toLowerCase();
      const corr = (q as { correct_answer?: string }).correct_answer
        ?? (q as { correct_option?: string }).correct_option
        ?? 'a';
      const correctVal = String(corr).toLowerCase()[0];
      if (sel === correctVal) correct++;
    }

    const passed = total > 0 && correct / total >= 0.8;
    const studentId = user.id;

    const progressPayload = {
      student_id: studentId,
      lecture_id,
      mcq_score: correct,
      mcq_total: total,
      mcq_passed: passed,
      unlocked_at: new Date().toISOString(),
      ...(passed && { completed_at: new Date().toISOString() }),
    };

    const { error: upsertErr } = await supabase
      .from('lecture_progress')
      .upsert(progressPayload, {
        onConflict: 'student_id,lecture_id',
      });

    if (upsertErr) {
      const { data: existing } = await supabase
        .from('lecture_progress')
        .select('id')
        .eq('student_id', studentId)
        .eq('lecture_id', lecture_id)
        .single();

      if (existing) {
        await supabase.from('lecture_progress').update(progressPayload).eq('id', existing.id);
      } else {
        await supabase.from('lecture_progress').insert(progressPayload);
      }
    }

    let nextLectureId: string | null = null;
    if (passed) {
      const { data: curr } = await supabase
        .from('lectures')
        .select('chapter_id, order_index')
        .eq('id', lecture_id)
        .single();

      if (curr) {
        const { data: sameChapter } = await supabase
          .from('lectures')
          .select('id')
          .eq('chapter_id', curr.chapter_id)
          .gt('order_index', curr.order_index)
          .order('order_index', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (sameChapter) {
          nextLectureId = sameChapter.id;
        } else {
          const { data: ch } = await supabase
            .from('chapters')
            .select('subject_id')
            .eq('id', curr.chapter_id)
            .single();
          if (ch?.subject_id) {
            const { data: chaps } = await supabase
              .from('chapters')
              .select('id, order_index')
              .eq('subject_id', ch.subject_id)
              .order('order_index');
            const idx = chaps?.findIndex((c: { id: string }) => c.id === curr.chapter_id) ?? -1;
            if (chaps && idx >= 0 && idx < chaps.length - 1) {
              const nextChap = chaps[idx + 1];
              const { data: first } = await supabase
                .from('lectures')
                .select('id')
                .eq('chapter_id', nextChap.id)
                .order('order_index')
                .limit(1)
                .maybeSingle();
              if (first) nextLectureId = first.id;
            }
          }
        }

        if (nextLectureId) {
          await supabase.from('lecture_progress').upsert(
            {
              student_id: studentId,
              lecture_id: nextLectureId,
              unlocked_at: new Date().toISOString(),
            },
            { onConflict: 'student_id,lecture_id' }
          );
        }
      }
    }

    return NextResponse.json({
      score: correct,
      total,
      passed,
      next_lecture_id: nextLectureId,
    });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
