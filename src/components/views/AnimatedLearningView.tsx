import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Search, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  X, 
  Maximize2, 
  ExternalLink,
  SlidersHorizontal,
  Box,
  Layers,
  ShieldCheck,
  Cpu,
  Radio,
  BookOpen,
  BarChart3,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { ANIMATED_MODULES, AnimatedModuleMetadata } from '../../data/animatedModulesData';

interface AnimatedLearningViewProps {
  onNavigateHome?: () => void;
  onNavigate?: (tab: string) => void;
}

type CategoryFilter = 'All' | 'Transport Layer' | 'Network Layer' | 'Security' | 'Algorithms' | 'Routing';

// Durations and specific theme metadata matching the reference design
interface ModuleCardTheme {
  duration: string;
  categoryTag: string;
  badgeBg: string;
  badgeText: string;
  layerBadgeBg: string;
  layerBadgeText: string;
  btnGradient: string;
  cardBorder: string;
  cardBg: string;
  illustrationType: string;
}

const MODULE_THEMES: Record<number, ModuleCardTheme> = {
  1: {
    duration: '12 min',
    categoryTag: 'Transport Layer',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/60',
    badgeText: 'text-sky-600 dark:text-sky-300',
    layerBadgeBg: 'bg-teal-50 dark:bg-teal-950/60',
    layerBadgeText: 'text-teal-600 dark:text-teal-300',
    btnGradient: 'bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 shadow-blue-500/25',
    cardBorder: 'border-blue-100/80 dark:border-blue-900/40',
    cardBg: 'bg-gradient-to-br from-blue-50/40 via-white to-cyan-50/30 dark:from-slate-900 dark:via-[#0c1424] dark:to-slate-900',
    illustrationType: 'server-layers'
  },
  2: {
    duration: '15 min',
    categoryTag: 'Transport Layer',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
    badgeText: 'text-purple-600 dark:text-purple-300',
    layerBadgeBg: 'bg-fuchsia-50 dark:bg-fuchsia-950/60',
    layerBadgeText: 'text-fuchsia-600 dark:text-fuchsia-300',
    btnGradient: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-purple-500/25',
    cardBorder: 'border-purple-100/80 dark:border-purple-900/40',
    cardBg: 'bg-gradient-to-br from-purple-50/40 via-white to-violet-50/30 dark:from-slate-900 dark:via-[#0c1424] dark:to-slate-900',
    illustrationType: 'code-laptop'
  },
  3: {
    duration: '14 min',
    categoryTag: 'Transport Layer',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    layerBadgeBg: 'bg-orange-50 dark:bg-orange-950/60',
    layerBadgeText: 'text-orange-600 dark:text-orange-300',
    btnGradient: 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 shadow-orange-500/25',
    cardBorder: 'border-orange-100/80 dark:border-orange-900/40',
    cardBg: 'bg-gradient-to-br from-orange-50/40 via-white to-amber-50/30 dark:from-slate-900 dark:via-[#0c1424] dark:to-slate-900',
    illustrationType: 'geometric-cubes'
  },
  4: {
    duration: '10 min',
    categoryTag: 'Transport Layer',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-600 dark:text-emerald-300',
    layerBadgeBg: 'bg-teal-50 dark:bg-teal-950/60',
    layerBadgeText: 'text-teal-600 dark:text-teal-300',
    btnGradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-emerald-500/25',
    cardBorder: 'border-emerald-100/80 dark:border-emerald-900/40',
    cardBg: 'bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 dark:from-slate-900 dark:via-[#0c1424] dark:to-slate-900',
    illustrationType: 'ack-seq-nodes'
  },
  5: {
    duration: '18 min',
    categoryTag: 'Transport Layer',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
    badgeText: 'text-rose-600 dark:text-rose-300',
    layerBadgeBg: 'bg-red-50 dark:bg-red-950/60',
    layerBadgeText: 'text-red-600 dark:text-red-300',
    btnGradient: 'bg-gradient-to-r from-rose-500 via-red-500 to-pink-600 shadow-rose-500/25',
    cardBorder: 'border-rose-100/80 dark:border-rose-900/40',
    cardBg: 'bg-gradient-to-br from-rose-50/40 via-white to-red-50/30 dark:from-slate-900 dark:via-[#0c1424] dark:to-slate-900',
    illustrationType: 'tcp-handshake'
  },
  6: {
    duration: '10 min',
    categoryTag: 'Transport Layer',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/60',
    badgeText: 'text-sky-600 dark:text-sky-300',
    layerBadgeBg: 'bg-blue-50 dark:bg-blue-950/60',
    layerBadgeText: 'text-blue-600 dark:text-blue-300',
    btnGradient: 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 shadow-blue-500/25',
    cardBorder: 'border-sky-100/80 dark:border-sky-900/40',
    cardBg: 'bg-gradient-to-br from-sky-50/40 via-white to-blue-50/30 dark:from-slate-900 dark:via-[#0c1424] dark:to-slate-900',
    illustrationType: 'udp-paper-plane'
  },
  7: {
    duration: '16 min',
    categoryTag: 'Transport Layer',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
    badgeText: 'text-purple-600 dark:text-purple-300',
    layerBadgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    layerBadgeText: 'text-indigo-600 dark:text-indigo-300',
    btnGradient: 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-indigo-500/25',
    cardBorder: 'border-purple-100/80 dark:border-purple-900/40',
    cardBg: 'bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/30 dark:from-slate-900 dark:via-[#0c1424] dark:to-slate-900',
    illustrationType: 'purple-shield'
  },
  8: {
    duration: '14 min',
    categoryTag: 'Transport Layer',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/60',
    badgeText: 'text-teal-600 dark:text-teal-300',
    layerBadgeBg: 'bg-cyan-50 dark:bg-cyan-950/60',
    layerBadgeText: 'text-cyan-600 dark:text-cyan-300',
    btnGradient: 'bg-gradient-to-r from-teal-500 via-emerald-500 to-green-600 shadow-teal-500/25',
    cardBorder: 'border-teal-100/80 dark:border-teal-900/40',
    cardBg: 'bg-gradient-to-br from-teal-50/40 via-white to-emerald-50/30 dark:from-slate-900 dark:via-[#0c1424] dark:to-slate-900',
    illustrationType: 'teal-shield'
  },
  9: {
    duration: '16 min',
    categoryTag: 'Transport Layer',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    layerBadgeBg: 'bg-yellow-50 dark:bg-yellow-950/60',
    layerBadgeText: 'text-yellow-600 dark:text-yellow-300',
    btnGradient: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 shadow-amber-500/25',
    cardBorder: 'border-amber-100/80 dark:border-amber-900/40',
    cardBg: 'bg-gradient-to-br from-amber-50/40 via-white to-yellow-50/30 dark:from-slate-900 dark:via-[#0c1424] dark:to-slate-900',
    illustrationType: 'golden-padlock'
  }
};

export const AnimatedLearningView: React.FC<AnimatedLearningViewProps> = ({ onNavigateHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [activeSimulationModal, setActiveSimulationModal] = useState<AnimatedModuleMetadata | null>(null);

  // Filter modules based on Search Query and Category
  const filteredModules = useMemo(() => {
    return ANIMATED_MODULES.filter((mod) => {
      // Search matching
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        mod.title.toLowerCase().includes(q) || 
        mod.description.toLowerCase().includes(q) || 
        `module ${mod.id}`.includes(q);

      if (!matchSearch) return false;

      // Category matching
      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Transport Layer') return mod.unit.includes('Transport Layer');
      if (selectedCategory === 'Network Layer') return mod.unit.includes('Network Layer');
      if (selectedCategory === 'Security') return mod.title.includes('Security') || mod.title.includes('SSL') || mod.title.includes('TLS') || mod.title.includes('SSH');
      if (selectedCategory === 'Algorithms') return mod.title.toLowerCase().includes('algorithm') || mod.description.toLowerCase().includes('algorithm') || mod.id === 12;
      if (selectedCategory === 'Routing') return mod.title.toLowerCase().includes('routing') || mod.description.toLowerCase().includes('routing');

      return true;
    });
  }, [searchQuery, selectedCategory]);

  const handleLaunchSimulation = (mod: AnimatedModuleMetadata) => {
    soundFx.playClick();
    setActiveSimulationModal(mod);
  };

  // Helper to render customized 3D vector illustrations matching the exact reference image
  const renderCardIllustration = (modId: number) => {
    const theme = MODULE_THEMES[modId] || {
      illustrationType: modId % 2 === 0 ? 'server-layers' : 'code-laptop'
    };

    switch (theme.illustrationType) {
      case 'server-layers':
        // 3D Layered Server Disks (Module 1)
        return (
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center pointer-events-none select-none shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="diskBlueTop" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
                <linearGradient id="diskBlueSide" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1D4ED8" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
                <linearGradient id="diskPurpleTop" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
                <linearGradient id="diskPurpleSide" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6D28D9" />
                  <stop offset="100%" stopColor="#4C1D95" />
                </linearGradient>
              </defs>
              {/* Bottom disk */}
              <path d="M25 80 C25 72 95 72 95 80 L95 90 C95 98 25 98 25 90 Z" fill="url(#diskBlueSide)" />
              <ellipse cx="60" cy="80" rx="35" ry="12" fill="url(#diskBlueTop)" />
              
              {/* Middle disk */}
              <path d="M25 58 C25 50 95 50 95 58 L95 68 C95 76 25 76 25 68 Z" fill="url(#diskPurpleSide)" />
              <ellipse cx="60" cy="58" rx="35" ry="12" fill="url(#diskPurpleTop)" />

              {/* Top disk */}
              <path d="M25 36 C25 28 95 28 95 36 L95 46 C95 54 25 54 25 46 Z" fill="url(#diskBlueSide)" />
              <ellipse cx="60" cy="36" rx="35" ry="12" fill="url(#diskBlueTop)" />

              {/* Floating isometric data cubes */}
              <polygon points="18,48 24,44 30,48 24,52" fill="#67E8F9" />
              <polygon points="18,48 24,52 24,58 18,54" fill="#06B6D4" />
              <polygon points="30,48 24,52 24,58 30,54" fill="#0891B2" />

              <polygon points="90,32 96,28 102,32 96,36" fill="#F472B6" />
              <polygon points="90,32 96,36 96,42 90,38" fill="#EC4899" />
              <polygon points="102,32 96,36 96,42 102,38" fill="#DB2777" />
            </svg>
          </div>
        );

      case 'code-laptop':
        // 3D Open Laptop with glowing windows (Module 2)
        return (
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center pointer-events-none select-none shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="laptopScreen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
                <linearGradient id="docPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E9D5FF" />
                  <stop offset="100%" stopColor="#C084FC" />
                </linearGradient>
              </defs>
              {/* Floating code window document */}
              <rect x="20" y="24" width="28" height="38" rx="4" fill="url(#docPurple)" transform="rotate(-10 34 43)" opacity="0.9" />
              <line x1="24" y1="32" x2="42" y2="29" stroke="#7E22CE" strokeWidth="2" strokeLinecap="round" />
              <line x1="25" y1="38" x2="40" y2="35" stroke="#7E22CE" strokeWidth="2" strokeLinecap="round" />
              <line x1="26" y1="44" x2="38" y2="41" stroke="#7E22CE" strokeWidth="2" strokeLinecap="round" />

              {/* 3D Isometric Laptop Screen */}
              <polygon points="45,35 95,20 105,62 55,75" fill="#1E1B4B" rx="2" />
              <polygon points="48,37 92,24 101,60 57,72" fill="url(#laptopScreen)" />
              
              {/* Screen code lines */}
              <line x1="56" y1="45" x2="84" y2="36" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" />
              <line x1="58" y1="52" x2="90" y2="42" stroke="#67E8F9" strokeWidth="2" strokeLinecap="round" />
              <line x1="60" y1="59" x2="78" y2="53" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />

              {/* Laptop Keyboard Base */}
              <polygon points="55,75 105,62 88,88 38,98" fill="#475569" />
              <polygon points="56,76 102,64 86,86 42,96" fill="#334155" />
              {/* Trackpad */}
              <polygon points="60,86 75,82 72,90 57,93" fill="#64748B" />
            </svg>
          </div>
        );

      case 'geometric-cubes':
        // 3D Isometric Geometric Cubes (Module 3)
        return (
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center pointer-events-none select-none shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
              {/* Top gold cube */}
              <g transform="translate(68, 26)">
                <polygon points="16,0 32,8 16,16 0,8" fill="#FDE047" />
                <polygon points="0,8 16,16 16,34 0,26" fill="#EAB308" />
                <polygon points="16,16 32,8 32,26 16,34" fill="#CA8A04" />
              </g>

              {/* Middle orange cube */}
              <g transform="translate(42, 48)">
                <polygon points="16,0 32,8 16,16 0,8" fill="#FDBA74" />
                <polygon points="0,8 16,16 16,34 0,26" fill="#F97316" />
                <polygon points="16,16 32,8 32,26 16,34" fill="#EA580C" />
              </g>

              {/* Bottom pink-red cube */}
              <g transform="translate(76, 62)">
                <polygon points="16,0 32,8 16,16 0,8" fill="#F472B6" />
                <polygon points="0,8 16,16 16,34 0,26" fill="#EC4899" />
                <polygon points="16,16 32,8 32,26 16,34" fill="#DB2777" />
              </g>

              <circle cx="34" cy="38" r="2.5" fill="#FBBF24" />
              <circle cx="106" cy="46" r="3" fill="#FB923C" />
            </svg>
          </div>
        );

      case 'ack-seq-nodes':
        // ACK & SEQ Nodes Channel (Module 4)
        return (
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center pointer-events-none select-none shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
              {/* Connection stream line */}
              <line x1="38" y1="62" x2="88" y2="76" stroke="#2DD4BF" strokeWidth="2.5" strokeDasharray="4 3" />
              
              {/* Left Green Node */}
              <g transform="translate(18, 52)">
                <polygon points="14,0 28,7 14,14 0,7" fill="#6EE7B7" />
                <polygon points="0,7 14,14 14,28 0,21" fill="#10B981" />
                <polygon points="14,14 28,7 28,21 14,28" fill="#059669" />
              </g>

              {/* Right Purple Node */}
              <g transform="translate(76, 66)">
                <polygon points="14,0 28,7 14,14 0,7" fill="#A5B4FC" />
                <polygon points="0,7 14,14 14,28 0,21" fill="#6366F1" />
                <polygon points="14,14 28,7 28,21 14,28" fill="#4F46E5" />
              </g>

              {/* Floating ACK pill badge */}
              <g transform="translate(44, 38)">
                <rect width="28" height="15" rx="4" fill="#10B981" />
                <text x="14" y="11" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">ACK</text>
              </g>

              {/* Floating SEQ pill badge */}
              <g transform="translate(74, 46)">
                <rect width="28" height="15" rx="4" fill="#06B6D4" />
                <text x="14" y="11" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">SEQ</text>
              </g>
            </svg>
          </div>
        );

      case 'tcp-handshake':
        // Red Monoliths with SYN, ACK, FIN badges (Module 5)
        return (
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center pointer-events-none select-none shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
              {/* Left red server tower */}
              <path d="M22 45 C22 40 38 40 38 45 L38 85 C38 90 22 90 22 85 Z" fill="#E11D48" />
              <ellipse cx="30" cy="45" rx="8" ry="4" fill="#FB7185" />
              <ellipse cx="30" cy="58" rx="8" ry="3" fill="#BE123C" />
              <ellipse cx="30" cy="72" rx="8" ry="3" fill="#9F1239" />

              {/* Right red server tower */}
              <path d="M82 45 C82 40 98 40 98 45 L98 85 C98 90 82 90 82 85 Z" fill="#E11D48" />
              <ellipse cx="90" cy="45" rx="8" ry="4" fill="#FB7185" />
              <ellipse cx="90" cy="58" rx="8" ry="3" fill="#BE123C" />
              <ellipse cx="90" cy="72" rx="8" ry="3" fill="#9F1239" />

              {/* Middle SYN, ACK, FIN badges */}
              <g transform="translate(48, 38)">
                <rect width="24" height="12" rx="6" fill="#F43F5E" />
                <text x="12" y="9" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="monospace">SYN</text>
              </g>

              <g transform="translate(48, 55)">
                <rect width="24" height="12" rx="6" fill="#E11D48" />
                <text x="12" y="9" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="monospace">ACK</text>
              </g>

              <g transform="translate(48, 72)">
                <rect width="24" height="12" rx="6" fill="#BE123C" />
                <text x="12" y="9" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="monospace">FIN</text>
              </g>
            </svg>
          </div>
        );

      case 'udp-paper-plane':
        // Supersonic 3D Paper Airplane with Speed Trail (Module 6)
        return (
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center pointer-events-none select-none shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
              {/* Cyan Speed Lines */}
              <line x1="15" y1="62" x2="48" y2="62" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
              <line x1="22" y1="72" x2="62" y2="72" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <line x1="18" y1="52" x2="52" y2="52" stroke="#7DD3FC" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

              {/* 3D Paper Airplane */}
              <g transform="translate(45, 30)">
                <polygon points="58,18 0,48 24,52" fill="#0284C7" />
                <polygon points="58,18 24,52 22,66" fill="#0369A1" />
                <polygon points="58,18 24,52 42,42" fill="#38BDF8" />
                <polygon points="58,18 42,42 20,40" fill="#BAE6FD" />
              </g>

              {/* Trailing data cubes */}
              <polygon points="20,80 25,77 30,80 25,83" fill="#38BDF8" />
              <polygon points="10,42 15,39 20,42 15,45" fill="#7DD3FC" />
            </svg>
          </div>
        );

      case 'purple-shield':
        // Glowing Purple Shield with Padlock (Module 7)
        return (
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center pointer-events-none select-none shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="shieldPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
              </defs>
              {/* Orbital aura ring */}
              <ellipse cx="60" cy="62" rx="42" ry="14" fill="none" stroke="#C084FC" strokeWidth="1.5" strokeDasharray="6 4" transform="rotate(-15 60 62)" opacity="0.8" />
              
              {/* Outer Shield */}
              <path d="M60 22 C78 22 92 32 92 48 C92 74 60 96 60 96 C60 96 28 74 28 48 C28 32 42 22 60 22 Z" fill="url(#shieldPurple)" filter="drop-shadow(0 4px 10px rgba(79, 70, 229, 0.4))" />
              
              {/* Padlock Icon Inside Shield */}
              <rect x="50" y="54" width="20" height="16" rx="3" fill="#FFFFFF" />
              <path d="M54 54 V46 C54 42.5 66 42.5 66 46 V54" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="60" cy="62" r="2" fill="#4F46E5" />
            </svg>
          </div>
        );

      case 'teal-shield':
        // Glowing Cyan/Teal Shield with Radar Pulse (Module 8)
        return (
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center pointer-events-none select-none shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="shieldTeal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2DD4BF" />
                  <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
              </defs>
              {/* Concentric radar pulse arcs */}
              <circle cx="60" cy="60" r="42" fill="none" stroke="#5EEAD4" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.6" />
              <circle cx="60" cy="60" r="32" fill="none" stroke="#2DD4BF" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />

              {/* Outer Shield */}
              <path d="M60 25 C76 25 88 34 88 48 C88 72 60 92 60 92 C60 92 32 72 32 48 C32 34 44 25 60 25 Z" fill="url(#shieldTeal)" filter="drop-shadow(0 4px 10px rgba(13, 148, 136, 0.4))" />

              {/* Padlock Inside */}
              <rect x="52" y="54" width="16" height="14" rx="2.5" fill="#FFFFFF" />
              <path d="M55 54 V47 C55 44 65 44 65 47 V54" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              <circle cx="60" cy="61" r="1.5" fill="#0D9488" />
            </svg>
          </div>
        );

      case 'golden-padlock':
      default:
        // 3D Golden Padlock on Beveled Pedestal (Module 9)
        return (
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center pointer-events-none select-none shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="goldPadlock" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE047" />
                  <stop offset="50%" stopColor="#FACC15" />
                  <stop offset="100%" stopColor="#CA8A04" />
                </linearGradient>
              </defs>
              {/* Pedestal Base */}
              <polygon points="60,82 98,68 60,54 22,68" fill="#FEF08A" />
              <polygon points="22,68 60,82 60,94 22,80" fill="#FACC15" />
              <polygon points="60,82 98,68 98,80 60,94" fill="#EAB308" />

              {/* Golden Padlock Body */}
              <g transform="translate(42, 28)">
                {/* Shackle */}
                <path d="M10 26 V15 C10 6 26 6 26 15 V26" fill="none" stroke="#FDE047" strokeWidth="5" strokeLinecap="round" />
                <path d="M10 26 V15 C10 6 26 6 26 15 V26" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" />
                
                {/* Body */}
                <rect x="4" y="24" width="28" height="26" rx="5" fill="url(#goldPadlock)" filter="drop-shadow(0 4px 6px rgba(202, 138, 4, 0.4))" />
                {/* Keyhole */}
                <circle cx="18" cy="34" r="2.5" fill="#713F12" />
                <polygon points="17,34 19,34 20,41 16,41" fill="#713F12" />
              </g>

              {/* Sparkles */}
              <polygon points="24,36 26,30 28,36 34,38 28,40 26,46 24,40 18,38" fill="#FBBF24" />
              <polygon points="94,44 95,40 96,44 100,45 96,46 95,50 94,46 90,45" fill="#FDE047" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="w-full min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans select-none animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & 3D NETWORK HERO GRAPHIC                                   */}
      {/* ========================================================================= */}
      <div className="relative mb-8 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left: Titles, Badges, Features */}
          <div className="space-y-3.5 max-w-2xl">
            {/* Top Pill Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 uppercase tracking-wider">
                CURRICULUM SIMULATIONS
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 font-mono">
                Modules 1–30
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Standalone{' '}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Animated Learning
              </span>{' '}
              Labs
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
              Dedicated isolated visual simulations for networking protocols, packet journeys, and security mechanisms.
            </p>

            {/* Feature Pills Row */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/40 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                <Box className="w-3.5 h-3.5 text-blue-500" />
                <span>30+ Interactive Labs</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <Play className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                <span>Visual Simulations</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50/80 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/40 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                <span>Self-Paced Learning</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/40 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                <span>Concept to Visualization</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50/80 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/40 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                <span>Network & Security Focused</span>
              </div>
            </div>
          </div>

          {/* Right: 3D Isometric Laptop & Server Stack Illustration (Matching reference image) */}
          <div className="hidden lg:flex items-center justify-center shrink-0 w-80 h-44 relative pointer-events-none select-none">
            <svg viewBox="0 0 320 180" className="w-full h-full drop-shadow-xl">
              <defs>
                <linearGradient id="heroLaptopScreen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E1B4B" />
                  <stop offset="100%" stopColor="#312E81" />
                </linearGradient>
                <linearGradient id="heroServerBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
              </defs>

              {/* Ambient Glow */}
              <ellipse cx="160" cy="110" rx="110" ry="40" fill="#38BDF8" opacity="0.15" filter="blur(20px)" />

              {/* 3D Isometric Laptop */}
              <g transform="translate(60, 20)">
                {/* Screen */}
                <polygon points="30,40 120,10 135,75 45,105" fill="#0F172A" />
                <polygon points="34,43 116,15 130,73 48,101" fill="url(#heroLaptopScreen)" />
                {/* Graph topology lines on screen */}
                <line x1="60" y1="55" x2="85" y2="45" stroke="#38BDF8" strokeWidth="2" />
                <line x1="85" y1="45" x2="110" y2="60" stroke="#38BDF8" strokeWidth="2" />
                <line x1="60" y1="55" x2="80" y2="80" stroke="#818CF8" strokeWidth="2" />
                <circle cx="60" cy="55" r="4" fill="#67E8F9" />
                <circle cx="85" cy="45" r="4" fill="#38BDF8" />
                <circle cx="110" cy="60" r="4" fill="#818CF8" />
                <circle cx="80" cy="80" r="4" fill="#C084FC" />

                {/* Base */}
                <polygon points="45,105 135,75 110,120 20,150" fill="#334155" />
                <polygon points="47,106 131,77 107,118 25,147" fill="#1E293B" />
              </g>

              {/* 3D Isometric Server Stack Disks on Right */}
              <g transform="translate(230, 30)">
                {/* Bottom disk */}
                <path d="M10 80 C10 70 60 70 60 80 L60 92 C60 102 10 102 10 92 Z" fill="#1E40AF" />
                <ellipse cx="35" cy="80" rx="25" ry="9" fill="#2563EB" />

                {/* Middle disk */}
                <path d="M10 55 C10 45 60 45 60 55 L60 67 C60 77 10 77 10 67 Z" fill="#1D4ED8" />
                <ellipse cx="35" cy="55" rx="25" ry="9" fill="#38BDF8" />

                {/* Top disk */}
                <path d="M10 30 C10 20 60 20 60 30 L60 42 C60 52 10 52 10 42 Z" fill="#1E40AF" />
                <ellipse cx="35" cy="30" rx="25" ry="9" fill="#60A5FA" />

                {/* Blinking server lights */}
                <circle cx="20" cy="86" r="1.5" fill="#34D399" />
                <circle cx="26" cy="86" r="1.5" fill="#60A5FA" />
                <circle cx="20" cy="61" r="1.5" fill="#34D399" />
                <circle cx="26" cy="61" r="1.5" fill="#60A5FA" />
              </g>

              {/* Floating network packets */}
              <polygon points="190,50 196,47 202,50 196,53" fill="#38BDF8" />
              <polygon points="215,85 220,82 225,85 220,88" fill="#F472B6" />
            </svg>
          </div>

        </div>

        {/* Search & Category Filter Navigation */}
        <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules, protocols, or topics..."
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-full text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-xs transition-colors"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Category Filter Pills (Exact Match to Reference Image) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'Transport Layer', 'Network Layer', 'Security', 'Algorithms', 'Routing'] as CategoryFilter[]).map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedCategory(cat);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CARD GRID (3 COLUMNS - EXACT VISUAL MATCH TO REFERENCE IMAGE)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((mod) => {
          const theme = MODULE_THEMES[mod.id] || {
            duration: '15 min',
            categoryTag: 'Transport Layer',
            badgeBg: 'bg-slate-100 dark:bg-slate-800',
            badgeText: 'text-slate-700 dark:text-slate-300',
            layerBadgeBg: 'bg-blue-50 dark:bg-blue-950/60',
            layerBadgeText: 'text-blue-600 dark:text-blue-300',
            btnGradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25',
            cardBorder: 'border-slate-200/80 dark:border-slate-800',
            cardBg: 'bg-white dark:bg-[#0c1424]',
            illustrationType: 'server-layers'
          };

          return (
            <div
              key={mod.id}
              className={`rounded-[2rem] p-6 border ${theme.cardBorder} ${theme.cardBg} shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(79,70,229,0.09)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative group`}
            >
              {/* Card Top: Badges + Title + Description + 3D Illustration */}
              <div>
                {/* Category & Module Pills */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold font-mono ${theme.badgeBg} ${theme.badgeText}`}>
                    Module {mod.id}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold font-mono ${theme.layerBadgeBg} ${theme.layerBadgeText}`}>
                    {theme.categoryTag}
                  </span>
                </div>

                {/* Content & Illustration Row */}
                <div className="flex items-start justify-between gap-3 mt-3.5">
                  <div className="min-w-0 pr-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 line-clamp-3">
                      {mod.description}
                    </p>
                  </div>

                  {/* 3D Custom Illustration */}
                  {renderCardIllustration(mod.id)}
                </div>
              </div>

              {/* Card Footer: Launch Simulation Button + Estimated Time */}
              <div className="pt-5 mt-4 border-t border-slate-100/80 dark:border-slate-800/60 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleLaunchSimulation(mod)}
                  className={`py-2.5 px-5 rounded-full ${theme.btnGradient} text-white font-bold text-xs flex items-center gap-2 shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer group`}
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Launch Simulation</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 font-mono shrink-0">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{theme.duration}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. SIMULATION MODAL OVERLAY (INTEGRATED LIVE HTML SIMULATOR)              */}
      {/* ========================================================================= */}
      {activeSimulationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl h-[90vh] bg-white dark:bg-[#0c1424] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-600 text-white">
                  Module {activeSimulationModal.id}
                </span>
                <div className="min-w-0">
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {activeSimulationModal.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    {activeSimulationModal.unit}
                  </p>
                </div>
              </div>

              {/* Actions: Open in New Tab & Close */}
              <div className="flex items-center gap-2">
                <a
                  href={`/animated_learn_${activeSimulationModal.id}/index.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Open in Full Window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Tab</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveSimulationModal(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Simulation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Iframe Content */}
            <div className="flex-1 w-full bg-slate-950 relative">
              <iframe
                src={`/animated_learn_${activeSimulationModal.id}/index.html`}
                title={activeSimulationModal.title}
                className="w-full h-full border-0"
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
