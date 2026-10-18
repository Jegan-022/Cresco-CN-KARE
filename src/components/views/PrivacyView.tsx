import React from 'react';
import { ArrowLeft, Lock, ShieldCheck, Database, Eye } from 'lucide-react';

interface PrivacyViewProps {
  onBack?: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 p-4 sm:p-8 flex justify-center">
      <div className="max-w-3xl w-full">
        <header className="mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Lock size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Privacy Policy
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                CRESCO CN • Data Governance &amp; Student Privacy • Version 1.0
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
              <Database size={16} className="text-teal-400" />
              1. Information We Collect
            </h2>
            <p className="mb-2">
              CRESCO collects only information strictly necessary for academic learning evaluation:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Institutional Identity:</strong> University email address (@klu.ac.in), Register Number (Username), and official full name from Google Workspace authentication.</li>
              <li><strong>Learning Telemetry:</strong> Module completion timestamps, quiz scores, packet simulator traces, subjective rubric evaluations, and practice activity streaks.</li>
              <li><strong>Session Data:</strong> Authenticated token expiry, browser user agent, and security audit logs.</li>
            </ul>
          </section>

          <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck size={16} className="text-teal-400" />
              2. How We Protect Your Data
            </h2>
            <p className="mb-2">
              We enforce industry-standard security and student privacy guardrails:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Zero Plaintext Passwords:</strong> Passwords are never stored in plaintext, localStorage, or custom Firestore collections. All authentication is cryptographically validated by Firebase Authentication.</li>
              <li><strong>Owner Isolation:</strong> Firestore security rules strictly isolate private student records (<code className="text-cyan-400 font-mono">/students/{'{studentId}'}</code>), disallowing unauthorized peer reads.</li>
              <li><strong>Public Projection Sanitization:</strong> Public leaderboard standings (<code className="text-cyan-400 font-mono">/public_leaderboard</code>) expose only sanitized gamification totals (XP and level rank) without revealing email addresses or quiz answers.</li>
            </ul>
          </section>

          <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Eye size={16} className="text-teal-400" />
              3. Data Access &amp; Faculty Oversight
            </h2>
            <p>
              Only authorized course coordinators and verified lab instructors possessing
              cryptographic server-issued claims (<code className="text-cyan-400 font-mono">request.auth.token.role == 'faculty'</code>)
              are permitted to inspect cohort analytics, grade subjective Wireshark exercises,
              and orchestrate live classroom sessions.
            </p>
          </section>

          <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Lock size={16} className="text-teal-400" />
              4. Third-Party Disclosures
            </h2>
            <p>
              CRESCO CN does not sell, license, or share student records or learning telemetry
              with commercial advertisers or third-party marketing entities. Telemetry is used
              exclusively for continuous pedagogical adaptation and academic grading at KARE.
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

export default PrivacyView;
