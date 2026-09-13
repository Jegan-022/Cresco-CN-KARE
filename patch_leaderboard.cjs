const fs = require('fs');

let content = fs.readFileSync('src/components/views/LeaderboardView.tsx', 'utf-8');

// Replace fetchWithAuth with firestore query
content = content.replace(
  /const fetchLeaderboard = async \(\) => \{[\s\S]*?fetchWithAuth\('\/api\/leaderboard'\);[\s\S]*?data\.leaderboard\);[\s\S]*?finally \{[\s\S]*?\}\n    \};/,
  `const fetchLeaderboard = async () => {
      try {
        const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        
        const q = query(
          collection(db, 'students'),
          orderBy('totalXP', 'desc'),
          limit(100)
        );
        const querySnapshot = await getDocs(q);
        const leaderboardData: any[] = [];
        querySnapshot.forEach((doc) => {
          leaderboardData.push({ uid: doc.id, ...doc.data() });
        });
        setRealtimeStudents(leaderboardData);
      } catch (err) {
        console.error("Failed to fetch leaderboard from Firestore:", err);
      } finally {
        setLoading(false);
      }
    };`
);

fs.writeFileSync('src/components/views/LeaderboardView.tsx', content);
console.log("Patched LeaderboardView.tsx successfully.");
