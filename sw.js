// Guarda o jogo no celular para abrir rápido; sempre tenta buscar a versão nova primeiro
const CACHE = 'miguel-v3';
const ARQUIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icones/icone-192.png', 'icones/icone-512.png', 'icones/apple-touch-icon.png', 'icones/miguel.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia));
        return resposta;
      })
      .catch(() => caches.match(e.request))
  );
});
