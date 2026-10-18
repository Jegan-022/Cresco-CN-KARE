// Level Routing Utility for Cresco CN
// Provides direct, lightweight URL routing for /learn/level1 through /learn/level21
// without replacing the existing navigation system.

export interface LevelRouteInfo {
  levelNumber: number; // 1 to 21
  slug: string;        // 'level1' to 'level21'
  path: string;        // '/learn/level1' to '/learn/level21'
  lessonId: string;    // 'u3_m01', etc.
  sectionId: number;   // Unit 3, 4, 5 section ID
  title: string;
}

export const LEVEL_ROUTES: Record<number, LevelRouteInfo> = {
  1: {
    levelNumber: 1,
    slug: 'level1',
    path: '/learn/level1',
    lessonId: 'u3_m01',
    sectionId: 3,
    title: 'Network Layer: Need & Issues',
  },
  2: {
    levelNumber: 2,
    slug: 'level2',
    path: '/learn/level2',
    lessonId: 'u3_m02',
    sectionId: 3,
    title: 'Routing Algorithms',
  },
  3: {
    levelNumber: 3,
    slug: 'level3',
    path: '/learn/level3',
    lessonId: 'u3_m03',
    sectionId: 3,
    title: 'Quality of Service (QoS)',
  },
  4: {
    levelNumber: 4,
    slug: 'level4',
    path: '/learn/level4',
    lessonId: 'u3_m05',
    sectionId: 3,
    title: 'IPv4 & IPv6 Packet Formats',
  },
  5: {
    levelNumber: 5,
    slug: 'level5',
    path: '/learn/level5',
    lessonId: 'u3_m06',
    sectionId: 3,
    title: 'Addressing & Router Configuration',
  },
  6: {
    levelNumber: 6,
    slug: 'level6',
    path: '/learn/level6',
    lessonId: 'u3_m02',
    sectionId: 3,
    title: 'Distance Vector Routing & RIP',
  },
  7: {
    levelNumber: 7,
    slug: 'level7',
    path: '/learn/level7',
    lessonId: 'u3_m07',
    sectionId: 3,
    title: 'Link State Routing, OSPF & BGP',
  },
  8: {
    levelNumber: 8,
    slug: 'level8',
    path: '/learn/level8',
    lessonId: 'u3_m08',
    sectionId: 3,
    title: 'Subnetting, CIDR, VLSM & Protocols',
  },
  9: {
    levelNumber: 9,
    slug: 'level9',
    path: '/learn/level9',
    lessonId: 'u4_m05',
    sectionId: 4,
    title: 'Transport Layer Services',
  },
  10: {
    levelNumber: 10,
    slug: 'level10',
    path: '/learn/level10',
    lessonId: 'u4_m05',
    sectionId: 4,
    title: 'Transport Protocols: ARQ Challenge',
  },
  11: {
    levelNumber: 11,
    slug: 'level11',
    path: '/learn/level11',
    lessonId: 'u4_m06',
    sectionId: 4,
    title: 'User Datagram Protocol (UDP)',
  },
  12: {
    levelNumber: 12,
    slug: 'level12',
    path: '/learn/level12',
    lessonId: 'u4_m05',
    sectionId: 4,
    title: 'TCP Services & Segment Structure',
  },
  13: {
    levelNumber: 13,
    slug: 'level13',
    path: '/learn/level13',
    lessonId: 'u4_m05',
    sectionId: 4,
    title: 'TCP Connection: 3-Way Handshake',
  },
  14: {
    levelNumber: 14,
    slug: 'level14',
    path: '/learn/level14',
    lessonId: 'u4_m05',
    sectionId: 4,
    title: 'TCP State Transition Diagram',
  },
  15: {
    levelNumber: 15,
    slug: 'level15',
    path: '/learn/level15',
    lessonId: 'u4_m05',
    sectionId: 4,
    title: 'TCP Flow, Error & Congestion Control',
  },
  16: {
    levelNumber: 16,
    slug: 'level16',
    path: '/learn/level16',
    lessonId: 'u5_m02',
    sectionId: 5,
    title: 'Domain Name System (DNS)',
  },
  17: {
    levelNumber: 17,
    slug: 'level17',
    path: '/learn/level17',
    lessonId: 'u5_m02',
    sectionId: 5,
    title: 'World Wide Web & HTTP / HTTPS',
  },
  18: {
    levelNumber: 18,
    slug: 'level18',
    path: '/learn/level18',
    lessonId: 'u5_m02',
    sectionId: 5,
    title: 'File Transfer Protocol (FTP)',
  },
  19: {
    levelNumber: 19,
    slug: 'level19',
    path: '/learn/level19',
    lessonId: 'u5_m02',
    sectionId: 5,
    title: 'Email Protocols: SMTP, POP3 & IMAP',
  },
  20: {
    levelNumber: 20,
    slug: 'level20',
    path: '/learn/level20',
    lessonId: 'u5_m08',
    sectionId: 5,
    title: 'Remote Terminal: Telnet vs SSH',
  },
  21: {
    levelNumber: 21,
    slug: 'level21',
    path: '/learn/level21',
    lessonId: 'u5_m08',
    sectionId: 5,
    title: 'TCP/IP Mastery & Internet Capstone',
  },
};

/**
 * Returns LevelRouteInfo for level 1 to 21 (defaults to level 1 if out of range)
 */
export function getLevelRoute(levelNumber: number): LevelRouteInfo {
  const num = Math.min(21, Math.max(1, levelNumber));
  return LEVEL_ROUTES[num] || LEVEL_ROUTES[1];
}

/**
 * Parses a pathname (e.g. '/learn/level1', '/learn/level-1', '/learn/1') into LevelRouteInfo
 */
export function parseLevelFromPath(pathname: string): LevelRouteInfo | null {
  if (!pathname) return null;
  const cleanPath = pathname.trim().toLowerCase();

  // Match /learn/level1 .. /learn/level21 or /learn/level-1 .. /learn/level-21
  const levelMatch = cleanPath.match(/\/learn\/level-?(\d+)/i);
  if (levelMatch) {
    const num = parseInt(levelMatch[1], 10);
    if (num >= 1 && num <= 21) {
      return getLevelRoute(num);
    }
  }

  // Match /learn/1 .. /learn/21
  const plainNumMatch = cleanPath.match(/\/learn\/(\d+)/i);
  if (plainNumMatch) {
    const num = parseInt(plainNumMatch[1], 10);
    if (num >= 1 && num <= 21) {
      return getLevelRoute(num);
    }
  }

  // Match /learn/u3_m01 etc.
  const lessonMatch = cleanPath.match(/\/learn\/(u[345]_m\w+)/i);
  if (lessonMatch) {
    return getLevelRouteByLessonId(lessonMatch[1]);
  }

  return null;
}

/**
 * Safely finds level route by lessonId, returning null if unmatched
 */
export function findLevelRouteByLessonId(lessonId: string): LevelRouteInfo | null {
  if (!lessonId) return null;
  const cleanId = lessonId.trim().toLowerCase();

  // If passed directly as 'level1' or 'level-1'
  const match = cleanId.match(/^level-?(\d+)$/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 21) return getLevelRoute(num);
  }

  // Find in registry
  for (let i = 1; i <= 21; i++) {
    if (LEVEL_ROUTES[i].lessonId.toLowerCase() === cleanId) {
      return LEVEL_ROUTES[i];
    }
  }

  return null;
}

/**
 * Finds level route by lessonId (e.g. 'u3_m01' -> level 1)
 */
export function getLevelRouteByLessonId(lessonId: string): LevelRouteInfo {
  const found = findLevelRouteByLessonId(lessonId);
  if (found) return found;

  const cleanId = lessonId ? lessonId.trim().toLowerCase() : '';

  // Fallback: derive from unit and module numbers if possible
  const unitMatch = cleanId.match(/u([345])_m0?(\d+)/i);
  if (unitMatch) {
    const u = parseInt(unitMatch[1], 10);
    const m = parseInt(unitMatch[2], 10);
    if (u === 3) {
      const lvl = Math.min(8, Math.max(1, m));
      return getLevelRoute(lvl);
    } else if (u === 4) {
      const lvl = Math.min(15, Math.max(9, 8 + m));
      return getLevelRoute(lvl);
    } else if (u === 5) {
      const lvl = Math.min(21, Math.max(16, 15 + m));
      return getLevelRoute(lvl);
    }
  }

  return LEVEL_ROUTES[1];
}

/**
 * Returns canonical path string '/learn/levelX'
 */
export function getLevelPath(levelNumber: number): string {
  return `/learn/level${Math.min(21, Math.max(1, levelNumber))}`;
}
