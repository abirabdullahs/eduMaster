'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Certificate, Course } from '@/lib/types';
import { Award, Download, Loader2, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<(Certificate & { course: Course })[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCertificates() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('certificates')
        .select('*, course:courses(*)')
        .eq('student_id', user.id)
        .order('issued_at', { ascending: false });

      if (error) {
        console.error('Error fetching certificates:', error);
      } else {
        setCertificates(data || []);
      }
      setLoading(false);
    }

    fetchCertificates();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white">My Certificates</h1>
          <p className="text-slate-400">View and download your earned course certificates.</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl flex items-center gap-3">
          <Award className="text-indigo-400" size={24} />
          <div>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Total Earned</p>
            <p className="text-xl font-black text-white leading-none">{certificates.length}</p>
          </div>
        </div>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div 
              key={cert.id}
              className="bg-[#161b22] border border-slate-800 rounded-[2rem] overflow-hidden group hover:border-indigo-500/50 transition-all duration-300 shadow-xl"
            >
              <div className="aspect-[1.4/1] bg-slate-800/50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <FileText size={64} className="text-slate-700 group-hover:text-indigo-500/50 transition-colors" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Award size={12} className="text-indigo-400" />
                    Verified Certificate
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
                    {cert.course.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Issued on {format(new Date(cert.issued_at), 'MMMM d, yyyy')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a 
                    href={cert.certificate_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                  >
                    <Download size={14} />
                    Download PDF
                  </a>
                  <Link 
                    href={`/courses/${cert.course_id}`}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#161b22] border border-slate-800 rounded-[3rem] p-20 text-center space-y-6">
          <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-slate-700">
            <Award size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">No certificates yet</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Complete all lectures and pass the final exam of a course to earn your official certificate.
            </p>
          </div>
          <Link 
            href="/courses"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20"
          >
            Explore Courses
          </Link>
        </div>
      )}
    </div>
  );
}
