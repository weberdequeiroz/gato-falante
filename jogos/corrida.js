// Corrida do Miguel: corra, pule os obstáculos, pegue peixinhos, estrelas e presentes.
// A cada nível o cenário muda e a velocidade aumenta. O recorde e o nível alcançado ficam salvos.
(() => {
  const M = window.Miguel;
  const ALTURA = 360, CHAO = 300; // mundo em unidades lógicas
  const GRAVIDADE = 2300, PULO = -820, PULO_DUPLO = -740;
  const SEGUNDOS_POR_NIVEL = 32;

  const CENARIOS = [
    { nome: 'Campo', onde: 'no campo', ceu: ['#7cc8f5', '#dff4ff'], morro: '#7ccb68', morro2: '#5fb24f', chao: '#6abf4b', terra: '#9b6b43', obst: ['🪨', '🪵', '🌵'], voa: ['🐝', '🦋'], enfeite: ['🌳', '🌻', '🌷'] },
    { nome: 'Praia', onde: 'na praia', ceu: ['#5ec4f0', '#fff3cf'], morro: '#4fb3e6', morro2: '#2f98cf', chao: '#f4d58d', terra: '#e0b765', obst: ['🦀', '🪣', '🐚'], voa: ['🐦', '🪁'], enfeite: ['🌴', '⛱️', '🏖️'] },
    { nome: 'Floresta', onde: 'na floresta', ceu: ['#89d39b', '#e9f9e3'], morro: '#3f8f4f', morro2: '#2e6f3b', chao: '#4f9a3c', terra: '#7a4f2c', obst: ['🍄', '🪵', '🦔'], voa: ['🦉', '🐝'], enfeite: ['🌲', '🌳', '🍄'] },
    { nome: 'Cidade', onde: 'na cidade', ceu: ['#9fb7ff', '#ffe6f2'], morro: '#8b95c9', morro2: '#6f78ad', chao: '#9aa3ad', terra: '#6b7280', obst: ['🚧', '🗑️', '📦'], voa: ['🕊️', '🎈'], enfeite: ['🏠', '🏪', '🚦'] },
    { nome: 'Neve', onde: 'na neve', ceu: ['#bfe3ff', '#ffffff'], morro: '#e3f2ff', morro2: '#c8e1f7', chao: '#f4fbff', terra: '#b8d4ea', obst: ['⛄', '🧊', '🎄'], voa: ['❄️', '🐦'], enfeite: ['🌲', '⛄', '🏔️'] },
    { nome: 'Deserto', onde: 'no deserto', ceu: ['#ffcf8a', '#fff1d6'], morro: '#f0b867', morro2: '#d99a45', chao: '#f2c879', terra: '#c9934a', obst: ['🌵', '🦂', '🪨'], voa: ['🦅', '🐝'], enfeite: ['🌵', '🐪', '🏜️'] },
    { nome: 'Espaço', onde: 'no espaço', ceu: ['#1b1f4b', '#4b3c8f'], morro: '#2f2a63', morro2: '#241f4f', chao: '#a9a9c9', terra: '#77779a', obst: ['☄️', '🪨', '👾'], voa: ['🛸', '☄️'], enfeite: ['🪐', '🌙', '⭐'], noite: true },
  ];

  const lerDados = () => { try { return Object.assign({ recorde: 0, peixes: 0, nivelMax: 1 }, JSON.parse(M.ler('miguel-corrida') || '{}')); } catch (e) { return { recorde: 0, peixes: 0, nivelMax: 1 }; } };
  const guardarDados = (d) => M.guardar('miguel-corrida', JSON.stringify(d));

  // ---------- sons do jogo ----------
  function som(tipo) {
    const ac = M.obterContexto(), t = ac.currentTime + 0.01, vol = M.calmo ? 0.5 : 1;
    const nota = (f, ini, dur, v = 0.15, forma = 'square', f2) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = forma; o.frequency.setValueAtTime(f, t + ini);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + ini + dur);
      g.gain.setValueAtTime(0.0001, t + ini);
      g.gain.exponentialRampToValueAtTime(v * vol, t + ini + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + ini + dur);
      o.connect(g); g.connect(ac.destination); o.start(t + ini); o.stop(t + ini + dur + 0.02);
    };
    if (tipo === 'pulo') nota(330, 0, 0.14, 0.09, 'square', 760);
    else if (tipo === 'pulo2') nota(520, 0, 0.14, 0.08, 'square', 1200);
    else if (tipo === 'peixe') { nota(988, 0, 0.07, 0.09); nota(1319, 0.06, 0.16, 0.09); }
    else if (tipo === 'estrela') [784, 988, 1175, 1568].forEach((f, i) => nota(f, i * 0.05, 0.12, 0.08, 'triangle'));
    else if (tipo === 'poder') [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => nota(f, i * 0.06, 0.14, 0.08, 'triangle'));
    else if (tipo === 'vida') [659, 880, 1319].forEach((f, i) => nota(f, i * 0.08, 0.2, 0.09, 'sine'));
    else if (tipo === 'batida') { nota(220, 0, 0.3, 0.16, 'sawtooth', 70); nota(110, 0, 0.3, 0.12, 'square', 50); }
    else if (tipo === 'escudo') nota(1200, 0, 0.25, 0.09, 'sine', 300);
    else if (tipo === 'nivel') [523, 523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => nota(f, [0, .1, .2, .3, .45, .6, .7, .85][i], i === 7 ? 0.5 : 0.12, 0.09, 'square'));
    else if (tipo === 'fim') [523, 494, 466, 440].forEach((f, i) => nota(f, i * 0.18, 0.22, 0.1, 'triangle'));
  }

  // música de fundo: uma melodia alegre que acelera com o nível
  function criarMusica() {
    let ligada = M.ler('miguel-corrida-musica') !== '0' && !M.calmo, proxima = 0, passo = 0, timer = null, bpm = 140;
    const MELODIA = [72, 0, 76, 79, 77, 0, 76, 72, 74, 0, 77, 81, 79, 0, 77, 74, 72, 0, 76, 79, 84, 0, 83, 79, 81, 79, 77, 76, 74, 0, 72, 0];
    const BAIXO = [48, 48, 55, 55, 50, 50, 57, 57, 48, 48, 55, 55, 53, 53, 55, 55];
    const f = (m) => 440 * Math.pow(2, (m - 69) / 12);
    function agendar() {
      const ac = M.obterContexto();
      while (proxima < ac.currentTime + 0.25) {
        const dur = 60 / bpm / 2;
        const m = MELODIA[passo % MELODIA.length];
        const toca = (freq, tipo, v, d) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.type = tipo; o.frequency.value = freq;
          g.gain.setValueAtTime(0.0001, proxima);
          g.gain.exponentialRampToValueAtTime(v, proxima + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, proxima + d);
          o.connect(g); g.connect(ac.destination); o.start(proxima); o.stop(proxima + d + 0.02);
        };
        if (m) toca(f(m), 'square', 0.035, dur * 0.9);
        if (passo % 2 === 0) toca(f(BAIXO[(passo / 2) % BAIXO.length]), 'triangle', 0.07, dur * 1.8);
        proxima += dur;
        passo++;
      }
    }
    return {
      get ligada() { return ligada; },
      iniciar() { if (!ligada || timer) return; proxima = M.obterContexto().currentTime + 0.05; timer = setInterval(agendar, 60); },
      parar() { clearInterval(timer); timer = null; },
      alternar() { ligada = !ligada; M.guardar('miguel-corrida-musica', ligada ? '1' : '0'); if (ligada) this.iniciar(); else this.parar(); },
      tempo(n) { bpm = Math.min(190, 136 + n * 6); },
    };
  }

  const miar = (tipo) => M.miar(tipo);

  const MIGUEL = () => (M.roupas ? M.roupas.imagemMiguel() : 'icones/miguel.png');
  const TUTORIAL = () => [
    { titulo: 'Toque para pular!', texto: 'O Miguel corre sozinho. Toque em qualquer lugar da tela para ele pular.',
      ilustracao: `<div class="ilu-cena"><img class="ilu-gato pula" src="${MIGUEL()}" alt=""><span class="ilu-obst">🪨</span><span class="ilu-dedo">👆</span><div class="ilu-chao"></div></div>` },
    { titulo: 'Pulo duplo!', texto: 'Com o Miguel no ar, toque de novo para ele pular ainda mais alto.',
      ilustracao: `<div class="ilu-cena"><img class="ilu-gato pula-duplo" src="${MIGUEL()}" alt=""><span class="ilu-obst alto">🌵🌵</span><span class="ilu-dedo duplo">👆</span><div class="ilu-chao"></div></div>` },
    { titulo: 'Pegue os prêmios!', texto: 'Peixinho vale 1 ponto, estrela vale 10. O presente dá um poder e o coração dá mais uma vida.',
      ilustracao: `<div class="ilu-itens"><span>🐟<small>+1</small></span><span>⭐<small>+10</small></span><span>🎁<small>🛡️⚡🧲</small></span><span>❤️<small>+1 vida</small></span></div>` },
    { titulo: 'Desvie dos obstáculos!', texto: 'Pule por cima das pedras e dos bichinhos. Você tem 3 vidas.',
      ilustracao: `<div class="ilu-itens"><span>🪨<small>pule</small></span><span>🌵<small>pule</small></span><span>🐝<small>cuidado</small></span><span class="vidas">❤️❤️❤️<small>3 vidas</small></span></div>` },
    { titulo: 'Novos lugares!', texto: 'A cada nível o lugar muda e fica mais rápido. O jogo guarda o nível que você alcançou.',
      ilustracao: `<div class="ilu-itens lugares"><span>🌳</span><span>🏖️</span><span>🌲</span><span>🏙️</span><span>⛄</span><span>🏜️</span><span>🪐</span></div>` },
  ];

  // ---------- telas ----------
  function inicio(nav) {
    nav.ir('Corrida do Miguel', (c) => {
      const d = lerDados();
      c.innerHTML = `
        <div class="corrida-capa">
          <div class="corrida-titulo"><span>🏃</span> Corrida do Miguel</div>
          <img class="corrida-miguel" src="${M.roupas ? M.roupas.imagemMiguel() : 'icones/miguel.png'}" alt="">
          <div class="corrida-recordes">
            <span>🏆 Recorde: <strong>${d.recorde}</strong></span>
            <span>🐟 Peixes: <strong>${d.peixes}</strong></span>
            <span>🚩 Nível: <strong>${d.nivelMax}</strong></span>
          </div>
          <div class="como-jogar">
            <p><strong>Como jogar</strong></p>
            <p>👆 Toque na tela para <strong>pular</strong>. Toque de novo no ar para pular <strong>mais alto</strong>!</p>
            <p>🐟 Pegue peixinhos, ⭐ estrelas e 🎁 presentes. Desvie das pedras e dos bichinhos!</p>
            <p>❤️ Você tem 3 vidas. A cada nível o lugar muda e fica mais rápido.</p>
          </div>
          <button class="botao-pronto" data-nivel="1">▶ Correr do começo</button>
          <button class="botao-largo" data-tutorial>❓ Como jogar</button>
          ${d.nivelMax > 1 ? `<button class="modo" data-nivel="${d.nivelMax}"><span class="simbolo">🚩</span><span><strong>Continuar do nível ${d.nivelMax}</strong><small>${CENARIOS[(d.nivelMax - 1) % CENARIOS.length].nome}</small></span></button>` : ''}
        </div>`;
      M.falar('Corrida do Miguel! Toque na tela para pular. Pegue os peixinhos e desvie dos obstáculos!');
      c.onclick = (e) => {
        if (e.target.closest('[data-tutorial]')) { M.jogos.tutorial(TUTORIAL()); return; }
        const b = e.target.closest('[data-nivel]');
        if (!b) return;
        // na primeira vez, o Miguel mostra como jogar antes de começar
        if (M.ler('miguel-tutorial-corrida') !== '1') {
          M.guardar('miguel-tutorial-corrida', '1');
          M.jogos.tutorial(TUTORIAL(), () => jogar(nav, +b.dataset.nivel));
        } else jogar(nav, +b.dataset.nivel);
      };
    });
  }

  function jogar(nav, nivelInicial) {
    nav.ir('Corrida do Miguel', (c) => {
      c.innerHTML = `
        <div class="corrida">
          <canvas class="corrida-tela"></canvas>
          <div class="corrida-hud">
            <span class="hud-vidas" id="hud-vidas"></span>
            <span class="hud-caixa">🐟 <strong id="hud-peixes">0</strong></span>
            <span class="hud-caixa">⭐ <strong id="hud-pontos">0</strong></span>
            <button class="hud-botao" data-acao="musica" aria-label="Música">🎵</button>
            <button class="hud-botao" data-acao="pausa" aria-label="Pausar">⏸️</button>
          </div>
          <div class="hud-nivel"><span id="hud-nivel"></span><div class="hud-barra"><span id="hud-barra"></span></div><span id="hud-poder"></span></div>
          <div class="corrida-aviso" id="aviso" hidden></div>
          <div class="corrida-pausa" id="pausa" hidden>
            <div class="cartao-camada"><h2>⏸️ Pausa</h2>
              <button class="botao-pronto" data-acao="continuar">▶ Continuar</button>
              <button class="botao-largo" data-acao="como-jogar">❓ Como jogar</button>
              <button class="botao-largo" data-acao="sair">🏠 Sair da corrida</button></div>
          </div>
        </div>`;
      const tela = c.querySelector('canvas'), ctx = tela.getContext('2d');
      const musica = criarMusica();
      const dados = lerDados();
      const img = new Image();
      img.src = M.roupas ? M.roupas.imagemMiguel() : 'icones/miguel.png';

      // a câmera sempre mostra pelo menos 520 unidades de caminho à frente (celular em pé ou deitado)
      let larguraMundo = 640, escala = 1, sobraTopo = 0;
      function ajustar() {
        const r = tela.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
        tela.width = Math.round(r.width * dpr);
        tela.height = Math.round(r.height * dpr);
        escala = Math.min(tela.height / ALTURA, tela.width / 440);
        larguraMundo = tela.width / escala;
        sobraTopo = tela.height / escala - ALTURA - 40;
      }
      ajustar();
      const aoRedimensionar = () => ajustar();
      window.addEventListener('resize', aoRedimensionar);

      // estado
      const jogador = { x: 96, y: CHAO - 84, w: 68, h: 84, vy: 0, noChao: true, pulos: 0, invencivel: 0, escudo: false, turbo: 0, ima: 0, esmaga: 0 };
      let nivel = nivelInicial, tempoNivel = 0, velocidade = 0, distancia = 0, proximoSpawn = 500;
      let pontos = 0, peixes = 0, vidas = 3, rodando = true, pausado = false, acabou = false;
      let ultimoTempo = performance.now(), quadro = null, avisoTimer = null;
      const coisas = []; // obstáculos, prêmios, plataformas
      const particulas = [];
      const enfeites = [];
      let deslocFundo = 0;

      const cenario = () => CENARIOS[(nivel - 1) % CENARIOS.length];
      const velocidadeBase = () => Math.min(640, (250 + (nivel - 1) * 34)) * (M.calmo ? 0.82 : 1);

      function aviso(texto, tempo = 1800) {
        const a = c.querySelector('#aviso');
        a.textContent = texto;
        a.hidden = false;
        a.animate([{ transform: 'translate(-50%, -50%) scale(.6)', opacity: 0 }, { transform: 'translate(-50%, -50%) scale(1.08)', opacity: 1 }, { transform: 'translate(-50%, -50%) scale(1)' }], { duration: 400, easing: 'ease-out' });
        clearTimeout(avisoTimer);
        avisoTimer = setTimeout(() => { a.hidden = true; }, tempo);
      }
      function atualizarHud() {
        c.querySelector('#hud-vidas').textContent = '❤️'.repeat(vidas) + '🤍'.repeat(Math.max(0, 3 - vidas));
        c.querySelector('#hud-peixes').textContent = peixes;
        c.querySelector('#hud-pontos').textContent = Math.floor(pontos);
        c.querySelector('#hud-nivel').textContent = `Nível ${nivel} · ${cenario().nome}`;
        c.querySelector('#hud-barra').style.width = Math.min(100, tempoNivel / SEGUNDOS_POR_NIVEL * 100) + '%';
        const poderes = [];
        if (jogador.escudo) poderes.push('🛡️');
        if (jogador.turbo > 0) poderes.push('⚡' + Math.ceil(jogador.turbo));
        if (jogador.ima > 0) poderes.push('🧲' + Math.ceil(jogador.ima));
        c.querySelector('#hud-poder').textContent = poderes.join(' ');
      }

      function pular() {
        if (pausado || acabou) return;
        M.obterContexto();
        if (jogador.noChao) { jogador.vy = PULO; jogador.noChao = false; jogador.pulos = 1; som('pulo'); poeira(jogador.x + 20, CHAO, 6); }
        else if (jogador.pulos < 2) { jogador.vy = PULO_DUPLO; jogador.pulos = 2; som('pulo2'); brilho(jogador.x + 34, jogador.y + 70, '#ffffff', 8); }
      }
      const aoTocar = (e) => {
        if (e.target.closest('button')) return;
        e.preventDefault();
        pular();
      };
      const aoTeclar = (e) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); pular(); } };
      c.querySelector('.corrida').addEventListener('pointerdown', aoTocar);
      window.addEventListener('keydown', aoTeclar);

      // ---------- criação de obstáculos e prêmios ----------
      function adicionar(o) { coisas.push(o); }
      const xNovo = () => larguraMundo + 60;
      function arcoDePeixes(x0, largura, altura, n = 5) {
        for (let i = 0; i < n; i++) {
          const t = n === 1 ? 0.5 : i / (n - 1);
          adicionar({ tipo: 'peixe', fig: '🐟', x: x0 + t * largura, y: CHAO - 60 - Math.sin(t * Math.PI) * altura, w: 30, h: 30 });
        }
      }
      function filaDePeixes(x0, y, n) { for (let i = 0; i < n; i++) adicionar({ tipo: 'peixe', fig: '🐟', x: x0 + i * 42, y, w: 30, h: 30 }); }
      function obstaculo(x, fig) {
        const tam = 54;
        adicionar({ tipo: 'obst', fig: fig || M.sortear(cenario().obst), x, y: CHAO - tam + 6, w: tam, h: tam });
      }
      function gerar() {
        const x = xNovo();
        const r = Math.random();
        const opcoes = ['simples', 'simples', 'peixes'];
        if (nivel >= 2) opcoes.push('plataforma', 'duplo');
        if (nivel >= 3) opcoes.push('voador', 'voador');
        if (nivel >= 4) opcoes.push('triplo');
        const tipo = M.sortear(opcoes);
        let largura = 0;
        if (tipo === 'simples') { obstaculo(x); if (r < 0.6) arcoDePeixes(x - 70, 190, 120); largura = 120; }
        else if (tipo === 'duplo') { obstaculo(x); obstaculo(x + 80); arcoDePeixes(x - 60, 250, 150, 6); largura = 200; }
        else if (tipo === 'triplo') { obstaculo(x); obstaculo(x + 64); obstaculo(x + 128); arcoDePeixes(x - 40, 260, 150, 6); largura = 260; }
        else if (tipo === 'peixes') { filaDePeixes(x, CHAO - 60, 5 + Math.floor(Math.random() * 4)); largura = 300; }
        else if (tipo === 'voador') {
          adicionar({ tipo: 'obst', fig: M.sortear(cenario().voa), x: x + 40, y: CHAO - 150, w: 50, h: 50, voa: true, fase: Math.random() * 6 });
          filaDePeixes(x, CHAO - 60, 4);
          largura = 220;
        } else if (tipo === 'plataforma') {
          const larg = 190 + Math.random() * 120, alt = CHAO - 130 - Math.random() * 40;
          adicionar({ tipo: 'plataforma', x, y: alt, w: larg, h: 22 });
          filaDePeixes(x + 20, alt - 44, Math.floor(larg / 46));
          if (Math.random() < 0.6) obstaculo(x + larg / 2 - 20);
          largura = larg + 40;
        }
        // prêmios especiais de vez em quando
        const sorte = Math.random();
        if (sorte < 0.12) adicionar({ tipo: 'estrela', fig: '⭐', x: x + largura + 90, y: CHAO - 200, w: 40, h: 40 });
        else if (sorte < 0.2) adicionar({ tipo: 'presente', fig: '🎁', x: x + largura + 90, y: CHAO - 170, w: 44, h: 44 });
        else if (sorte < 0.235 && vidas < 3) adicionar({ tipo: 'vida', fig: '❤️', x: x + largura + 90, y: CHAO - 210, w: 40, h: 40 });
        const folga = Math.max(velocidade * 0.95, 360 - nivel * 8);
        proximoSpawn = distancia + largura + folga + Math.random() * 260;
      }

      // ---------- efeitos ----------
      function poeira(x, y, n) { for (let i = 0; i < n; i++) particulas.push({ x, y, vx: -60 - Math.random() * 120, vy: -40 - Math.random() * 80, vida: 0.5, cor: 'rgba(255,255,255,.8)', r: 4 + Math.random() * 4 }); }
      function brilho(x, y, cor, n) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 160; particulas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 0.6, cor, r: 3 + Math.random() * 3 }); } }
      function pontinho(x, y, texto, cor = '#fff') { particulas.push({ x, y, vx: 0, vy: -70, vida: 0.9, texto, cor }); }

      function ganharPoder() {
        const p = M.sortear(['escudo', 'turbo', 'ima']);
        som('poder');
        miar('feliz');
        if (p === 'escudo') { jogador.escudo = true; aviso('🛡️ Escudo! Protege de uma batida.'); }
        if (p === 'turbo') { jogador.turbo = 6; aviso('⚡ Turbo! Ninguém te pega!'); }
        if (p === 'ima') { jogador.ima = 9; aviso('🧲 Ímã! Os peixinhos vêm até você!'); }
      }

      function bater(o) {
        if (jogador.turbo > 0) { o.morto = true; brilho(o.x + 25, o.y + 25, '#ffd54f', 12); som('estrela'); pontos += 5; return; }
        if (jogador.invencivel > 0) return;
        if (jogador.escudo) { jogador.escudo = false; jogador.invencivel = 1.2; som('escudo'); o.morto = true; brilho(o.x + 25, o.y + 25, '#80deea', 14); return; }
        vidas--;
        som('batida');
        if (vidas <= 0) miar('triste'); else if (vidas > 0) miar('ai');
        jogador.invencivel = 1.8;
        jogador.vy = -420; jogador.noChao = false;
        tremor = 0.35;
        if (navigator.vibrate && !M.calmo) navigator.vibrate(120);
        if (vidas <= 0) fimDeJogo();
      }
      let tremor = 0;

      function fimDeJogo() {
        acabou = true;
        musica.parar();
        som('fim');
        const novoRecorde = Math.floor(pontos) > dados.recorde;
        dados.recorde = Math.max(dados.recorde, Math.floor(pontos));
        dados.peixes += peixes;
        dados.nivelMax = Math.max(dados.nivelMax, nivel);
        guardarDados(dados);
        if (nivel >= 3) M.jogos.ganharTrofeu('corrida');
        setTimeout(() => {
          c.querySelector('.corrida').insertAdjacentHTML('beforeend', `
            <div class="corrida-pausa">
              <div class="cartao-camada fim-corrida">
                <h2>${novoRecorde ? '🏆 Novo recorde!' : '🏁 Fim da corrida!'}</h2>
                <img src="${img.src}" alt="">
                <p>⭐ Pontos: <strong>${Math.floor(pontos)}</strong> · 🐟 Peixes: <strong>${peixes}</strong></p>
                <p>🚩 Você chegou ao nível <strong>${nivel}</strong> (${cenario().nome})</p>
                <button class="botao-pronto" data-acao="denovo">🔁 Correr de novo</button>
                ${nivel > 1 ? `<button class="botao-largo" data-acao="continuar-nivel">🚩 Continuar do nível ${nivel}</button>` : ''}
                <button class="botao-largo" data-acao="sair">🏠 Sair</button>
              </div>
            </div>`);
          miar(novoRecorde ? 'feliz' : 'miau');
        }, 700);
      }

      // ---------- laço principal ----------
      function passo(agora) {
        const dt = Math.min(0.033, (agora - ultimoTempo) / 1000);
        ultimoTempo = agora;
        if (!pausado) atualizar(dt);
        desenhar();
        if (rodando) quadro = requestAnimationFrame(passo);
      }

      function atualizar(dt) {
        if (acabou) { particulas.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= dt; }); return; }
        const alvo = velocidadeBase() * (jogador.turbo > 0 ? 1.45 : 1);
        velocidade += (alvo - velocidade) * Math.min(1, dt * 2);
        const dx = velocidade * dt;
        distancia += dx;
        deslocFundo += dx;
        pontos += dx / 40;
        tempoNivel += dt;
        if (tempoNivel >= SEGUNDOS_POR_NIVEL) {
          nivel++;
          tempoNivel = 0;
          som('nivel');
          musica.tempo(nivel);
          aviso(`🚩 Nível ${nivel}! ${cenario().nome}`, 2200);
          miar('feliz');
          if (nivel > dados.nivelMax) { dados.nivelMax = nivel; guardarDados(dados); }
          brilho(jogador.x + 34, jogador.y + 40, '#ffd54f', 24);
        }
        for (const p of ['invencivel', 'turbo', 'ima']) if (jogador[p] > 0) jogador[p] = Math.max(0, jogador[p] - dt);

        // jogador
        const antes = jogador.y + jogador.h;
        jogador.vy += GRAVIDADE * dt;
        jogador.y += jogador.vy * dt;
        let apoio = CHAO;
        for (const o of coisas) {
          if (o.tipo !== 'plataforma') continue;
          const pe = jogador.x + jogador.w / 2;
          if (pe > o.x && pe < o.x + o.w && antes <= o.y + 4 && jogador.y + jogador.h >= o.y && jogador.vy >= 0) apoio = Math.min(apoio, o.y);
        }
        if (jogador.y + jogador.h >= apoio) {
          if (!jogador.noChao && jogador.vy > 300) { jogador.esmaga = 0.15; poeira(jogador.x + 30, apoio, 5); }
          jogador.y = apoio - jogador.h; jogador.vy = 0; jogador.noChao = true; jogador.pulos = 0;
        } else if (jogador.noChao && jogador.y + jogador.h < apoio - 1) {
          jogador.noChao = false; jogador.pulos = 1;
        }
        jogador.esmaga = Math.max(0, jogador.esmaga - dt);

        // mundo
        if (distancia >= proximoSpawn) gerar();
        const caixa = { x: jogador.x + 16, y: jogador.y + 18, w: jogador.w - 32, h: jogador.h - 24 };
        for (const o of coisas) {
          o.x -= dx;
          if (o.voa) { o.fase += dt * 4; o.yv = o.y + Math.sin(o.fase) * 14; }
          if (o.morto) continue;
          if (jogador.ima > 0 && o.tipo === 'peixe' && o.x < jogador.x + 260 && o.x > jogador.x - 20) {
            o.x += (jogador.x + 20 - o.x) * Math.min(1, dt * 6);
            o.y += (jogador.y + 30 - o.y) * Math.min(1, dt * 6);
          }
          const oy = o.voa ? o.yv : o.y, m = o.tipo === 'obst' ? 0.22 : 0;
          const toca = caixa.x < o.x + o.w * (1 - m) && caixa.x + caixa.w > o.x + o.w * m && caixa.y < oy + o.h * (1 - m) && caixa.y + caixa.h > oy + o.h * m;
          if (!toca || o.tipo === 'plataforma') continue;
          if (o.tipo === 'obst') { bater(o); continue; }
          o.morto = true;
          if (o.tipo === 'peixe') { peixes++; pontos += 1; som('peixe'); pontinho(o.x, o.y, '+1', '#fff'); if (peixes % 15 === 0) miar('miau'); }
          else if (o.tipo === 'estrela') { pontos += 10; som('estrela'); brilho(o.x + 20, o.y + 20, '#ffd54f', 16); pontinho(o.x, o.y, '+10', '#ffe082'); }
          else if (o.tipo === 'presente') { brilho(o.x + 20, o.y + 20, '#f48fb1', 16); ganharPoder(); }
          else if (o.tipo === 'vida') { vidas = Math.min(3, vidas + 1); som('vida'); miar('glub'); pontinho(o.x, o.y, '+❤️', '#ff8a80'); }
        }
        for (let i = coisas.length - 1; i >= 0; i--) if (coisas[i].x + coisas[i].w < -80 || coisas[i].morto && coisas[i].tipo !== 'obst') coisas.splice(i, 1);
        for (let i = coisas.length - 1; i >= 0; i--) if (coisas[i].morto && coisas[i].tipo === 'obst') coisas.splice(i, 1);
        // enfeites do cenário (árvores, casas...) passam no meio do caminho
        if (!enfeites.length || enfeites[enfeites.length - 1].x < larguraMundo - 180 - Math.random() * 200) enfeites.push({ x: larguraMundo + 40, fig: M.sortear(cenario().enfeite), tam: 46 + Math.random() * 30 });
        for (const e of enfeites) e.x -= dx * 0.55;
        while (enfeites.length && enfeites[0].x < -100) enfeites.shift();
        for (let i = particulas.length - 1; i >= 0; i--) {
          const p = particulas[i];
          p.x += p.vx * dt - (p.texto ? 0 : dx * 0.3); p.y += p.vy * dt; p.vy += (p.texto ? 0 : 400) * dt; p.vida -= dt;
          if (p.vida <= 0) particulas.splice(i, 1);
        }
        if (tremor > 0) tremor -= dt;
        if (Math.random() < dt * 8 && jogador.noChao) poeira(jogador.x + 14, CHAO, 1);
        atualizarHud();
      }

      // ---------- desenho ----------
      function emoji(fig, x, y, tam) {
        ctx.font = `${tam}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.fillText(fig, x, y);
      }
      function desenhar() {
        const cen = cenario(), W = larguraMundo;
        ctx.setTransform(escala, 0, 0, escala, 0, Math.max(0, sobraTopo) * escala);
        if (tremor > 0) ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8);
        // céu
        const topo = -Math.max(0, sobraTopo) - 20;
        const g = ctx.createLinearGradient(0, topo, 0, ALTURA);
        g.addColorStop(0, cen.ceu[0]); g.addColorStop(1, cen.ceu[1]);
        ctx.fillStyle = g; ctx.fillRect(-20, topo, W + 40, ALTURA - topo + 80);
        if (cen.noite) { ctx.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { const sx = ((i * 97 - deslocFundo * 0.05) % (W + 20) + W + 20) % (W + 20), sy = (i * 53) % 220; ctx.globalAlpha = 0.4 + (i % 5) / 8; ctx.fillRect(sx, sy, 2, 2); } ctx.globalAlpha = 1; }
        else {
          ctx.fillStyle = 'rgba(255,255,255,.85)';
          for (let i = 0; i < 4; i++) {
            const nx = ((i * 230 - deslocFundo * 0.08) % (W + 200) + W + 200) % (W + 200) - 100, ny = 40 + (i % 3) * 30;
            ctx.beginPath(); ctx.arc(nx, ny, 22, 0, 7); ctx.arc(nx + 26, ny - 8, 28, 0, 7); ctx.arc(nx + 54, ny, 20, 0, 7); ctx.fill();
          }
        }
        // morros em duas camadas (parallax)
        const morros = (cor, alt, amp, freq, vel) => {
          ctx.fillStyle = cor; ctx.beginPath(); ctx.moveTo(0, CHAO);
          for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, CHAO - alt - Math.sin((x + deslocFundo * vel) * freq) * amp - Math.sin((x + deslocFundo * vel) * freq * 2.3) * amp * 0.4);
          ctx.lineTo(W + 10, CHAO); ctx.fill();
        };
        morros(cen.morro2, 110, 30, 0.006, 0.15);
        // enfeites ficam lá no fundo, entre os morros
        ctx.globalAlpha = 0.9;
        for (const e of enfeites) emoji(e.fig, e.x, CHAO - 62 - e.tam * 0.3, e.tam * 0.75);
        ctx.globalAlpha = 1;
        morros(cen.morro, 46, 18, 0.011, 0.3);
        // chão
        ctx.fillStyle = cen.terra; ctx.fillRect(-20, CHAO, W + 40, ALTURA - CHAO + 80);
        ctx.fillStyle = cen.chao; ctx.fillRect(-20, CHAO, W + 40, 16);
        ctx.fillStyle = 'rgba(0,0,0,.08)';
        for (let x = -((deslocFundo) % 48); x < W + 48; x += 48) ctx.fillRect(x, CHAO + 26, 24, 8);
        // coisas
        ctx.globalAlpha = 1;
        for (const o of coisas) {
          if (o.tipo === 'plataforma') {
            ctx.fillStyle = cen.terra; roundRect(o.x, o.y, o.w, o.h + 10, 10);
            ctx.fillStyle = cen.chao; roundRect(o.x, o.y, o.w, 12, 8);
            continue;
          }
          const oy = o.voa ? o.yv : o.y;
          if (o.tipo === 'obst') { ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.ellipse(o.x + o.w / 2, CHAO + 4, o.w * 0.4, 5, 0, 0, 7); ctx.fill(); }
          const pulso = o.tipo === 'peixe' || o.tipo === 'estrela' || o.tipo === 'presente' || o.tipo === 'vida' ? Math.sin(performance.now() / 180 + o.x / 40) * 3 : 0;
          if (o.tipo === 'estrela' || o.tipo === 'presente') { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(o.x + o.w / 2, oy + o.h / 2, o.w * 0.75, 0, 7); ctx.fill(); }
          emoji(o.fig, o.x + o.w / 2, oy + o.h / 2 + pulso, o.w);
        }
        // Miguel
        const j = jogador;
        const corre = j.noChao ? Math.sin(performance.now() / 70) : 0;
        const pisca = j.invencivel > 0 && Math.floor(performance.now() / 90) % 2 === 0;
        ctx.fillStyle = 'rgba(0,0,0,.18)';
        ctx.beginPath(); ctx.ellipse(j.x + j.w / 2, CHAO + 4, 26 - Math.min(16, (CHAO - j.y - j.h) / 10), 6, 0, 0, 7); ctx.fill();
        if (!pisca) {
          ctx.save();
          ctx.translate(j.x + j.w / 2, j.y + j.h);
          const esm = j.esmaga > 0 ? 1 + j.esmaga * 1.5 : 1;
          ctx.rotate(j.noChao ? corre * 0.05 : Math.max(-0.25, Math.min(0.25, j.vy / 3000)));
          ctx.scale(esm, 1 / esm);
          if (j.turbo > 0) { ctx.shadowColor = '#ffd54f'; ctx.shadowBlur = 24; }
          if (img.complete && img.naturalWidth) ctx.drawImage(img, -j.w / 2 - 6, -j.h - 6 + Math.abs(corre) * -4, j.w + 12, j.h + 12);
          else emoji('🐱', 0, -j.h / 2, 60);
          ctx.restore();
        }
        if (j.escudo) { ctx.strokeStyle = 'rgba(128,222,234,.9)'; ctx.lineWidth = 4; ctx.fillStyle = 'rgba(128,222,234,.18)'; ctx.beginPath(); ctx.arc(j.x + j.w / 2, j.y + j.h / 2, 54, 0, 7); ctx.fill(); ctx.stroke(); }
        if (j.ima > 0) emoji('🧲', j.x + j.w + 6, j.y + 6, 22);
        // partículas
        for (const p of particulas) {
          ctx.globalAlpha = Math.max(0, Math.min(1, p.vida * 2));
          if (p.texto) { ctx.font = 'bold 20px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(31,45,61,.6)'; ctx.strokeText(p.texto, p.x, p.y); ctx.fillStyle = p.cor; ctx.fillText(p.texto, p.x, p.y); }
          else { ctx.fillStyle = p.cor; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
        }
        ctx.globalAlpha = 1;
      }
      function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); ctx.fill(); }

      // ---------- botões ----------
      c.onclick = (e) => {
        const b = e.target.closest('[data-acao]');
        if (!b) return;
        const acao = b.dataset.acao;
        if (acao === 'pausa') { pausado = true; musica.parar(); c.querySelector('#pausa').hidden = false; }
        else if (acao === 'como-jogar') M.jogos.tutorial(TUTORIAL());
        else if (acao === 'continuar') { pausado = false; ultimoTempo = performance.now(); c.querySelector('#pausa').hidden = true; musica.iniciar(); }
        else if (acao === 'musica') { musica.alternar(); b.style.opacity = musica.ligada ? 1 : 0.45; }
        else if (acao === 'sair') nav.voltar();
        else if (acao === 'denovo') { nav.voltar(); jogar(nav, 1); }
        else if (acao === 'continuar-nivel') { nav.voltar(); jogar(nav, nivel); }
      };
      c.querySelector('[data-acao="musica"]').style.opacity = musica.ligada ? 1 : 0.45;

      velocidade = velocidadeBase() * 0.6;
      musica.tempo(nivel);
      musica.iniciar();
      atualizarHud();
      aviso(`🚩 Nível ${nivel}: ${cenario().nome}! Toque para pular!`, 2200);
      quadro = requestAnimationFrame(passo);
      const aoSumir = () => { if (document.hidden && !acabou && !pausado) c.querySelector('[data-acao="pausa"]').click(); };
      document.addEventListener('visibilitychange', aoSumir);
      return () => {
        rodando = false;
        cancelAnimationFrame(quadro);
        musica.parar();
        clearTimeout(avisoTimer);
        window.removeEventListener('resize', aoRedimensionar);
        window.removeEventListener('keydown', aoTeclar);
        document.removeEventListener('visibilitychange', aoSumir);
      };
    }, 'corpo-jogo');
  }

  M.catalogo.push(() => [
    'Corrida do Miguel! Toque na tela para pular. Pegue os peixinhos e desvie dos obstáculos!',
    ...M.jogos.textoTutorial(TUTORIAL()),
  ]);
  M.jogos.registrar({ id: 'corrida', nome: 'Corrida do Miguel', simbolo: '🏃', cor: '#ff5722', secao: 'aventura', abrir: inicio });
})();
