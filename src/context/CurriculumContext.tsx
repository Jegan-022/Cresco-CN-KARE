import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Course, CourseUnitData, CourseModuleData } from '../types';
import { FlattenedModule } from '../data/courseContent';
import { 
  getCachedCourses, 
  getCachedUnits, 
  getCachedModules, 
  fetchCoursesFromFirestore, 
  fetchModulesFromFirestore, 
  seedCurriculumToFirestore, 
  saveModuleToFirestore, 
  saveCourseToFirestore, 
  deleteModuleFromFirestore, 
  subscribeToDatabaseCurriculum,
  DynamicModuleInput,
  DynamicCourseInput
} from '../services/courseDatabaseService';

interface CurriculumContextType {
  courses: Course[];
  units: CourseUnitData[];
  modules: FlattenedModule[];
  isLoading: boolean;
  isDbConnected: boolean;
  dbModuleCount: number;
  seedDatabase: () => Promise<{ success: boolean; count: number; error?: string }>;
  addModule: (input: DynamicModuleInput) => Promise<FlattenedModule>;
  addCourse: (input: DynamicCourseInput) => Promise<Course>;
  removeModule: (moduleId: string) => Promise<boolean>;
  refreshCurriculum: () => Promise<void>;
}

const CurriculumContext = createContext<CurriculumContextType | undefined>(undefined);

export const CurriculumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(getCachedCourses());
  const [units, setUnits] = useState<CourseUnitData[]>(getCachedUnits());
  const [modules, setModules] = useState<FlattenedModule[]>(getCachedModules());
  const [isLoading, setIsLoading] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(true);

  const refreshCurriculum = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedCourses, fetchedModules] = await Promise.all([
        fetchCoursesFromFirestore(),
        fetchModulesFromFirestore(),
      ]);
      setCourses(fetchedCourses);
      setModules(fetchedModules);
      setUnits(getCachedUnits());
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Failed to refresh curriculum from Firestore:', err);
      setIsDbConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load from Firestore
    refreshCurriculum();

    // Subscribe to live database updates
    const unsubscribe = subscribeToDatabaseCurriculum((updatedModules) => {
      setModules(updatedModules);
      setUnits(getCachedUnits());
      setIsDbConnected(true);
    });

    const handleCustomEvent = () => {
      setCourses(getCachedCourses());
      setUnits(getCachedUnits());
      setModules(getCachedModules());
    };

    window.addEventListener('netquest_curriculum_updated', handleCustomEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('netquest_curriculum_updated', handleCustomEvent);
    };
  }, [refreshCurriculum]);

  const seedDatabase = async () => {
    setIsLoading(true);
    try {
      const res = await seedCurriculumToFirestore();
      if (res.success) {
        await refreshCurriculum();
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const addModule = async (input: DynamicModuleInput) => {
    const created = await saveModuleToFirestore(input);
    setModules(getCachedModules());
    setUnits(getCachedUnits());
    return created;
  };

  const addCourse = async (input: DynamicCourseInput) => {
    const created = await saveCourseToFirestore(input);
    setCourses(getCachedCourses());
    return created;
  };

  const removeModule = async (moduleId: string) => {
    const success = await deleteModuleFromFirestore(moduleId);
    setModules(getCachedModules());
    setUnits(getCachedUnits());
    return success;
  };

  return (
    <CurriculumContext.Provider
      value={{
        courses,
        units,
        modules,
        isLoading,
        isDbConnected,
        dbModuleCount: modules.length,
        seedDatabase,
        addModule,
        addCourse,
        removeModule,
        refreshCurriculum,
      }}
    >
      {children}
    </CurriculumContext.Provider>
  );
};

export const useCurriculum = (): CurriculumContextType => {
  const context = useContext(CurriculumContext);
  if (!context) {
    throw new Error('useCurriculum must be used within a CurriculumProvider');
  }
  return context;
};
