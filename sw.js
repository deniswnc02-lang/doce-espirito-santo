/* =========================================================
   DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
   SERVICE WORKER
   ========================================================= */

const CACHE_NAME = "doce-espirito-v3";

const CORE_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./motor-editorial.js",
  "./devocionais.json",
  "./estudos.json",
  "./manifest.json"
];

/* =========================================================
   INSTALAÇÃO
   ========================================================= */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(
          CORE_FILES
        );

      })
      .catch(error => {

        console.warn(
          "Alguns arquivos não puderam ser armazenados:",
          error
        );

      })

  );

  /*
    Faz a nova versão assumir o controle
    imediatamente.
  */

  self.skipWaiting();

});


/* =========================================================
   ATIVAÇÃO
   ========================================================= */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(
              key => key !== CACHE_NAME
            )
            .map(
              key => caches.delete(key)
            )

        );

      })
      .then(() => {

        /*
          Assume imediatamente todas as páginas
          abertas pelo aplicativo.
        */

        return self.clients.claim();

      })

  );

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", event => {

  const request =
    event.request;

  /*
    Apenas requisições GET.
  */

  if (
    request.method !== "GET"
  ) {
    return;
  }


  /*
    JSON:
    sempre tenta buscar a versão mais nova
    na rede antes de usar o cache.
  */

  if (
    request.url.endsWith(".json") ||
    request.url.includes(".json?")
  ) {

    event.respondWith(

      fetch(request, {
        cache: "no-store"
      })

        .then(response => {

          /*
            Atualiza o cache com a versão nova.
          */

          const clone =
            response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(
                request,
                clone
              );

            });

          return response;

        })

        .catch(() => {

          return caches.match(
            request
          );

        })

    );

    return;
  }


  /*
    JavaScript e CSS:
    prioriza a rede.
    
    Isso é importante durante o desenvolvimento,
    porque alterações no GitHub precisam aparecer
    imediatamente.
  */

  if (
    request.url.endsWith(".js") ||
    request.url.endsWith(".css")
  ) {

    event.respondWith(

      fetch(request, {
        cache: "no-store"
      })

        .then(response => {

          const clone =
            response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(
                request,
                clone
              );

            });

          return response;

        })

        .catch(() => {

          return caches.match(
            request
          );

        })

    );

    return;
  }


  /*
    Imagens, fontes e outros arquivos:
    tenta primeiro a rede.
    Se estiver offline, usa o cache.
  */

  event.respondWith(

    fetch(request)

      .then(response => {

        if (
          response &&
          response.status === 200
        ) {

          const clone =
            response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(
                request,
                clone
              );

            });

        }

        return response;

      })

      .catch(() => {

        return caches.match(
          request
        );

      })

  );

});
