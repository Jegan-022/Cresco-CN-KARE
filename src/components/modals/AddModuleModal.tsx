import React, { useState, useEffect } from 'react';
import { X, Plus, Layers, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';
import { saveCustomModule, NewModuleInput } from '../../utils/courseManager';

interface AddModuleModalProps {
  isOpen: boolean;
  defaultUnitId?: string;
  onClose: () => void;
  onModuleAdded: (moduleId: string) => void;
}

export const AddModuleModal: React.FC<AddModuleModalProps> = ({
  isOpen,
  defaultUnitId = 'unit_3',
  onClose,
  onModuleAdded,
}) => {
  const [formData, setFormData] = useState<NewModuleInput>({
    unitId: defaultUnitId,
    title: '',
    code: '',
    duration: '18 mins',
    simulatorType: 'router-cli',
    hook: '',
    concept: '',
    takeaway: '',
    quizQuestion: '',
    quizOptions: ['', '', '', ''],
    quizCorrectIndex: 0,
    quizExplanation: '',
    xpReward: 50,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultUnitId) {
      setFormData((prev) => ({ ...prev, unitId: defaultUnitId }));
    }
  }, [defaultUnitId]);

  if (!isOpen) return null;

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...(formData.quizOptions || ['', '', '', ''])];
    updated[idx] = val;
    setFormData({ ...formData, quizOptions: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a module title.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = saveCustomModule(formData);
      onModuleAdded(created.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add module.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Add New Course Module
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Expand the curriculum with conceptual lessons, simulators, and quiz drills.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Unit & Code Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Academic Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="unit_3">Unit 3: Network Layer</option>
                <option value="unit_4">Unit 4: Transport Layer</option>
                <option value="unit_5">Unit 5: Application Layer</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Module Code
              </label>
              <input
                type="text"
                placeholder="e.g. u3_m8"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Estimated Duration
              </label>
              <input
                type="text"
                placeholder="e.g. 18 mins"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Module Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Module Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Software-Defined Networking (SDN) & OpenFlow"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Simulator Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Visual Simulator Engine
            </label>
            <select
              value={formData.simulatorType}
              onChange={(e) => setFormData({ ...formData, simulatorType: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="router-cli">Router CLI & Routing Table Inspector</option>
              <option value="ipv4-header">IPv4 Packet Header & Checksum Visualizer</option>
              <option value="subnet-calc">CIDR Subnet Calculator & Address Allocator</option>
              <option value="tcp-handshake">TCP 3-Way Handshake & State Visualizer</option>
              <option value="tcp-sliding-window">TCP Sliding Window Flow Simulator</option>
              <option value="dns-lookup">DNS Hierarchy & Resolution Trace</option>
              <option value="http-builder">HTTP/1.1 vs HTTP/2 Stream Visualizer</option>
              <option value="generic-viewer">Standard Protocol Analyzer</option>
            </select>
          </div>

          {/* Pedagogy Section */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Pedagogical Content & Deep-Dive
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hook / Real-World Problem Scenario
              </label>
              <textarea
                rows={2}
                placeholder="Why do we need this concept? Describe the engineering bottleneck..."
                value={formData.hook}
                onChange={(e) => setFormData({ ...formData, hook: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Core Conceptual Explanation
              </label>
              <textarea
                rows={2}
                placeholder="Explain the architectural mechanism, protocol headers, and behaviors..."
                value={formData.concept}
                onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Key Exam Takeaway
              </label>
              <input
                type="text"
                placeholder="Summarize the single most critical takeaway for examinations..."
                value={formData.takeaway}
                onChange={(e) => setFormData({ ...formData, takeaway: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick Check Quiz Section */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Quick-Check Drill Question
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Question Text
              </label>
              <input
                type="text"
                placeholder="e.g. Which layer does SDN separate from the data forwarding plane?"
                value={formData.quizQuestion}
                onChange={(e) => setFormData({ ...formData, quizQuestion: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                4 Options (Select the radio button for the correct answer)
              </label>
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="quizCorrectIndex"
                    checked={formData.quizCorrectIndex === idx}
                    onChange={() => setFormData({ ...formData, quizCorrectIndex: idx })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder={`Option ${String.fromCharCode(65 + idx)}...`}
                    value={(formData.quizOptions || [])[idx] || ''}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Answer Explanation
              </label>
              <input
                type="text"
                placeholder="Why is this option correct? Give brief rationale..."
                value={formData.quizExplanation}
                onChange={(e) => setFormData({ ...formData, quizExplanation: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Plus size={15} />
              <span>{isSubmitting ? 'Adding...' : 'Add Module to Syllabus'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
