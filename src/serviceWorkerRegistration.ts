/**
 * Service Worker Registration for Cresco CN
 * Provides offline caching and network fallback support
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // In development mode, Vite generates modules dynamically on the fly.
  // An active service worker can cache stale ES modules or throw SyntaxErrors.
  // Always unregister during local development.
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = '/sw.js';

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.info('[Service Worker] Successfully registered with scope:', registration.scope);

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.info('[Service Worker] New content is available; please refresh.');
              } else {
                console.info('[Service Worker] Content cached for offline access.');
              }
            }
          };
        };
      })
      .catch((error) => {
        console.warn('[Service Worker] Registration failed:', error);
      });
  });
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
