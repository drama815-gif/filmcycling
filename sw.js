/* FilmCycling Computer — Service Worker v0.9.3
   CACHE 문자열이 갱신 신호. 새 버전 배포 시 반드시 이 값을 함께 올릴 것. */
const CACHE='fcc-v0.9.3';
const ASSETS=['./','./index.html','./manifest.webmanifest',
              './icon-180.png','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];

self.addEventListener('install',e=>{
  /* 개별 add — 파일 하나가 404여도 설치 전체가 실패하지 않도록 */
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>Promise.all(ASSETS.map(a=>c.add(a).catch(()=>{}))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  if(new URL(req.url).origin!==self.location.origin) return;

  /* 페이지 이동 요청: 캐시된 index.html 우선 — 오프라인에서도 즉시 기동 */
  if(req.mode==='navigate'){
    e.respondWith(
      caches.match('./index.html',{ignoreSearch:true})
        .then(r=>r||fetch(req))
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req))
  );
});
