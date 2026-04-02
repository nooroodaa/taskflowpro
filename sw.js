// TaskFlow Pro — Service Worker
// Version: 1.0.0

const CACHE_NAME = 'taskflow-pro-v1';
const ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap',
  'https://unpkg.com/lucide@latest'
];

// ═══ INSTALL ═══
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ═══ ACTIVATE ═══
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ═══ FETCH (Cache First, Network Fallback) ═══
self.addEventListener('fetch', function(e) {
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;

      return fetch(e.request).then(function(response) {
        // Cache valid responses
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline fallback → serve index.html
        return caches.match('./index.html');
      });
    })
  );
});

// ═══ PUSH NOTIFICATIONS ═══
self.addEventListener('push', function(e) {
  var data = e.data ? e.data.json() : { title: 'TaskFlow Pro', body: 'تذكير جديد' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'https://placehold.co/192x192/4f8fff/ffffff?text=TF',
      badge: 'https://placehold.co/96x96/4f8fff/ffffff?text=TF',
      tag: data.tag || 'taskflow',
      dir: 'rtl',
      lang: 'ar',
      vibrate: [200, 100, 200]
    })
  );
});

// ═══ NOTIFICATION CLICK ═══
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
