import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateCertificate } from '@/lib/certificate';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { courseId, studentId } = await req.json();
    if (!courseId || !studentId) {
      return NextResponse.json({ error: 'Missing courseId or studentId' }, { status: 400 });
    }
    const { url } = await generateCertificate(supabase, courseId, studentId);
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Certificate generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
