// Service Worker
// 1. GitHub Pages では HTTP ヘッダを設定できないため、ここで COOP/COEP を付けて
//    マルチスレッド実行（SharedArrayBuffer）を有効にする。
// 2. 画面とライブラリを端末内に保存し、通信なしでも開けるようにする。
//    （翻訳モデル本体はライブラリ側が別途、端末内に保存する）
const CACHE = 'app-shell-v4';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

function isolate(response) {
  if (!response || response.status === 0) return response;
  const headers = new Headers(response.headers);
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return; // モデル取得などは素通し

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      // 通信できるときは最新を取り、保存分を更新する
      const fresh = await fetch(req, { cache: 'no-cache' });
      if (fresh.ok) await cache.put(req, fresh.clone());
      return isolate(fresh);
    } catch (err) {
      // オフライン時は保存分を使う
      const cached = await cache.match(req, { ignoreSearch: true });
      if (cached) return isolate(cached);
      throw err;
    }
  })());
});
