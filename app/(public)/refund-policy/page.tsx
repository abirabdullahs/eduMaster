import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund Policy | EduMaster',
  description: 'Refund policy for EduMaster course enrollments.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-hind-siliguri mb-6">
          Refund Policy
        </h1>
        <p className="text-slate-400 text-sm mb-12">Last updated: March 2025</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Eligibility for Refund</h2>
            <p className="text-slate-400 leading-relaxed">
              Refund requests may be considered within 7 days of payment for online courses, provided that you have not 
              accessed more than 20% of the course content. Refunds are processed at our discretion based on the nature 
              of the request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Non-Refundable Items</h2>
            <p className="text-slate-400 leading-relaxed">
              Offline or in-person course enrollments, exam fees, and courses where substantial content has been accessed 
              are generally non-refundable. Monthly installment payments for offline courses are also non-refundable once 
              the period has commenced.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">How to Request a Refund</h2>
            <p className="text-slate-400 leading-relaxed">
              To request a refund, please contact us at contact@abirabdullah.me with your enrollment details and reason 
              for the request. We will respond within 5-7 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Refund Processing</h2>
            <p className="text-slate-400 leading-relaxed">
              Approved refunds will be processed within 10-14 business days to the original payment method. For bank 
              transfers or offline payments, processing may take additional time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Contact</h2>
            <p className="text-slate-400 leading-relaxed">
              For refund-related inquiries, visit our{' '}
              <Link href="/contact" className="text-indigo-400 hover:text-indigo-300">Contact Support</Link> page or 
              email us at contact@abirabdullah.me.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
