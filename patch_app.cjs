const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf-8');

// The main change needed is to simplify the tabs
const newApp = content
  .replace(/activeTab === 'home' && \(/, "activeTab === 'home' && (")
  .replace(/<HomeView\s+primaryCourse=\{PRIMARY_COURSE\}\s+secondaryCourses=\{SECONDARY_COURSES\}\s+onNavigate=\{handleNavigate\}\s+onStartQuiz=\{startQuiz\}\s+onOpenUnitChallenge=\{openUnitChallenge\}\s+\/>/g, '<HomeView onNavigate={handleNavigate} />')
  .replace(/activeTab === 'courses' && \(/, "false && (") // Disable old courses view
  .replace(/activeTab === 'lesson-player' && activeLessonId && activeSectionId !== undefined && \(/, "activeTab === 'lesson-player' && activeLessonId && activeSectionId !== undefined && (")
  .replace(/<LessonPlayerView[\s\S]*?\/>/, '<LessonPlayerView \n          moduleId={activeLessonId} \n          unitIndex={activeSectionId} \n          onClose={() => handleNavigate(\'home\')} \n        />')
  .replace(/<PracticeView[\s\S]*?\/>/, '<PracticeView onNavigate={handleNavigate} />');

fs.writeFileSync('src/App.tsx', newApp);
console.log("Patched App.tsx successfully.");
