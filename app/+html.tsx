import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const serviceWorkerCleanup = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister()))
      )
      .catch((error) => console.error('Service worker cleanup failed:', error));

    if ('caches' in window) {
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith('elivestock-pwa-'))
              .map((key) => caches.delete(key))
          )
        )
        .catch((error) => console.error('Cache cleanup failed:', error));
    }
  });
}
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
        <script dangerouslySetInnerHTML={{ __html: serviceWorkerCleanup }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
