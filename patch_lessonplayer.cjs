const fs = require('fs');

let content = fs.readFileSync('src/components/views/LessonPlayerView.tsx', 'utf-8');

if (!content.includes('NetworkVisualizer')) {
  content = content.replace(
    /import confetti from 'canvas-confetti';/,
    "import confetti from 'canvas-confetti';\nimport { NetworkVisualizer } from '../NetworkVisualizer';"
  );
}

// Add the visualization as step 3 (which moves takeaways to 4)
content = content.replace(
  /const totalSteps = 4 \+ module.quiz.length;/,
  "const totalSteps = 5 + module.quiz.length;"
);

// We need to shift steps. Hook = 0, Analogy = 1, Concept = 2, Visualizer = 3, Takeaways = 4.
content = content.replace(
  /\{\/\* 3: KEY TAKEAWAYS \*\/\}/g,
  `{/* 3: INTERACTIVE VISUALIZATION */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <NetworkVisualizer moduleId={module.id} />
              </div>
            )}

            {/* 4: KEY TAKEAWAYS */}`
);

content = content.replace(
  /step === 3 && \(/,
  "step === 4 && ("
);

content = content.replace(
  /step > 3 && step < totalSteps && \(/,
  "step > 4 && step < totalSteps && ("
);

content = content.replace(
  /Shield className="w-4 h-4" \/> Knowledge Check \{step - 3\}/,
  'Shield className="w-4 h-4" /> Knowledge Check {step - 4}'
);

content = content.replace(
  /const qIndex = step - 4;/,
  "const qIndex = step - 5;"
);

content = content.replace(
  /step > 3 && step < totalSteps/g,
  "step > 4 && step < totalSteps"
);

fs.writeFileSync('src/components/views/LessonPlayerView.tsx', content);
console.log("Patched LessonPlayerView.tsx successfully.");
