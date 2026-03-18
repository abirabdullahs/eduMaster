import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'আরিফ আহমেদ',
    class: 'HSC 2025',
    quote: 'EduMaster এর ক্লাসগুলো অসাধারণ। বিশেষ করে ফিজিক্সের কঠিন বিষয়গুলো এখানে খুব সহজে বোঝানো হয়েছে।',
    avatar: 'https://picsum.photos/seed/student1/100/100'
  },
  {
    name: 'সাদিয়া ইসলাম',
    class: 'SSC 2024',
    quote: 'পরীক্ষার আগে রিভিশন দেওয়ার জন্য এই প্ল্যাটফর্মটি সেরা। কুইজ এবং মডেল টেস্টগুলো আমাকে অনেক সাহায্য করেছে।',
    avatar: 'https://picsum.photos/seed/student2/100/100'
  },
  {
    name: 'তানভীর রহমান',
    class: 'HSC 2025',
    quote: 'শিক্ষকদের বোঝানোর ধরণ এবং নোটগুলো খুবই কার্যকর। আমি আমার রেজাল্টে অনেক উন্নতি করতে পেরেছি।',
    avatar: 'https://picsum.photos/seed/student3/100/100'
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#0a0f1e] relative">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white font-hind-siliguri">
            শিক্ষার্থীদের <span className="text-indigo-500">মতামত</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto font-poppins">
            Hear from our successful students who have achieved their academic goals with EduMaster.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="glass-card p-8 space-y-6 relative group hover:border-indigo-500/50 transition-all duration-300">
              <div className="absolute top-6 right-8 text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors">
                <Quote size={48} fill="currentColor" />
              </div>
              
              <div className="flex items-center gap-1 text-yellow-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>

              <p className="text-slate-300 leading-relaxed font-hind-siliguri italic">
                &quot;{testimonial.quote}&quot;
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-white font-bold font-hind-siliguri">{testimonial.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{testimonial.class}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
