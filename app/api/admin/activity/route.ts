import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json();
    const { activity_type, title, entity_type, entity_id, href } = body;
    if (!activity_type || !title || !entity_type || !href) {
      return NextResponse.json({ error: 'activity_type, title, entity_type, href required' }, { status: 400 });
    }

    const { error } = await supabase.from('admin_activity_log').insert({
      activity_type,
      title,
      entity_type: entity_type || 'unknown',
      entity_id: entity_id || null,
      href,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '4', 10), 100);
    const hours = parseInt(searchParams.get('hours') || '48', 10);
    const all = searchParams.get('all') === 'true';

    const since = new Date();
    since.setHours(since.getHours() - hours);
    const sinceIso = since.toISOString();

    const query = supabase
      .from('admin_activity_log')
      .select('*')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false });

    const { data, error } = all
      ? await query
      : await query.limit(limit);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ activities: data || [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
