import { Course, CourseUnitData, CourseModuleData } from '../types';
import { PRIMARY_COURSE, SECONDARY_COURSES } from '../data/networkCourse';
import { COURSE_UNITS, FlattenedModule } from '../data/courseContent';

const STORAGE_KEY_COURSES = 'netquest_custom_courses_v1';
const STORAGE_KEY_MODULES = 'netquest_custom_modules_v1';
const STORAGE_KEY_ORDER = 'netquest_module_order_v1';

export interface NewModuleInput {
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

export interface NewCourseInput {
  title: string;
  code: string;
  description: string;
  department?: string;
  instructor?: string;
}

// 1. Storage Helpers
export function loadCustomCourses(): Course[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COURSES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load custom courses from localStorage:', err);
    return [];
  }
}

export function saveCustomCourse(input: NewCourseInput): Course {
  const existing = loadCustomCourses();
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

  const updated = [...existing, newCourse];
  localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(updated));
  notifyCurriculumUpdated();
  return newCourse;
}

export function loadCustomModules(): FlattenedModule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MODULES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load custom modules from localStorage:', err);
    return [];
  }
}

export function saveCustomModule(input: NewModuleInput): FlattenedModule {
  const existing = loadCustomModules();
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
    globalIndex: 99,
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

  const updated = [...existing, newModule];
  localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(updated));
  notifyCurriculumUpdated();
  return newModule;
}

export function deleteCustomModule(moduleId: string): boolean {
  const existing = loadCustomModules();
  const filtered = existing.filter((m) => m.id !== moduleId);
  if (filtered.length === existing.length) return false;
  localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(filtered));
  notifyCurriculumUpdated();
  return true;
}

// 2. Custom Ordering / Move Module
export function loadModuleOrder(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDER);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveModuleOrder(unitId: string, moduleIds: string[]): void {
  const allOrder = loadModuleOrder();
  allOrder[unitId] = moduleIds;
  localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(allOrder));
  notifyCurriculumUpdated();
}

export function moveModule(unitId: string, moduleId: string, direction: 'up' | 'down'): boolean {
  const normUnitId = unitId.replace('-', '_');
  const mergedUnits = getMergedUnits();
  const unit = mergedUnits.find((u) => u.id === normUnitId);
  if (!unit || !unit.modules) return false;

  const currentIds = unit.modules.map((m) => m.id);
  const idx = currentIds.indexOf(moduleId);
  if (idx === -1) return false;

  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= currentIds.length) return false;

  // Swap
  const temp = currentIds[idx];
  currentIds[idx] = currentIds[targetIdx];
  currentIds[targetIdx] = temp;

  saveModuleOrder(normUnitId, currentIds);
  return true;
}

// 3. Merged Data Providers
export function getMergedCourses(): Course[] {
  const custom = loadCustomCourses();
  return [PRIMARY_COURSE, ...SECONDARY_COURSES, ...custom];
}

export function getMergedUnits(): CourseUnitData[] {
  const customModules = loadCustomModules();
  const savedOrders = loadModuleOrder();

  return COURSE_UNITS.map((baseUnit) => {
    const normUnitId = baseUnit.id.replace('-', '_');
    const unitCustom = customModules.filter((m) => (m.unitId as string).replace('-', '_') === normUnitId);
    
    // Combine base modules with custom modules for this unit
    let combined: CourseModuleData[] = [
      ...(baseUnit.modules || []),
      ...(unitCustom as unknown as CourseModuleData[])
    ];

    // Apply custom ordering if saved
    const order = savedOrders[normUnitId];
    if (order && order.length > 0) {
      const orderMap = new Map<string, number>();
      order.forEach((id, idx) => orderMap.set(id, idx));

      combined.sort((a, b) => {
        const orderA = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : 9999;
        const orderB = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : 9999;
        return orderA - orderB;
      });
    }

    return {
      ...baseUnit,
      moduleCount: combined.length,
      modules: combined,
    };
  });
}

export function getMergedAllModules(): FlattenedModule[] {
  const units = getMergedUnits();
  let globalCount = 0;
  return units.flatMap((unit) => {
    return (unit.modules || []).map((mod, idx) => {
      globalCount++;
      return {
        ...mod,
        unitId: unit.id as any,
        unitTitle: unit.title,
        unitColor: unit.color,
        unitIcon: unit.icon,
        moduleIndex: idx,
        globalIndex: globalCount,
      } as FlattenedModule;
    });
  });
}

export function notifyCurriculumUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('netquest_curriculum_updated'));
  }
}
