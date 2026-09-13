import React, { useState, useEffect, useRef } from 'react';
import { NavTab } from '../types';
import { COURSE_SEARCH_INDEX, CourseSearchItem } from '../data/courseContent';
import { Search, X, BookOpen, Layers, ArrowRight, Compass } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab, lessonId?: string, sectionId?: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Unit 3' | 'Unit 4' | 'Unit 5'>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = COURSE_SEARCH_INDEX.filter((item) => {
    let matchesFilter = true;
    if (selectedFilter === 'Unit 3') matchesFilter = item.unitId === 'unit_3';
    if (selectedFilter === 'Unit 4') matchesFilter = item.unitId === 'unit_4';
    if (selectedFilter === 'Unit 5') matchesFilter = item.unitId === 'unit_5';

    const q = query.toLowerCase().trim();
    if (!q) return matchesFilter;

    const matchesQuery = item.title.toLowerCase().includes(q) || 
                         item.subtitle.toLowerCase().includes(q) ||
                         item.keywords.some(k => k.includes(q));
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#0B0D12]/85 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Modal Container */}
      <div 
        className="w-full max-w-2xl bg-[#11141B] rounded-2xl shadow-2xl border border-[#252B36] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#252B36]">
          <Search className="w-5 h-5 text-[#94A3B8] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all 45 modules, routing, TCP, subnetting, DNS, etc..."
            className="w-full text-white placeholder-[#94A3B8] text-sm sm:text-base focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-[#94A3B8] hover:text-white mr-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-[#94A3B8] hover:text-white bg-[#171B24] hover:bg-[#1E2330] border border-[#252B36] rounded-md transition-colors cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 px-4 py-2 bg-[#171B24] border-b border-[#252B36] overflow-x-auto text-xs">
          {(['All', 'Unit 3', 'Unit 4', 'Unit 5'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === cat
                  ? 'bg-[#5B7CFF] text-white shadow-xs'
                  : 'text-[#94A3B8] hover:bg-[#1E2330] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#252B36]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#94A3B8]">
              <Search className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium">No modules found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for "Dijkstra", "Handshake", "Subnetting", "DNS", or "IPv6".</p>
            </div>
          ) : (
            filtered.map((item) => {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate('lesson-player', item.moduleId);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-[#171B24] transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#171B24] text-[#94A3B8] group-hover:bg-[#5B7CFF] group-hover:text-white flex items-center justify-center shrink-0 transition-colors border border-[#252B36]">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-white group-hover:text-[#5B7CFF] truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-[#171B24] border border-[#252B36] text-[#94A3B8] shrink-0">
                          {item.unitId.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-0.5 truncate">{item.subtitle}</p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#5B7CFF] group-hover:translate-x-0.5 transition-all transform-gpu shrink-0 ml-2" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2.5 bg-[#171B24] border-t border-[#252B36] flex items-center justify-between text-xs text-[#94A3B8]">
          <span>Index covers all 45 modules, topics & practice items</span>
          <span className="font-mono text-[11px] text-[#5B7CFF]">Ctrl + K to toggle</span>
        </div>

      </div>

    </div>
  );
};
