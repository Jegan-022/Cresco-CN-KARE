import React, { useState } from 'react';
import { NavTab } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Network, 
  BookOpen, 
  Target, 
  Trophy, 
  Medal, 
  TrendingUp, 
  User, 
  LogOut, 
  Menu, 
  X, 
  HelpCircle,
  Search,
  Layers,
  LayoutDashboard,
  Terminal
} from 'lucide-react';

interface NavbarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  onSearch
}) => {
  const { userProfile, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isDeveloper = userProfile?.role === 'developer';

  const baseNavItems: { id: NavTab; label: string; icon: any }[] = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Curriculum (45)', icon: Layers },
    { id: 'practice', label: 'Practice', icon: Target },
    { id: 'quiz', label: 'Quiz Arena', icon: HelpCircle },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'achievements', label: 'Achievements', icon: Medal },
    { id: 'analytics', label: 'Progress', icon: TrendingUp },
  ];

  const desktopNavItems = isDeveloper
    ? [...baseNavItems, { id: 'developer-dashboard' as NavTab, label: 'Dev Console', icon: Terminal }]
    : baseNavItems;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#1c1d21]/95  border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => onNavigate('home')}
                className="flex items-center space-x-3 text-white hover:text-cyan-300 transition-colors group cursor-pointer"
              >
                <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-cyan-400/40 shadow-[0_4px_12px_rgba(6,182,212,0.3)] group-hover:scale-108 group-hover:rotate-2 transition-all duration-300 shrink-0 bg-gradient-to-br from-[#0d3b46] to-[#08252d] flex items-center justify-center">
                  <img 
                    src="/assets/brand/cresco-favicon.png" 
                    alt="Cresco CN Mascot Logo" 
                    className="w-full h-full object-contain p-0.5" 
                  />
                  <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 shadow-xs animate-packet-beacon" />
                </div>
                <span className="font-headline font-black text-2xl tracking-tight text-white hidden sm:flex items-center gap-1">
                  CRESCO<span className="text-cyan-400 font-black">-CN</span>
                </span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {desktopNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-500/10 text-blue-400' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Menu & Mobile Toggle */}
            <div className="flex items-center space-x-3">
              {onSearch && (
                <button
                  onClick={onSearch}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer text-xs"
                  title="Search Curriculum (Ctrl + K)"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden lg:inline text-xs text-slate-400">Search</span>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 border border-slate-700 rounded text-slate-400">Ctrl K</kbd>
                </button>
              )}

              {isDeveloper ? (
                <div className="hidden md:flex items-center space-x-2 border-r border-purple-800/80 pr-3 mr-1">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-purple-400 font-mono flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                      <span>DEV ROOT</span>
                    </span>
                    <span className="text-[10px] text-purple-300/80 font-mono">{userProfile?.studentId || 'DEV'}</span>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2 border-r border-slate-700 pr-3 mr-1">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-bold text-white">{userProfile?.totalXP || 0} XP</span>
                    <span className="text-xs text-amber-500 font-medium">Lvl {Math.floor((userProfile?.totalXP || 0) / 400) + 1}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => onNavigate('profile')}
                className={`p-2 rounded-full transition-colors hidden md:block ${
                  activeTab === 'profile' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <User className="w-5 h-5" />
              </button>
              
              <button
                onClick={logout}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 hidden md:block transition-colors"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-[#1c1d21] pt-16 md:hidden">
          <div className="px-4 py-6 space-y-2">
            {[...desktopNavItems, { id: 'profile', label: 'Profile', icon: User }].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id as NavTab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full space-x-3 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-500/10 text-blue-400' 
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => { logout(); setIsMobileMenuOpen(false); }}
              className="flex items-center w-full space-x-3 px-4 py-4 rounded-xl text-lg font-medium text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-6 h-6" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
