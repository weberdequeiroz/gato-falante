// Guarda o jogo no celular para abrir rápido; sempre tenta buscar a versão nova primeiro
const CACHE = 'miguel-v37';
const ARQUIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icones/icone-192.png', 'icones/icone-512.png', 'icones/apple-touch-icon.png', 'icones/miguel.png',
  'jogos/jogos.css', 'jogos/nucleo.js', 'jogos/aprender.js', 'jogos/idiomas.js', 'jogos/musica.js', 'jogos/colorir.js', 'jogos/pontos.js', 'jogos/memoria.js', 'jogos/bolhas.js',
  'jogos/sons.js', 'jogos/mercadinho.js', 'jogos/sombras.js', 'jogos/diferente.js', 'jogos/quebracabeca.js',
  'jogos/roupas.js', 'jogos/penelope3d.js', 'jogos/corrida.js', 'jogos/mundo.js', 'vendor/three-0.149.0.min.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS.map((a) => new Request(a, { cache: 'reload' })))));
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
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // o número da versão nunca vem guardado
  if (url.pathname.endsWith('/versao.json')) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }));
    return;
  }
  // a página sempre confere no servidor se mudou (sem esperar o cache de 10 minutos)
  const pagina = e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  // código e estilos também conferem no servidor (pergunta rápida "mudou?"), para nunca misturar versões
  const codigo = /\.(js|css|json)$/.test(url.pathname);
  e.respondWith(
    fetch(e.request, pagina || codigo ? { cache: 'no-cache' } : undefined)
      .then((resposta) => {
        if (resposta.status !== 200) return resposta;
        const copia = resposta.clone();
        const chave = pagina ? new Request(url.origin + url.pathname) : e.request;
        caches.open(CACHE).then((c) => c.put(chave, copia));
        return resposta;
      })
      .catch(() => caches.match(pagina ? new Request(url.origin + url.pathname) : e.request, { ignoreSearch: !pagina }))
  );
});
