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
import { parseLevelFromPath, getLevelRouteByLessonId } from './utils/levelRouting';

// Modals
import { StreakModal } from './components/modals/StreakModal';
import { LevelProgressModal } from './components/modals/LevelProgressModal';

import { Loader, FullScreenLoader } from './components/ui/Loader';

// Core Primary Screens
import { HomeView } from './components/views/HomeView';
import { LearningMapView } from './components/views/LearningMapView';

// Code-Split Secondary & Interactive Views
const WelcomeOnboardingView = React.lazy(() => import('./components/views/WelcomeOnboardingView').then(m => ({ default: m.WelcomeOnboardingView })));
const GamifiedLessonView = React.lazy(() => import('./components/views/GamifiedLessonView').then(m => ({ default: m.GamifiedLessonView })));
const DragDropNetworkView = React.lazy(() => import('./components/views/DragDropNetworkView').then(m => ({ default: m.DragDropNetworkView })));
const PacketSimulatorView = React.lazy(() => import('./components/views/PacketSimulatorView').then(m => ({ default: m.PacketSimulatorView })));
const PracticeView = React.lazy(() => import('./components/views/PracticeView').then(m => ({ default: m.PracticeView })));
const SmartReviewView = React.lazy(() => import('./components/views/SmartReviewView').then(m => ({ default: m.SmartReviewView })));
const LeaderboardView = React.lazy(() => import('./components/views/LeaderboardView').then(m => ({ default: m.LeaderboardView })));
const ProfileView = React.lazy(() => import('./components/views/ProfileView').then(m => ({ default: m.ProfileView })));
const SettingsView = React.lazy(() => import('./components/views/SettingsView').then(m => ({ default: m.SettingsView })));
const AnimatedLearningView = React.lazy(() => import('./components/views/AnimatedLearningView').then(m => ({ default: m.AnimatedLearningView })));
const LandingView = React.lazy(() => import('./components/views/LandingView').then(m => ({ default: m.LandingView })));
const ExamModeView = React.lazy(() => import('./components/views/ExamModeView').then(m => ({ default: m.ExamModeView })));

// Code-Split Supporting Dashboard Views
const TeacherDashboardView = React.lazy(() => import('./components/views/TeacherDashboardView').then(m => ({ default: m.TeacherDashboardView })));
const LiveClassroomView = React.lazy(() => import('./components/views/LiveClassroomView').then(m => ({ default: m.LiveClassroomView })));
const DeveloperDashboardView = React.lazy(() => import('./components/views/DeveloperDashboardView').then(m => ({ default: m.DeveloperDashboardView })));
const AnalyticsView = React.lazy(() => import('./components/views/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const MyLearningView = React.lazy(() => import('./components/views/MyLearningView').then(m => ({ default: m.MyLearningView })));
const LoginView = React.lazy(() => import('./components/views/LoginView').then(m => ({ default: m.LoginView })));
const TermsView = React.lazy(() => import('./components/views/TermsView').then(m => ({ default: m.TermsView })));
const PrivacyView = React.lazy(() => import('./components/views/PrivacyView').then(m => ({ default: m.PrivacyView })));
const AdminPortalView = React.lazy(() => import('./components/views/AdminPortalView').then(m => ({ default: m.AdminPortalView })));

import { BootTerminal } from './components/BootTerminal';
import { ErrorBoundary } from './components/errors/ErrorBoundary';
import { Offline403Page } from './components/errors/Offline403Page';
import { ServerCrash404Page } from './components/errors/ServerCrash404Page';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { CharacterProvider, useCharacter } from './context/CharacterContext';
import { CharacterHubModal } from './components/character/CharacterHubModal';
import { FloatingCompanion } from './components/character/FloatingCompanion';
import { KluRegistrationModal } from './components/auth/KluRegistrationModal';
import { Bot, Sparkles } from 'lucide-react';
import { AiTutorDrawer } from './components/tutor/AiTutorDrawer';
import { TutorInstructionalContext } from './types/aiTutor';

function MainApp() {
  const { currentUser, userProfile, loading, recordModuleCompletion, pendingRegistration } = useAuth();
  const { isOnline } = useNetworkStatus();
  const { isCharacterHubOpen, closeCharacterHub } = useCharacter();

  // Check URL on startup for /learn/level1 .. /learn/level21 or other routes
  const getInitialRoute = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/terms') return { tab: 'terms' as NavTab, lessonId: 'u3_m01', sectionId: 3 };
      if (path === '/privacy') return { tab: 'privacy' as NavTab, lessonId: 'u3_m01', sectionId: 3 };
      if (path === '/admin') return { tab: 'admin' as NavTab, lessonId: 'u3_m01', sectionId: 3 };
      if (path === '/login') return { tab: 'login' as NavTab, lessonId: 'u3_m01', sectionId: 3 };

      const routeInfo = parseLevelFromPath(path);
      if (routeInfo) {
        return { tab: 'lesson-player' as NavTab, lessonId: routeInfo.lessonId, sectionId: routeInfo.sectionId };
      }
      if (path.startsWith('/learn/')) {
        const slug = path.replace('/learn/', '').replace(/\/$/, '');
        if (slug) {
          const fallbackRoute = getLevelRouteByLessonId(slug);
          return { tab: 'lesson-player' as NavTab, lessonId: fallbackRoute.lessonId, sectionId: fallbackRoute.sectionId };
        }
      }
    }
    return { tab: 'landing' as NavTab, lessonId: 'u3_m01', sectionId: 3 };
  };

  const initialRoute = getInitialRoute();

  // Navigation State - defaults to 'landing' for visitors or URL route
  const [currentTab, setCurrentTab] = useState<NavTab>(initialRoute.tab);
  const [tabHistory, setTabHistory] = useState<NavTab[]>([initialRoute.tab]);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [authPortalMode, setAuthPortalMode] = useState<'login' | 'landing' | 'prelaunch'>('login');
  const [selectedPortal, setSelectedPortal] = useState<'student' | 'developer' | 'teacher'>('student');
  
  // Gamified User State (XP, Streak, Hearts) - Clean 0 baseline for student login
  const [userStats, setUserStats] = useState({
    streak: 0,
    xp: 0,
    hearts: 5,
  });

  // Active Lesson Pointer - starts at Unit 3 Module 1 or URL level
  const [activeLessonId, setActiveLessonId] = useState<string>(initialRoute.lessonId);
  const [activeSectionId, setActiveSectionId] = useState<number>(initialRoute.sectionId);

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

  // AI Personal Tutor State (Step 23)
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);
  const [aiTutorContext, setAiTutorContext] = useState<TutorInstructionalContext | undefined>(undefined);

  useEffect(() => {
    const handleOpenTutor = (e: any) => {
      if (e.detail) {
        setAiTutorContext(e.detail);
      }
      setIsAiTutorOpen(true);
    };
    window.addEventListener('cresco:open-ai-tutor', handleOpenTutor as EventListener);
    return () => window.removeEventListener('cresco:open-ai-tutor', handleOpenTutor as EventListener);
  }, []);

  // Browser History & URL route synchronization
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const levelRoute = parseLevelFromPath(path);
      if (levelRoute) {
        setActiveLessonId(levelRoute.lessonId);
        setActiveSectionId(levelRoute.sectionId);
        setCurrentTab('lesson-player');
        return;
      }
      if (path.startsWith('/learn/')) {
        const slug = path.replace('/learn/', '').replace(/\/$/, '');
        if (slug) {
          const fallbackRoute = getLevelRouteByLessonId(slug);
          setActiveLessonId(fallbackRoute.lessonId);
          setActiveSectionId(fallbackRoute.sectionId);
          setCurrentTab('lesson-player');
          return;
        }
      }
      if (path === '/terms') { setCurrentTab('terms'); return; }
      if (path === '/privacy') { setCurrentTab('privacy'); return; }
      if (path === '/admin') { setCurrentTab('admin'); return; }
      if (path === '/login') { setCurrentTab('login'); return; }
      if (path === '/' || path === '') {
        setCurrentTab(currentUser ? 'home' : 'landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  useEffect(() => {
    if (loading) return;

    if (currentUser && (currentTab === 'landing' || currentTab === 'login')) {
      setCurrentTab('home');
      setTabHistory(['home']);
      return;
    }

    if (!currentUser && !pendingRegistration && 
        currentTab !== 'landing' && 
        currentTab !== 'login' && 
        currentTab !== 'welcome' && 
        currentTab !== 'lesson-player' &&
        currentTab !== 'terms' &&
        currentTab !== 'privacy' &&
        currentTab !== 'admin') {
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
  }, [currentUser, userProfile?.streak, userProfile?.totalXP, userProfile?.xp]);

  // Stable Firestore onSnapshot listener for lesson completions
  useEffect(() => {
    if (!currentUser?.uid) return;

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
  }, [currentUser?.uid]);

  // Navigation handlers
  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSelectLesson = (lessonId: string, sectionId: number) => {
    const routeInfo = getLevelRouteByLessonId(lessonId);
    const targetLessonId = routeInfo ? routeInfo.lessonId : lessonId;
    const targetPath = routeInfo ? routeInfo.path : `/learn/${lessonId}`;

    setActiveLessonId(targetLessonId);
    setActiveSectionId(sectionId);
    setCurrentTab('lesson-player');
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab: 'lesson-player', lessonId: targetLessonId }, '', targetPath);
      }
    }
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
        const currentPath = window.location.pathname;
        const targetUrl = currentPath.startsWith('/learn/') ? '/' : currentPath;
        window.history.pushState({ tab }, '', targetUrl);
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
      const levelRoute = parseLevelFromPath(window.location.pathname);
      if (levelRoute) {
        setActiveLessonId(levelRoute.lessonId);
        setActiveSectionId(levelRoute.sectionId);
        setCurrentTab('lesson-player');
        return;
      }

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
      <React.Suspense fallback={<BootTerminal />}>
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
      </React.Suspense>
    );
  }

  // Dedicated Login & Student Registration Flow
  if (currentTab === 'login') {
    return (
      <React.Suspense fallback={<FullScreenLoader message="Loading Authentication Portal..." />}>
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
          isOpen={
            Boolean(pendingRegistration) && 
            !userProfile?.profileCompleted && 
            (typeof window === 'undefined' || !localStorage.getItem(`klu_registered_done_${pendingRegistration?.uid}`))
          }
          onSuccess={() => {
            setCurrentTab('home');
            setTabHistory(['home']);
          }}
        />
      </React.Suspense>
    );
  }

  // Terms & Conditions View
  if (currentTab === 'terms') {
    return (
      <React.Suspense fallback={<FullScreenLoader message="Loading Terms & Conditions..." />}>
        <TermsView onBack={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
          } else {
            setCurrentTab(currentUser ? 'home' : 'landing');
          }
        }} />
      </React.Suspense>
    );
  }

  // Privacy Policy View
  if (currentTab === 'privacy') {
    return (
      <React.Suspense fallback={<FullScreenLoader message="Loading Privacy Policy..." />}>
        <PrivacyView onBack={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
          } else {
            setCurrentTab(currentUser ? 'home' : 'landing');
          }
        }} />
      </React.Suspense>
    );
  }

  // Admin Portal View
  if (currentTab === 'admin') {
    return (
      <React.Suspense fallback={<FullScreenLoader message="Loading Administrator Console..." />}>
        <AdminPortalView onNavigate={(tab) => {
          setCurrentTab(tab);
          if (typeof window !== 'undefined') {
            window.history.pushState({ tab }, '', tab === 'home' ? '/' : `/${tab}`);
          }
        }} />
      </React.Suspense>
    );
  }

  // SCREEN 01 — WELCOME / ONBOARDING (if tab is 'welcome')
  if (currentTab === 'welcome') {
    return (
      <React.Suspense fallback={<FullScreenLoader message="Loading Onboarding Experience..." />}>
        <WelcomeOnboardingView
          onStart={() => setCurrentTab('login')}
          onKnowBasics={() => {
            setActiveSectionId(1);
            setCurrentTab('learn-map');
          }}
          onSignIn={() => setCurrentTab('login')}
        />
      </React.Suspense>
    );
  }

  // SCREEN 04 & 05 — LESSON & INTERACTIVE QUESTION (Full-Screen Mode, No Sidebar!)
  if (currentTab === 'lesson-player') {
    return (
      <React.Suspense fallback={<FullScreenLoader message="Initializing Lesson Pipeline..." />}>
        <GamifiedLessonView
          key={activeLessonId}
          lessonId={activeLessonId}
          onClose={() => {
            handleNavigate('learn-map');
            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/learn/')) {
              window.history.pushState({ tab: 'learn-map' }, '', '/');
            }
          }}
          onCompleteLesson={(earnedXp) => {
            setUserStats((prev) => ({ ...prev, xp: prev.xp + earnedXp }));
            if (recordModuleCompletion) {
              const unitId = activeLessonId.startsWith('u3') ? 'unit-3' : activeLessonId.startsWith('u4') ? 'unit-4' : 'unit-5';
              recordModuleCompletion(activeLessonId, unitId, earnedXp);
            }
          }}
          onNavigateNextLesson={(nextId) => {
            const nextRoute = getLevelRouteByLessonId(nextId);
            const resolvedId = nextRoute ? nextRoute.lessonId : nextId;
            setActiveLessonId(resolvedId);
            if (typeof window !== 'undefined' && nextRoute) {
              window.history.pushState({ tab: 'lesson-player', lessonId: resolvedId }, '', nextRoute.path);
            }
          }}
        />
      </React.Suspense>
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
            <React.Suspense fallback={
              <div className="w-full flex items-center justify-center min-h-[360px] py-20">
                <Loader size="3em" />
              </div>
            }>
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

              {currentTab === 'exam' && (
                <ExamModeView onNavigate={handleNavigate} />
              )}

              {(currentTab === 'practice' || currentTab === 'quiz-and-practice' || currentTab === 'quiz' || currentTab === 'challenges' || currentTab === 'boss-challenge' || currentTab === 'daily-challenge') && (
                <PracticeView 
                  onNavigate={handleNavigate} 
                  initialTab={currentTab === 'quiz' ? 'quiz' : 'flashcards'} 
                />
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
            </React.Suspense>
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

      {/* Floating AI Tutor Trigger Button (Step 23) */}
      <button
        type="button"
        onClick={() => {
          setAiTutorContext(undefined);
          setIsAiTutorOpen(true);
        }}
        className="fixed bottom-20 right-6 sm:bottom-6 sm:right-6 z-40 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-xl hover:shadow-cyan-500/25 flex items-center gap-2 font-bold text-xs transition-all transform hover:-translate-y-0.5 cursor-pointer group border border-cyan-400/30"
        title="Open ByteBot AI Personal Tutor"
      >
        <Bot className="w-5 h-5 text-cyan-200 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Ask AI Tutor</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
      </button>

      {/* AI Personal Tutor Drawer (Step 23) */}
      <AiTutorDrawer
        isOpen={isAiTutorOpen}
        onClose={() => setIsAiTutorOpen(false)}
        studentId={currentUser?.uid || 'guest'}
        initialContext={aiTutorContext}
        onNavigate={handleNavigate}
      />
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
