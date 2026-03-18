'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    q: 'কিভাবে কোর্সে এনরোল করব?',
    a: 'প্রথমে আপনার অ্যাকাউন্ট তৈরি করুন, তারপর পছন্দের কোর্স নির্বাচন করে "Enroll Now" বাটনে ক্লিক করুন। অনলাইন পেমেন্ট অথবা অফলাইন এনরোলমেন্টের জন্য যোগাযোগ করুন।',
  },
  {
    q: 'অফলাইন কোর্স কী?',
    a: 'অফলাইন কোর্সগুলো মাসিক পেমেন্ট সিস্টেমে চলতে পারে। ক্লাসে উপস্থিত থেকে শিখবেন এবং প্রতি মাসে ফি পরিশোধ করবেন।',
  },
  {
    q: 'রিফান্ড পেতে পারি কি?',
    a: 'হ্যাঁ, নির্দিষ্ট শর্তে রিফান্ড পেতে পারেন। বিস্তারিত জানতে Refund Policy পেজ দেখুন।',
  },
  {
    q: 'সহায়তার জন্য কীভাবে যোগাযোগ করব?',
    a: 'ইমেইল (contact@abirabdullah.me) অথবা ফোন (01406751374, 01410751374) এ যোগাযোগ করতে পারেন।',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-[#0a0f1e] relative">
      <div className="max-w-3xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-indigo-400 mb-4">
            <HelpCircle size={24} />
            <span className="text-sm font-bold uppercase tracking-wider">সহায়তা</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white font-hind-siliguri">
            সাধারণ <span className="text-indigo-500">প্রশ্নাবলী</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto font-poppins">
            আপনার সাধারণ প্রশ্নের উত্তর এখানে খুঁজে পাবেন।
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "glass-card overflow-hidden transition-all duration-300",
                openIndex === index && "border-indigo-500/50"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-bold text-white font-hind-siliguri">{faq.q}</span>
                <ChevronDown
                  size={20}
                  className={cn(
                    "text-slate-400 shrink-0 transition-transform duration-300",
                    openIndex === index && "rotate-180 text-indigo-400"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 text-slate-400 text-sm leading-relaxed font-hind-siliguri">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
