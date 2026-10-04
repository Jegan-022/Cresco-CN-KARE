import { db, storage } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadString, 
  getDownloadURL,
  getBytes
} from 'firebase/storage';
import { 
  COURSE_DATA, 
  COURSE_UNITS, 
  ALL_MODULES, 
  QUICK_REFERENCE_FLASHCARDS,
  ALL_MODULE_QUIZ_QUESTIONS,
  ALL_PRACTICE_QUESTIONS,
  UNIT_FINAL_QUIZZES
} from '../data/courseContent';
import { CourseUnitData, CourseModuleData, UnitFinalQuizData } from '../types';

export interface CloudFlashcardItem {
  id: string;
  q: string;
  a: string;
  domain?: string;
  type?: string;
  unitId?: string;
  moduleId?: string;
}

export interface CloudCurriculumBundle {
  version: string;
  updatedAt: string;
  units: CourseUnitData[];
  modulesCount: number;
  flashcards: CloudFlashcardItem[];
  quizzes: Record<string, UnitFinalQuizData>;
}

// In-memory cache for ultra-fast subsequent page renders (< 1ms)
let cachedCurriculum: CourseUnitData[] | null = null;
let cachedFlashcards: CloudFlashcardItem[] | null = null;
let cachedQuizzes: Record<string, UnitFinalQuizData> | null = null;

export const curriculumCloudService = {
  /**
   * Upload all curriculum data (Units 3, 4, 5, Modules, Quizzes, Flashcards)
   * to both Firebase Cloud Storage and Firestore collections (Hybrid architecture).
   */
  async syncAllCurriculumToCloud(): Promise<{
    success: boolean;
    storageUrls: Record<string, string>;
    firestoreStats: {
      unitsUploaded: number;
      modulesUploaded: number;
      flashcardsUploaded: number;
      quizzesUploaded: number;
    };
  }> {
    const now = new Date().toISOString();
    const storageUrls: Record<string, string> = {};

    // 1. Prepare formatted flashcard dataset
    const formattedFlashcards: CloudFlashcardItem[] = [
      ...QUICK_REFERENCE_FLASHCARDS.map((card: any, idx: number) => ({
        id: `fc_quick_${idx + 1}`,
        q: card.q,
        a: card.a,
        domain: 'Quick Reference',
        type: 'Key Formula / Rule',
        unitId: 'unit_3',
      })),
      ...ALL_PRACTICE_QUESTIONS.slice(0, 40).map((pq, idx) => ({
        id: `fc_pq_${idx + 1}`,
        q: pq.question,
        a: pq.answer,
        domain: pq.domain,
        type: pq.type,
        unitId: pq.unitId,
        moduleId: pq.moduleId,
      })),
    ];

    const curriculumBundle: CloudCurriculumBundle = {
      version: '1.0.0',
      updatedAt: now,
      units: COURSE_UNITS,
      modulesCount: ALL_MODULES.length,
      flashcards: formattedFlashcards,
      quizzes: UNIT_FINAL_QUIZZES,
    };

    // 2. Upload JSON backups to Firebase Cloud Storage (cresco-cn.firebasestorage.app)
    try {
      const curriculumRef = ref(storage, 'curriculum/course_curriculum.json');
      await uploadString(curriculumRef, JSON.stringify(curriculumBundle, null, 2), 'raw', {
        contentType: 'application/json',
      });
      storageUrls.curriculum = await getDownloadURL(curriculumRef);

      const flashcardsRef = ref(storage, 'curriculum/flashcards.json');
      await uploadString(flashcardsRef, JSON.stringify(formattedFlashcards, null, 2), 'raw', {
        contentType: 'application/json',
      });
      storageUrls.flashcards = await getDownloadURL(flashcardsRef);

      const quizzesRef = ref(storage, 'curriculum/quizzes.json');
      await uploadString(quizzesRef, JSON.stringify(UNIT_FINAL_QUIZZES, null, 2), 'raw', {
        contentType: 'application/json',
      });
      storageUrls.quizzes = await getDownloadURL(quizzesRef);
    } catch (storageErr) {
      console.warn('[CurriculumCloudService] Cloud Storage upload note (continuing to Firestore):', storageErr);
    }

    // 3. Batch Upload to Firestore Collections
    let unitsUploaded = 0;
    let modulesUploaded = 0;
    let flashcardsUploaded = 0;
    let quizzesUploaded = 0;

    try {
      // (a) Upload Units into 'courses' collection
      for (const unit of COURSE_UNITS) {
        await setDoc(doc(db, 'courses', unit.id), {
          id: unit.id,
          title: unit.title,
          icon: unit.icon || 'Layers',
          color: unit.color || '#06B6D4',
          summary: unit.summary || '',
          moduleCount: unit.modules?.length || 0,
          passMark: unit.passMark || 70,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        unitsUploaded++;
      }

      // (b) Upload Modules in batches into 'curriculum_modules' collection
      const moduleBatches: CourseModuleData[][] = [];
      let tempBatch: CourseModuleData[] = [];
      for (const mod of ALL_MODULES) {
        tempBatch.push(mod);
        if (tempBatch.length >= 25) {
          moduleBatches.push(tempBatch);
          tempBatch = [];
        }
      }
      if (tempBatch.length > 0) moduleBatches.push(tempBatch);

      for (const mBatch of moduleBatches) {
        const batch = writeBatch(db);
        for (const mod of mBatch) {
          const modRef = doc(db, 'curriculum_modules', mod.id);
          batch.set(modRef, {
            ...mod,
            updatedAt: serverTimestamp(),
          }, { merge: true });
          modulesUploaded++;
        }
        await batch.commit();
      }

      // (c) Upload Flashcards into 'flashcards' collection
      const flashcardBatches: CloudFlashcardItem[][] = [];
      let tempFcBatch: CloudFlashcardItem[] = [];
      for (const fc of formattedFlashcards) {
        tempFcBatch.push(fc);
        if (tempFcBatch.length >= 25) {
          flashcardBatches.push(tempFcBatch);
          tempFcBatch = [];
        }
      }
      if (tempFcBatch.length > 0) flashcardBatches.push(tempFcBatch);

      for (const fcBatch of flashcardBatches) {
        const batch = writeBatch(db);
        for (const fc of fcBatch) {
          const fcRef = doc(db, 'flashcards', fc.id);
          batch.set(fcRef, {
            ...fc,
            updatedAt: serverTimestamp(),
          }, { merge: true });
          flashcardsUploaded++;
        }
        await batch.commit();
      }

      // (d) Upload Quizzes into 'quizzes' collection
      for (const [quizKey, quizData] of Object.entries(UNIT_FINAL_QUIZZES)) {
        await setDoc(doc(db, 'quizzes', quizKey), {
          ...quizData,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        quizzesUploaded++;
      }

      // (e) Update curriculum metadata doc
      await setDoc(doc(db, 'courses', '_metadata'), {
        version: '1.0.0',
        totalUnits: unitsUploaded,
        totalModules: modulesUploaded,
        totalFlashcards: flashcardsUploaded,
        totalQuizzes: quizzesUploaded,
        lastSyncedAt: serverTimestamp(),
      }, { merge: true });

    } catch (firestoreErr) {
      console.warn('[CurriculumCloudService] Firestore batch upload note:', firestoreErr);
    }

    return {
      success: true,
      storageUrls,
      firestoreStats: {
        unitsUploaded,
        modulesUploaded,
        flashcardsUploaded,
        quizzesUploaded,
      },
    };
  },

  /**
   * Fetch Course Units with automatic 3-tier fallback:
   * 1. Memory Cache (< 1ms)
   * 2. Firestore 'courses' & 'curriculum_modules' collections
   * 3. Built-in Course Units dataset (offline instant guarantee)
   */
  async getCourseUnits(): Promise<CourseUnitData[]> {
    if (cachedCurriculum) {
      return cachedCurriculum;
    }

    try {
      const unitsSnap = await getDocs(collection(db, 'courses'));
      if (!unitsSnap.empty) {
        const remoteUnits: CourseUnitData[] = [];
        const remoteUnitDocs = unitsSnap.docs.filter(d => d.id.startsWith('unit_'));
        
        if (remoteUnitDocs.length >= 3) {
          // Fetch modules
          const modulesSnap = await getDocs(collection(db, 'curriculum_modules'));
          const remoteModules = modulesSnap.docs.map(d => d.data() as CourseModuleData);

          for (const uDoc of remoteUnitDocs) {
            const uData = uDoc.data() as any;
            const unitMods = remoteModules.filter(m => m.unitId === uDoc.id);
            remoteUnits.push({
              id: uDoc.id as 'unit_3' | 'unit_4' | 'unit_5',
              title: uData.title || '',
              icon: uData.icon,
              color: uData.color,
              summary: uData.summary,
              moduleCount: unitMods.length || uData.moduleCount || 0,
              passMark: uData.passMark || 70,
              modules: unitMods.length > 0 ? unitMods : (COURSE_UNITS.find(u => u.id === uDoc.id)?.modules || []),
              finalQuiz: UNIT_FINAL_QUIZZES[uDoc.id],
            });
          }

          if (remoteUnits.length === 3) {
            cachedCurriculum = remoteUnits;
            return remoteUnits;
          }
        }
      }
    } catch (e) {
      console.info('[CurriculumCloudService] Remote course units lookup (using fast local copy):', e);
    }

    // Default fallback to high-yield local curriculum dataset
    cachedCurriculum = COURSE_UNITS;
    return COURSE_UNITS;
  },

  /**
   * Fetch Flashcards with automatic fallback
   */
  async getFlashcards(): Promise<CloudFlashcardItem[]> {
    if (cachedFlashcards) {
      return cachedFlashcards;
    }

    try {
      const fcSnap = await getDocs(collection(db, 'flashcards'));
      if (!fcSnap.empty) {
        const list = fcSnap.docs.map(d => d.data() as CloudFlashcardItem);
        if (list.length > 0) {
          cachedFlashcards = list;
          return list;
        }
      }
    } catch (e) {
      console.info('[CurriculumCloudService] Remote flashcards lookup (using local copy):', e);
    }

    const fallback: CloudFlashcardItem[] = QUICK_REFERENCE_FLASHCARDS.map((card: any, idx: number) => ({
      id: `fc_quick_${idx + 1}`,
      q: card.q,
      a: card.a,
      domain: 'Quick Reference',
      type: 'Key Formula / Rule',
      unitId: 'unit_3',
    }));

    cachedFlashcards = fallback;
    return fallback;
  },

  /**
   * Fetch Quizzes by Unit
   */
  async getUnitQuiz(unitId: string): Promise<UnitFinalQuizData | null> {
    if (cachedQuizzes && cachedQuizzes[unitId]) {
      return cachedQuizzes[unitId];
    }

    try {
      const quizDoc = await getDoc(doc(db, 'quizzes', unitId));
      if (quizDoc.exists()) {
        const data = quizDoc.data() as UnitFinalQuizData;
        if (!cachedQuizzes) cachedQuizzes = {};
        cachedQuizzes[unitId] = data;
        return data;
      }
    } catch (e) {
      console.info('[CurriculumCloudService] Remote quiz lookup (using local copy):', e);
    }

    return UNIT_FINAL_QUIZZES[unitId] || null;
  }
};
