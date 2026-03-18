import { createClient } from '@/lib/supabase/server';
import { jsPDF } from 'jspdf';

/**
 * Generates a certificate for a student who has completed a course.
 * Caller must use Supabase server client.
 */
export async function generateCertificate(supabase: ReturnType<typeof createClient>, courseId: string, studentId: string): Promise<{ url: string }> {
  // 1. Verify completion - Get all lectures for the course
  const { data: subjects } = await supabase.from('subjects').select('id').eq('course_id', courseId);
  const subjectIds = subjects?.map(s => s.id) || [];
  if (subjectIds.length === 0) throw new Error('Course has no content');

  const { data: chapters } = await supabase.from('chapters').select('id').in('subject_id', subjectIds);
  const chapterIds = chapters?.map(c => c.id) || [];
  const { data: courseLectures } = await supabase.from('lectures').select('id').in('chapter_id', chapterIds);

  const { data: progress } = await supabase
    .from('lecture_progress')
    .select('lecture_id')
    .eq('student_id', studentId);

  const completedLectureIds = new Set(progress?.map(p => p.lecture_id));
  const allCompleted = (courseLectures?.length ?? 0) > 0 && courseLectures!.every((l: any) => completedLectureIds.has(l.id));
  if (!allCompleted) throw new Error('Not all lectures completed');

  // 2. Check exam passed
  const { data: courseExams } = await supabase.from('exams').select('id').eq('course_id', courseId);
  const examIds = courseExams?.map(e => e.id) || [];
  if (examIds.length === 0) throw new Error('Course has no exams');

  const { data: examAttempts } = await supabase
    .from('exam_attempts')
    .select('score')
    .eq('student_id', studentId)
    .in('exam_id', examIds)
    .eq('is_practice', false)
    .order('score', { ascending: false })
    .limit(1);

  if (!examAttempts?.length || examAttempts[0].score < 50) throw new Error('Exam not passed');

  // 3. Check certificate doesn't already exist
  const { data: existing } = await supabase
    .from('certificates')
    .select('id')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (existing) throw new Error('Certificate already exists');

  // 4. Generate PDF
  const { data: student } = await supabase.from('profiles').select('name').eq('id', studentId).single();
  const { data: course } = await supabase.from('courses').select('title').eq('id', courseId).single();

  const certificateId = `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const issueDate = new Date().toLocaleDateString();

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setFillColor(245, 245, 240);
  doc.rect(0, 0, 297, 210, 'F');
  doc.setDrawColor(90, 90, 64);
  doc.setLineWidth(2);
  doc.rect(10, 10, 277, 190);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(40);
  doc.setTextColor(20, 20, 20);
  doc.text('CERTIFICATE OF COMPLETION', 148.5, 60, { align: 'center' });
  doc.setFontSize(20);
  doc.setFont('helvetica', 'normal');
  doc.text('This is to certify that', 148.5, 80, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.text(student?.name || 'Student Name', 148.5, 100, { align: 'center' });
  doc.setFontSize(20);
  doc.setFont('helvetica', 'normal');
  doc.text('has successfully completed the course', 148.5, 120, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(25);
  doc.text(course?.title || 'Course Name', 148.5, 140, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Issued on: ${issueDate}`, 148.5, 160, { align: 'center' });
  doc.text(`Certificate ID: ${certificateId}`, 148.5, 170, { align: 'center' });

  const pdfOutput = doc.output('arraybuffer');

  const fileName = `${studentId}/${courseId}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from('certificates')
    .upload(fileName, pdfOutput, { contentType: 'application/pdf', upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from('certificates').getPublicUrl(fileName);

  const { error: dbError } = await supabase
    .from('certificates')
    .insert({
      student_id: studentId,
      course_id: courseId,
      certificate_url: publicUrl,
      issued_at: new Date().toISOString()
    });

  if (dbError) throw dbError;

  return { url: publicUrl };
}
