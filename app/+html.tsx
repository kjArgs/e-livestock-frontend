import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const pwaBootstrapScript = `
(() => {
  const cachePrefix = 'elivestock-pwa-';
  const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

  const clearPwaCaches = () => {
    if (!('caches' in window)) {
      return Promise.resolve();
    }

    return caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(cachePrefix))
            .map((key) => caches.delete(key))
        )
      );
  };

  const unregisterPwaWorkers = () => {
    if (!('serviceWorker' in navigator)) {
      return Promise.resolve();
    }

    return navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(
          registrations
            .filter((registration) => registration.active?.scriptURL?.includes('/sw.js'))
            .map((registration) => registration.unregister())
        )
      );
  };

  window.addEventListener('load', () => {
    if (isLocalhost) {
      unregisterPwaWorkers()
        .then(clearPwaCaches)
        .catch((error) => console.error('PWA cleanup failed:', error));
      return;
    }

    if (!('serviceWorker' in navigator) || !window.isSecureContext) {
      return;
    }

    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      console.error('PWA registration failed:', error);
    });
  });
})();
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#1F4D2E" />
        <meta
          name="description"
          content="Manage livestock permits, inspections, schedules, renewals, and alerts with e-Livestock Services for Sipocot."
        />
        <meta name="application-name" content="e-Livestock" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="e-Livestock" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: pwaBootstrapScript }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
