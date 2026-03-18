'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Calendar, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Loader2,
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  event_date: z.string().min(1, 'Please select a date'),
  event_time: z.string().min(1, 'Please select a time'),
  location: z.string().min(1, 'Please specify a location (Online/Physical)'),
  registration_link: z.string().url('Invalid registration URL').optional().or(z.literal('')),
  max_participants: z.number().min(0, 'Must be positive').optional(),
  thumbnail_url: z.string().url('Invalid thumbnail URL').optional().or(z.literal('')),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (fetchError) throw fetchError;
      setEvents(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onSubmit = async (values: EventFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        description: values.description,
        event_date: values.event_date,
        event_time: values.event_time,
        location: values.location,
        registration_link: values.registration_link || null,
        thumbnail_url: values.thumbnail_url || null,
        max_participants: values.max_participants ?? null,
      };

      if (editingEvent) {
        const { error: updateError } = await supabase
          .from('events')
          .update(payload)
          .eq('id', editingEvent.id);
        if (updateError) throw updateError;
        alert('Event updated successfully!');
      } else {
        const { error: insertError } = await supabase.from('events').insert(payload);
        if (insertError) throw insertError;
        alert('Event created successfully!');
      }

      reset();
      setIsModalOpen(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setValue('title', event.title);
    setValue('description', event.description || '');
    setValue('event_date', event.event_date?.split('T')[0] || '');
    setValue('event_time', event.event_time || '');
    setValue('location', event.location || '');
    setValue('registration_link', event.registration_link || '');
    setValue('max_participants', event.max_participants ?? 0);
    setValue('thumbnail_url', event.thumbnail_url || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      fetchEvents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Event Management</h1>
          <p className="text-slate-400 mt-1">Organize workshops, webinars, and seminars.</p>
        </div>
        <button 
          onClick={() => { setEditingEvent(null); reset(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={20} />
          Create New Event
        </button>
      </div>

      {/* Event Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
          <p className="text-slate-400 font-medium tracking-wide">Fetching events...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex flex-col items-center text-center gap-4">
          <AlertCircle className="text-red-500" size={48} />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Error Loading Data</h3>
            <p className="text-sm text-red-200">{error}</p>
          </div>
          <button onClick={fetchEvents} className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl">Retry</button>
        </div>
      ) : events.length === 0 ? (
        <div className="py-20 text-center bg-[#161b22] border border-dashed border-slate-800 rounded-3xl space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <Calendar size={32} />
          </div>
          <p className="text-slate-500 font-medium">No events scheduled. Start by creating one!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col">
              {/* Thumbnail */}
              <div className="aspect-video relative overflow-hidden">
                <Image 
                  src={event.thumbnail_url || `https://picsum.photos/seed/${event.id}/600/400`} 
                  alt={event.title} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent opacity-60" />
                <div className="absolute top-4 right-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg",
                    new Date(event.event_date) > new Date() ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                  )}>
                    {new Date(event.event_date) > new Date() ? "Upcoming" : "Past"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{event.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={14} className="text-indigo-500" />
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={14} className="text-indigo-500" />
                    <span>{event.event_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={14} className="text-indigo-500" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users size={14} className="text-indigo-500" />
                    <span>Max: {event.max_participants || '∞'}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(event)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {event.registration_link && (
                    <a 
                      href={event.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all uppercase tracking-widest"
                    >
                      Reg Link <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar size={24} className="text-indigo-500" />
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button onClick={() => { setIsModalOpen(false); setEditingEvent(null); }} className="text-slate-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Event Title</label>
                  <input 
                    {...register('title')}
                    type="text" 
                    placeholder="e.g. HSC Physics Workshop"
                    className={cn(
                      "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                      errors.title && "border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    {...register('description')}
                    rows={4}
                    placeholder="What is this event about?"
                    className={cn(
                      "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                      errors.description && "border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Date</label>
                    <input 
                      {...register('event_date')}
                      type="date" 
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Time</label>
                    <input 
                      {...register('event_time')}
                      type="time" 
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Location</label>
                  <input 
                    {...register('location')}
                    type="text" 
                    placeholder="e.g. Zoom / Dhaka Office"
                    className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Registration Link</label>
                  <input 
                    {...register('registration_link')}
                    type="text" 
                    placeholder="https://..."
                    className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Max Participants</label>
                  <input 
                    {...register('max_participants', { valueAsNumber: true })}
                    type="number" 
                    placeholder="0 for unlimited"
                    className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Thumbnail URL</label>
                  <input 
                    {...register('thumbnail_url')}
                    type="text" 
                    placeholder="https://..."
                    className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
