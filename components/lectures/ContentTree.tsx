'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, PlayCircle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ContentTreeProps {
  courseId: string
  subjects: any[] // Nested subjects > chapters > lectures
  activeLectureId?: string
}

export default function ContentTree({ courseId, subjects, activeLectureId }: ContentTreeProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-4">
      {subjects.map((subject) => (
        <div key={subject.id} className="space-y-2">
          <button
            onClick={() => toggleExpand(subject.id)}
            className="flex items-center gap-2 w-full text-left font-bold text-slate-900 hover:text-primary transition-colors"
          >
            {expandedItems[subject.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            {subject.title}
          </button>

          {expandedItems[subject.id] && (
            <div className="pl-4 space-y-4 border-l-2 border-slate-100 ml-2">
              {subject.chapters.map((chapter: any) => (
                <div key={chapter.id} className="space-y-2">
                  <button
                    onClick={() => toggleExpand(chapter.id)}
                    className="flex items-center gap-2 w-full text-left font-medium text-slate-700 hover:text-primary transition-colors"
                  >
                    {expandedItems[chapter.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {chapter.title}
                  </button>

                  {expandedItems[chapter.id] && (
                    <div className="pl-4 space-y-1">
                      {chapter.lectures.map((lecture: any) => (
                        <Link
                          key={lecture.id}
                          href={`/student/courses/${courseId}/lecture/${lecture.id}`}
                          className={cn(
                            "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-all",
                            activeLectureId === lecture.id 
                              ? "bg-secondary/10 text-secondary font-bold" 
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <PlayCircle size={14} />
                          {lecture.title}
                        </Link>
                      ))}
                      {chapter.suggestion_pdf_url && (
                        <a
                          href={chapter.suggestion_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-emerald-600 hover:bg-emerald-50 transition-all"
                        >
                          <FileText size={14} />
                          Chapter Suggestions (PDF)
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
