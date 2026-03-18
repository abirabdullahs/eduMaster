'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GraduationCap, BookOpen, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stat {
  label: string;
  value: number;
  icon: any;
  color: string;
  suffix?: string;
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stat[]>([
    { label: 'শিক্ষার্থী', value: 0, icon: Users, color: 'text-indigo-500', suffix: '+' },
    { label: 'কোর্স', value: 0, icon: BookOpen, color: 'text-purple-500' },
    { label: 'শিক্ষক', value: 0, icon: GraduationCap, color: 'text-emerald-500' },
    { label: 'পরীক্ষা', value: 0, icon: FileText, color: 'text-blue-500', suffix: '+' },
  ]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: studentsCount },
        { count: coursesCount },
        { count: teachersCount },
        { count: examsCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('exams').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      ]);

      setStats([
        { label: 'শিক্ষার্থী', value: Math.max((studentsCount || 0), 500), icon: Users, color: 'text-indigo-500', suffix: '+' },
        { label: 'কোর্স', value: Math.max((coursesCount || 0), 10), icon: BookOpen, color: 'text-purple-500', suffix: '+' },
        { label: 'শিক্ষক', value: (teachersCount || 0) + 25, icon: GraduationCap, color: 'text-emerald-500' },
        { label: 'পরীক্ষা', value: (examsCount || 0) + 500, icon: FileText, color: 'text-blue-500', suffix: '+' },
      ]);
    }

    fetchStats();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [supabase]);

  return (
    <section ref={sectionRef} className="py-20 bg-[#0a0f1e] relative">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={cn(
                "glass-card p-8 text-center space-y-4 transition-all duration-700 delay-[var(--delay)]",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
              style={{ '--delay': `${index * 100}ms` } as any}
            >
              <div className={cn("w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center", stat.color)}>
                <Icon size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white font-poppins">
                  {isVisible ? <Counter value={stat.value} /> : 0}
                  {stat.suffix}
                </p>
                <p className="text-sm text-slate-400 font-hind-siliguri font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalDuration = 2000;
    const incrementTime = Math.abs(Math.floor(totalDuration / end));

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
}
