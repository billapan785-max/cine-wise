
const CACHE_NAME = 'cinewise-v1';
const ASSETS = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use addAll with a fallback to avoid failing if one asset fails
      return Promise.allSettled(ASSETS.map(url => cache.add(url)));
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      
      return fetch(event.request).catch((err) => {
        console.debug('Fetch failed (offline):', event.request.url);
        // Return a dummy response instead of letting the promise reject
        return new Response('Network error', { status: 408, statusText: 'Network Error' });
      });
    })
  );
});
