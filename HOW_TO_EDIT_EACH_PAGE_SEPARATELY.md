# 🎓 How to Edit Each Learning Page and Level Separately in Cresco CN

This project now follows a **clean, modular architecture** where the course track learning pathway is divided into separate, independent files. You no longer have to work in a single giant monolithic file!

---

## 🗂️ 1. Directory Structure at a Glance

```
src/
├── components/
│   ├── learn/
│   │   ├── LearnDashboardLayout.tsx      <-- Shell (Header, Search, Left Sidebar, Breadcrumb)
│   │   ├── ConceptLearningPage.tsx       <-- Page 1: Concept, Overview, Diagrams, Takeaways
│   │   ├── InteractiveLearningPage.tsx   <-- Page 2: Chennai -> Mumbai Router Simulation
│   │   ├── QuizPracticePage.tsx          <-- Page 3: MCQ Practice Quiz, Navigator, Timer
│   │   └── LessonSummaryPage.tsx         <-- Page 4: Summary Cards, Mind Map, Completion
│   └── views/
│       └── GamifiedLessonView.tsx        <-- Page Orchestrator (manages active phase)
│
└── data/
    └── lessons/
        ├── lessonModel.ts                <-- TypeScript types for all lesson data
        ├── lessonRegistry.ts             <-- Central registry mapping lesson IDs to files
        └── unit3/
            └── u3_m01_need_and_issues.ts <-- Level 1 / Unit 3 Lesson 1 content
```

---

## 📄 2. How to Edit the Layout / Design of Each Page

| If you want to change... | Open and edit this file: | What you can customize inside: |
| :--- | :--- | :--- |
| **Top Header & Left Sidebar** | `src/components/learn/LearnDashboardLayout.tsx` | App logo, search bar, streak/XP pill, left syllabus drawer, "Download Notes" button. |
| **1. Concept Learning Page** | `src/components/learn/ConceptLearningPage.tsx` | Hero banner gradient, Octo speech bubble, tabs (Overview, Key Concepts, Analogy, Examples, Quick Notes), visual Source -> Network Layer -> Destination diagram. |
| **2. Interactive Simulation Page** | `src/components/learn/InteractiveLearningPage.tsx` | Packet hop animation, topology canvas layout, message input box, transmission speed toggles (1x, 2x, 4x), route information card. |
| **3. Practice Quiz Page** | `src/components/learn/QuizPracticePage.tsx` | MCQ question display, option click states (green/red feedback), explanation box, score/streak counters, question navigator circles, quick tips. |
| **4. Lesson Summary Page** | `src/components/learn/LessonSummaryPage.tsx` | 4 summary cards (Key Concepts, Important Points, Analogy, Uses), interactive Mind Map nodes and links, completion mascot card, "Continue" buttons. |

---

## 📚 3. How to Edit the Content for a Specific Level / Lesson

Every lesson has its own dedicated data file so you can update text, quiz questions, or simulation parameters without touching any React component code!

### Example: Editing Level 1 (Unit 3, Lesson 1)
Open:
`src/data/lessons/unit3/u3_m01_need_and_issues.ts`

Inside this file, you can edit:
1. **Hero Title & Subtitle**:
   ```ts
   title: 'Network Layer — Need and Issues',
   subtitle: 'Understand why the network layer is required...',
   octoConceptSpeech: "Let's understand why the Network Layer exists! 🎓",
   ```

2. **Concept Overview & Takeaways**:
   ```ts
   concept: {
     overview: {
       heading: 'What is Network Layer?',
       body: 'The Network Layer is the third layer in the OSI model...',
       takeaways: [
         'Provides logical addressing (IP addressing)...',
         'Determines the best path for data...'
       ]
     }
   }
   ```

3. **Interactive Simulation Nodes & Latencies**:
   ```ts
   simulation: {
     sourceCity: 'Chennai',
     destinationCity: 'Mumbai',
     nodes: [
       { id: 'src', label: 'Source (Chennai)', type: 'host', x: 8, y: 55 },
       { id: 'r1', label: 'Router R1 (Gateway)', type: 'gateway', x: 28, y: 35 },
       ...
     ],
     bestPath: ['src', 'r1', 'r2', 'r4', 'dst'],
     hops: 3,
     totalTimeMs: 48
   }
   ```

4. **Quiz Questions & Explanations**:
   ```ts
   quiz: {
     questions: [
       {
         id: 'q1',
         question: 'Why does a letter sent across the world reach your doorstep...?',
         options: [
           { id: 'A', text: 'Because the network layer provides logical addressing...' },
           { id: 'B', text: 'Because physical layer is faster...' },
           ...
         ],
         correctOptionId: 'A',
         explanation: 'The network layer provides logical addressing (IP)...'
       }
     ]
   }
   ```

5. **Mind Map Nodes**:
   ```ts
   summary: {
     mindMapCenter: 'Network Layer',
     mindMapBranches: [
       { id: 'b1', title: 'Logical Addressing (IP Address)', color: '#3157D5' },
       { id: 'b2', title: 'Routing & Forwarding', color: '#10B981' },
       ...
     ]
   }
   ```

---

## ➕ 4. How to Add a New Lesson File (e.g. Unit 3, Lesson 2)

1. Create a new file: `src/data/lessons/unit3/u3_m02_routing.ts`
2. Export your lesson object (you can copy `u3_m01_need_and_issues.ts` as a template and customize it).
3. Open `src/data/lessons/lessonRegistry.ts` and add it to `LESSON_MODULES`:
   ```ts
   import { lessonU3M02 } from './unit3/u3_m02_routing';

   const LESSON_MODULES: Record<string, ModularLesson> = {
     'u3_m01': lessonU3M01,
     'u3_m02': lessonU3M02, // <-- added here!
   };
   ```
4. That's it! When any user opens Level 2 from the island map, it automatically renders your new custom lesson content across all 4 pages!
