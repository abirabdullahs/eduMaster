import Link from 'next/link';
import { BookOpen, GraduationCap, Target, Award } from 'lucide-react';

export const metadata = {
  title: 'About Us',
  description: 'Learn about Radiance - Advanced EdTech platform for SSC and HSC students in Bangladesh.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-hind-siliguri mb-6">
          আমাদের সম্পর্কে
        </h1>
        <p className="text-slate-400 text-lg mb-12">
          Radiance বাংলাদেশের SSC ও HSC শিক্ষার্থীদের জন্য একটি আধুনিক এডটেক প্ল্যাটফর্ম।
        </p>

        {/* Mission */}
        <div className="space-y-8 mb-16">
          <div className="p-8 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <Target className="text-indigo-400" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white font-hind-siliguri">আমাদের অভিপ্রায়</h2>
            </div>
            <p className="text-slate-400 leading-relaxed">
              বাংলাদেশের প্রতিটি শিক্ষার্থীর জন্য সহজলভ্য এবং মানসম্মত শিক্ষা নিশ্চিত করা। SSC ও HSC সিলেবাস অনুযায়ী ইন্টারেক্টিভ কন্টেন্ট, MCQ, লেকচার, এবং পরীক্ষার মাধ্যমে আমরা শিক্ষার্থীদের সাফল্যের পথ সুগম করতে চাই।
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <BookOpen className="text-indigo-400 mb-4" size={32} />
              <h3 className="text-lg font-bold text-white mb-2">কোর্স</h3>
              <p className="text-slate-400 text-sm">SSC ও HSC সিলেবাসভিত্তিক প্রিমিয়াম কোর্স এক্সপার্ট ইনস্ট্রাক্টরদের দ্বারা তৈরি।</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <GraduationCap className="text-purple-400 mb-4" size={32} />
              <h3 className="text-lg font-bold text-white mb-2">ফ্রি লার্নিং</h3>
              <p className="text-slate-400 text-sm">বিনামূল্যে ইন্টারেক্টিভ কন্টেন্ট—MCQ, ভিডিও, ফ্ল্যাশকার্ড সহ।</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <Award className="text-emerald-400 mb-4" size={32} />
              <h3 className="text-lg font-bold text-white mb-2">পরীক্ষা</h3>
              <p className="text-slate-400 text-sm">পাবলিক ও কোর্স পরীক্ষায় অংশ নিয়ে নিজেকে যাচাই করুন।</p>
            </div>
          </div>

          {/* Founder */}
          <div className="p-8 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shrink-0">
                AA
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white font-hind-siliguri">Abir Abdullah</h2>
                <p className="text-indigo-400 font-medium">Founder & CEO</p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Computer Science & Engineering (CSE), BUET। Chemistry, Math ও ICT ইনস্ট্রাক্টর। বাংলাদেশের শিক্ষার্থীদের জন্য মানসম্মত শিক্ষা democratize করার লক্ষ্যে Radiance প্রতিষ্ঠা।
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold">Competitive Programmer</span>
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-bold">Web Developer</span>
                </div>
                <Link 
                  href="https://abirabdullah.me" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-sm"
                >
                  Visit abirabdullah.me →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex gap-6">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
            ← Home
          </Link>
          <Link href="/contact" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
            Contact →
          </Link>
        </div>
      </div>
    </div>
  );
}
