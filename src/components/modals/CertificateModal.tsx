import React, { useRef } from 'react';
import { 
  Award, 
  Download, 
  Printer, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Calendar, 
  Sparkles,
  Share2,
  ExternalLink
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentId: string;
  college?: string;
  completedDate?: string;
  totalXP: number;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  studentName,
  studentId,
  college = 'Kalasalingam Academy of Research and Education (KARE)',
  completedDate,
  totalXP
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const issueDate = completedDate 
    ? new Date(completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const credentialId = `CR-CN-${(studentId || 'KLU').slice(-6).toUpperCase()}-${Math.abs(
    (studentName + issueDate).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)
  ).toString(36).toUpperCase()}`;

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 print:hidden">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Award className="w-5 h-5" />
            <span>Official Certificate of Completion</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Frame */}
        <div 
          ref={certificateRef}
          className="p-8 sm:p-12 md:p-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden print:p-8 print:bg-white print:text-slate-900"
        >
          {/* Ornate Cyber/Academic Border */}
          <div className="absolute inset-3 border-2 border-indigo-500/30 rounded-2xl pointer-events-none print:border-slate-800" />
          <div className="absolute inset-5 border border-indigo-400/20 rounded-xl pointer-events-none" />

          {/* Corner Decors */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-indigo-400" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-indigo-400" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-indigo-400" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-indigo-400" />

          {/* Certificate Content */}
          <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
            {/* Header Badge & Organization */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-400 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mx-auto">
                <Award className="w-9 h-9" />
              </div>
              <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase">
                CRESCO NETQUEST ACADEMY
              </span>
              <p className="text-[11px] text-slate-400 tracking-wider">
                KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION
              </p>
            </div>

            {/* Certificate Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-white print:text-slate-900">
                Certificate of Completion
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 italic font-serif">
                This document certifies the successful mastery of university curriculum
              </p>
            </div>

            {/* Presented To */}
            <div className="py-2">
              <span className="text-xs uppercase tracking-widest text-slate-400 block mb-1">
                PROUDLY PRESENTED TO
              </span>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 print:text-slate-900">
                {studentName || 'Distinguished Scholar'}
              </div>
              <div className="text-xs font-mono text-indigo-400 mt-1">
                Registration ID: {studentId || 'KLU Student'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {college}
              </div>
            </div>

            {/* Course Description */}
            <p className="text-xs sm:text-sm text-slate-300 print:text-slate-700 leading-relaxed">
              for successfully completing all gamified modules, RFC simulations, adaptive quizzes, and laboratory challenges in
              <span className="font-bold text-white print:text-slate-900 block mt-1 text-sm sm:text-base">
                Computer Networks: Network, Transport & Application Layers (Units 3, 4 & 5)
              </span>
              achieving mastery rank with an accumulated <span className="text-indigo-400 font-bold">{totalXP.toLocaleString()} XP</span>.
            </p>

            {/* Signatures & Issue Metadata */}
            <div className="pt-8 grid grid-cols-2 gap-8 border-t border-slate-800 print:border-slate-300">
              <div className="text-center">
                <div className="font-serif italic text-indigo-300 print:text-slate-800 text-base">
                  Dr. KLU Faculty Board
                </div>
                <div className="h-0.5 w-32 bg-slate-700 mx-auto my-1.5" />
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Department of CSE
                </div>
              </div>

              <div className="text-center">
                <div className="font-serif italic text-indigo-300 print:text-slate-800 text-base">
                  Cresco Academic Director
                </div>
                <div className="h-0.5 w-32 bg-slate-700 mx-auto my-1.5" />
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Course Coordinator
                </div>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-800/60 print:border-slate-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Issue Date: {issueDate}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Credential ID: {credentialId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
