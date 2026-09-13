import React from 'react';

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans">
      {/* 1. Header Profile Banner */}
      <div className="bg-[#11141B] border border-[#252B36] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
          {/* Avatar Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#171B24] border-2 border-[#252B36] shrink-0 animate-pulse" />
          
          {/* Student Identity Information */}
          <div className="space-y-3 flex-1 w-full flex flex-col items-center sm:items-start">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 w-full">
              <div className="w-48 h-8 rounded-lg bg-[#252B36] animate-pulse"></div>
              <div className="w-20 h-6 rounded-full bg-[#171B24] animate-pulse"></div>
              <div className="w-32 h-6 rounded-full bg-[#171B24] animate-pulse"></div>
            </div>
            <div className="w-72 h-4 rounded bg-[#171B24] animate-pulse"></div>
            <div className="w-64 h-3 rounded bg-[#171B24] animate-pulse mt-1"></div>
          </div>
        </div>
      </div>

      {/* 2. Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Progress & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#11141B] p-4 rounded-xl border border-[#252B36] flex flex-col items-center justify-center space-y-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[#171B24]"></div>
                <div className="w-16 h-6 rounded bg-[#252B36]"></div>
                <div className="w-20 h-3 rounded bg-[#171B24]"></div>
              </div>
            ))}
          </div>
          
          {/* Recent Activity */}
          <div className="bg-[#11141B] rounded-2xl border border-[#252B36] p-5 sm:p-6 shadow-lg">
            <div className="w-40 h-6 rounded bg-[#252B36] mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-4 p-4 rounded-xl bg-[#0B0D12] border border-[#171B24] animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-[#171B24] shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="w-1/3 h-5 rounded bg-[#252B36]"></div>
                    <div className="w-1/2 h-3 rounded bg-[#171B24]"></div>
                  </div>
                  <div className="w-16 h-4 rounded bg-[#171B24]"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Contact */}
        <div className="space-y-6">
          <div className="bg-[#11141B] rounded-2xl border border-[#252B36] p-5 sm:p-6 shadow-lg space-y-4">
            <div className="w-32 h-6 rounded bg-[#252B36] mb-4 animate-pulse"></div>
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center space-x-3 w-full p-3 rounded-lg bg-[#0B0D12] border border-[#171B24] animate-pulse">
                <div className="w-5 h-5 rounded bg-[#171B24]"></div>
                <div className="w-32 h-4 rounded bg-[#252B36]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
