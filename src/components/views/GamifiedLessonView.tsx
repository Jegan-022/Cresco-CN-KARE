import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { soundFx } from '../../utils/soundEffects';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';
import { getModularLessonById } from '../../data/lessons/lessonRegistry';
import { ModularLesson } from '../../data/lessons/lessonModel';
import { LearnDashboardLayout, LearnPhaseKey } from '../learn/LearnDashboardLayout';
import { ConceptLearningPage } from '../learn/ConceptLearningPage';
import { InteractiveLearningPage } from '../learn/InteractiveLearningPage';
import { QuizPracticePage } from '../learn/QuizPracticePage';
import { LessonSummaryPage } from '../learn/LessonSummaryPage';

interface GamifiedLessonViewProps {
  lessonId?: string;
  onClose: () => void;
  onCompleteLesson?: (xpEarned: number) => void;
  onNavigateNextLesson?: (nextLessonId: string) => void;
}

export const GamifiedLessonView: React.FC<GamifiedLessonViewProps> = ({
  lessonId = 'u3_m01',
  onClose,
  onCompleteLesson,
  onNavigateNextLesson,
}) => {
  const { userProfile } = useAuth();
  
  // Current active lesson data
  const [currentLessonId, setCurrentLessonId] = useState<string>(lessonId);
  const lessonData: ModularLesson = getModularLessonById(currentLessonId);

  // Active Phase State: 'concept' | 'interactive' | 'quiz' | 'summary'
  const [currentPhase, setCurrentPhase] = useState<LearnPhaseKey>('concept');

  // Reset phase when switching lessons
  useEffect(() => {
    setCurrentLessonId(lessonId);
    setCurrentPhase('concept');
  }, [lessonId]);

  // Handle Complete & Award XP
  const handleFinishLesson = () => {
    soundFx.playCorrect();
    triggerSubtleSectionConfetti();
    if (onCompleteLesson) {
      onCompleteLesson(lessonData.xpReward || 50);
    }
    onClose();
  };

  const handleContinueNextLesson = () => {
    soundFx.playCorrect();
    triggerSubtleSectionConfetti();
    if (onCompleteLesson) {
      onCompleteLesson(lessonData.xpReward || 50);
    }
    if (lessonData.nextLessonId && onNavigateNextLesson) {
      onNavigateNextLesson(lessonData.nextLessonId);
    } else {
      onClose();
    }
  };

  return (
    <LearnDashboardLayout
      lesson={lessonData}
      currentPhase={currentPhase}
      onSelectPhase={setCurrentPhase}
      onClose={onClose}
      onSelectLesson={(newId) => {
        setCurrentLessonId(newId);
        setCurrentPhase('concept');
      }}
      userStats={{
        streak: userProfile?.streak ?? 12,
        xp: userProfile?.totalXP ?? userProfile?.xp ?? 850,
        userName: userProfile?.name || userProfile?.studentId || 'Student'
      }}
    >
      {/* 1. CONCEPT LEARNING PAGE */}
      {currentPhase === 'concept' && (
        <ConceptLearningPage
          lesson={lessonData}
          onNext={() => {
            setCurrentPhase('interactive');
            soundFx.playClick();
          }}
          onPrev={onClose}
        />
      )}

      {/* 2. INTERACTIVE SIMULATION PAGE */}
      {currentPhase === 'interactive' && (
        <InteractiveLearningPage
          lesson={lessonData}
          onNext={() => {
            setCurrentPhase('quiz');
            soundFx.playClick();
          }}
          onPrev={() => {
            setCurrentPhase('concept');
            soundFx.playClick();
          }}
        />
      )}

      {/* 3. PRACTICE QUIZ PAGE */}
      {currentPhase === 'quiz' && (
        <QuizPracticePage
          lesson={lessonData}
          onNext={() => {
            setCurrentPhase('summary');
            soundFx.playCorrect();
          }}
          onPrev={() => {
            setCurrentPhase('interactive');
            soundFx.playClick();
          }}
        />
      )}

      {/* 4. LESSON SUMMARY PAGE */}
      {currentPhase === 'summary' && (
        <LessonSummaryPage
          lesson={lessonData}
          onFinish={handleFinishLesson}
          onPrev={() => {
            setCurrentPhase('quiz');
            soundFx.playClick();
          }}
          onContinueNextLesson={handleContinueNextLesson}
          onTakeUnitQuiz={() => {
            alert('Unit Quiz feature launched! Good luck!');
          }}
        />
      )}
    </LearnDashboardLayout>
  );
};
