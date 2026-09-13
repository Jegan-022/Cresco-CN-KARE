import React, { useState, useEffect } from 'react';
import { 
  GUIDE_MASTERS, 
  GuideMasterId, 
  GuideMasterProfile, 
  getGuideMasterById 
} from '../../data/guideMasterCharacters';
import { GuideMasterAvatar } from './GuideMasterAvatar';
import { GuideMasterTutorPanel } from './GuideMasterTutorPanel';
import { soundFx } from '../../utils/soundEffects';
import { Sparkles, MessageSquare, X, ChevronUp, ChevronDown } from 'lucide-react';

interface GuideMasterFloatingTriggerProps {
  onNavigateToSelect?: () => void;
  currentTopic?: string;
}

export const GuideMasterFloatingTrigger: React.FC<GuideMasterFloatingTriggerProps> = ({
  onNavigateToSelect,
  currentTopic = 'TCP 3-Way Handshake',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener('netquest_toggle_guidemaster', handleToggle);
    return () => window.removeEventListener('netquest_toggle_guidemaster', handleToggle);
  }, []);

  const activeId = (() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('netquest_guidemaster_id');
      if (saved && GUIDE_MASTERS.some((m) => m.id === saved)) {
        return saved as GuideMasterId;
      }
    }
    return 'mira';
  })();

  const master: GuideMasterProfile = getGuideMasterById(activeId);

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 select-none flex flex-col items-end pointer-events-auto">
      
      {/* Expanded Interactive Tutor Panel */}
      {isOpen && (
        <div className="mb-3 animate-in slide-in-from-bottom-5 duration-300 shadow-2xl">
          <GuideMasterTutorPanel
            currentTopic={currentTopic}
            isFloating
            onClose={() => setIsOpen(false)}
            onNavigateToSelect={onNavigateToSelect}
          />
        </div>
      )}

      {/* Minimized Floating Tutor Pill */}
      {!isOpen && (
        <button
          onClick={() => {
            soundFx.playClick();
            setIsOpen(true);
          }}
          className="group flex items-center gap-3 px-3.5 py-2 rounded-full bg-surface-container-lowest dark:bg-slate-900 border-2 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          style={{ borderColor: master.color.primary }}
          title={`Ask ${master.name} • GuideMaster Personal Tutor`}
        >
          {/* Avatar with live breathing & blinking */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-visible border shadow-xs"
            style={{ 
              backgroundColor: master.color.background, 
              borderColor: master.color.border 
            }}
          >
            <GuideMasterAvatar
              characterId={master.id}
              mood="idle"
              size="xs"
            />
          </div>

          <div className="flex flex-col items-start pr-2">
            <div className="flex items-center gap-1.5">
              <span className="font-headline font-black text-xs text-on-surface">
                {master.name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] text-outline font-medium">
              Ask GuideMaster...
            </span>
          </div>

          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-xs group-hover:scale-110 transition-transform"
            style={{ backgroundColor: master.color.primary }}
          >
            <Sparkles size={14} />
          </div>
        </button>
      )}
    </div>
  );
};
