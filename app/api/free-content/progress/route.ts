import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content_id, status, answer_given, is_correct } = body;

    if (!content_id) {
      return NextResponse.json({ error: 'content_id required' }, { status: 400 });
    }

    const { error } = await supabase.from('free_content_progress').upsert({
      user_id: user.id,
      content_id,
      status: status || 'completed',
      answer_given: answer_given ?? null,
      is_correct: is_correct ?? null,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,content_id' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { searchParams } = new URL(req.url);
    const topic_id = searchParams.get('topic_id');
    const subject_id = searchParams.get('subject_id');

    if (!user) return NextResponse.json({ progress: [] });

    // Resume position for subject: returns { topic_id, content_index }
    if (subject_id) {
      const { data: chaps } = await supabase
        .from('free_chapters')
        .select(`
          id,
          topics:free_topics (id, order_index)
        `)
        .eq('subject_id', subject_id)
        .order('order_index');
      const topicIds: string[] = [];
      (chaps || []).forEach((c: { topics?: { id: string; order_index?: number }[] }) => {
        const sorted = (c.topics || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
        sorted.forEach((t) => topicIds.push(t.id));
      });

      if (topicIds.length === 0) {
        return NextResponse.json({ resume: null, subjectProgress: { completed: 0, total: 0 } });
      }

      const { data: contents } = await supabase
        .from('free_contents')
        .select('id, topic_id, order_index')
        .in('topic_id', topicIds);

      const allContents = contents || [];
      const totalCount = allContents.length;

      const { data: progress } = await supabase
        .from('free_content_progress')
        .select('content_id, status')
        .eq('user_id', user.id)
        .in('content_id', allContents.map((c: { id: string }) => c.id));

      const completedIds = new Set(
        (progress || []).filter((p: { status: string }) => p.status === 'completed').map((p: { content_id: string }) => p.content_id)
      );
      const completedCount = completedIds.size;

      const byTopic = allContents.reduce((acc: Record<string, { id: string; order_index: number }[]>, c: { id: string; topic_id: string; order_index: number }) => {
        if (!acc[c.topic_id]) acc[c.topic_id] = [];
        acc[c.topic_id].push({ id: c.id, order_index: c.order_index });
        return acc;
      }, {});

      const subjectProgress = { completed: completedCount, total: totalCount };

      for (const tid of topicIds) {
        const list = (byTopic[tid] || []).sort((a, b) => a.order_index - b.order_index);
        for (let i = 0; i < list.length; i++) {
          if (!completedIds.has(list[i].id)) {
            return NextResponse.json({ resume: { topic_id: tid, content_index: i }, subjectProgress });
          }
        }
      }
      const lastTid = topicIds[topicIds.length - 1];
      const lastList = (byTopic[lastTid] || []).sort((a, b) => a.order_index - b.order_index);
      return NextResponse.json({
        resume: {
          topic_id: lastTid || topicIds[0],
          content_index: Math.max(0, lastList.length - 1),
        },
        subjectProgress,
      });
    }

    if (!topic_id) return NextResponse.json({ error: 'topic_id or subject_id required' }, { status: 400 });

    const { data: contents } = await supabase
      .from('free_contents')
      .select('id')
      .eq('topic_id', topic_id);
    const ids = (contents || []).map((c: { id: string }) => c.id);

    const { data: progress } = await supabase
      .from('free_content_progress')
      .select('content_id, status, answer_given, is_correct')
      .eq('user_id', user.id)
      .in('content_id', ids);

    const map: Record<string, { status: string; answer_given?: string; is_correct?: boolean }> = {};
    (progress || []).forEach((p: { content_id: string; status: string; answer_given?: string; is_correct?: boolean }) => {
      map[p.content_id] = {
        status: p.status,
        answer_given: p.answer_given ?? undefined,
        is_correct: p.is_correct ?? undefined,
      };
    });
    return NextResponse.json({ progress: map });
  } catch {
    return NextResponse.json({ progress: [] });
  }
}
