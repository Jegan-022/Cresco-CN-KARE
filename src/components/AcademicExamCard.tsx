import React, { useState } from 'react';
import { soundFx } from '../utils/audio';

export const AcademicExamCard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        onClick={() => {
          soundFx.playClick();
          setShowModal(true);
        }}
        className="bg-[#f2f3ff] p-4 rounded-2xl flex items-center justify-between border border-[#dae2fd]/70 cursor-pointer hover:bg-[#eaedff] transition-all transform-gpu group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#004ac6] shadow-sm group-hover:scale-105 transition-transform transform-gpu">
            <span className="material-symbols-outlined">event</span>
          </div>
          <div>
            <div className="text-[14px] font-bold text-[#131b2e]">
              Midterm Simulation Exam
            </div>
            <div className="font-mono text-[11px] text-[#434655]">
              Due in 5 calendar days
            </div>
          </div>
        </div>
        <span className="material-symbols-outlined text-[#434655] group-hover:translate-x-1 group-hover:text-[#004ac6] transition-all transform-gpu">
          chevron_right
        </span>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/50  animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#c3c6d7] relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#737686] hover:text-[#131b2e]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-2 text-[#004ac6] mb-2 font-mono text-xs font-bold">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>ACADEMIC CALENDAR SYLLABUS</span>
            </div>

            <h3 className="text-xl font-bold text-[#131b2e]">
              CS-4200: Midterm Simulation Exam
            </h3>
            <p className="text-xs text-[#434655] mt-1">
              Comprehensive 90-minute proctored hands-on network simulation covering Modules 1 through 5.
            </p>

            <div className="mt-4 space-y-2 text-xs bg-[#f2f3ff] p-3 rounded-xl border border-[#dae2fd]">
              <div className="flex justify-between">
                <span className="text-[#434655]">Date & Time:</span>
                <span className="font-semibold text-[#131b2e]">September 8, 2025 at 14:00 EST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#434655]">Format:</span>
                <span className="font-semibold text-[#131b2e]">CLI & Topology Live Debugging</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#434655]">Weight:</span>
                <span className="font-semibold text-[#004ac6]">25% of Course Grade</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#434655]">Allowed Tools:</span>
                <span className="font-mono text-[#131b2e]">Cresco CN Terminal & RFC Spec Sheet</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#004ac6] text-white text-xs font-bold shadow hover:bg-[#003ea8] transition-colors"
              >
                Add to Calendar (.ics)
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#eaedff] text-[#131b2e] text-xs font-semibold hover:bg-[#e2e7ff] transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
