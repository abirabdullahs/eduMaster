'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('loading');
    // For now, open mailto as fallback - can integrate with an API later
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement)?.value || '';
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value || '';
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement)?.value || '';
    const subject = encodeURIComponent(`EduMaster Support: ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:contact@abirabdullah.me?subject=${subject}&body=${body}`;
    setFormState('sent');
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-hind-siliguri mb-6">
          Contact Support
        </h1>
        <p className="text-slate-400 text-lg mb-12">
          Have a question or need help? We&apos;d love to hear from you.
        </p>

        <div className="grid gap-8 lg:grid-cols-2 mb-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
              <MapPin className="text-indigo-500 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-white mb-1">Address</h3>
                <p className="text-slate-400 text-sm">House No: 54, Darussalam Rd, Dhaka 1216</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Phone className="text-indigo-500 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-white mb-1">Phone</h3>
                <p className="text-slate-400 text-sm">01406751374</p>
                <p className="text-slate-400 text-sm">01410751374</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Mail className="text-indigo-500 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-white mb-1">Email</h3>
                <a href="mailto:contact@abirabdullah.me" className="text-indigo-400 hover:text-indigo-300 text-sm">
                  contact@abirabdullah.me
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-[#0a0f1e] border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-[#0a0f1e] border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0a0f1e] border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="submit"
                disabled={formState === 'loading'}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 text-white font-bold rounded-xl transition-all"
              >
                {formState === 'loading' ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
