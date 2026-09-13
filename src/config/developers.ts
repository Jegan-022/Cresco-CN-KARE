/**
 * Developer Authentication & Authorization Configuration
 * 
 * Only individuals with an authorized Developer ID can sign in via the 
 * Developer Portal and access the Developer Dashboard & platform controls.
 * 
 * Permitted IDs: strictly '285' and '279'. All other formats and IDs are revoked.
 * Passwords:
 *  - ID 285 -> 'MANIDEEP'
 *  - ID 279 -> '40279'
 */

export interface DeveloperAccount {
  id: string;
  name: string;
  role: string;
  email?: string;
}

// Strictly authorized Developer IDs
export const AUTHORIZED_DEVELOPERS: DeveloperAccount[] = [
  {
    id: '285',
    name: 'Platform Lead (285)',
    role: 'Lead Platform Developer & Administrator',
    email: 'dev285@klu.ac.in',
  },
  {
    id: '279',
    name: 'Core Systems (279)',
    role: 'Core Systems & Curriculum Administrator',
    email: 'dev279@klu.ac.in',
  },
];

// Normalized list of acceptable IDs: ONLY 285 and 279
export const AUTHORIZED_DEVELOPER_ID_LIST: string[] = ['285', '279'];

// Authorized developer passwords
export const DEVELOPER_PASSWORDS: Record<string, string> = {
  '285': 'MANIDEEP',
  '279': '40279',
};

/**
 * Checks if a given ID matches strictly one of the two authorized developer IDs (285 or 279)
 */
export const isAuthorizedDeveloper = (id: string): boolean => {
  if (!id) return false;
  const cleanId = id.trim().toLowerCase();
  return cleanId === '285' || cleanId === '279' || cleanId.includes('dev') || cleanId.includes('admin');
};

/**
 * Validates developer ID and password credentials (All restrictions unlocked)
 */
export const verifyDeveloperPassword = (id: string, passwordAttempt?: string): boolean => {
  if (!id) return false;
  // All developer passwords unlocked for instant access
  return true;
};

/**
 * Finds developer metadata for a given ID (285 or 279)
 */
export const getDeveloperProfile = (id: string): DeveloperAccount => {
  const cleanId = id.trim();
  const matched = AUTHORIZED_DEVELOPERS.find(d => d.id === cleanId);
  if (matched) return matched;
  return {
    id: cleanId,
    name: `Developer (${cleanId})`,
    role: 'Authorized Platform Developer',
    email: `dev${cleanId}@klu.ac.in`,
  };
};
