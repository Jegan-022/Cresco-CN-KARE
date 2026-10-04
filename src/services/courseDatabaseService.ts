import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Course, CourseUnitData, CourseModuleData } from '../types';
import { PRIMARY_COURSE, SECONDARY_COURSES } from '../data/networkCourse';
import { COURSE_UNITS, ALL_MODULES, FlattenedModule } from '../data/courseContent';

const CACHE_KEY_COURSES = 'cresco_db_courses_v1';
const CACHE_KEY_MODULES = 'cresco_db_modules_v1';
const CACHE_KEY_UNITS = 'cresco_db_units_v1';

export interface DynamicModuleInput {
  unitId: string;
  title: string;
  code?: string;
  duration?: string;
  simulatorType?: string;
  hook?: string;
  analogy?: string;
  concept?: string;
  takeaway?: string;
  quizQuestion?: string;
  quizOptions?: string[];
  quizCorrectIndex?: number;
  quizExplanation?: string;
  xpReward?: number;
}

export interface DynamicCourseInput {
  title: string;
  code: string;
  description: string;
  department?: string;
  instructor?: string;
}

// Memory caches initialized with static defaults so UI is 0ms instantaneous
let cachedCourses: Course[] = [PRIMARY_COURSE, ...SECONDARY_COURSES];
let cachedUnits: CourseUnitData[] = COURSE_UNITS;
let cachedModules: FlattenedModule[] = ALL_MODULES;

// Try to hydrate from localStorage immediately
if (typeof window !== 'undefined') {
  try {
    const savedCourses = localStorage.getItem(CACHE_KEY_COURSES);
    if (savedCourses) cachedCourses = JSON.parse(savedCourses);
    const savedModules = localStorage.getItem(CACHE_KEY_MODULES);
    if (savedModules) cachedModules = JSON.parse(savedModules);
  } catch (e) {
    console.warn('Could not read curriculum cache from localStorage:', e);
  }
}

export const getCachedCourses = (): Course[] => cachedCourses;
export const getCachedUnits = (): CourseUnitData[] => cachedUnits;
export const getCachedModules = (): FlattenedModule[] => cachedModules;

export const dispatchCurriculumUpdate = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('netquest_curriculum_updated'));
  }
};

/**
 * 1. Seed All Built-in Courses & Modules to Firestore Database
 * Allows 1-click publishing of the full 30-module curriculum to Firestore
 */
export async function seedCurriculumToFirestore(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const batch = writeBatch(db);
    let count = 0;

    // 1. Seed Courses
    const coursesToSeed = [PRIMARY_COURSE, ...SECONDARY_COURSES];
    for (const c of coursesToSeed) {
      const cRef = doc(db, 'courses', c.id);
      batch.set(cRef, {
        ...c,
        isPublished: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      count++;
    }

    // 2. Seed Units
    for (const u of COURSE_UNITS) {
      const uRef = doc(db, 'curriculum_units', u.id);
      const moduleIds = (u.modules || []).map((m) => m.id);
      batch.set(uRef, {
        id: u.id,
        title: u.title,
        icon: u.icon || 'Network',
        color: u.color || '#3b82f6',
        summary: u.summary || '',
        moduleCount: u.modules?.length || 0,
        moduleIds,
        finalQuiz: u.finalQuiz || null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      count++;
    }

    // 3. Seed Modules in batches
    for (const m of ALL_MODULES) {
      const mRef = doc(db, 'modules', m.id);
      batch.set(mRef, {
        ...m,
        isCustom: false,
        isPublished: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      count++;
    }

    await batch.commit();

    // Cache locally
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY_COURSES, JSON.stringify(coursesToSeed));
      localStorage.setItem(CACHE_KEY_MODULES, JSON.stringify(ALL_MODULES));
    }

    dispatchCurriculumUpdate();
    return { success: true, count };
  } catch (err: any) {
    console.error('Failed to seed curriculum to Firestore:', err);
    return { success: false, count: 0, error: err?.message || 'Firestore seed failed' };
  }
}

/**
 * 2. Fetch Courses from Firestore
 */
export async function fetchCoursesFromFirestore(): Promise<Course[]> {
  try {
    const snap = await getDocs(collection(db, 'courses'));
    if (!snap.empty) {
      const list: Course[] = [];
      snap.forEach((d) => {
        list.push({ ...(d.data() as Course), id: d.id });
      });

      // Merge with default primary course if not present
      const hasPrimary = list.some((c) => c.id === PRIMARY_COURSE.id);
      const combined = hasPrimary ? list : [PRIMARY_COURSE, ...list];

      cachedCourses = combined;
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY_COURSES, JSON.stringify(combined));
      }
      return combined;
    }
  } catch (err) {
    console.warn('Firestore courses fetch fallback:', err);
  }
  return cachedCourses;
}

/**
 * 3. Fetch Modules from Firestore
 */
export async function fetchModulesFromFirestore(): Promise<FlattenedModule[]> {
  try {
    const snap = await getDocs(collection(db, 'modules'));
    if (!snap.empty) {
      const remoteModules: FlattenedModule[] = [];
      snap.forEach((d) => {
        remoteModules.push({ ...(d.data() as FlattenedModule), id: d.id });
      });

      // Map to ensure default modules are merged without duplicates
      const moduleMap = new Map<string, FlattenedModule>();
      ALL_MODULES.forEach((m) => moduleMap.set(m.id, m));
      remoteModules.forEach((m) => moduleMap.set(m.id, { ...moduleMap.get(m.id), ...m }));

      const combined = Array.from(moduleMap.values());
      cachedModules = combined;

      // Re-aggregate cached units
      cachedUnits = COURSE_UNITS.map((unit) => {
        const normUnitId = unit.id.replace('-', '_');
        const unitMods = combined.filter((m) => (m.unitId as string).replace('-', '_') === normUnitId);
        return {
          ...unit,
          moduleCount: unitMods.length,
          modules: unitMods as unknown as CourseModuleData[],
        };
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY_MODULES, JSON.stringify(combined));
        localStorage.setItem(CACHE_KEY_UNITS, JSON.stringify(cachedUnits));
      }

      dispatchCurriculumUpdate();
      return combined;
    }
  } catch (err) {
    console.warn('Firestore modules fetch fallback:', err);
  }
  return cachedModules;
}

/**
 * 4. Save New or Edited Module directly to Firestore Database
 */
export async function saveModuleToFirestore(input: DynamicModuleInput): Promise<FlattenedModule> {
  const modId = input.code
    ? input.code.toLowerCase().replace(/[^a-z0-9_]/g, '_')
    : `mod_${Date.now()}`;

  let unitTitle = 'Unit 3: Network Layer';
  if (input.unitId === 'unit_4' || input.unitId === 'unit-4') unitTitle = 'Unit 4: Transport Layer';
  if (input.unitId === 'unit_5' || input.unitId === 'unit-5') unitTitle = 'Unit 5: Application Layer';

  const defaultQuiz = [
    {
      id: `${modId}_q1`,
      question: input.quizQuestion || `What is the primary function of ${input.title}?`,
      options: input.quizOptions && input.quizOptions.length === 4
        ? input.quizOptions
        : [
            `Coordinates services and protocol parameters for ${input.title}.`,
            'Discards corrupted packets without checksum calculation.',
            'Bypasses physical transmission medium entirely.',
            'Encrypts payload using deprecated DES algorithm.'
          ],
      correctIndex: input.quizCorrectIndex ?? 0,
      explanation: input.quizExplanation || `Correct! ${input.title} manages end-to-end communication parameters and system resilience.`
    }
  ];

  const newModule: FlattenedModule = {
    id: modId,
    code: input.code || modId.toUpperCase(),
    title: input.title,
    xp: input.xpReward || 50,
    readTimeMinutes: 15,
    duration: input.duration || '15 mins',
    unitId: (input.unitId.replace('-', '_')) as any,
    unitTitle,
    moduleIndex: 99,
    globalIndex: cachedModules.length + 1,
    simulatorType: input.simulatorType || 'router-cli',
    pedagogy: {
      hook: input.hook || `Discover how ${input.title} enables reliable communications and data delivery.`,
      analogy: input.analogy || `Think of ${input.title} like an intelligent dispatch hub routing packets to their exact destination.`,
      concept: input.concept || `${input.title} is an architectural pillar of modern networking, ensuring high availability, protocol compliance, and optimal throughput.`,
      keyTakeaways: [
        input.takeaway || `${input.title} standardizes service interaction across heterogeneous network topologies.`,
        'Ensures predictable end-to-end packet delivery and fault tolerance.',
        'Essential concept for RFC compliance and university examinations.'
      ]
    },
    lesson: {
      hook: input.hook || `Discover how ${input.title} operates in modern computer networks.`,
      keyConcepts: [
        input.concept || `Fundamental mechanisms and protocol interactions of ${input.title}.`,
        'Header formats, handshake procedures, and state-machine transitions.',
        'High-performance buffering, error detection, and congestion control.'
      ],
      takeaway: input.takeaway || `${input.title} provides critical infrastructure for modern scalable networks.`,
      deepDive: {
        section1: `In-depth theoretical examination of ${input.title}: protocol architecture, standard RFC behaviors, and operational metrics.`,
        section2: `Practical applications: network diagnostics, packet-level analysis, and real-world deployment considerations.`
      },
      visualization: {
        type: input.simulatorType || 'router-cli',
        description: `Interactive simulation demonstrating operational states and datagram exchange for ${input.title}.`
      }
    },
    keyTakeaways: [
      input.takeaway || `${input.title} provides critical infrastructure for modern scalable networks.`,
      'Configured with standard protocol timeouts and buffer mechanisms.'
    ],
    practiceDrills: [
      {
        id: `${modId}_drill_1`,
        title: `${input.title} Architecture Analysis`,
        scenario: `A network node experiences latency during communication under ${input.title}. Determine the optimal configuration.`,
        prompt: `A network node experiences latency during communication under ${input.title}. Calculate the operational efficiency and recommend configuration parameters for ${input.title}.`,
        question: `Calculate the operational efficiency and recommend configuration parameters for ${input.title}.`,
        solution: `Inspect routing tables and MTU sizing to eliminate packet fragmentation and maintain low jitter.`
      }
    ],
    quiz: defaultQuiz,
    isCustom: true,
  };

  // 1. Persist to Firestore
  try {
    const modRef = doc(db, 'modules', modId);
    await setDoc(modRef, {
      ...newModule,
      isPublished: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore module setDoc error, saved to local cache:', err);
  }

  // 2. Update local state & cache
  const existingIdx = cachedModules.findIndex((m) => m.id === modId);
  if (existingIdx >= 0) {
    cachedModules[existingIdx] = newModule;
  } else {
    cachedModules.push(newModule);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(CACHE_KEY_MODULES, JSON.stringify(cachedModules));
  }

  dispatchCurriculumUpdate();
  return newModule;
}

/**
 * 5. Save New Course to Firestore Database
 */
export async function saveCourseToFirestore(input: DynamicCourseInput): Promise<Course> {
  const id = input.code.toLowerCase().replace(/[^a-z0-9]/g, '-') || `course-${Date.now()}`;
  
  const newCourse: Course = {
    id,
    title: input.title,
    subtitle: input.description,
    description: input.description,
    instructor: input.instructor || 'Staff Instructor',
    instructorTitle: 'Course Coordinator',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    studentsCount: 1,
    progressPercent: 0,
    completedLessonsCount: 0,
    totalLessonsCount: 0,
    currentLessonId: '',
    currentLessonTitle: 'No modules yet',
    lastAccessed: 'Just now',
    sectionsCount: 1,
    category: input.department || 'Computer Science',
  };

  // Persist to Firestore
  try {
    const cRef = doc(db, 'courses', id);
    await setDoc(cRef, {
      ...newCourse,
      isPublished: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore course setDoc error, saved to local cache:', err);
  }

  const existingIdx = cachedCourses.findIndex((c) => c.id === id);
  if (existingIdx >= 0) {
    cachedCourses[existingIdx] = newCourse;
  } else {
    cachedCourses.push(newCourse);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(CACHE_KEY_COURSES, JSON.stringify(cachedCourses));
  }

  dispatchCurriculumUpdate();
  return newCourse;
}

/**
 * 6. Delete Module from Firestore Database
 */
export async function deleteModuleFromFirestore(moduleId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'modules', moduleId));
  } catch (err) {
    console.warn('Firestore deleteDoc fallback:', err);
  }

  cachedModules = cachedModules.filter((m) => m.id !== moduleId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(CACHE_KEY_MODULES, JSON.stringify(cachedModules));
  }

  dispatchCurriculumUpdate();
  return true;
}

/**
 * 7. Real-Time Listener on Modules Collection
 * Automatically keeps all learner dashboards and lesson maps live without page reloads
 */
export function subscribeToDatabaseCurriculum(onChange: (modules: FlattenedModule[]) => void): () => void {
  try {
    const unsub = onSnapshot(collection(db, 'modules'), (snap) => {
      if (!snap.empty) {
        const remoteList: FlattenedModule[] = [];
        snap.forEach((d) => {
          remoteList.push({ ...(d.data() as FlattenedModule), id: d.id });
        });

        const map = new Map<string, FlattenedModule>();
        ALL_MODULES.forEach((m) => map.set(m.id, m));
        remoteList.forEach((m) => map.set(m.id, { ...map.get(m.id), ...m }));

        const merged = Array.from(map.values());
        cachedModules = merged;
        if (typeof window !== 'undefined') {
          localStorage.setItem(CACHE_KEY_MODULES, JSON.stringify(merged));
        }
        onChange(merged);
        dispatchCurriculumUpdate();
      }
    }, (err) => {
      console.warn('Real-time database curriculum subscription error:', err);
    });
    return unsub;
  } catch (e) {
    console.warn('Real-time curriculum listener setup failed:', e);
    return () => {};
  }
}
