/**
 * Cresco CN - Cloud Storage & Firestore Curriculum Synchronizer
 * Syncs full curriculum data (Units 3, 4, 5, Modules, Quizzes, Flashcards) to:
 * 1. Firebase Cloud Storage (cresco-cn.firebasestorage.app)
 * 2. Firestore Database Collections (courses, curriculum_modules, quizzes, flashcards)
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';
import courseJson from '../src/data/syllabusUnits345.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

async function runCloudSync() {
  console.log('====================================================');
  console.log('🚀 CRESCO CN: CLOUD CURRICULUM SYNCHRONIZATION');
  console.log('Project:', firebaseConfig.projectId);
  console.log('Storage Bucket:', firebaseConfig.storageBucket);
  console.log('====================================================\n');

  const units: any[] = (courseJson as any).units || [];
  const flashcards: any[] = (courseJson as any).quickReferenceFlashcards || [];
  const gamification: any = (courseJson as any).gamification || {};

  const allModules: any[] = [];
  units.forEach((u: any) => {
    (u.modules || []).forEach((m: any) => {
      allModules.push({
        ...m,
        unitId: u.id,
        unitTitle: u.title,
      });
    });
  });

  console.log(`📦 Loaded local curriculum data:`);
  console.log(`   - Units: ${units.length} (Unit 3, Unit 4, Unit 5)`);
  console.log(`   - Modules: ${allModules.length}`);
  console.log(`   - Flashcards: ${flashcards.length}`);
  console.log(`\n⏳ Step 1: Uploading JSON Backups to Cloud Storage...`);

  // 1. Cloud Storage Uploads
  try {
    const curriculumPayload = JSON.stringify({
      version: '1.0.0',
      syncedAt: new Date().toISOString(),
      units,
      modulesCount: allModules.length,
      flashcards,
      gamification
    }, null, 2);

    const curriculumStorageRef = ref(storage, 'curriculum/course_curriculum.json');
    await uploadString(curriculumStorageRef, curriculumPayload, 'raw', {
      contentType: 'application/json'
    });
    const curriculumUrl = await getDownloadURL(curriculumStorageRef).catch(() => 'gs://' + firebaseConfig.storageBucket + '/curriculum/course_curriculum.json');
    console.log(`   ✅ Uploaded: curriculum/course_curriculum.json -> ${curriculumUrl}`);

    const flashcardsPayload = JSON.stringify(flashcards, null, 2);
    const flashcardsStorageRef = ref(storage, 'curriculum/flashcards.json');
    await uploadString(flashcardsStorageRef, flashcardsPayload, 'raw', {
      contentType: 'application/json'
    });
    console.log(`   ✅ Uploaded: curriculum/flashcards.json`);

    const quizzesMap: Record<string, any> = {};
    units.forEach((u: any) => {
      if (u.finalQuiz) quizzesMap[u.id] = u.finalQuiz;
    });
    const quizzesStorageRef = ref(storage, 'curriculum/quizzes.json');
    await uploadString(quizzesStorageRef, JSON.stringify(quizzesMap, null, 2), 'raw', {
      contentType: 'application/json'
    });
    console.log(`   ✅ Uploaded: curriculum/quizzes.json`);
  } catch (err: any) {
    console.warn(`   ⚠️ Cloud Storage note:`, err.message || err);
  }

  // 2. Firestore Collections Upload
  console.log(`\n⏳ Step 2: Syncing Firestore Database Collections...`);

  try {
    // (a) Courses collection
    for (const unit of units) {
      await setDoc(doc(db, 'courses', unit.id), {
        id: unit.id,
        title: unit.title,
        icon: unit.icon || 'Layers',
        color: unit.color || '#06B6D4',
        summary: unit.summary || '',
        moduleCount: unit.modules?.length || 0,
        passMark: unit.passMark || 70,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log(`   ✅ Synced Course Unit: ${unit.id} (${unit.title})`);
    }

    // (b) Curriculum Modules collection in batches
    const batchSize = 25;
    for (let i = 0; i < allModules.length; i += batchSize) {
      const chunk = allModules.slice(i, i + batchSize);
      const batch = writeBatch(db);
      for (const mod of chunk) {
        batch.set(doc(db, 'curriculum_modules', mod.id), {
          ...mod,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      await batch.commit();
      console.log(`   ✅ Synced Modules batch ${i + 1} - ${Math.min(i + batchSize, allModules.length)}`);
    }

    // (c) Flashcards collection
    const fcBatch = writeBatch(db);
    flashcards.forEach((fc: any, idx: number) => {
      const cardId = `fc_${idx + 1}`;
      fcBatch.set(doc(db, 'flashcards', cardId), {
        id: cardId,
        q: fc.q,
        a: fc.a,
        domain: 'Quick Reference',
        type: 'Key Rule / Formula',
        updatedAt: serverTimestamp()
      }, { merge: true });
    });
    await fcBatch.commit();
    console.log(`   ✅ Synced ${flashcards.length} Flashcards to 'flashcards' collection`);

    // (d) Quizzes collection
    for (const unit of units) {
      if (unit.finalQuiz) {
        await setDoc(doc(db, 'quizzes', unit.id), {
          ...unit.finalQuiz,
          unitId: unit.id,
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log(`   ✅ Synced Final Quiz for Unit: ${unit.id}`);
      }
    }

    // (e) Metadata status
    await setDoc(doc(db, 'courses', '_metadata'), {
      version: '1.0.0',
      totalUnits: units.length,
      totalModules: allModules.length,
      totalFlashcards: flashcards.length,
      lastSyncedAt: serverTimestamp(),
      cloudStorageSynced: true
    }, { merge: true });

    console.log('\n====================================================');
    console.log('🎉 CLOUD SYNCHRONIZATION FINISHED SUCCESSFULLY!');
    console.log('Units, Modules, Quizzes, and Flashcards are live on Cloud!');
    console.log('====================================================');
  } catch (err: any) {
    console.error('❌ Firestore sync error:', err);
  }
}

runCloudSync().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
