/* sw.js — Kočko Hotel */
const VERSION = 'v3-2025-10-16';
const CACHE_NAME = `kocko-${VERSION}`;
const RUNTIME_CACHE = `kocko-runtime-${VERSION}`;

// Offline fallback page
const OFFLINE_HTML = `<!doctype html>
<html lang="cs"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Jste offline — Kočko Hotel</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;margin:0;padding:2rem;background:#f8f9fa;color:#212529}
  .card{max-width:720px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 12px 24px rgba(0,0,0,.08);padding:1.5rem}
  h1{font-size:1.4rem;margin:.5rem 0 1rem}
  p{margin:.5rem 0;color:#6c757d}
  .btn{display:inline-block;margin-top:1rem;padding:.6rem 1rem;border-radius:8px;background:#6f42c1;color:#fff;text-decoration:none}
</style>
</head>
<body>
  <main class="card" role="main" aria-label="Offline obrazovka">
    <h1>Jste offline</h1>
    <p>Vypadá to, že aktuálně nemáte připojení k internetu. Zkuste to prosím později.</p>
    <a class="btn" href="/">Zkusit znovu načíst</a>
  </main>
</body></html>`;

const AVOID_CACHE_HOSTS = new Set([
  'www.googletagmanager.com', 'www.google-analytics.com',
  'youtube.com', 'www.youtube.com', 'youtu.be', 'i.ytimg.com'
]);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(new URL('__offline__', self.registration.scope), new Response(OFFLINE_HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => { if (!k.includes(VERSION)) return caches.delete(k); }));
    if ('navigationPreload' in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        if (preload) return preload;
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 4000);
        const fresh = await fetch(req, { signal: controller.signal });
        clearTimeout(t);
        return fresh;
      } catch (err) {
        const cache = await caches.open(CACHE_NAME);
        const offline = await cache.match(new URL('__offline__', self.registration.scope));
        return offline || new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  if (req.method !== 'GET' || AVOID_CACHE_HOSTS.has(url.hostname)) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(req);
    const fetchPromise = fetch(req).then(resp => {
      try { if (resp && (resp.ok || resp.type === 'opaque')) cache.put(req, resp.clone()).catch(()=>{}); } catch {}
      return resp;
    }).catch(() => cached);
    return cached || fetchPromise;
  })());
});
