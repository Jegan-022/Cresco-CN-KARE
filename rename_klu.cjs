const fs = require('fs');

const filesToUpdate = [
  'src/components/views/NineStepModuleView.tsx',
  'src/components/views/LeaderboardView.tsx',
  'src/components/views/ProfileView.tsx',
  'src/components/views/CoursesView.tsx',
  'src/components/views/LoginView.tsx',
  'src/components/simulators/ModuleSimulators.tsx',
  'src/data/networkCourse.ts',
  'src/data/unitsCurriculum.ts',
  'src/context/AuthContext.tsx'
];

filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/KL University/g, 'KLU University');
  fs.writeFileSync(file, content);
});
