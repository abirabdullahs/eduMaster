import { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Phone, MessageCircle, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Support | EduMaster',
  description: 'Get help and support for EduMaster educational platform.',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-hind-siliguri mb-6">Support</h1>
        <p className="text-slate-400 text-lg mb-12">We are here to help.</p>
        <div className="grid gap-6 sm:grid-cols-2 mb-12">
          <a href="mailto:contact@abirabdullah.me" className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10">
            <Mail className="text-indigo-500 mb-4" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Email</h3>
            <p className="text-slate-400 text-sm">contact@abirabdullah.me</p>
          </a>
          <a href="tel:01406751374" className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10">
            <Phone className="text-indigo-500 mb-4" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Phone</h3>
            <p className="text-slate-400 text-sm">01406751374 / 01410751374</p>
          </a>
        </div>
        <div className="space-y-6 mb-12">
          <h2 className="text-xl font-bold text-white">Quick Links</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl">
              <MessageCircle size={20} /> Contact Support
            </Link>
            <Link href="/refund-policy" className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl">
              <BookOpen size={20} /> Refund Policy
            </Link>
          </div>
        </div>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4">Visit Us</h3>
          <p className="text-slate-400">House No: 54, Darussalam Rd, Dhaka 1216</p>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
