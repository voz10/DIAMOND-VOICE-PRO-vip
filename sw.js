/* ============================================================
   sw.js — Service Worker do Vocal Studio Pro
   Estratégia:
     · navegações → rede primeiro, cai para o cache (SPA)
     · estáticos (js/css/html) → cache primeiro, atualiza em background
     · áudio (mp3) → cache primeiro (nunca revalida: os clipes são fixos)
   O app inteiro funciona offline depois do primeiro acesso.
   ============================================================ */
const VERSAO = 'vsp-v32';
const SHELL = 'vsp-shell-' + VERSAO;
const DINAMICO = 'vsp-dyn-' + VERSAO;
const AUDIO = 'vsp-audio-' + VERSAO;

/* Arquivos essenciais para abrir o app sem rede */
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/css/app.css',
  './src/js/main.js',
  './src/js/version.js',
  './version.json',
  './src/js/data/course.js',
  './src/js/data/explicacoes.js',
  './src/js/data/anatomia.js',
  './src/js/data/aquecimentos.js',
  './src/js/core/util.js',
  './src/js/core/idb.js',
  './src/js/core/store.js',
  './src/js/audio/engine.js',
  './src/js/audio/piano.js',
  './src/js/audio/instruments.js',
  './src/js/audio/metronome.js',
  './src/js/audio/pitch.js',
  './src/js/audio/pitch-worklet.js',
  './src/js/audio/recorder.js',
  './src/js/audio/voice.js',
  './src/js/audio/mic.js',
  './src/js/audio/vozUnica.js',
  './src/js/audio/parecer.js',
  './src/js/ia/analiseTake.js',
  './src/js/ia/coletor.js',
  './src/js/ia/metricas.js',
  './src/js/ia/texto.js',
  './src/js/ia/motor.js',
  './src/js/ia/preencher.js',
  './src/js/ia/blocoTarefa.js',
  './src/js/audio/demoVoz.js',
  './src/js/music/theory.js',
  './src/js/ui/icons.js',
  './src/js/ui/dashboard.js',
  './src/js/ui/aulas.js',
  './src/js/ui/exercicios.js',
  './src/js/ui/rotinas.js',
  './src/js/ui/piano.js',
  './src/js/ui/trainer.js',
  './src/js/ui/slides.js',
  './src/js/ui/anatomia.js',
  './src/js/ui/aquecimento.js',
  './src/js/ui/turma.js',
  './src/js/ui/relatorio.js',
  './src/js/core/turma.js',
  './src/js/audio/fala.js',
  './src/assets/anatomia/aparelho-fonador.png',
  './src/assets/anatomia/aparelho-respiratorio.png',
  './src/assets/logo-emblema.png',
  './src/assets/marca-dagua.png',
  './src/js/ui/metronomo.js',
  './src/js/ui/pitchlab.js',
  './src/js/ui/jogos.js',
  './src/js/ui/imprimir.js',
  './src/js/ui/guiaIniciante.js',
  './src/js/ui/gravacoes.js',
  './src/js/ui/ferramentas.js',
  './src/js/ui/caderno.js',
  './src/js/ui/repertorio.js',
  './src/js/ui/progresso.js',
  './src/js/ui/ia.js',
  './src/js/ui/charts.js',
  './src/js/ui/config.js',
  './src/js/ui/assist.js',
  './src/assets/voice/manifest.json',
];

/* ---------------- instalação ---------------- */
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    // cacheia um por um: um 404 isolado não derruba a instalação
    await Promise.allSettled(PRECACHE.map(u => c.add(new Request(u, { cache: 'reload' }))));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const chaves = await caches.keys();
    await Promise.all(chaves.filter(k => k.startsWith('vsp-') && k !== SHELL && k !== DINAMICO && k !== AUDIO)
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

/* ---------------- utilidades ---------------- */
const ehAudio = (url) => /\.(mp3|ogg|wav|m4a|webm)$/i.test(url.pathname);
const ehEstaTico = (url) => /\.(js|css|html|json|webmanifest|png|svg|ico|woff2?)$/i.test(url.pathname);

async function cachePrimeiro(req, cacheNome) {
  const c = await caches.open(cacheNome);
  const hit = await c.match(req, { ignoreSearch: false });
  if (hit) {
    // revalida em background sem bloquear a resposta
    fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); }).catch(() => {});
    return hit;
  }
  const res = await fetch(req);
  if (res && res.ok) c.put(req, res.clone());
  return res;
}

async function redePrimeiro(req, cacheNome) {
  const c = await caches.open(cacheNome);
  try {
    const res = await fetch(req);
    if (res && res.ok) c.put(req, res.clone());
    return res;
  } catch (_) {
    const hit = await c.match(req);
    if (hit) return hit;
    const idx = await c.match('./index.html');
    if (idx) return idx;
    throw _;
  }
}

/* ---------------- fetch ---------------- */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return;

  // Versão e o próprio SW: SEMPRE rede primeiro (é o detector de atualização)
  if (url.pathname.endsWith('/version.json') || url.pathname.endsWith('/sw.js')) {
    e.respondWith(redePrimeiro(req, DINAMICO).catch(() => fetch(req)));
    return;
  }

  // Áudio de narração: cache primeiro, sem revalidar (os clipes são fixos)
  if (ehAudio(url)) {
    e.respondWith(cachePrimeiro(req, AUDIO).catch(() => caches.match(req).then(r => r || Response.error())));
    return;
  }

  // Navegação (SPA): rede primeiro, cai no index.html cacheado
  if (req.mode === 'navigate') {
    e.respondWith(redePrimeiro(req, SHELL));
    return;
  }

  // Estáticos: cache primeiro com revalidação em background
  if (ehEstaTico(url)) {
    e.respondWith(cachePrimeiro(req, SHELL).catch(() => fetch(req)));
    return;
  }

  // Demais: rede com fallback de cache
  e.respondWith(redePrimeiro(req, DINAMICO));
});

/* ---------------- mensagens da página ---------------- */
self.addEventListener('message', (e) => {
  if (e.data === 'VSP_SKIP_WAITING') self.skipWaiting();
  if (e.data === 'VSP_VERSAO') {
    e.source?.postMessage({ tipo: 'versao', versao: VERSAO });
  }
});
