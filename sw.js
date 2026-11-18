// Service worker: lo que permite "instalar" la app y que abra aunque no
// haya internet en ese momento (con la última versión que se haya visto).
//
// Estrategia: SIEMPRE preferir la red (la versión más nueva de verdad). Si
// no hay conexión, recién ahí usa lo que tenga guardado de la última vez
// que se abrió con internet. Así nunca queda "pegada" en una versión vieja
// mientras se sigue cambiando la app.
const CACHE = "desde-la-panza-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) => Promise.all(nombres.filter((nombre) => nombre !== CACHE).map((nombre) => caches.delete(nombre))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;

  evento.respondWith(
    fetch(evento.request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE).then((cache) => cache.put(evento.request, copia));
        return respuesta;
      })
      .catch(() => caches.match(evento.request))
  );
});
