const fs = require('fs');

let content = fs.readFileSync('src/components/views/AnalyticsView.tsx', 'utf-8');

if (!content.includes('useAuth')) {
  content = content.replace(
    "import React from 'react';",
    "import React from 'react';\nimport { useAuth } from '../../context/AuthContext';"
  );
  
  content = content.replace(
    "export const AnalyticsView: React.FC = () => {",
    "export const AnalyticsView: React.FC = () => {\n  const { userProfile, currentUser } = useAuth();\n  const displayName = userProfile?.displayName || currentUser?.email?.split('@')[0] || 'Student';"
  );
  
  content = content.replace(
    "Student Analytics // Alex Chen",
    "Student Analytics // {displayName}"
  );
}

fs.writeFileSync('src/components/views/AnalyticsView.tsx', content);
console.log("Patched AnalyticsView.tsx to use Auth context.");
