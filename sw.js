const CACHE = 'kitty-ledger-v33';
const ASSETS = [
  './',
  './index.html?pwa=v30',
  './index.html',
  './manifest.json',
  './assets/icecream.png',
  './assets/macaron.png',
  './assets/kakigori.png',
  './assets/drink.png',
  './assets/picnic.png',
  './assets/blanket.png',
  './assets/calendar.png',
  './assets/cart.png',
  './assets/camera.png',
  './assets/handbag.png',
  './assets/plane.png',
  './assets/medkit.png',
  './assets/pouch.png',
  './assets/gift.png',
  './assets/house.png',
  './assets/money.png',
  './assets/chart.png',
  './assets/coins.png',
  './assets/saving.png',
  './assets/wallet.png',
  './assets/battery.png',
  './assets/phone.png',
  './assets/pouch2.png',
  './assets/bag.png',
  './assets/nail.png',
  './assets/lucky.png',
  './assets/heart.png',
  './assets/teddy.png',
  './assets/milk.png',
  './assets/shop.png',
  './assets/kimono.png',
  './assets/jam.png',
  './assets/ev.png',
  './assets/cake.png',
  './assets/bowl.png',
  './assets/tree.png',
  './assets/coins-up.png',
  './assets/sandwich.png',
  './assets/bubbles.png',
  './assets/popcorn.png',
  './assets/cleaning.png',
  './assets/icecream-cart.png',
  './assets/garden.png',
  './assets/swim.png',
  './assets/cloud-kitty.png',
  './assets/money-tree.png',
  './assets/shopping-bag.png',
  './assets/icecream-bowl.png',
  './assets/plane-kitty.png',
  './assets/music-player.png',
  './assets/shopping-cart.png',
  './assets/fortune.png',
  './assets/crown-kitty.png',
  './assets/notebook-kitty.png',
  './assets/toast-icon.png',
  './assets/app-icon-v4.png',
  './assets/goal-tab-icon.png',
  './assets/fab-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({type: 'window', includeUncontrolled: true}))
      .then(clients => clients.forEach(c => c.navigate(c.url)))
  );
});

// 从缓存里取：先精确匹配，再忽略查询参数，导航请求兜底到 index.html
function fromCache(req) {
  return caches.match(req, {ignoreSearch: true})
    .then(hit => hit || caches.match(req.url.split('?')[0]))
    .then(hit => {
      if (hit) return hit;
      if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
        return caches.match('./index.html');
      }
      return null;
    })
    .then(hit => hit || Response.error());
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    Promise.race([
      fetch(e.request).then(res => {
        // 只有真正成功的响应才使用和缓存；服务端返回 403/404/错误页时一律回退到本地缓存
        if (res && res.ok && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        }
        return fromCache(e.request);
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
    ]).catch(() => fromCache(e.request))
  );
});
