// こもーしょん Service Worker
// 方針:
//  - ページ本体(ナビゲーション): ネットワーク優先 = 毎回起動時に更新チェックし、
//    取得できたらキャッシュを更新。オフライン時は前回のキャッシュで起動する。
//  - その他のファイル(ポーズ検出モデル・wasm・フォント等のCDN含む): キャッシュ優先。
//    初回利用時にネットワークから取得してキャッシュする(CDNのURLはバージョン付きで不変のため安全)。
const CACHE = "komotion-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(hit =>
      hit ||
      fetch(req).then(res => {
        if (res.ok || res.type === "opaque") {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
    )
  );
});
