const fs = require('fs');

const content = fs.readFileSync('src/context/AuthContext.tsx', 'utf-8');

const newUpdateStudentProfile = `  const updateStudentProfile = async (updates: Partial<UserProfileData>) => {
    if (!currentUser) return;
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    try {
      const userRef = doc(db, 'students', currentUser.uid);
      await updateDoc(userRef, { ...updates, updatedAt: serverTimestamp() });
    } catch (e) {
      console.warn('Failed to update student profile in Firestore:', e);
    }
  };`;

const newRecordModuleCompletion = `  const recordModuleCompletion = async (
    moduleId: string, 
    unitId: 'unit-3' | 'unit-4' | 'unit-5', 
    moduleXp: number = 50
  ): Promise<{ success: boolean; duplicate: boolean }> => {
    if (!currentUser) return { success: false, duplicate: false };

    if (userProfile?.completedModules?.includes(moduleId)) {
      return { success: true, duplicate: true };
    }

    const nextXP = (userProfile?.totalXP || 0) + moduleXp;
    const newCompletedList = [...(userProfile?.completedModules || []), moduleId];
    const newOverallProgress = Math.min(100, Math.round((newCompletedList.length / 45) * 100));
    
    setUserProfile((prev) => prev ? {
      ...prev,
      completedModules: newCompletedList,
      totalXP: nextXP,
      xp: nextXP,
      overallProgress: newOverallProgress,
      modulesCompleted: newCompletedList.length
    } : null);

    try {
      const userRef = doc(db, 'students', currentUser.uid);
      await updateDoc(userRef, {
        completedModules: arrayUnion(moduleId),
        totalXP: increment(moduleXp),
        xp: increment(moduleXp),
        modulesCompleted: increment(1),
        overallProgress: newOverallProgress,
        updatedAt: serverTimestamp()
      });
      return { success: true, duplicate: false };
    } catch (err) {
      console.error("Failed to record module completion in Firestore:", err);
    }
    return { success: true, duplicate: false };
  };`;

// Replace updateStudentProfile
let patched = content.replace(
  /const updateStudentProfile = async \([^)]+\) => \{[\s\S]*?(?=\/\/ Record completed module)/g,
  newUpdateStudentProfile + '\n\n  // Record completed module'
);

// Replace recordModuleCompletion
patched = patched.replace(
  /const recordModuleCompletion = async \([\s\S]*?return \{ success: true, duplicate: false \};\n  \};/g,
  newRecordModuleCompletion
);

fs.writeFileSync('src/context/AuthContext.tsx', patched);
console.log("Patched AuthContext.tsx successfully.");
