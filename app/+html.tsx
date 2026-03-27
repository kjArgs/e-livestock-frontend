import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SHORT_NAME,
  buildAbsoluteAssetUrl,
  getGovernmentServiceSchema,
  getOrganizationSchema,
  getWebsiteSchema,
} from "../lib/seo";

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
  const globalStructuredData = JSON.stringify([
    getWebsiteSchema(),
    getOrganizationSchema(),
    getGovernmentServiceSchema(),
  ]);

  return (
    <html lang="en-PH">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>{SITE_NAME}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#1F4D2E" />
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="application-name" content={SITE_SHORT_NAME} />
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content={SITE_SHORT_NAME} />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_SHORT_NAME} />
        <meta property="og:title" content={SITE_NAME} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta
          property="og:image"
          content={buildAbsoluteAssetUrl("/pwa-512.png")}
        />
        <meta property="og:image:alt" content={SITE_NAME} />
        <meta property="og:locale" content="en_PH" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_NAME} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta
          name="twitter:image"
          content={buildAbsoluteAssetUrl("/pwa-512.png")}
        />
        <link rel="icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: globalStructuredData }}
        />
        <script dangerouslySetInnerHTML={{ __html: pwaBootstrapScript }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
