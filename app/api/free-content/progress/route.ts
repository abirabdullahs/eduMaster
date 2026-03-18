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

    if (!user) return NextResponse.json({ progress: [] });
    if (!topic_id) return NextResponse.json({ error: 'topic_id required' }, { status: 400 });

    const { data: contents } = await supabase
      .from('free_contents')
      .select('id')
      .eq('topic_id', topic_id);
    const ids = (contents || []).map(c => c.id);

    const { data: progress } = await supabase
      .from('free_content_progress')
      .select('content_id, status, answer_given, is_correct')
      .eq('user_id', user.id)
      .in('content_id', ids);

    const map: Record<string, { status: string; answer_given?: string; is_correct?: boolean }> = {};
    (progress || []).forEach(p => {
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
