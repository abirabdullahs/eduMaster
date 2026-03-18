'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  BookOpen, 
  MoreVertical,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';

export default function AdminEnrollments() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'pending';
  
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('enrollments')
        .select(`
          *,
          profiles:student_id (name, email),
          courses (title, main_price, discounted_price, is_offline)
        `)
        .order('created_at', { ascending: false });

      if (activeTab === 'pending') {
        query = query.eq('status', 'pending');
      } else if (activeTab === 'active') {
        query = query.eq('status', 'active');
      } else if (activeTab === 'offline') {
        query = query.eq('courses.is_offline', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setEnrollments(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  }, [activeTab, supabase]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleStatusUpdate = async (id: string, newStatus: 'active' | 'rejected') => {
    try {
      const res = await fetch('/api/enrollments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: id,
          status: newStatus === 'rejected' ? 'rejected' : 'active',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      fetchEnrollments();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const filteredEnrollments = enrollments.filter(e => 
    e.profiles?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.courses?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Enrollment Management</h1>
          <p className="text-slate-400 mt-1">Review and approve student enrollment requests.</p>
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap items-center bg-[#161b22] border border-slate-800 rounded-2xl p-1 gap-1">
          {[
            { id: 'pending', label: 'Pending' },
            { id: 'active', label: 'Active' },
            { id: 'offline', label: 'Offline Requests' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => router.push(`/admin/enrollments?tab=${tab.id}`)}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="Search by student name or course..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#161b22] border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      {/* Content */}
      <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#0d1117] border-b border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Course</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Payment Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
                    <p className="text-slate-500 mt-4 font-medium">Loading enrollments...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <AlertCircle className="text-red-500 mx-auto" size={32} />
                    <p className="text-red-200 mt-4 font-medium">{error}</p>
                  </td>
                </tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                    No {activeTab} enrollments found.
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enroll) => (
                  <tr key={enroll.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                          {enroll.profiles?.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{enroll.profiles?.name}</p>
                          <p className="text-xs text-slate-500">{enroll.profiles?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-indigo-500" />
                        <span className="text-sm font-medium text-white line-clamp-1">{enroll.courses?.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">
                          {enroll.payment_method || 'Online'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          ID: {enroll.transaction_id || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(enroll.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {activeTab === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(enroll.id, 'active')}
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-all"
                            title="Approve"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(enroll.id, 'rejected')}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <button className="p-2 text-slate-500 hover:text-white transition-all">
                          <MoreVertical size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
