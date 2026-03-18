import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions | EduMaster',
  description: 'Terms and conditions for using EduMaster educational platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-hind-siliguri mb-6">
          Terms & Conditions
        </h1>
        <p className="text-slate-400 text-sm mb-12">Last updated: March 2025</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-400 leading-relaxed">
              By accessing and using EduMaster (&quot;the Platform&quot;), you accept and agree to be bound by these Terms and Conditions. 
              If you do not agree with any part of these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Use of Service</h2>
            <p className="text-slate-400 leading-relaxed">
              EduMaster provides online educational content for SSC and HSC students in Bangladesh. You agree to use the service 
              only for lawful purposes and in accordance with these terms. You must provide accurate information during registration 
              and maintain the confidentiality of your account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Course Enrollment & Payments</h2>
            <p className="text-slate-400 leading-relaxed">
              Course fees are payable as described at the time of enrollment. Once payment is confirmed, you gain access to the 
              enrolled course content. For refund eligibility, please refer to our{' '}
              <Link href="/refund-policy" className="text-indigo-400 hover:text-indigo-300">Refund Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Intellectual Property</h2>
            <p className="text-slate-400 leading-relaxed">
              All content, including videos, materials, and course content on EduMaster, is protected by copyright. You may not 
              copy, distribute, or share course materials without prior written permission from EduMaster.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Contact</h2>
            <p className="text-slate-400 leading-relaxed">
              For questions about these Terms & Conditions, contact us at{' '}
              <a href="mailto:contact@abirabdullah.me" className="text-indigo-400 hover:text-indigo-300">contact@abirabdullah.me</a> or 
              visit our <Link href="/contact" className="text-indigo-400 hover:text-indigo-300">Contact Support</Link> page.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
