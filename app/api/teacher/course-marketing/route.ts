import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { course_id, details_markdown, curriculum_topics, faq_json } = body;

    if (!course_id || typeof course_id !== 'string') {
      return NextResponse.json({ error: 'course_id required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: course, error: fetchErr } = await admin
      .from('courses')
      .select('id, teacher_id')
      .eq('id', course_id)
      .single();

    if (fetchErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    if (course.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const topics = Array.isArray(curriculum_topics) ? curriculum_topics : [];
    const faqs = Array.isArray(faq_json) ? faq_json : [];

    const { error: updateErr } = await admin
      .from('courses')
      .update({
        details_markdown: typeof details_markdown === 'string' ? details_markdown.trim() || null : null,
        curriculum_topics: topics
          .filter((t: any) => String(t?.title ?? '').trim() || String(t?.body_md ?? t?.body ?? '').trim())
          .map((t: any) => ({
            title: String(t?.title ?? ''),
            body_md: String(t?.body_md ?? t?.body ?? ''),
          })),
        faq_json: faqs
          .filter((f: any) => String(f?.question ?? f?.q ?? '').trim() || String(f?.answer ?? f?.a ?? '').trim())
          .map((f: any) => ({
            question: String(f?.question ?? f?.q ?? ''),
            answer: String(f?.answer ?? f?.a ?? ''),
          })),
      })
      .eq('id', course_id);

    if (updateErr) throw updateErr;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Failed to update' }, { status: 500 });
  }
}
