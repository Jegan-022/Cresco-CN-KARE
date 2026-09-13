import React, { useState, useEffect } from 'react';
import { NavTab, UserRole, CourseSection, PracticeCategory } from './types';
import { 
  PRIMARY_COURSE, 
  SECONDARY_COURSES, 
  COURSE_SECTIONS, 
  PRACTICE_CATEGORIES, 
  STUDENT_PROFILE, 
  TEACHER_STATS 
} from './data/networkCourse';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { OfflinePersistenceBanner } from './components/OfflinePersistenceBanner';
import { SectionCompletionToast } from './components/SectionCompletionToast';
import { triggerSubtleSectionConfetti } from './utils/confetti';
import { SearchModal } from './components/SearchModal';
import { QuizModal } from './components/QuizModal';
import { PracticeDrillModal } from './components/PracticeDrillModal';
import { NetworkBackground } from './components/background/NetworkBackground';
import { Preloader } from './components/ui/Preloader';

// Modals
import { StreakModal } from './components/modals/StreakModal';
import { LevelProgressModal } from './components/modals/LevelProgressModal';

// 16 Dedicated Screens & Views
import { WelcomeOnboardingView } from './components/views/WelcomeOnboardingView';
import { HomeView } from './components/views/HomeView';
import { LearningMapView } from './components/views/LearningMapView';
import { GamifiedLessonView } from './components/views/GamifiedLessonView';
import { DragDropNetworkView } from './components/views/DragDropNetworkView';
import { PacketSimulatorView } from './components/views/PacketSimulatorView';
import { BossChallengeView } from './components/views/BossChallengeView';
import { DailyChallengeView } from './components/views/DailyChallengeView';
import { PracticeView } from './components/views/PracticeView';
import { SmartReviewView } from './components/views/SmartReviewView';
import { AchievementsView } from './components/views/AchievementsView';
import { LeaderboardView } from './components/views/LeaderboardView';
import { ProfileView } from './components/views/ProfileView';
import { ExamModeView } from './components/views/ExamModeView';
import { NetworkChallengesView } from './components/views/NetworkChallengesView';
import { SettingsView } from './components/views/SettingsView';

// Existing Secondary Supporting Views
import { TeacherDashboardView } from './components/views/TeacherDashboardView';
import { LiveClassroomView } from './components/views/LiveClassroomView';
import { DeveloperDashboardView } from './components/views/DeveloperDashboardView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { MyLearningView } from './components/views/MyLearningView';
import { LoginView } from './components/views/LoginView';
import { PreLaunchView } from './components/views/PreLaunchView';
import { LandingView } from './components/views/LandingView';

import { BootTerminal } from './components/BootTerminal';
import { ErrorBoundary } from './components/errors/ErrorBoundary';
import { Offline403Page } from './components/errors/Offline403Page';
import { ServerCrash404Page } from './components/errors/ServerCrash404Page';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { CharacterProvider, useCharacter } from './context/CharacterContext';

function MainApp() {
  const { currentUser, userProfile, loading, recordModuleCompletion } = useAuth();
  const { isOnline } = useNetworkStatus();
  const { isCharacterHubOpen, closeCharacterHub } = useCharacter();

  // Navigation State - defaults to 'home'
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [authPortalMode, setAuthPortalMode] = useState<'prelaunch' | 'login' | 'landing'>('prelaunch');
  const [selectedPortal, setSelectedPortal] = useState<'student' | 'developer' | 'teacher'>('student');
  
  // Gamified User State (XP, Streak, Hearts) - Clean 0 baseline for student login
  const [userStats, setUserStats] = useState({
    streak: 0,
    xp: 0,
    hearts: 5,
  });

  // Active Lesson Pointer - starts at Unit 3 Module 1
  const [activeLessonId, setActiveLessonId] = useState<string>('u3_m01');
  const [activeSectionId, setActiveSectionId] = useState<number>(3);

  // Curriculum State
  const [sections, setSections] = useState<CourseSection[]>(COURSE_SECTIONS);
  const [course, setCourse] = useState(PRIMARY_COURSE);
  const [studentProfile, setStudentProfile] = useState(STUDENT_PROFILE);

  // Modals State
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [activePracticeCategory, setActivePracticeCategory] = useState<PracticeCategory | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [pendingWritesCount, setPendingWritesCount] = useState(0);
  const [isPostLoginLoading, setIsPostLoginLoading] = useState(false);
  const [sectionCompletionCelebration, setSectionCompletionCelebration] = useState<{
    sectionTitle: string;
    bonusXp: number;
  } | null>(null);

  // Global Ctrl + K search shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Synchronize authenticated user profile & restore genuine metrics from Firebase
  useEffect(() => {
    if (!currentUser) return;

    setStudentProfile((prev) => ({
      ...prev,
      name: userProfile?.displayName || currentUser.displayName || prev.name,
      email: currentUser.email || prev.email,
    }));
    if (userProfile?.role) {
      setUserRole(userProfile.role);
      if (userProfile.role === 'developer' && currentTab === 'home') {
        setCurrentTab('developer-dashboard');
      }
    }

    // Strictly sync real streak & XP from userProfile (default to 0 for new students)
    setUserStats({
      streak: userProfile?.streak ?? 0,
      xp: userProfile?.totalXP ?? userProfile?.xp ?? 0,
      hearts: 5,
    });

    let unsubscribe = () => {};
    if (isSupabaseConfigured() && currentUser?.uid) {
      try {
        const channel = supabase
          .channel(`lesson_completions_${currentUser.uid}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'lesson_completions',
              filter: `user_id=eq.${currentUser.uid}`,
            },
            () => {
              setPendingWritesCount(0);
            }
          )
          .subscribe();

        unsubscribe = () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.warn('Supabase realtime listener fallback:', err);
      }
    }

    return () => unsubscribe();
  }, [currentUser, userProfile]);

  // Navigation handlers
  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSelectLesson = (lessonId: string, sectionId: number) => {
    setActiveLessonId(lessonId);
    setActiveSectionId(sectionId);
    setCurrentTab('lesson-player');
    document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleNavigate = (tab: NavTab, lessonId?: string, sectionId?: number) => {
    if (tab === 'guidemaster-select' || tab === 'companion-select') {
      setCurrentTab('home');
      return;
    }
    if (tab === 'developer-dashboard' && userProfile?.role !== 'developer') {
      setCurrentTab('home');
      return;
    }
    if (lessonId !== undefined) {
      setActiveLessonId(lessonId);
    }
    if (sectionId !== undefined) {
      setActiveSectionId(sectionId);
    }
    if (tab === 'streak') {
      setIsStreakModalOpen(true);
      return;
    }
    if (tab === 'level') {
      setIsLevelModalOpen(true);
      return;
    }
    setCurrentTab(tab);
    document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Loading State while Firebase resolves
  if (loading) {
    return <BootTerminal />;
  }

  // Pre-Launch Gateway for Unauthenticated Visitors
  if (!currentUser) {
    if (authPortalMode === 'login') {
      return (
        <LoginView
          initialPortal={selectedPortal}
          onCancel={() => setAuthPortalMode('prelaunch')}
          onSuccess={() => {
            setIsPostLoginLoading(true);
            setAuthPortalMode('prelaunch');
            setCurrentTab('home');
          }}
        />
      );
    }
    if (authPortalMode === 'landing') {
      return (
        <LandingView
          onNavigateToLogin={() => setAuthPortalMode('login')}
          onNavigateToSignup={() => setAuthPortalMode('login')}
          onNavigateToLaunch={() => setAuthPortalMode('prelaunch')}
        />
      );
    }
    return (
      <PreLaunchView
        onNavigateToLogin={() => setAuthPortalMode('login')}
        onNavigateToLanding={() => setAuthPortalMode('landing')}
      />
    );
  }

  // Preview Pre-Launch Countdown when explicitly requested
  if (currentTab === 'prelaunch') {
    return (
      <PreLaunchView
        onNavigateToLogin={() => setCurrentTab('home')}
        onNavigateToLanding={() => setCurrentTab('landing')}
      />
    );
  }

  // Preview Landing Page when explicitly requested
  if (currentTab === 'landing') {
    return (
      <LandingView
        onNavigateToLogin={() => setCurrentTab('home')}
        onNavigateToSignup={() => setCurrentTab('home')}
        onNavigateToLaunch={() => setCurrentTab('prelaunch')}
      />
    );
  }

  // SCREEN 01 — WELCOME / ONBOARDING (if tab is 'welcome')
  if (currentTab === 'welcome') {
    return (
      <WelcomeOnboardingView
        onStart={() => setCurrentTab('home')}
        onKnowBasics={() => {
          setActiveSectionId(1);
          setCurrentTab('learn-map');
        }}
        onSignIn={() => handleOpenAuth('login')}
      />
    );
  }

  // SCREEN 04 & 05 — LESSON & INTERACTIVE QUESTION (Full-Screen Mode, No Sidebar!)
  if (currentTab === 'lesson-player') {
    return (
      <GamifiedLessonView
        lessonId={activeLessonId}
        onClose={() => setCurrentTab('learn-map')}
        onCompleteLesson={(earnedXp) => {
          setUserStats((prev) => ({ ...prev, xp: prev.xp + earnedXp }));
          if (recordModuleCompletion) {
            const unitId = activeLessonId.startsWith('u3') ? 'unit-3' : activeLessonId.startsWith('u4') ? 'unit-4' : 'unit-5';
            recordModuleCompletion(activeLessonId, unitId, earnedXp);
          }
        }}
        onNavigateNextLesson={(nextId) => {
          setActiveLessonId(nextId);
        }}
      />
    );
  }

  const studentIdentifier = userProfile?.displayName || userProfile?.studentId || currentUser?.email?.split('@')[0] || 'KLU Student';

  return (
    <Preloader
      loading={isPostLoginLoading}
      duration={2600}
      variant="stairs"
      stairCount={10}
      stairsRevealDirection="up"
      showProgressBar={true}
      progressBarPosition="bottom"
      brandTitle="Cresco CN"
      userIdentifier={studentIdentifier}
      compliments={[
        'Establishing encrypted TLS 1.3 socket...',
        `Authenticating student node: ${studentIdentifier}...`,
        'Verifying Subnet & CIDR routing tables...',
        'Synchronizing OSI 7-Layer Protocol achievements...',
        'High bandwidth verified — academic latency < 1ms!',
        'Access Granted! Directing you to your Dashboard...',
      ]}
      onComplete={() => {
        setIsPostLoginLoading(false);
      }}
    >
      <div className="relative h-[100dvh] min-h-[100dvh] w-full max-w-full bg-surface text-on-surface flex flex-col overflow-hidden font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-300">
        
        {/* Subtle Network Topology Background Mesh (Sections 10 & 11) */}
        <NetworkBackground mode={currentTab === 'exam' ? 'exam' : 'static'} />

        {/* 1. Global Header Bar (Cresco CN platform header) */}
        <Header
          currentTab={currentTab}
          onNavigate={handleNavigate}
          userStats={userStats}
          onOpenStreak={() => setIsStreakModalOpen(true)}
          onOpenLevel={() => setIsLevelModalOpen(true)}
          onSearch={() => setIsSearchOpen(true)}
          onTriggerPreloader={() => setIsPostLoginLoading(true)}
        />

      {/* 2. Main Body: Left Sidebar + Independent Scrollable Content */}
      <div className="flex-1 flex flex-row min-w-0 min-h-0 overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={currentTab}
          onNavigate={handleNavigate}
          onSearch={() => setIsSearchOpen(true)}
        />

        {/* Scrollable Center Area */}
        <div 
          id="main-scroll-container" 
          className="flex-1 flex flex-col min-w-0 h-full min-h-0 overflow-y-auto overflow-x-hidden"
        >
          {/* Offline Persistence Banner */}
          <OfflinePersistenceBanner pendingSyncCount={pendingWritesCount} />

          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 pb-28 sm:pb-24 md:pb-16">
            
            {/* Screen 02: Home */}
            {currentTab === 'home' && (
              <HomeView onNavigate={handleNavigate} userStats={userStats} />
            )}

            {/* Screen 03: The Signature Learning Map */}
            {(currentTab === 'learn-map' || currentTab === 'courses' || currentTab === 'learn') && (
              <LearningMapView
                onSelectLesson={handleSelectLesson}
                onNavigate={handleNavigate}
              />
            )}

            {/* Screen 06: Drag & Drop Network Builder */}
            {currentTab === 'drag-drop' && (
              <DragDropNetworkView
                onComplete={() => handleNavigate('learn-map')}
                onBack={() => handleNavigate('home')}
              />
            )}

            {/* Screen 07: Packet Simulator */}
            {(currentTab === 'simulator' || currentTab === 'lab') && (
              <PacketSimulatorView
                onBack={() => handleNavigate('home')}
              />
            )}

            {/* Challenges & Simulators */}
            {(currentTab === 'boss-challenge' || currentTab === 'challenges') && (
              <NetworkChallengesView
                onRewardXp={(xp) => {
                  setUserStats((prev) => ({ ...prev, xp: prev.xp + xp }));
                }}
                onNavigateToBoss={() => handleNavigate('boss-challenge')}
              />
            )}

            {/* Screen 09: Daily Challenge */}
            {currentTab === 'daily-challenge' && (
              <DailyChallengeView
                onComplete={(xp) => {
                  setUserStats((prev) => ({ ...prev, xp: prev.xp + xp }));
                }}
                onBack={() => handleNavigate('home')}
              />
            )}

            {/* Exam Mode (Sections 27, 28, 29) */}
            {currentTab === 'exam' && (
              <ExamModeView onNavigate={handleNavigate} />
            )}

            {/* Screen 10: Practice */}
            {(currentTab === 'practice' || currentTab === 'quiz-and-practice' || currentTab === 'quiz') && (
              <PracticeView onNavigate={handleNavigate} initialTab="flashcards" />
            )}

            {/* Screen 11: Smart Review */}
            {currentTab === 'review' && (
              <SmartReviewView
                onBack={() => handleNavigate('home')}
                onSelectTopic={() => handleNavigate('practice')}
              />
            )}

            {/* Settings (Section 33) */}
            {currentTab === 'settings' && (
              <SettingsView onNavigate={handleNavigate} />
            )}

            {/* Screen 14: Achievements */}
            {currentTab === 'achievements' && (
              <AchievementsView onNavigate={handleNavigate} />
            )}

            {/* Screen 15: Leaderboard / Network League */}
            {currentTab === 'leaderboard' && (
              <LeaderboardView />
            )}

            {/* Screen 16: Profile */}
            {currentTab === 'profile' && (
              <ProfileView
                primaryCourse={course}
                onNavigate={handleNavigate}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {/* Progress & Analytics Dashboard */}
            {currentTab === 'analytics' && (
              <AnalyticsView />
            )}

            {/* Secondary Hubs */}
            {currentTab === 'my-learning' && (
              <MyLearningView
                primaryCourse={course}
                secondaryCourses={SECONDARY_COURSES}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'teacher-dashboard' && (
              <TeacherDashboardView
                metrics={TEACHER_STATS}
                sections={sections}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'live-classroom' && (
              <LiveClassroomView
                userRole={userRole}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'developer-dashboard' && (
              <DeveloperDashboardView onNavigate={handleNavigate} />
            )}

            {/* Dedicated 403 Offline Access Restricted Page */}
            {currentTab === '403' && (
              <Offline403Page
                standalone
                onDismiss={() => handleNavigate('home')}
                onRetry={() => handleNavigate('home')}
              />
            )}

            {/* Dedicated 404 Server Crash / Route Not Found Page */}
            {currentTab === '404' && (
              <ServerCrash404Page
                errorCode="404"
                customTitle="Server Crash & 404 Route Failure"
                customMessage="Cresco CN edge worker detected an unhandled server-side crash or unresolvable destination route."
                onNavigateHome={() => handleNavigate('home')}
                resetErrorBoundary={() => handleNavigate('home')}
              />
            )}

          </main>

          {/* Clean Educational Footer */}
          <footer className="border-t border-[#E5E0D8] dark:border-slate-800/80 py-6 px-4 text-center text-xs text-[#64748B] dark:text-slate-400">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-bold text-[#172033] dark:text-slate-300">
                Cresco CN • Learn. Connect. Master.
              </span>
              <span>Gamified Computer Networks Platform</span>
            </div>
          </footer>

        </div>

      </div>

      {/* Dedicated Mobile Responsive Bottom Navigation */}
      <BottomNav activeTab={currentTab} onNavigate={handleNavigate} />

      {/* Screen 12: Streak Modal */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        streakDays={userStats.streak}
      />

      {/* Screen 13: XP / Level Progress Modal */}
      <LevelProgressModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        currentXp={userStats.xp}
      />

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onComplete={() => {
          setUserStats((prev) => ({ ...prev, xp: prev.xp + 30 }));
        }}
      />

      <PracticeDrillModal
        isOpen={!!activePracticeCategory}
        category={activePracticeCategory}
        onClose={() => setActivePracticeCategory(null)}
      />

      {/* Firebase Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          setIsPostLoginLoading(true);
        }}
      />

      {/* Section Completion Toast */}
      {sectionCompletionCelebration && (
        <SectionCompletionToast
          sectionTitle={sectionCompletionCelebration.sectionTitle}
          bonusXp={sectionCompletionCelebration.bonusXp}
          onClose={() => setSectionCompletionCelebration(null)}
        />
      )}
 

      </div>
    </Preloader>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CharacterProvider>
            <MainApp />
          </CharacterProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
