'use client'

import LatexRenderer from '@/components/shared/LatexRenderer'
import { Lecture } from '@/lib/types'

interface LectureViewerProps {
  lecture: Lecture
}

export default function LectureViewer({ lecture }: LectureViewerProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border">
      <h1 className="text-3xl font-bold mb-6 text-primary">{lecture.title}</h1>
      
      {lecture.video_url && (
        <div className="aspect-video mb-8 rounded-xl overflow-hidden bg-slate-100">
          <iframe
            src={lecture.video_url}
            className="w-full h-full"
            allowFullScreen
            title={lecture.title}
          />
        </div>
      )}

      {lecture.topics && (
        <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Topics Covered</h3>
          <p className="text-slate-700">{lecture.topics}</p>
        </div>
      )}

      <div className="markdown-body">
        {lecture.content_html ? (
          <div dangerouslySetInnerHTML={{ __html: lecture.content_html }} />
        ) : (
          <p className="text-slate-400 italic">No content available for this lecture.</p>
        )}
      </div>
    </div>
  )
}
