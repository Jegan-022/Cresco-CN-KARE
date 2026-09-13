import { 
  getMergedCourses, 
  getMergedUnits, 
  getMergedAllModules, 
  saveCustomCourse, 
  saveCustomModule, 
  moveModule, 
  deleteCustomModule 
} from './src/utils/courseManager';
import { getModuleById } from './src/data/courseContent';

// Setup minimal localStorage mock for Node environment
class LocalStorageMock {
  store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, val: string) { this.store[key] = String(val); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

(global as any).localStorage = new LocalStorageMock();
(global as any).window = {
  dispatchEvent: () => true
};

console.log('--- 1. Testing Default Merged Units & Courses ---');
const baseCourses = getMergedCourses();
console.log(`Initial Courses Count: ${baseCourses.length} (Expected >= 3)`);
if (baseCourses.length < 3) throw new Error('Base courses missing');

const baseUnits = getMergedUnits();
const baseModulesCount = getMergedAllModules().length;
console.log(`Initial Modules Count: ${baseModulesCount} (Expected 17)`);
if (baseModulesCount !== 17) throw new Error(`Expected 17 base modules, got ${baseModulesCount}`);

console.log('--- 2. Testing Adding New Course ---');
const newCourse = saveCustomCourse({
  title: 'CS-5300: High-Performance Network Protocols',
  code: 'CS-5300',
  description: 'Advanced distributed consensus, RDMA, and programmable switches.',
  department: 'Computer Science'
});
const updatedCourses = getMergedCourses();
console.log(`Updated Courses Count: ${updatedCourses.length}`);
if (updatedCourses.length !== baseCourses.length + 1) throw new Error('Course addition failed');
console.log('✅ Course creation successful:', newCourse.title);

console.log('--- 3. Testing Adding New Module to Unit 3 ---');
const newModule = saveCustomModule({
  unitId: 'unit_3',
  title: 'Software-Defined Networking (SDN) & OpenFlow',
  code: 'u3_m8',
  duration: '20 mins',
  simulatorType: 'router-cli',
  hook: 'Traditional routers use distributed control planes...',
  concept: 'SDN decouples control and data planes...',
  takeaway: 'Centralized network programmability.'
});
const afterAddModules = getMergedAllModules();
console.log(`Modules Count after addition: ${afterAddModules.length} (Expected 18)`);
if (afterAddModules.length !== 18) throw new Error(`Expected 18 modules, got ${afterAddModules.length}`);
console.log('✅ Module addition successful:', newModule.title);

console.log('--- 4. Testing getModuleById for Custom Module ---');
const resolved = getModuleById('u3_m8');
if (!resolved || resolved.title !== newModule.title) {
  throw new Error('Custom module could not be resolved by getModuleById');
}
console.log('✅ Custom module correctly resolved by getModuleById');

console.log('--- 5. Testing Module Reordering (Move Up / Move Down) ---');
const u3Before = getMergedUnits().find(u => u.id === 'unit_3')!;
const initialU3Ids = u3Before.modules.map(m => m.id);
console.log('Initial Unit 3 last 2 modules:', initialU3Ids.slice(-2));

// Move the new module (currently at end) UP
const movedUp = moveModule('unit_3', 'u3_m8', 'up');
if (!movedUp) throw new Error('moveModule up failed');

const u3AfterMove = getMergedUnits().find(u => u.id === 'unit_3')!;
const movedU3Ids = u3AfterMove.modules.map(m => m.id);
console.log('Unit 3 after move up last 2 modules:', movedU3Ids.slice(-2));
if (movedU3Ids[movedU3Ids.length - 1] === 'u3_m8') {
  throw new Error('Module did not move up!');
}
console.log('✅ Module move up reordering successful');

console.log('--- 6. Testing Custom Module Deletion ---');
const deleted = deleteCustomModule('u3_m8');
if (!deleted) throw new Error('deleteCustomModule failed');
const finalModulesCount = getMergedAllModules().length;
console.log(`Final Modules Count after deletion: ${finalModulesCount} (Expected 17)`);
if (finalModulesCount !== 17) throw new Error(`Expected 17 modules after delete, got ${finalModulesCount}`);
console.log('✅ Custom module deletion successful');

console.log('\n========================================');
console.log('🎉 ALL COURSE & MODULE MANAGEMENT TESTS PASSED!');
console.log('========================================');
