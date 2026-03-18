import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PublicExams() {
  const supabase = createClient()
  const { data: exams } = await supabase
    .from('exams')
    .select('*')
    .eq('exam_type', 'public')
    .eq('status', 'published')

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Public Exams</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exams?.map((exam) => (
          <div key={exam.id} className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
            <div className="space-y-2 text-sm text-slate-500 mb-6">
              <p>Duration: {exam.duration_minutes} minutes</p>
              <p>Negative Marking: {exam.negative_marking ? 'Yes' : 'No'}</p>
            </div>
            <Link
              href={`/exam/${exam.access_link}`}
              className="block w-full bg-primary text-white py-2 rounded-md font-medium text-center hover:opacity-90 transition-opacity"
            >
              পরীক্ষা দাও
            </Link>
          </div>
        ))}
        {!exams?.length && (
          <p className="text-slate-500">No public exams available at the moment.</p>
        )}
      </div>
    </div>
  )
}
