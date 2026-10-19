const CACHE_VERSION = "doce-espirito-v4";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./devocionais.json",
  "./temas.json",
  "./estudos.json",
  "./planos.json",
  "./biblia.json",
  "./assets/capa.jpeg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_VERSION)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  /*
   * Arquivos principais do aplicativo:
   * sempre tenta buscar a versão atual primeiro.
   */
  const isAppFile =
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/styles.css") ||
    url.pathname.endsWith("/manifest.json") ||
    url.pathname.endsWith("/devocionais.json") ||
    url.pathname.endsWith("/temas.json") ||
    url.pathname.endsWith("/estudos.json") ||
    url.pathname.endsWith("/planos.json") ||
    url.pathname.endsWith("/biblia.json") ||
    url.pathname.endsWith("/sw.js");

  if (isAppFile) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();

            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );

    return;
  }

  /*
   * Imagens e demais recursos:
   * tenta a rede e utiliza o cache como fallback.
   */
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const responseClone = response.clone();

          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
