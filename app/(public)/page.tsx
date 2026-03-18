import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import UpcomingExams from '@/components/home/UpcomingExams';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FounderSection from '@/components/home/FounderSection';
import FAQSection from '@/components/home/FAQSection';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-[#0a0f1e] overflow-hidden">
      <HeroSection />
      <StatsSection />
      <FeaturedCourses />
      <UpcomingExams />
      <TestimonialsSection />
      <FounderSection />
      <FAQSection />
      
      {/* Call to Action Section */}
      <section className="py-24 bg-[#0a0f1e] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-600 to-purple-700 p-12 md:p-20 text-center space-y-8 shadow-2xl shadow-indigo-500/20">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 rounded-full blur-[100px]" />

            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold text-white font-hind-siliguri leading-tight">
                আজই শুরু করুন আপনার <br />
                <span className="text-indigo-200">সাফল্যের</span> যাত্রা
              </h2>
              <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto font-poppins">
                Join thousands of students who are already learning and growing with Radiance. Your future starts here.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link 
                  href="/signup" 
                  className="w-full sm:w-auto px-10 py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-xl hover:bg-indigo-50 transition-all"
                >
                  ফ্রি রেজিস্ট্রেশন করুন
                </Link>
                <Link 
                  href="/courses" 
                  className="w-full sm:w-auto px-10 py-4 bg-indigo-500/20 hover:bg-indigo-500/30 text-white font-bold rounded-2xl border border-white/20 backdrop-blur-sm transition-all"
                >
                  কোর্সগুলো দেখুন
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
