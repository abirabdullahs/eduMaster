'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Trophy, Users, Zap } from 'lucide-react';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  className?: string;
}

function StatCard({ icon: Icon, value, label, className = '' }: StatCardProps) {
  return (
    <div
      className={`absolute flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl ${className}`}
      style={{ background: 'rgba(255,255,255,0.06)' }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-teal-500/20 text-teal-400 shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-white font-bold text-base leading-none">{value}</p>
        <p className="text-slate-400 text-xs mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16"
      style={{ background: '#060b18' }}
    >
      {/* ── Geometric background ── */}
      {/* Radial glow — teal left, violet right */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 10% 60%, rgba(20,184,166,0.12) 0%, transparent 70%), radial-gradient(ellipse 55% 50% at 90% 30%, rgba(124,58,237,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Top horizontal accent line */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.5), transparent)' }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center gap-14 lg:gap-10">

        {/* ── LEFT: Text content ── */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-7">

          {/* Pill badge */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-widest"
            style={{
              background: 'rgba(20,184,166,0.08)',
              borderColor: 'rgba(20,184,166,0.3)',
              color: '#2dd4bf',
            }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            ২০২৬ সালের ভর্তি চলছে
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1
              className="text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.1] text-white font-hind-siliguri"
            >
              স্বপ্ন ছোঁয়ার পথে{' '}
              <br className="hidden sm:block" />
              <span
                style={{
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #818cf8 60%, #c084fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                সেরা প্রস্তুতি
              </span>{' '}
              শুরু হোক
            </h1>
            <p className="text-base md:text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed font-poppins">
              Bangladesh-এর SSC ও HSC শিক্ষার্থীদের জন্য সবচেয়ে উন্নত লার্নিং প্ল্যাটফর্ম। দেশের সেরা শিক্ষকদের কাছ থেকে শিখুন, পরীক্ষায় এগিয়ে থাকুন।
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/courses"
              className="group relative flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-white transition-all duration-300 w-full sm:w-auto overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0d9488, #6366f1)',
                boxShadow: '0 0 32px rgba(13,148,136,0.35)',
              }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, #0f766e, #4f46e5)' }} />
              <span className="relative flex items-center gap-2">
                <BookOpen size={18} />
                কোর্স দেখুন
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Link>

            <Link
              href="/exams/public"
              className="group flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-white transition-all duration-300 w-full sm:w-auto border"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.12)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            >
              <Zap size={18} className="text-amber-400" />
              ফ্রি পরীক্ষা দাও
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full overflow-hidden border-2"
                  style={{ borderColor: '#060b18' }}
                >
                  <img
                    src={`https://picsum.photos/seed/s${i}xyz/80/80`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div
                className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                style={{ borderColor: '#060b18', background: 'linear-gradient(135deg,#0d9488,#6366f1)', color: '#fff' }}
              >
                +৫০০
              </div>
            </div>
            <div className="text-sm">
              <span className="text-white font-semibold">৫০০+</span>{' '}
              <span className="text-slate-500">শিক্ষার্থী আমাদের সাথে শিখছে</span>
            </div>
          </div>

          {/* Quick stats row */}
          <div
            className="flex items-center gap-6 pt-1 border-t w-full max-w-sm mx-auto lg:mx-0"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            {[
              { value: '৯৮%', label: 'পাসের হার' },
              { value: '৩০+', label: 'বিষয় কোর্স' },
              { value: '২৪/৭', label: 'অ্যাক্সেস' },
            ].map(({ value, label }) => (
              <div key={label} className="pt-5 text-center lg:text-left">
                <p className="text-lg font-bold" style={{ color: '#2dd4bf' }}>{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Image + floating cards ── */}
        <div className="relative flex-1 flex justify-center items-center w-full max-w-sm lg:max-w-none">

          {/* Outer decorative ring */}
          <div
            className="absolute w-[380px] h-[380px] md:w-[480px] md:h-[480px] rounded-full border"
            style={{ borderColor: 'rgba(45,212,191,0.12)' }}
          />
          <div
            className="absolute w-[300px] h-[300px] md:w-[390px] md:h-[390px] rounded-full border"
            style={{ borderColor: 'rgba(99,102,241,0.12)' }}
          />

          {/* Main image card */}
          <div
            className="relative w-[260px] h-[340px] md:w-[320px] md:h-[420px] rounded-3xl overflow-hidden border"
            style={{
              borderColor: 'rgba(255,255,255,0.08)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            <Image
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700&q=80"
              alt="শিক্ষার্থী পড়াশোনা করছেন"
              fill
              className="object-cover"
              priority
              sizes="320px"
            />
            {/* Bottom gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(6,11,24,0.7) 0%, transparent 55%)' }}
            />

            {/* Card label at bottom */}
            <div className="absolute bottom-4 left-4 right-4">
              <div
                className="px-3 py-2 rounded-xl backdrop-blur-sm border text-center"
                style={{ background: 'rgba(6,11,24,0.6)', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <p className="text-xs text-slate-400">Live class চলছে</p>
                <p className="text-sm font-semibold text-white mt-0.5">HSC Chemistry — Chapter 4</p>
              </div>
            </div>
          </div>

          {/* Floating stat: top-left */}
          <StatCard
            icon={Trophy}
            value="৯৮%"
            label="পাসের হার"
            className="-top-4 -left-6 md:-left-12 animate-bounce [animation-duration:3s]"
          />

          {/* Floating stat: top-right */}
          <StatCard
            icon={Users}
            value="৫০০+"
            label="শিক্ষার্থী"
            className="top-16 -right-4 md:-right-10"
          />

          {/* Floating stat: bottom-left */}
          <StatCard
            icon={Zap}
            value="৩০+"
            label="কোর্স"
            className="-bottom-4 -left-4 md:-left-10"
          />
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24"
        style={{ background: 'linear-gradient(to top, #060b18, transparent)' }}
      />
    </section>
  );
}