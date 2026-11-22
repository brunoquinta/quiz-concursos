/* Cache com rede na frente para o app, e pacotes revalidados ao fundo.
   Online, a versão nova substitui a guardada. Offline, vale a última cópia. */
var CACHE = 'cq1-piloto-1';
var SHELL = ['./', './index.html', './manifest.webmanifest', './favicon.svg', './favicon.ico', './apple-touch-icon.png', './icone-192.png', './icone-512.png', './icone-512-maskable.png'];

self.addEventListener('install', function (ev) {
  ev.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (ev) {
  ev.waitUntil(caches.keys().then(function (chaves) {
    return Promise.all(chaves.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function guardar(req, res) {
  if (!res || !res.ok) return res;
  var copia = res.clone();
  caches.open(CACHE).then(function (c) { c.put(req, copia); }).catch(function () {});
  return res;
}

self.addEventListener('fetch', function (ev) {
  var req = ev.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;
  var pacote = url.pathname.indexOf('/pacotes/') >= 0;
  if (pacote) {
    ev.respondWith(caches.match(req).then(function (hit) {
      var rede = fetch(req).then(function (res) { return guardar(req, res); }).catch(function () { return hit; });
      return hit || rede;
    }));
    return;
  }
  ev.respondWith(fetch(req).then(function (res) { return guardar(req, res); }).catch(function () {
    return caches.match(req).then(function (hit) { return hit || caches.match('./index.html'); });
  }));
});
