'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Course } from '@/lib/types';
import CourseGrid from './CourseGrid';
import { cn } from '@/lib/utils';

interface CourseCatalogClientProps {
  initialCourses: Course[];
}

export default function CourseCatalogClient({ initialCourses }: CourseCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const subjects = useMemo(() => {
    const s = new Set<string>();
    initialCourses.forEach(c => {
      if (c.subject) s.add(c.subject);
    });
    return Array.from(s).sort();
  }, [initialCourses]);

  const filteredCourses = useMemo(() => {
    return initialCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = !selectedClass || course.class === selectedClass;
      const matchesSubject = !selectedSubject || course.subject === selectedSubject;
      const price = course.discounted_price || course.main_price;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      
      return matchesSearch && matchesClass && matchesSubject && matchesPrice;
    });
  }, [initialCourses, searchQuery, selectedClass, selectedSubject, priceRange]);

  const clearFilters = () => {
    setSelectedClass(null);
    setSelectedSubject(null);
    setPriceRange([0, 10000]);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedClass || selectedSubject || searchQuery || priceRange[0] > 0 || priceRange[1] < 10000;

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search for courses (e.g. Physics, Math)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161b22] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all border",
            isFilterOpen || hasActiveFilters 
              ? "bg-indigo-600 text-white border-indigo-500" 
              : "bg-[#161b22] text-slate-400 border-slate-800 hover:bg-white/5 hover:text-white"
          )}
        >
          <SlidersHorizontal size={20} />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 w-5 h-5 bg-white text-indigo-600 rounded-full flex items-center justify-center text-[10px]">
              !
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 animate-in fade-in slide-in-from-top-4 duration-300 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Filter size={20} className="text-indigo-500" />
              Refine Your Search
            </h3>
            <button 
              onClick={clearFilters}
              className="text-sm font-bold text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <X size={16} />
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Class Filter */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Class</label>
              <div className="flex flex-wrap gap-2">
                {['SSC', 'HSC'].map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(selectedClass === cls ? null : cls)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                      selectedClass === cls
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-white/5 text-slate-400 border-slate-700 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Filter */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</label>
              <select
                value={selectedSubject || ''}
                onChange={(e) => setSelectedSubject(e.target.value || null)}
                className="w-full bg-white/5 border border-slate-700 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">All Subjects</option>
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                Max Price: ৳{priceRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                <span>৳0</span>
                <span>৳10,000+</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400 font-medium">
            Showing <span className="text-white font-bold">{filteredCourses.length}</span> courses
          </p>
        </div>
        <CourseGrid courses={filteredCourses} />
      </div>
    </div>
  );
}
