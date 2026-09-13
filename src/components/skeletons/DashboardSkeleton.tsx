import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* 1. Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-3">
          {/* Badges row */}
          <div className="flex space-x-2">
            <div className="w-24 h-5 rounded bg-[#171B24] animate-pulse"></div>
            <div className="w-40 h-5 rounded bg-[#171B24] animate-pulse"></div>
          </div>
          {/* Greeting */}
          <div className="w-64 h-8 rounded-lg bg-[#252B36] animate-pulse"></div>
          {/* Subtext */}
          <div className="w-96 h-4 rounded bg-[#171B24] animate-pulse"></div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-28 h-10 rounded-xl bg-[#171B24] border border-[#252B36] animate-pulse"></div>
          <div className="w-28 h-10 rounded-xl bg-[#171B24] border border-[#252B36] animate-pulse"></div>
        </div>
      </div>

      {/* 2. Visualizer Card */}
      <div className="w-full h-[280px] rounded-2xl bg-[#11141B] border border-[#252B36] shadow-xl relative overflow-hidden animate-pulse">
      </div>

      {/* 3. Syllabus/Roadmap Section */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="w-40 h-6 rounded bg-[#252B36] animate-pulse"></div>
            <div className="w-56 h-4 rounded bg-[#171B24] animate-pulse"></div>
          </div>
          <div className="w-24 h-8 rounded-full bg-[#171B24] animate-pulse"></div>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-4">
          <div className="absolute left-2 sm:left-4 top-0 bottom-0 w-0.5 bg-[#171B24]"></div>
          
          {/* Skeleton Modules */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-[#252B36] bg-[#0B0D12]">
              <div className="absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#171B24] border border-[#252B36] animate-pulse"></div>
              
              <div className="space-y-2 flex-1 pr-4">
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-4 rounded bg-[#171B24] animate-pulse"></div>
                </div>
                <div className="w-1/2 h-5 rounded bg-[#252B36] animate-pulse"></div>
                <div className="w-3/4 h-3 rounded bg-[#171B24] animate-pulse"></div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <div className="hidden md:block w-20 h-6 rounded bg-[#171B24] animate-pulse"></div>
                <div className="w-8 h-8 rounded-full bg-[#171B24] animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
