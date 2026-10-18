# Cresco CN — Project Map & Developer Navigation Guide

> **Target Audience:** Developers, content contributors, and maintainers.  
> **Status:** Accurate as of baseline commit `b2bdc3d` on branch `production-upgrade`.

---

## 1. Quick Architecture Tree

```text
Home / Dashboard
 └── src/components/views/HomeView.tsx

Learn
 ├── Learning Map → src/components/views/LearningMapView.tsx
 ├── Level Content (Modular) → src/components/learn/LevelView.tsx
 │    ├── Stage 1 (Concept) → src/components/learn/ConceptLearningPage.tsx
 │    ├── Stage 2 (Interactive) → src/components/learn/InteractiveLearningPage.tsx
 │    ├── Stage 3 (Quiz) → src/components/learn/QuizLearningPage.tsx
 │    └── Stage 4 (Summary) → src/components/learn/SummaryLearningPage.tsx
 ├── Level Content (Legacy) → src/components/views/GamifiedLessonView.tsx
 └── Level Data Repository → src/levels/ (level-1/, level-2/, registry.ts, types.ts)

Animated Learning
 └── src/components/views/AnimatedLearningView.tsx

Practice & Exams
 └── src/components/views/PracticeView.tsx
```

---

## 2. Major Student Pages & System Breakdown

### 🏠 Home / Student Dashboard
* **Exact Source File:** [`src/components/views/HomeView.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/views/HomeView.tsx)
* **Navigation Path:** Default view on login, or Sidebar → **Home** (`currentTab === 'home'`).
* **Firebase Data Used:**
  * Reads `userProfile` from [`src/context/AuthContext.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/context/AuthContext.tsx) (collection: `users/{uid}`).
  * Tracks real streak count, accumulated XP, hearts, and `completedModules`.
* **Main Components:**
  * [`HomeView.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/views/HomeView.tsx)
  * [`src/components/Header.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/Header.tsx)
  * [`src/components/Sidebar.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/Sidebar.tsx)
  * [`src/components/character/ByteBot.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/character/ByteBot.tsx)
  * [`src/components/StreakHeatmap.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/StreakHeatmap.tsx)
* **Where Content is Stored:**
  * [`src/data/networkCourse.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/data/networkCourse.ts) (Course metadata, sections, and milestones).
  * [`src/data/courseContent.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/data/courseContent.ts) (Daily challenges, unit module counts).
* **Safe to Edit:** Text copy, layout widgets, banners, and progress cards in `HomeView.tsx`.
* **High-Risk:** Modifying `userStats` state calculations or calling unguarded mutation handlers.

---

### 🗺️ Learning Map (Island Progression Path)
* **Exact Source File:** [`src/components/views/LearningMapView.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/views/LearningMapView.tsx)
* **Navigation Path:** Sidebar → **Learning Map** or **Courses** (`currentTab === 'learn-map'`).
* **Firebase Data Used:**
  * Reads `userProfile.completedModules` to evaluate node locks and completion badges.
* **Main Components:**
  * 21 Level Nodes (Nodes 1–8: Unit 3 Network Layer; 9–15: Unit 4 Transport Layer; 16–21: Unit 5 Application Layer).
  * SVG Connectors (`public/assets/d15da.svg`, `56dd6.svg`, etc.).
  * Level Detail Modal / Action Popups.
* **Where Content is Stored:**
  * `LEVEL_CONFIGS` array inside [`src/components/views/LearningMapView.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/views/LearningMapView.tsx#L60).
* **Safe to Edit:** Coordinates (`left`, `top`), labels, descriptions, and XP values inside `LEVEL_CONFIGS`.
* **High-Risk:** Changing the node `lessonId` key format or altering `onSelectLesson(lessonId, sectionId)` without updating the target lesson router in `App.tsx`.

---

### 📖 Level Content (Modular 4-Stage Learning Experience)
* **Exact Source Files:**
  * Container Shell: [`src/components/learn/LevelView.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/learn/LevelView.tsx)
  * Stage 1 (Concept): [`src/components/learn/ConceptLearningPage.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/learn/ConceptLearningPage.tsx)
  * Stage 2 (Interactive): [`src/components/learn/InteractiveLearningPage.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/learn/InteractiveLearningPage.tsx)
  * Stage 3 (Quiz): [`src/components/learn/QuizLearningPage.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/learn/QuizLearningPage.tsx)
  * Stage 4 (Summary): [`src/components/learn/SummaryLearningPage.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/learn/SummaryLearningPage.tsx)
* **Navigation Path:** Clicking any level on the Learning Map or visiting `/learn/level-1`.
* **Firebase Data Used:**
  * Calls `recordModuleCompletion(lessonId, unitId, earnedXp)` to update Firestore collection `users/{uid}/lessonCompletions` and award XP.
* **Where Content is Stored:**
  * Type Definitions: [`src/levels/types.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/levels/types.ts)
  * Central Level Registry: [`src/levels/registry.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/levels/registry.ts)
  * **Level 1 Content:** [`src/levels/level-1/index.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/levels/level-1/index.ts)
  * **Level 2 Content:** [`src/levels/level-2/index.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/levels/level-2/index.ts)
* **Safe to Edit:** Any markdown, tabs, simulation nodes, quiz questions, or mind map edges inside `src/levels/level-X/index.ts`.
* **High-Risk:** Changing the `LevelDefinition` schema in `types.ts` without updating `registry.ts` and all stage pages.

---

### ⚡ Animated Learning (Protocol Simulation Lab)
* **Exact Source File:** [`src/components/views/AnimatedLearningView.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/views/AnimatedLearningView.tsx)
* **Navigation Path:** Sidebar → **Animated Learning** (`currentTab === 'animated-learning'`).
* **Firebase Data Used:**
  * None (pure client-side interactive state machine).
* **Main Components:**
  * Animation Canvas & Timeline Controls (Play, Pause, Step-by-Step, Speed 0.5x/1x/2x).
  * Interactive Packet Inspector (Hex/Header breakdown).
  * Synthesizer Sound triggers via [`src/utils/soundEffects.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/utils/soundEffects.ts).
* **Where Content is Stored:**
  * Array `topics` inside [`src/components/views/AnimatedLearningView.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/views/AnimatedLearningView.tsx#L42).
* **Safe to Edit:** Topic explanations, RFC references, SVG rendering nodes, packet inspection tables, and playback speeds.
* **High-Risk:** The `animationTimerRef` interval cleanup and Web Audio trigger calls.

---

### 📝 Practice, Flashcards & Exam Mode
* **Exact Source File:** [`src/components/views/PracticeView.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/views/PracticeView.tsx)
* **Navigation Path:** Sidebar → **Practice** (`currentTab === 'practice'`).
* **Firebase Data Used:**
  * Writes score results to `practiceScores` inside `users/{uid}`.
* **Main Components:**
  * Flashcards Deck, Scenario Challenges, Packet Header Inspection Drills, Blitz Speed Quizzes.
* **Where Content is Stored:**
  * [`src/data/practiceData.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/data/practiceData.ts) (Flashcards, headers, questions).
  * [`src/data/courseContent.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/data/courseContent.ts) (`QUICK_REFERENCE_FLASHCARDS`, `ALL_PRACTICE_QUESTIONS`).
* **Safe to Edit:** Question text, options, explanations, and flashcard cues in `practiceData.ts`.
* **High-Risk:** Modifying the XP increment or score submission hooks.

---

## 3. "Where to Edit" Quick Reference

Use this index to quickly locate and edit key features:

| Feature / Page | File to Edit | Key Section / Line Reference | Notes |
|---|---|---|---|
| **Dashboard UI** | [`src/components/views/HomeView.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/views/HomeView.tsx) | Line 100+ (`Quick Actions`, `Progress Overview`) | Safe for layout and styling updates. |
| **Learning Map Nodes** | [`src/components/views/LearningMapView.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/views/LearningMapView.tsx) | `LEVEL_CONFIGS` (~Line 60–340) | Edit node position, title, and XP. |
| **Level 1 Content** | [`src/levels/level-1/index.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/levels/level-1/index.ts) | Entire file (`level1Data`) | Contains concept, simulation, quiz, and summary. |
| **Level 2 Content** | [`src/levels/level-2/index.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/levels/level-2/index.ts) | Entire file (`level2Data`) | Contains concept, simulation, quiz, and summary for Routing. |
| **Level 10 (Middle Level)** | [`src/levels/level-10/index.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/levels/level-10/index.ts) | Entire file (`level10Data`) | Transport Protocols ARQ Boss Challenge. |
| **Level 21 (Final Level)** | [`src/levels/level-21/index.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/levels/level-21/index.ts) | Entire file (`level21Data`) | TCP/IP Full-Stack Mastery Capstone. |
| **Animated Learning** | [`src/components/views/AnimatedLearningView.tsx`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/components/views/AnimatedLearningView.tsx) | `topics` (~Line 42) & Simulation renderers (~Line 350+) | Edit protocol steps and SVG drawings. |
| **Quiz (Level-Specific)** | [`src/levels/level-1/index.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/levels/level-1/index.ts#L170), [`src/levels/level-10/index.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/levels/level-10/index.ts), etc. | `quiz: { questions: [...] }` block | Add or edit multiple choice questions per level. |
| **Quiz (Global/Units)** | [`src/data/unitQuizzes.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/data/unitQuizzes.ts) | `UNIT_CHALLENGES` | Unit-level challenge quizzes. |
| **Practice & Flashcards** | [`src/data/practiceData.ts`](file:///d:/new_cresco/cresco%20CN/cresco%20CN/src/data/practiceData.ts) | `PRACTICE_FLASHCARDS`, `SCENARIOS` | Safe repository for review material. |

---

## 4. File Safety Classification

### 🟢 Safe to Edit (Low Risk)
* `src/levels/level-1/index.ts` and `src/levels/level-2/index.ts`: Isolated level content.
* `src/data/practiceData.ts`: Questions and flashcards.
* `src/components/learn/ConceptLearningPage.tsx`: Presentation of concept tabs.
* `src/components/learn/InteractiveLearningPage.tsx`: Presentation of interactive packet canvas.
* `src/components/learn/QuizLearningPage.tsx`: Quiz UI.
* `src/components/learn/SummaryLearningPage.tsx`: Mind map and summary layout.
* `src/components/views/AnimatedLearningView.tsx`: Standalone simulation visualizations.

### 🟡 Medium Risk (Requires Careful Verification)
* `src/components/views/LearningMapView.tsx`: Controls level selection and routing ids.
* `src/levels/registry.ts`: Connects level numbers and slugs to level datasets.
* `src/levels/types.ts`: Interface definitions used across all level pages.
* `src/App.tsx`: Top-level tab routing and modal state.

### 🔴 High Risk (DO NOT Modify Without Review)
* `src/context/AuthContext.tsx`: 2,000+ lines managing authentication, streak math, and Firestore writes.
* `src/lib/firebase.ts` & `firebase-applet-config.json`: Production database connection.
* `firestore.rules`: Security rules for the live database.
* `src/data/courseContent.ts`: Validated by `test_curriculum_and_gamification.ts`.
* `src/utils/soundEffects.ts`: Web Audio API oscillator synthesis.
* `vercel.json` & `server.ts`: Deployment and static serving configuration.
