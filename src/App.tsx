import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { CurriculumProvider } from './context/CurriculumContext';
import { AuthModal } from './components/AuthModal';
import { collection, onSnapshot, getDocsFromCache } from 'firebase/firestore';
import { db } from './lib/firebase';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { OfflinePersistenceBanner } from './components/OfflinePersistenceBanner';
import { SectionCompletionToast } from './components/SectionCompletionToast';
import { triggerSubtleSectionConfetti } from './utils/confetti';
import { soundFx } from './utils/audio';
import { SearchModal } from './components/SearchModal';
import { QuizModal } from './components/QuizModal';
import { PracticeDrillModal } from './components/PracticeDrillModal';
import { NetworkBackground } from './components/background/NetworkBackground';

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
import { AnimatedLearningView } from './components/views/AnimatedLearningView';
import { LandingView } from './components/views/LandingView';

// Existing Secondary Supporting Views
import { TeacherDashboardView } from './components/views/TeacherDashboardView';
import { LiveClassroomView } from './components/views/LiveClassroomView';
import { DeveloperDashboardView } from './components/views/DeveloperDashboardView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { MyLearningView } from './components/views/MyLearningView';
import { LoginView } from './components/views/LoginView';

import { BootTerminal } from './components/BootTerminal';
import { ErrorBoundary } from './components/errors/ErrorBoundary';
import { Offline403Page } from './components/errors/Offline403Page';
import { ServerCrash404Page } from './components/errors/ServerCrash404Page';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { CharacterProvider, useCharacter } from './context/CharacterContext';
import { CharacterHubModal } from './components/character/CharacterHubModal';
import { FloatingCompanion } from './components/character/FloatingCompanion';
import { KluRegistrationModal } from './components/auth/KluRegistrationModal';

function MainApp() {
  const { currentUser, userProfile, loading, recordModuleCompletion, pendingRegistration } = useAuth();
  const { isOnline } = useNetworkStatus();
  const { isCharacterHubOpen, closeCharacterHub } = useCharacter();

  // Navigation State - defaults to 'landing' for visitors
  const [currentTab, setCurrentTab] = useState<NavTab>('landing');
  const [tabHistory, setTabHistory] = useState<NavTab[]>(['landing']);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [authPortalMode, setAuthPortalMode] = useState<'login' | 'landing' | 'prelaunch'>('login');
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
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  const [pendingWritesCount, setPendingWritesCount] = useState(0);
  const [sectionCompletionCelebration, setSectionCompletionCelebration] = useState<{
    sectionTitle: string;
    bonusXp: number;
  } | null>(null);

  useEffect(() => {
    if (loading) return;

    if (currentUser && (currentTab === 'landing' || currentTab === 'login')) {
      setCurrentTab('home');
      setTabHistory(['home']);
      return;
    }

    if (!currentUser && !pendingRegistration && currentTab !== 'landing' && currentTab !== 'login' && currentTab !== 'welcome') {
      initialRedirectDoneRef.current = false;
      setCurrentTab('landing');
      setTabHistory(['landing']);
    }
  }, [currentUser, pendingRegistration, loading, currentTab]);

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

  const prevUserRef = useRef<any>(currentUser);
  const initialRedirectDoneRef = useRef(false);

  // Synchronize authenticated user profile & restore genuine metrics from Firebase
  useEffect(() => {
    // 1. Initial auth resolution: if user is logged in, transition from 'landing' to their dashboard
    if (!loading && currentUser && !initialRedirectDoneRef.current) {
      initialRedirectDoneRef.current = true;
      setCurrentTab((prev) => {
        if (prev === 'landing') {
          const dest = userProfile?.role === 'developer' ? 'developer-dashboard' : 'home';
          setTabHistory([dest]);
          return dest;
        }
        return prev;
      });
    }

    // 2. User logout: if user was logged in and is now logged out, route back to landing
    if (prevUserRef.current && !currentUser) {
      initialRedirectDoneRef.current = false;
      setCurrentTab('landing');
      setTabHistory(['landing']);
    }

    prevUserRef.current = currentUser;
  }, [loading, currentUser, userProfile?.role]);

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

    const completionsRef = collection(db, 'users', currentUser.uid, 'lessonCompletions');
    const unsubscribe = onSnapshot(
      completionsRef,
      { includeMetadataChanges: true },
      (snap) => {
        if (snap.metadata.hasPendingWrites) {
          setPendingWritesCount((c) => Math.max(1, c));
        } else {
          setPendingWritesCount(0);
        }
      },
      async (err) => {
        console.warn('Firestore onSnapshot listener error (offline cache fallback):', err);
      }
    );

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

  const handleNavigate = useCallback((tab: NavTab, lessonId?: string, sectionId?: number) => {
    if (tab === 'guidemaster-select' || tab === 'companion-select') {
      tab = 'home';
    }
    if (tab === 'achievements') {
      tab = 'leaderboard';
    }
    if (tab === 'challenges' || tab === 'boss-challenge' || tab === 'daily-challenge' || tab === 'exam') {
      tab = 'practice';
    }
    if (tab === 'developer-dashboard' && userProfile?.role !== 'developer') {
      tab = 'home';
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

    if (tab !== currentTab) {
      setTabHistory(prev => [...prev, tab]);
      if (typeof window !== 'undefined') {
        window.history.pushState({ tab }, '', window.location.pathname);
      }
    }

    setCurrentTab(tab);
    document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentTab, userProfile?.role]);

  const handleGoBack = useCallback(() => {
    soundFx.playClick();
    if (tabHistory.length > 1) {
      const updated = [...tabHistory];
      updated.pop(); // remove current tab
      const prevTab = updated[updated.length - 1];
      setTabHistory(updated);
      setCurrentTab(prevTab);
    } else {
      setCurrentTab(currentUser ? 'home' : 'landing');
    }
  }, [tabHistory, currentUser]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.tab) {
        setCurrentTab(e.state.tab);
        setTabHistory(prev => {
          if (prev.length > 1) {
            const next = [...prev];
            next.pop();
            return next;
          }
          return prev;
        });
      } else {
        handleGoBack();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleGoBack]);

  // Automatically route authenticated students from landing/login screens straight to Dashboard & Learning Path
  useEffect(() => {
    if (currentUser && userProfile && !pendingRegistration) {
      if (currentTab === 'login' || currentTab === 'landing' || currentTab === 'welcome') {
        setCurrentTab('home');
        setTabHistory(['home']);
      }
    }
  }, [currentUser, userProfile, pendingRegistration, currentTab]);

  // Loading State while Firebase resolves
  if (loading) {
    return <BootTerminal />;
  }

  // Dedicated Landing Page (Default for Visitors: Visitor → Cresco CN Landing/Home → Sign Up / Sign In)
  // Landing page routing
  if (currentTab === 'landing') {
    return (
      <LandingView
        isLoggedIn={!!currentUser}
        onNavigateToLogin={() => {
          if (currentUser) {
            handleNavigate('home');
          } else {
            setLoginMode('login');
            handleNavigate('login');
          }
        }}
        onNavigateToSignup={() => {
          if (currentUser) {
            handleNavigate('home');
          } else {
            setLoginMode('signup');
            handleNavigate('login');
          }
        }}
        onNavigateToLaunch={() => {
          const el = document.getElementById('launch') || document.getElementById('simulators');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    );
  }

  // Dedicated Login & Student Registration Flow
  if (currentTab === 'login') {
    return (
      <>
        <LoginView
          initialMode={loginMode}
          initialPortal={selectedPortal}
          onSuccess={() => {
            setCurrentTab('home');
            setTabHistory(['home']);
          }}
          onCancel={() => {
            setCurrentTab('landing');
            setTabHistory(['landing']);
          }}
        />
        <KluRegistrationModal
          isOpen={!!pendingRegistration}
          onSuccess={() => {
            setCurrentTab('home');
            setTabHistory(['home']);
          }}
        />
      </>
    );
  }

  // SCREEN 01 — WELCOME / ONBOARDING (if tab is 'welcome')
  if (currentTab === 'welcome') {
    return (
      <WelcomeOnboardingView
        onStart={() => setCurrentTab('login')}
        onKnowBasics={() => {
          setActiveSectionId(1);
          setCurrentTab('learn-map');
        }}
        onSignIn={() => setCurrentTab('login')}
      />
    );
  }

  // SCREEN 04 & 05 — LESSON & INTERACTIVE QUESTION (Full-Screen Mode, No Sidebar!)
  if (currentTab === 'lesson-player') {
    return (
      <GamifiedLessonView
        key={activeLessonId}
        lessonId={activeLessonId}
        onClose={() => handleNavigate('learn-map')}
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

  return (
    <div className="relative h-[100dvh] min-h-[100dvh] w-full max-w-full bg-surface text-on-surface flex flex-col overflow-hidden font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Existing dashboard layout unchanged */}
      <NetworkBackground mode={currentTab === 'exam' ? 'exam' : 'static'} />

      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        userStats={userStats}
        onOpenStreak={() => setIsStreakModalOpen(true)}
        onOpenLevel={() => setIsLevelModalOpen(true)}
        onSearch={() => setIsSearchOpen(true)}
      />

      <div className="flex-1 flex flex-row min-w-0 min-h-0 overflow-hidden">
        <Sidebar
          activeTab={currentTab}
          onNavigate={handleNavigate}
          onSearch={() => setIsSearchOpen(true)}
        />

        <div 
          id="main-scroll-container" 
          className="flex-1 flex flex-col min-w-0 h-full min-h-0 overflow-y-auto overflow-x-hidden"
        >
          <OfflinePersistenceBanner pendingSyncCount={pendingWritesCount} />

          <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pb-28 sm:pb-24 md:pb-16 py-4">
            {currentTab === 'home' && (
              <HomeView onNavigate={handleNavigate} userStats={userStats} />
            )}

            {(currentTab === 'learn-map' || currentTab === 'courses' || currentTab === 'learn') && (
              <LearningMapView
                onSelectLesson={handleSelectLesson}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'drag-drop' && (
              <DragDropNetworkView
                onComplete={() => handleNavigate('learn-map')}
                onBack={() => handleNavigate('home')}
              />
            )}

            {(currentTab === 'simulator' || currentTab === 'lab') && (
              <PacketSimulatorView
                onBack={() => handleNavigate('home')}
              />
            )}

            {currentTab === 'animated-learning' && (
              <AnimatedLearningView
                onNavigateHome={() => handleNavigate('home')}
              />
            )}

            {(currentTab === 'practice' || currentTab === 'quiz-and-practice' || currentTab === 'quiz' || currentTab === 'exam' || currentTab === 'challenges' || currentTab === 'boss-challenge' || currentTab === 'daily-challenge') && (
              <PracticeView onNavigate={handleNavigate} initialTab="flashcards" />
            )}

            {currentTab === 'review' && (
              <SmartReviewView
                onBack={handleGoBack}
                onSelectTopic={() => handleNavigate('practice')}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView onNavigate={handleNavigate} />
            )}

            {currentTab === 'leaderboard' && (
              <LeaderboardView />
            )}

            {currentTab === 'profile' && (
              <ProfileView
                primaryCourse={course}
                onNavigate={handleNavigate}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsView />
            )}

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

            {currentTab === '403' && (
              <Offline403Page
                standalone
                onDismiss={() => handleNavigate('home')}
                onRetry={() => handleNavigate('home')}
              />
            )}

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

      <BottomNav activeTab={currentTab} onNavigate={handleNavigate} />

      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        onReturnToDashboard={() => {
          setIsStreakModalOpen(false);
          handleNavigate('home');
        }}
        streakDays={userStats.streak}
      />

      <LevelProgressModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        onReturnToDashboard={() => {
          setIsLevelModalOpen(false);
          handleNavigate('home');
        }}
        currentXp={userStats.xp}
      />

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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
        }}
      />

      <KluRegistrationModal
        isOpen={!!pendingRegistration}
        onSuccess={() => {
          setCurrentTab('home');
          setTabHistory(['home']);
        }}
      />

      {sectionCompletionCelebration && (
        <SectionCompletionToast
          sectionTitle={sectionCompletionCelebration.sectionTitle}
          bonusXp={sectionCompletionCelebration.bonusXp}
          onClose={() => setSectionCompletionCelebration(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CurriculumProvider>
            <CharacterProvider>
              <MainApp />
            </CharacterProvider>
          </CurriculumProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
