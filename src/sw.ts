/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

declare const self: ServiceWorkerGlobalScope;

// Injected assets manifest will be automatically included by VitePWA
precacheAndRoute(self.__WB_MANIFEST);

// Clean up outdated caches on service worker activation
cleanupOutdatedCaches();

// Cache Google Fonts CSS files
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" &&
    url.pathname.startsWith("/css2"),
  new CacheFirst({
    cacheName: "google-fonts-css",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10, // Cache a limited number of Google Fonts CSS files
        maxAgeSeconds: 60 * 60 * 24 * 365, // Cache for 1 year
      }),
    ],
  })
);

// Cache font files served from Google Fonts
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.gstatic.com" &&
    /\.(woff2?|eot|ttf|otf)$/.test(url.pathname), // Match font file types (woff2, eot, ttf, otf)
  new CacheFirst({
    cacheName: "google-fonts-files",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20, // Cache a limited number of font files
        maxAgeSeconds: 60 * 60 * 24 * 365, // Cache for 1 year
      }),
    ],
  })
);

// Define cache names for assets and API responses
const ASSETS_CACHE = "assets-cache";
const API_CACHE = "api-cache";

// Cache static assets like JS, CSS, Fonts, and Images
registerRoute(
  ({ url }) =>
    /\.(?:js|css|woff2?|eot|ttf|svg|png|jpg|jpeg|gif)$/.test(url.pathname),
  new CacheFirst({
    cacheName: ASSETS_CACHE,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50, // Max number of assets to cache
        maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
      }),
    ],
  })
);

// Cache API requests using NetworkFirst strategy
registerRoute(
  /\/api\//,
  new NetworkFirst({
    cacheName: API_CACHE,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20, // Max number of API responses to cache
        maxAgeSeconds: 60 * 60, // Cache API responses for 1 hour
      }),
    ],
  })
);

// Cache dynamic content with StaleWhileRevalidate strategy
registerRoute(
  ({ url }) => /\/dynamic\//.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: "dynamic-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100, // Max number of dynamic resources to cache
        maxAgeSeconds: 60 * 60 * 24, // Cache for 1 day
      }),
    ],
  })
);

// Activate event: Clean up old caches when a new service worker takes control
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![ASSETS_CACHE, API_CACHE].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Install event: Ensure the service worker takes control immediately
self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(self.skipWaiting());
});
