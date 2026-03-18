import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050811] border-t border-white/5 pt-20 pb-10 px-6 font-poppins">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">
        {/* Brand */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Radiance</span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed">
            বাংলাদেশের সেরা অনলাইন লার্নিং প্ল্যাটফর্ম। SSC ও HSC শিক্ষার্থীদের জন্য মানসম্মত শিক্ষা নিশ্চিত করাই আমাদের লক্ষ্য।
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="w-10 h-10 bg-white/5 hover:bg-indigo-600/20 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-all border border-white/10">
              <Facebook size={18} />
            </Link>
            <Link href="#" className="w-10 h-10 bg-white/5 hover:bg-indigo-600/20 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-all border border-white/10">
              <Twitter size={18} />
            </Link>
            <Link href="#" className="w-10 h-10 bg-white/5 hover:bg-indigo-600/20 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-all border border-white/10">
              <Instagram size={18} />
            </Link>
            <Link href="#" className="w-10 h-10 bg-white/5 hover:bg-indigo-600/20 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-all border border-white/10">
              <Youtube size={18} />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h3 className="text-white font-bold text-lg">Quick Links</h3>
          <ul className="space-y-4">
            <li><Link href="/" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Home</Link></li>
            <li><Link href="/courses" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">All Courses</Link></li>
            <li><Link href="/exams/public" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Public Exams</Link></li>
            <li><Link href="/about" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">About Us</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-6">
          <h3 className="text-white font-bold text-lg">Support</h3>
          <ul className="space-y-4">
            <li><Link href="/terms" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/support" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Support</Link></li>
            <li><Link href="/refund-policy" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Refund Policy</Link></li>
            <li><Link href="/contact" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <h3 className="text-white font-bold text-lg">Contact Us</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MapPin className="text-indigo-500 shrink-0 mt-1" size={18} />
              <span className="text-slate-400 text-sm">House No: 54, Darussalam Rd, Dhaka 1216</span>
            </li>
            <li className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Phone className="text-indigo-500 shrink-0" size={18} />
                <span className="text-slate-400 text-sm">01406751374</span>
              </div>
              <div className="flex items-center gap-3 pl-7">
                <span className="text-slate-400 text-sm">01410751374</span>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="text-indigo-500 shrink-0" size={18} />
              <a href="mailto:contact@abirabdullah.me" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">contact@abirabdullah.me</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 text-center">
        <p className="text-slate-500 text-xs">
          © {new Date().getFullYear()} Radiance. All rights reserved. Developed with ❤️ by <a href="https://abirabdullah.me" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">abirabdullah</a>
        </p>
      </div>
    </footer>
  );
}
