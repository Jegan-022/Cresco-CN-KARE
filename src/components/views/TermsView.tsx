import React from 'react';
import { ArrowLeft, FileText, Shield, CheckCircle } from 'lucide-react';

interface TermsViewProps {
  onBack?: () => void;
}

export const TermsView: React.FC<TermsViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 p-4 sm:p-8 flex justify-center">
      <div className="max-w-3xl w-full">
        <header className="mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Terms &amp; Conditions
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                CRESCO CN • Kalasalingam Academy of Research and Education • Version 1.0
              </p>
            </div>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}
        </header>

        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Shield size={16} className="text-cyan-400" />
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account, signing in with your official KLU institutional Google account,
              or accessing the CRESCO Computer Networks (CS-4200) platform, you agree to comply with
              these Terms &amp; Conditions and all applicable academic policies established by the
              Department of Computer Science &amp; Engineering at Kalasalingam Academy of Research and Education.
            </p>
          </section>

          <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle size={16} className="text-cyan-400" />
              2. Academic Integrity &amp; Honor Code
            </h2>
            <p className="mb-2">
              CRESCO is an active learning and assessment environment. You agree that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>All packet traces, Wireshark lab submissions, and quiz attempts submitted under your account reflect your individual work.</li>
              <li>You will not share credentials, automated scripts, or unauthorized solutions with other students.</li>
              <li>Tampering with client-side telemetry, XP rewards, or network simulation engines constitutes a direct academic violation.</li>
            </ul>
          </section>

          <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Shield size={16} className="text-cyan-400" />
              3. Institutional Authentication &amp; Access Controls
            </h2>
            <p>
              Access is strictly restricted to enrolled students, authorized faculty instructors,
              and appointed institutional administrators. Multi-role segregation is enforced cryptographically
              via Firebase Authentication custom claims. Any unauthorized attempt to escalate privileges
              will be logged and reported to the university administration.
            </p>
          </section>

          <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle size={16} className="text-cyan-400" />
              4. Curriculum &amp; Intellectual Property
            </h2>
            <p>
              All course materials, animated visualizations, question banks, and packet scenarios
              for CS-4200 (Units 1 through 5) are proprietary curriculum assets of Kalasalingam
              Academy of Research and Education. They may not be redistributed without formal written consent.
            </p>
          </section>

          <footer className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
            Effective Date: October 2026 • CRESCO CN Institutional Release
          </footer>
        </div>
      </div>
    </div>
  );
};

export default TermsView;
