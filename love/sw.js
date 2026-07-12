// Минимальный service worker — нужен, чтобы браузер (в основном Chrome/Android)
// считал сайт "устанавливаемым приложением" и предлагал добавить его на экран.
// Кеширует только сам каркас страницы, чтобы сайт открывался, даже если
// на секунду пропала сеть. Данные Firebase не кешируются — всегда идут в сеть.

const CACHE_NAME = 'obshee-vremya-v1';
const CORE_ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(CORE_ASSETS); })
      .catch(function () { /* ничего страшного, если не вышло закешировать */ })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || caches.match('./index.html');
        });
      })
  );
});
