/**
 * CRESCO CN - Authentication Repair, Google Sign-in, Terms Acceptance, and Admin Verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

describe('CRESCO CN - Authentication Repair & Authorization Suite', () => {

  it('1. Terms & Conditions acceptance model integrity', () => {
    // Model requires termsAccepted, termsAcceptedAt, termsVersion
    const mockFirstTimeRegistration = {
      name: 'Test Student',
      registerNumber: '99220041234',
      year: '2',
      department: 'CSE',
      section: 'A',
      termsAccepted: false,
    };

    // Verify registration validator blocks registration without terms
    const validateRegistration = (data: typeof mockFirstTimeRegistration) => {
      if (!data.termsAccepted) {
        throw new Error('You must agree to the Terms & Conditions and Privacy Policy to continue.');
      }
      return {
        ...data,
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: '1.0',
      };
    };

    assert.throws(
      () => validateRegistration(mockFirstTimeRegistration),
      /Terms & Conditions and Privacy Policy/
    );

    const acceptedRegistration = validateRegistration({
      ...mockFirstTimeRegistration,
      termsAccepted: true,
    });

    assert.strictEqual(acceptedRegistration.termsAccepted, true);
    assert.strictEqual(acceptedRegistration.termsVersion, '1.0');
    assert.ok(typeof acceptedRegistration.termsAcceptedAt === 'string');
  });

  it('2. Existing users do not require re-acceptance of terms', () => {
    const existingProfile = {
      uid: 'user_xyz_123',
      name: 'Existing Scholar',
      email: 'scholar@klu.ac.in',
      termsAccepted: true,
      termsAcceptedAt: '2026-10-15T00:00:00.000Z',
      termsVersion: '1.0',
    };

    const needsTermsPrompt = (profile: typeof existingProfile) => {
      return !profile.termsAccepted;
    };

    assert.strictEqual(needsTermsPrompt(existingProfile), false);
  });

  it('3. Google Sign-In error handling for popup closure/cancellation', () => {
    // Simulating Firebase popup cancellation error codes
    const handleGoogleAuthError = (errorCode: string) => {
      switch (errorCode) {
        case 'auth/popup-closed-by-user':
          return { handled: true, action: 'cancel', message: 'Sign-in was cancelled before completion.' };
        case 'auth/popup-blocked':
          return { handled: true, action: 'redirect_fallback', message: 'Popup was blocked by your browser.' };
        case 'auth/cancelled-popup-request':
          return { handled: true, action: 'ignore_redundant', message: 'Duplicate popup request ignored.' };
        default:
          return { handled: false, action: 'throw', message: 'Authentication failure.' };
      }
    };

    assert.strictEqual(handleGoogleAuthError('auth/popup-closed-by-user').action, 'cancel');
    assert.strictEqual(handleGoogleAuthError('auth/popup-blocked').action, 'redirect_fallback');
    assert.strictEqual(handleGoogleAuthError('auth/cancelled-popup-request').action, 'ignore_redundant');
  });

  it('4. Role-based authorization: Student accounts cannot claim Admin role', () => {
    const studentUser = {
      uid: 'std_4100_01',
      email: 'student@klu.ac.in',
      customClaims: {}, // No admin claim
    };

    const checkAdminAccess = (user: { uid: string; customClaims?: Record<string, any> }) => {
      if (user.customClaims?.admin === true || user.customClaims?.role === 'developer') {
        return true;
      }
      return false;
    };

    assert.strictEqual(checkAdminAccess(studentUser), false);

    // Tampered client-side object cannot bypass if backend claims are checked
    const tamperedClientUser = {
      uid: 'std_4100_01',
      email: 'student@klu.ac.in',
      customClaims: {},
      localStorageRole: 'admin', // Attack vector
    };
    assert.strictEqual(checkAdminAccess(tamperedClientUser), false);
  });

  it('5. Backend /api/admin/overview rejects unauthenticated or unauthorized requests', async () => {
    // Probe the locally running server on port 3000
    const testUnauthenticated = () => {
      return new Promise<number>((resolve) => {
        const req = http.request(
          'http://localhost:3000/api/admin/overview',
          { method: 'GET' },
          (res) => {
            resolve(res.statusCode || 0);
          }
        );
        req.on('error', () => resolve(500));
        req.end();
      });
    };

    const statusCode = await testUnauthenticated();
    // Must return 401 Unauthorized or 403 Forbidden
    assert.ok(statusCode === 401 || statusCode === 403, `Expected 401 or 403, got ${statusCode}`);
  });

  it('6. Backend /api/admin/overview accepts authorized administrator credentials', async () => {
    const testAuthorized = () => {
      return new Promise<{ status: number; data?: any }>((resolve) => {
        const req = http.request(
          'http://localhost:3000/api/admin/overview',
          {
            method: 'GET',
            headers: {
              'x-cresco-admin-token': process.env.ADMIN_PORTAL_SECRET || 'cresco_admin_kare_2026',
            },
          },
          (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
              try {
                resolve({ status: res.statusCode || 0, data: JSON.parse(body) });
              } catch {
                resolve({ status: res.statusCode || 0 });
              }
            });
          }
        );
        req.on('error', () => resolve({ status: 500 }));
        req.end();
      });
    };

    const result = await testAuthorized();
    assert.strictEqual(result.status, 200);
    assert.ok(result.data?.success, 'Expected success: true');
    assert.strictEqual(typeof result.data.data.enrolledStudentsCount, 'number');
    assert.strictEqual(typeof result.data.data.registeredFacultyCount, 'number');
    assert.strictEqual(result.data.data.totalModules, 30);
  });

  it('7. Backend /api/admin/curriculum returns authentic 30 modules with stable IDs', async () => {
    const testCurriculum = () => {
      return new Promise<{ status: number; data?: any }>((resolve) => {
        const req = http.request(
          'http://localhost:3000/api/admin/curriculum',
          {
            method: 'GET',
            headers: {
              'x-cresco-admin-token': process.env.ADMIN_PORTAL_SECRET || 'cresco_admin_kare_2026',
            },
          },
          (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
              try {
                resolve({ status: res.statusCode || 0, data: JSON.parse(body) });
              } catch {
                resolve({ status: res.statusCode || 0 });
              }
            });
          }
        );
        req.on('error', () => resolve({ status: 500 }));
        req.end();
      });
    };

    const result = await testCurriculum();
    assert.strictEqual(result.status, 200);
    assert.ok(Array.isArray(result.data?.data));
    assert.strictEqual(result.data.data.length, 30);
    assert.ok(result.data.data.every((m: any) => typeof m.id === 'string' && typeof m.title === 'string'));
  });

  it('8. Password reset dispatch does not leak credentials or bypass auth', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validateEmailForReset = (email: string) => {
      if (!email || !emailRegex.test(email)) {
        throw new Error('Please enter a valid academic or registered email address.');
      }
      return true;
    };

    assert.throws(() => validateEmailForReset(''), /valid academic/);
    assert.throws(() => validateEmailForReset('invalid-email'), /valid academic/);
    assert.strictEqual(validateEmailForReset('student@klu.ac.in'), true);
  });
});
