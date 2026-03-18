'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { 
  Calendar, 
  Loader2, 
  ChevronRight, 
  Clock,
  MapPin,
  Video,
  Users,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isAfter, isBefore } from 'date-fns';

export default function StudentEventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('start_time', { ascending: true });

      setEvents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingEvents = filteredEvents.filter(e => isAfter(new Date(e.start_time), new Date()));
  const pastEvents = filteredEvents.filter(e => isBefore(new Date(e.start_time), new Date()));

  return (
    <DashboardShell>
      <div className="space-y-10 animate-in fade-in duration-500 font-bengali">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">ইভেন্টস</h1>
            <p className="text-slate-400">আসন্ন সেমিনার, ওয়ার্কশপ এবং লাইভ সেশনগুলোতে অংশগ্রহণ করুন।</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="ইভেন্ট খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-[#161b22] border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full md:w-80"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
            <p className="text-slate-500 font-bold animate-pulse">লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Upcoming Events */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                <h2 className="text-2xl font-bold text-white tracking-tight">আসন্ন ইভেন্টস</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="group bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all shadow-xl flex flex-col">
                      <div className="aspect-video bg-slate-800 relative overflow-hidden">
                        {event.image_url ? (
                          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Calendar size={48} />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest shadow-lg">
                          Upcoming
                        </div>
                      </div>

                      <div className="p-6 space-y-6 flex-1 flex flex-col">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">{event.title}</h3>
                          <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{event.description}</p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-800/50">
                          <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <Clock size={14} className="text-indigo-500" />
                            {format(new Date(event.start_time), 'MMM d, p')}
                          </div>
                          <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            {event.location_type === 'online' ? (
                              <><Video size={14} className="text-emerald-500" /> Online Session</>
                            ) : (
                              <><MapPin size={14} className="text-rose-500" /> {event.location_name}</>
                            )}
                          </div>
                        </div>

                        <div className="pt-6 mt-auto">
                          <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                            অংশগ্রহণ করুন <ArrowUpRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center space-y-4 bg-[#161b22] border border-slate-800 rounded-3xl">
                    <p className="text-slate-500 font-bold">আপাতত কোনো আসন্ন ইভেন্ট নেই।</p>
                  </div>
                )}
              </div>
            </section>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-slate-500 rounded-full" />
                  <h2 className="text-2xl font-bold text-white tracking-tight opacity-60">অতীতের ইভেন্টস</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {pastEvents.map((event) => (
                    <div key={event.id} className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 opacity-60 hover:opacity-100 transition-all">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                            <Calendar size={20} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ended</span>
                        </div>
                        <h3 className="font-bold text-white line-clamp-1">{event.title}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{format(new Date(event.start_time), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
