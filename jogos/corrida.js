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
    { nome: 'Fazenda', onde: 'na fazenda', ceu: ['#8fd3ff', '#f2fbff'], morro: '#a5d66b', morro2: '#86bf4f', chao: '#93c95a', terra: '#8a5a35', obst: ['🌾', '🪵', '🐓'], voa: ['🐝', '🐦'], enfeite: ['🐄', '🐖', '🏡', '🌽'] },
    { nome: 'Fundo do mar', onde: 'no fundo do mar', ceu: ['#2a8fd6', '#9be3ff'], morro: '#1f7bb8', morro2: '#16639a', chao: '#f1dca0', terra: '#d4b571', obst: ['🦀', '🐚', '🪸'], voa: ['🐙', '🐡'], enfeite: ['🐠', '🪸', '🐢', '🐬'], bolhas: true },
    { nome: 'Selva', onde: 'na selva', ceu: ['#9fe0a8', '#effbe6'], morro: '#2f8a3e', morro2: '#22702f', chao: '#3d8f32', terra: '#5b3a1f', obst: ['🪨', '🐊', '🪵'], voa: ['🦜', '🐒'], enfeite: ['🌴', '🦒', '🐘', '🦁'] },
    { nome: 'Terra dos doces', onde: 'na terra dos doces', ceu: ['#ffc4e1', '#fff1f8'], morro: '#ff9ccf', morro2: '#f27bb7', chao: '#ffd1e8', terra: '#c98fb0', obst: ['🍩', '🧁', '🍭'], voa: ['🍬', '🎈'], enfeite: ['🍰', '🍦', '🍫', '🍓'] },
    { nome: 'Parque de diversões', onde: 'no parque de diversões', ceu: ['#a7c8ff', '#fff4d6'], morro: '#b8a3e6', morro2: '#9c86d6', chao: '#c9d1da', terra: '#7d8794', obst: ['🎪', '🧸', '📦'], voa: ['🎈', '🪁'], enfeite: ['🎡', '🎢', '🎠', '🍿'] },
    { nome: 'Montanhas', onde: 'nas montanhas', ceu: ['#9cc9f2', '#eef7ff'], morro: '#8a9bab', morro2: '#6f8092', chao: '#7fae5a', terra: '#6d5a48', obst: ['🪨', '🪵', '🐐'], voa: ['🦅', '🐦'], enfeite: ['🏔️', '⛰️', '🌲', '🏕️'] },
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
    { titulo: 'Super Miguel!', texto: 'Às vezes, o presente chama o Super Miguel! Ele voa junto com o gatinho e transforma os obstáculos em peixinhos.',
      ilustracao: `<div class="ilu-cena ilu-super"><img class="ilu-heroi" src="icones/super-miguel.png" alt=""><span class="ilu-raio"></span><span class="ilu-obst">🪨</span><span class="ilu-vira">🐟</span><div class="ilu-chao"></div></div>` },
    { titulo: 'Penélope!', texto: 'Pegue o osso dourado e a cachorrinha Penélope vem correr com você. Ela dá super latidos que assopram os obstáculos para longe, e chove ossinhos para pegar!',
      ilustracao: `<div class="ilu-itens"><span>🦴<small>osso</small></span><span><img src="icones/penelope.png" alt="" style="height:64px"><small>Penélope</small></span><span>💨<small>assopra</small></span><span>🦴🦴<small>+3</small></span></div>` },
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
          ${d.nivelMax > 1 ? `<button class="botao-pronto" data-nivel="${d.nivelMax}">🚩 Continuar do nível ${d.nivelMax}<small class="corrida-lugar">Cada corrida tem lugares diferentes!</small></button>
          <button class="botao-largo" data-nivel="1">▶ Correr do começo</button>` : `<button class="botao-pronto" data-nivel="1">▶ Correr!</button>`}
          <button class="botao-largo" data-tutorial>❓ Como jogar</button>
          <details class="como-jogar">
            <summary><strong>📖 Ler as regras</strong></summary>
            <p>👆 Toque na tela para <strong>pular</strong>. Toque de novo no ar para pular <strong>mais alto</strong>!</p>
            <p>🐟 Pegue peixinhos, ⭐ estrelas e 🎁 presentes. Desvie das pedras e dos bichinhos!</p>
            <p>🛡️ Passe uma fase <strong>sem se machucar</strong> e ganhe <strong>5 moedas</strong> de bônus!</p>
            <p>🦴 O <strong>osso dourado</strong> chama a cachorrinha <strong>Penélope</strong>: ela late e assopra os obstáculos para longe!</p>
            <p>🦸 Às vezes o presente chama o <strong>Super Miguel</strong>, que voa com você e transforma os obstáculos em peixinhos!</p>
            <p>🎁 O presente dá um poder: 🛡️ escudo, ⚡ turbo, 🧲 ímã, 🎈 balão, 🌧️ chuva de peixes ou 🐢 tartaruga. É <strong>um poder de cada vez</strong>: quando um acaba, espere um pouquinho que logo aparece outro!</p>
            <p>❤️ Você tem 3 vidas. A cada nível o lugar muda e fica mais rápido.</p>
          </details>
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
      // partes do gatinho (cabeça, bracinhos, patinhas, rabo) desenhadas uma vez em telas pequenas
      let partes = null;
      if (M.roupas?.partesMiguel) {
        const fontes = M.roupas.partesMiguel();
        Promise.all(Object.values(fontes).map(im => im.decode ? im.decode().catch(() => {}) : new Promise(ok => { im.onload = im.onerror = ok; }))).then(() => {
          const prontas = {};
          for (const [nome, im] of Object.entries(fontes)) {
            if (!im.naturalWidth) return;
            const cv = document.createElement('canvas');
            cv.width = 260; cv.height = 325;
            cv.getContext('2d').drawImage(im, 0, 0, 260, 325);
            prontas[nome] = cv;
          }
          partes = prontas;
        });
      }
      const imgHeroi = new Image();
      imgHeroi.src = 'icones/super-miguel.png';
      const gritoHeroi = new Audio('sons/super-miguel.mp3');
      gritoHeroi.preload = 'auto';

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
      const jogador = { x: 96, y: CHAO - 84, w: 68, h: 84, vy: 0, noChao: true, pulos: 0, invencivel: 0, escudo: 0, turbo: 0, ima: 0, balao: 0, chuva: 0, lento: 0, esmaga: 0, passo: 0, giro: 0, piscar: 2.5 };
      let nivel = nivelInicial, tempoNivel = 0, velocidade = 0, distancia = 0, proximoSpawn = 500;
      let pontos = 0, peixes = 0, vidas = 3, rodando = true, pausado = false, acabou = false;
      let machucouNoNivel = false, invictos = 0;
      let ultimoTempo = performance.now(), quadro = null, avisoTimer = null;
      const coisas = []; // obstáculos, prêmios, plataformas
      const particulas = [];
      const enfeites = [];
      let deslocFundo = 0;
      // Super Miguel: chega voando com capa, acompanha o gatinho e transforma obstáculos em peixinhos
      let heroi = null, presentesSemHeroi = 0, clarao = 0;
      const raios = [];
      const heroiAtivo = () => heroi && !heroi.saindo;
      // Penélope: a cachorrinha em 3D corre na frente e dá super latidos que assopram os obstáculos para longe
      let penelope = null, telinhaPenelope = null;
      const ondas = [];
      const penelopeAtiva = () => penelope && !penelope.saindo;
      // um poder de cada vez: enquanto um está ligado (ou logo depois dele) não aparece outro
      const DESCANSO_PODER = 7;
      let descansoPoder = 0;
      const poderAtivo = () => !!(heroi || penelope || jogador.escudo > 0 || jogador.turbo > 0 || jogador.ima > 0 || jogador.balao > 0 || jogador.chuva > 0 || jogador.lento > 0);
      const podePoder = () => !poderAtivo() && descansoPoder <= 0;
      M.penelope3d?.carregarThree().then((T) => { if (rodando) telinhaPenelope = M.penelope3d.telinha(T, 256); }).catch(() => {});
      const fotoPenelope = new Image();
      fotoPenelope.src = 'icones/penelope.png';
      function chamarPenelope() {
        penelope = { t: M.calmo ? 14 : 12, x: -120, anim: 0, latido: 1.0, saindo: false, ossos: 0.6 };
        clarao = 0.4;
        M.penelope3d.gritar();
        som('poder');
        aviso('🐶 PENÉLOPE! Ela late e assopra os obstáculos para longe! Pegue os ossinhos!', 2800);
      }
      if (/teste/.test(location.search)) { // só para testes automáticos
        window.__chamarPenelope = () => chamarPenelope();
        window.__ganharPoder = (p) => ganharPoder(p);
        window.__imortal = () => { jogador.invencivel = 1e9; };
        window.__poder = () => ({ ativo: poderAtivo(), descanso: descansoPoder, pode: podePoder(), y: jogador.y, vidas });
      }
      // o obstáculo sai voando girando (não vira peixe: some no céu)
      function assoprar(o) {
        if (o.assoprado) return;
        o.assoprado = { vx: 420 + Math.random() * 220, vy: -520 - Math.random() * 160, giro: 0, vg: 9 + Math.random() * 6 };
        const cx = o.x + o.w / 2, cy = (o.voa ? o.yv : o.y) + o.h / 2;
        brilho(cx, cy, '#ffffff', 10); pontinho(cx, cy - 20, '💨 +3', '#e1f5fe');
        pontos += 3;
        som('estrela');
      }

      // cada corrida sorteia a ordem dos lugares, a hora do dia e o formato dos morros,
      // para a criança não decorar o caminho
      const ordemCenarios = CENARIOS.map((_, i) => i).sort(() => Math.random() - 0.5);
      const cenariosSorteados = {};
      const HORAS = {
        tarde: { ceu: ['#ff9f6e', '#ffe2b8'], sol: '🌅' },
        noite: { ceu: ['#1d2b5a', '#55639f'], noite: true, lua: true },
      };
      const cenario = () => {
        if (!cenariosSorteados[nivel]) {
          const base = CENARIOS[ordemCenarios[(nivel - 1) % CENARIOS.length]];
          const sorte = Math.random();
          const hora = base.noite || base.bolhas ? {} : sorte < 0.55 ? { sol: '☀️' } : sorte < 0.8 ? HORAS.tarde : HORAS.noite;
          cenariosSorteados[nivel] = { ...base, ...hora, morroF: 0.7 + Math.random() * 0.7, morroA: 0.6 + Math.random() * 0.9 };
        }
        return cenariosSorteados[nivel];
      };
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
        if (jogador.escudo > 0) poderes.push('🛡️' + Math.ceil(jogador.escudo));
        if (jogador.balao > 0) poderes.push('🎈' + Math.ceil(jogador.balao));
        if (jogador.chuva > 0) poderes.push('🌧️' + Math.ceil(jogador.chuva));
        if (jogador.lento > 0) poderes.push('🐢' + Math.ceil(jogador.lento));
        if (jogador.turbo > 0) poderes.push('⚡' + Math.ceil(jogador.turbo));
        if (jogador.ima > 0) poderes.push('🧲' + Math.ceil(jogador.ima));
        if (heroiAtivo()) poderes.push('🦸' + Math.ceil(heroi.t));
        if (penelopeAtiva()) poderes.push('🐶' + Math.ceil(penelope.t));
        c.querySelector('#hud-poder').textContent = poderes.join(' ');
      }

      function pular() {
        if (pausado || acabou) return;
        M.obterContexto();
        if (jogador.noChao) { jogador.vy = PULO; jogador.noChao = false; jogador.pulos = 1; som('pulo'); poeira(jogador.x + 20, CHAO, 6); }
        else if (jogador.pulos < 2) { jogador.vy = PULO_DUPLO; jogador.pulos = 2; jogador.giro = 0.001; som('pulo2'); brilho(jogador.x + 34, jogador.y + 70, '#ffffff', 8); }
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
        else if (sorte < 0.3 && podePoder() && !coisas.some(o => o.tipo === 'presente' || o.tipo === 'osso')) {
          // a Penélope vem pelo osso dourado; os outros poderes vêm no presente
          const poder = proximoPoder();
          if (poder === 'penelope') adicionar({ tipo: 'osso', fig: '🦴', x: x + largura + 90, y: CHAO - 165, w: 46, h: 46 });
          else adicionar({ tipo: 'presente', fig: '🎁', x: x + largura + 90, y: CHAO - 170, w: 44, h: 44, poder });
        }
        else if (sorte < 0.34 && vidas < 3) adicionar({ tipo: 'vida', fig: '❤️', x: x + largura + 90, y: CHAO - 210, w: 40, h: 40 });
        const folga = Math.max(velocidade * 0.95, 360 - nivel * 8);
        proximoSpawn = distancia + largura + folga + Math.random() * 260;
      }

      // ---------- efeitos ----------
      function poeira(x, y, n) { for (let i = 0; i < n; i++) particulas.push({ x, y, vx: -60 - Math.random() * 120, vy: -40 - Math.random() * 80, vida: 0.5, cor: 'rgba(255,255,255,.8)', r: 4 + Math.random() * 4 }); }
      function brilho(x, y, cor, n) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 160; particulas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 0.6, cor, r: 3 + Math.random() * 3 }); } }
      function pontinho(x, y, texto, cor = '#fff') { particulas.push({ x, y, vx: 0, vy: -70, vida: 0.9, texto, cor }); }

      function chamarHeroi() {
        heroi = { t: M.calmo ? 13 : 11, x: -140, y: -60, anim: 0, recarga: 1.1, saindo: false, tiro: 0 };
        presentesSemHeroi = 0;
        clarao = 0.7;
        som('nivel');
        try { gritoHeroi.currentTime = 0; gritoHeroi.volume = M.calmo ? 0.6 : 1; gritoHeroi.play().catch(() => {}); } catch (e) {}
        aviso('🦸 SUPER MIGUEL! Ele transforma os obstáculos em peixinhos!', 2800);
        M.vibrar && M.vibrar([60, 40, 120]);
      }
      // raio de estrelas: o obstáculo vira um peixinho no ar
      function transformar(o) {
        const cx = o.x + o.w / 2, cy = (o.voa ? o.yv : o.y) + o.h / 2;
        raios.push({ x1: heroi.x + 40, y1: heroi.y - 34, x2: cx, y2: cy, vida: 0.35 });
        heroi.tiro = 1;
        Object.assign(o, { tipo: 'peixe', fig: '🐟', voa: false, w: 34, h: 34, x: cx - 17, y: Math.min(cy, CHAO - 70) - 17 });
        brilho(cx, cy, '#ffd54f', 14); brilho(cx, cy, '#ff80ab', 8); brilho(cx, cy, '#80deea', 8);
        pontinho(cx, cy - 20, '✨ +5', '#ffe082');
        pontos += 5;
        som('estrela');
      }
      // saquinho de poderes: sai um de cada antes de repetir; o Super Miguel e a Penélope vêm logo no começo
      const TODOS_PODERES = ['heroi', 'penelope', 'escudo', 'turbo', 'ima', 'balao', 'chuva', 'lento'];
      let saquinho = [...['heroi', 'penelope'].sort(() => Math.random() - 0.5), ...['balao', 'chuva', 'lento', 'escudo', 'turbo', 'ima'].sort(() => Math.random() - 0.5)];
      saquinho.splice(2 + Math.floor(Math.random() * 2), 0, saquinho.shift()); // um dos dois logo, o outro um pouco depois
      function proximoPoder() {
        if (!saquinho.length) saquinho = [...TODOS_PODERES].sort(() => Math.random() - 0.5);
        return saquinho.shift();
      }
      function ganharPoder(forcado) {
        const p = forcado || proximoPoder();
        if (p === 'heroi') { chamarHeroi(); return; }
        if (p === 'penelope') { chamarPenelope(); return; }
        presentesSemHeroi++;
        som('poder');
        miar('feliz');
        if (p === 'escudo') { jogador.escudo = 12; aviso('🛡️ Escudo! Protege de uma batida.'); }
        if (p === 'balao') { jogador.balao = 6; jogador.giro = 0; aviso('🎈 Balão! O Miguel voa e puxa todos os peixinhos e estrelas!'); }
        if (p === 'chuva') { jogador.chuva = 7; jogador.gotas = 0; aviso('🌧️ Chuva de peixes! Pegue todos!'); }
        if (p === 'lento') { jogador.lento = 8; aviso('🐢 Tartaruga! Tudo fica devagarinho.'); }
        if (p === 'turbo') { jogador.turbo = 6; aviso('⚡ Turbo! Ninguém te pega!'); }
        if (p === 'ima') { jogador.ima = 9; aviso('🧲 Ímã! Os peixinhos vêm até você!'); }
      }

      function bater(o) {
        if (jogador.turbo > 0) { o.morto = true; brilho(o.x + 25, o.y + 25, '#ffd54f', 12); som('estrela'); pontos += 5; return; }
        if (heroiAtivo()) { transformar(o); return; }
        if (penelopeAtiva()) { assoprar(o); return; }
        if (jogador.invencivel > 0) return;
        if (jogador.escudo > 0) { jogador.escudo = 0; jogador.invencivel = 1.2; som('escudo'); o.morto = true; brilho(o.x + 25, o.y + 25, '#80deea', 14); return; }
        vidas--;
        machucouNoNivel = true;
        som('batida');
        if (vidas <= 0) miar('triste'); else if (vidas > 0) miar('ai');
        jogador.invencivel = 1.8;
        jogador.vy = -420; jogador.noChao = false;
        tremor = 0.35;
        M.vibrar && M.vibrar([150, 60, 80]);
        if (vidas <= 0) fimDeJogo();
      }
      let tremor = 0;

      function fimDeJogo() {
        acabou = true;
        musica.parar();
        som('fim');
        M.jogos.ganharMoedas(Math.floor(peixes / 5));
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
                ${invictos ? `<p>🛡️ Fases sem se machucar: <strong>${invictos}</strong> (+${invictos * 5} 🪙)</p>` : ''}
                ${Math.floor(peixes / 5) ? `<p class="vitoria-moedas">🪙 +${Math.floor(peixes / 5)} moedas no seu cofrinho!</p>` : ''}
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
        const alvo = velocidadeBase() * (jogador.turbo > 0 ? 1.45 : 1) * (jogador.lento > 0 ? 0.6 : 1);
        velocidade += (alvo - velocidade) * Math.min(1, dt * 2);
        const dx = velocidade * dt;
        distancia += dx;
        deslocFundo += dx;
        pontos += dx / 40;
        tempoNivel += dt;
        if (tempoNivel >= SEGUNDOS_POR_NIVEL) {
          // passou a fase sem se machucar? ganha moedas bônus
          const foiInvicto = !machucouNoNivel;
          if (foiInvicto) {
            const bonus = 5;
            M.jogos.ganharMoedas(bonus);
            pontinho(jogador.x + 30, jogador.y - 30, `🛡️ Invicto! +${bonus} 🪙`, '#ffe082');
            brilho(jogador.x + 34, jogador.y + 20, '#ffd54f', 20);
            invictos++;
          }
          machucouNoNivel = false;
          nivel++;
          tempoNivel = 0;
          som('nivel');
          musica.tempo(nivel);
          aviso(foiInvicto ? `🛡️ Invicto! +5 🪙 · Nível ${nivel}: ${cenario().nome}` : `🚩 Nível ${nivel}! ${cenario().nome}`, 2600);
          miar('feliz');
          if (nivel > dados.nivelMax) { dados.nivelMax = nivel; guardarDados(dados); }
          brilho(jogador.x + 34, jogador.y + 40, '#ffd54f', 24);
        }
        for (const p of ['invencivel', 'turbo', 'ima', 'escudo', 'balao', 'chuva', 'lento']) if (jogador[p] > 0) jogador[p] = Math.max(0, jogador[p] - dt);
        if (poderAtivo()) descansoPoder = DESCANSO_PODER; else descansoPoder = Math.max(0, descansoPoder - dt);
        // balão: uma trilha de peixinhos no céu, na altura em que o Miguel está voando
        if (jogador.balao > 0) {
          jogador.trilha = (jogador.trilha || 0) - dt;
          if (jogador.trilha <= 0) { jogador.trilha = 0.22; adicionar({ tipo: 'peixe', fig: '🐟', x: larguraMundo + 20, y: CHAO - jogador.h - 100 + Math.sin(distancia / 90) * 40, w: 30, h: 30 }); }
        }
        // chuva de peixes: caem do céu na frente do Miguel
        if (jogador.chuva > 0) {
          jogador.gotas -= dt;
          if (jogador.gotas <= 0) {
            // cada peixe cai na frente do Miguel e para numa altura que dá para pegar (no chão ou com um pulinho),
            // chegando lá bem quando o Miguel passa
            jogador.gotas = 0.3;
            const y0 = -Math.max(0, sobraTopo) - 30, alvo = CHAO - 50 - Math.random() * 110;
            const x0 = jogador.x + 220 + Math.random() * Math.max(40, larguraMundo - jogador.x - 260);
            const tempo = (x0 - jogador.x - 20) / Math.max(120, velocidade);
            adicionar({ tipo: 'peixe', fig: '🐟', x: x0, y: y0, w: 30, h: 30, cai: (alvo - y0) / tempo, para: alvo });
          }
        }
        if (heroi) {
          heroi.anim += dt;
          heroi.tiro = Math.max(0, heroi.tiro - dt * 4);
          heroi.t -= dt;
          if (heroi.t <= 0 && !heroi.saindo) { heroi.saindo = true; pontinho(heroi.x, heroi.y - 50, 'Tchau! 👋', '#fff'); }
          if (heroi.saindo) { heroi.x += 560 * dt; heroi.y -= 320 * dt; if (heroi.y < -Math.max(0, sobraTopo) - 200) heroi = null; }
          else {
            const ax = jogador.x + 20, ay = Math.min(jogador.y, CHAO - jogador.h) - 95 + Math.sin(heroi.anim * 3) * 10;
            heroi.x += (ax - heroi.x) * Math.min(1, dt * 3.5);
            heroi.y += (ay - heroi.y) * Math.min(1, dt * 3.5);
            heroi.recarga -= dt;
            if (heroi.recarga <= 0) {
              const alvo = coisas.filter(o => o.tipo === 'obst' && !o.morto && o.x > jogador.x + 50 && o.x < larguraMundo - 30).sort((a, b) => a.x - b.x)[0];
              if (alvo) { transformar(alvo); heroi.recarga = 0.45; } else heroi.recarga = 0.15;
            }
          }
          // rastro de estrelinhas coloridas
          if (heroi && Math.random() < dt * 30) particulas.push({ x: heroi.x - 30, y: heroi.y + (Math.random() - 0.5) * 30, vx: -120 - Math.random() * 80, vy: (Math.random() - 0.5) * 40, vida: 0.6, cor: M.sortear(['#ffd54f', '#ff80ab', '#80deea', '#b388ff', '#a5d6a7']), r: 3 + Math.random() * 3 });
        }
        if (penelope) {
          penelope.anim += dt; penelope.t -= dt;
          if (penelope.t <= 0 && !penelope.saindo) { penelope.saindo = true; M.penelope3d.latir(); pontinho(penelope.x, CHAO - 120, 'Tchau! 🐾', '#fff'); }
          if (penelope.saindo) { penelope.x += 520 * dt; if (penelope.x > larguraMundo + 150) penelope = null; }
          else {
            // corre um pouco à frente do gatinho
            penelope.x += (jogador.x + 120 - penelope.x) * Math.min(1, dt * 2.5);
            penelope.latido -= dt;
            if (penelope.latido <= 0) {
              penelope.latido = 1.3;
              M.penelope3d.latir();
              ondas.push({ x: penelope.x + 60, y: CHAO - 50, r: 10, vida: 1.1 });
            }
            // chuva de ossinhos para pegar
            penelope.ossos -= dt;
            if (penelope.ossos <= 0) { penelope.ossos = 0.55; adicionar({ tipo: 'ossinho', fig: '🦴', x: jogador.x + 120 + Math.random() * (larguraMundo - jogador.x - 160), y: -Math.max(0, sobraTopo) - 30, w: 32, h: 32, cai: 140 + Math.random() * 80 }); }
          }
        }
        // ondas do latido: anéis que andam para a frente e assopram o que encontram
        for (let i = ondas.length - 1; i >= 0; i--) {
          const w = ondas[i]; w.x += 520 * dt; w.r += 90 * dt; w.vida -= dt;
          for (const o of coisas) if (o.tipo === 'obst' && !o.morto && !o.assoprado && Math.abs(o.x + o.w / 2 - w.x) < 40) assoprar(o);
          if (w.vida <= 0 || w.x > larguraMundo + 60) ondas.splice(i, 1);
        }
        for (const o of coisas) {
          if (o.assoprado) { const a = o.assoprado; o.x += a.vx * dt; o.y += a.vy * dt; a.vy += 900 * dt; a.giro += a.vg * dt; if (o.y < -Math.max(0, sobraTopo) - 200 || o.x > larguraMundo + 200) o.morto = true; }
          if (o.cai) { o.y = Math.min(o.para ?? CHAO - o.h - 4, o.y + o.cai * dt); }
        }
        for (let i = raios.length - 1; i >= 0; i--) { raios[i].vida -= dt; raios[i].x2 -= velocidade * dt; if (raios[i].vida <= 0) raios.splice(i, 1); }
        if (clarao > 0) clarao = Math.max(0, clarao - dt * 1.4);

        // jogador
        const antes = jogador.y + jogador.h;
        if (jogador.balao > 0) {
          // balão: sobe devagar e fica flutuando bem acima dos obstáculos
          jogador.vy = ((CHAO - jogador.h - 130) - jogador.y) * 2.5;
          jogador.noChao = false; jogador.pulos = 2;
        } else jogador.vy += GRAVIDADE * dt;
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
        // passos acompanham a velocidade; cambalhota no pulo duplo; piscadinha de vez em quando
        if (jogador.noChao) jogador.passo += velocidade * dt / 34;
        if (jogador.giro > 0) { jogador.giro += dt * 13; if (jogador.giro >= Math.PI * 2 || jogador.noChao) jogador.giro = 0; }
        jogador.piscar -= dt;
        if (jogador.piscar < -0.13) jogador.piscar = 2 + Math.random() * 3;

        // mundo
        if (distancia >= proximoSpawn) gerar();
        const caixa = { x: jogador.x + 16, y: jogador.y + 18, w: jogador.w - 32, h: jogador.h - 24 };
        for (const o of coisas) {
          o.x -= dx;
          if (o.voa) { o.fase += dt * 4; o.yv = o.y + Math.sin(o.fase) * 14; }
          if (o.morto) continue;
          const puxa = jogador.balao > 0 ? (o.tipo === 'peixe' || o.tipo === 'estrela' || o.tipo === 'ossinho') && o.x < larguraMundo && o.x > jogador.x - 40
            : (jogador.ima > 0 || heroiAtivo() || jogador.chuva > 0) && o.tipo === 'peixe' && o.x < jogador.x + (jogador.chuva > 0 ? 140 : 260) && o.x > jogador.x - 20;
          if (puxa) {
            o.x += (jogador.x + 20 - o.x) * Math.min(1, dt * 6);
            o.y += (jogador.y + 30 - o.y) * Math.min(1, dt * 6);
          }
          const oy = o.voa ? o.yv : o.y, m = o.tipo === 'obst' ? 0.22 : 0;
          const toca = caixa.x < o.x + o.w * (1 - m) && caixa.x + caixa.w > o.x + o.w * m && caixa.y < oy + o.h * (1 - m) && caixa.y + caixa.h > oy + o.h * m;
          if (!toca || o.tipo === 'plataforma') continue;
          if (o.tipo === 'obst') { if (!o.assoprado) bater(o); continue; }
          o.morto = true;
          if (o.tipo === 'peixe') { peixes++; pontos += 1; som('peixe'); pontinho(o.x, o.y, '+1', '#fff'); if (peixes % 15 === 0) miar('miau'); }
          else if (o.tipo === 'estrela') { pontos += 10; som('estrela'); brilho(o.x + 20, o.y + 20, '#ffd54f', 16); pontinho(o.x, o.y, '+10', '#ffe082'); }
          else if ((o.tipo === 'presente' || o.tipo === 'osso') && poderAtivo()) { pontos += 10; som('estrela'); brilho(o.x + 20, o.y + 20, '#ffd54f', 16); pontinho(o.x, o.y, '+10', '#ffe082'); }
          else if (o.tipo === 'presente') { brilho(o.x + 20, o.y + 20, '#f48fb1', 16); ganharPoder(o.poder); }
          else if (o.tipo === 'osso') { brilho(o.x + 20, o.y + 20, '#fff59d', 16); chamarPenelope(); }
          else if (o.tipo === 'ossinho') { pontos += 3; som('peixe'); pontinho(o.x, o.y, '🦴 +3', '#fff8e1'); }
          else if (o.tipo === 'vida') { vidas = Math.min(3, vidas + 1); som('vida'); miar('glub'); pontinho(o.x, o.y, '+❤️', '#ff8a80'); }
        }
        for (let i = coisas.length - 1; i >= 0; i--) {
          const o = coisas[i];
          if (o.x + o.w < -80 && !o.morto && (o.tipo === 'presente' || o.tipo === 'osso')) saquinho.unshift(o.poder || 'penelope'); // não pegou: volta para o saquinho
          if (o.x + o.w < -80 || o.morto && o.tipo !== 'obst') coisas.splice(i, 1);
        }
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
        if (cen.sol) emoji(cen.sol, W - 70, cen.sol === '🌅' ? 120 : 70, 54);
        if (cen.lua) emoji('🌙', W - 70, 70, 46);
        if (cen.bolhas) { ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; for (let i = 0; i < 18; i++) { const bx = ((i * 131 - deslocFundo * 0.1) % (W + 20) + W + 20) % (W + 20), by = ((i * 71 - performance.now() / 20) % 300 + 300) % 300; ctx.beginPath(); ctx.arc(bx, by, 4 + (i % 4) * 2, 0, 7); ctx.stroke(); } }
        if (cen.noite) { ctx.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { const sx = ((i * 97 - deslocFundo * 0.05) % (W + 20) + W + 20) % (W + 20), sy = (i * 53) % 220; ctx.globalAlpha = 0.4 + (i % 5) / 8; ctx.fillRect(sx, sy, 2, 2); } ctx.globalAlpha = 1; }
        else if (!cen.bolhas) {
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
        morros(cen.morro2, 110, 30 * cen.morroA, 0.006 * cen.morroF, 0.15);
        // enfeites ficam lá no fundo, entre os morros
        ctx.globalAlpha = 0.9;
        for (const e of enfeites) emoji(e.fig, e.x, CHAO - 62 - e.tam * 0.3, e.tam * 0.75);
        ctx.globalAlpha = 1;
        morros(cen.morro, 46, 18 * cen.morroA, 0.011 * cen.morroF, 0.3);
        // chão
        ctx.fillStyle = cen.terra; ctx.fillRect(-20, CHAO, W + 40, ALTURA - CHAO + 80);
        ctx.fillStyle = cen.chao; ctx.fillRect(-20, CHAO, W + 40, 16);
        ctx.fillStyle = 'rgba(0,0,0,.08)';
        for (let x = -((deslocFundo) % 48); x < W + 48; x += 48) ctx.fillRect(x, CHAO + 26, 24, 8);
        // à noite o cenário fica mais escuro (o Miguel e os prêmios continuam bem claros)
        if (cen.lua) { ctx.fillStyle = 'rgba(20,30,80,.28)'; ctx.fillRect(-20, topo, W + 40, ALTURA - topo + 80); }
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
          if (o.tipo === 'estrela' || o.tipo === 'presente' || o.tipo === 'osso') { ctx.fillStyle = o.tipo === 'osso' ? 'rgba(255,236,130,.6)' : 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(o.x + o.w / 2, oy + o.h / 2, o.w * 0.75, 0, 7); ctx.fill(); }
          if (o.assoprado) { ctx.save(); ctx.translate(o.x + o.w / 2, oy + o.h / 2); ctx.rotate(o.assoprado.giro); emoji(o.fig, 0, 0, o.w); ctx.restore(); continue; }
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
          ctx.rotate(partes ? (j.noChao ? 0.06 : Math.max(-0.2, Math.min(0.2, j.vy / 3500))) : j.noChao ? corre * 0.05 : Math.max(-0.25, Math.min(0.25, j.vy / 3000)));
          ctx.scale(esm, 1 / esm);
          if (j.turbo > 0) { ctx.shadowColor = '#ffd54f'; ctx.shadowBlur = 24; }
          if (j.giro > 0) { ctx.translate(0, -j.h / 2); ctx.rotate(j.giro); ctx.translate(0, j.h / 2); }
          if (partes) desenharGatinho(j);
          else if (img.complete && img.naturalWidth) ctx.drawImage(img, -j.w / 2 - 6, -j.h - 6 + Math.abs(corre) * -4, j.w + 12, j.h + 12);
          else emoji('🐱', 0, -j.h / 2, 60);
          ctx.restore();
        }
        if (j.escudo) { ctx.strokeStyle = 'rgba(128,222,234,.9)'; ctx.lineWidth = 4; ctx.fillStyle = 'rgba(128,222,234,.18)'; ctx.beginPath(); ctx.arc(j.x + j.w / 2, j.y + j.h / 2, 54, 0, 7); ctx.fill(); ctx.stroke(); }
        if (j.ima > 0) emoji('🧲', j.x + j.w + 6, j.y + 6, 22);
        if (j.balao > 0) {
          ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(j.x + j.w / 2, j.y + 10); ctx.lineTo(j.x + j.w / 2 + 6, j.y - 50); ctx.stroke();
          emoji('🎈', j.x + j.w / 2 + 6, j.y - 72, 52);
        }
        if (j.lento > 0) emoji('🐢', j.x - 22, j.y + 6, 24);
        if (heroi) desenharHeroi();
        if (penelope) desenharPenelope();
        for (const w of ondas) {
          // ondinhas de som ")))" saindo do latido
          ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, w.vida * 1.4)); ctx.lineCap = 'round';
          for (let k = 0; k < 3; k++) {
            ctx.strokeStyle = ['#ffffff', '#fff59d', '#b3e5fc'][k]; ctx.lineWidth = 6 - k;
            ctx.beginPath(); ctx.arc(w.x - k * 18, w.y, w.r + k * 14, -0.9, 0.9); ctx.stroke();
          }
          ctx.restore();
        }
        for (const r of raios) {
          const a = Math.max(0, r.vida / 0.35);
          ctx.save();
          ctx.globalAlpha = a;
          const gr = ctx.createLinearGradient(r.x1, r.y1, r.x2, r.y2);
          ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#e040fb'].forEach((cor, i) => gr.addColorStop(i / 4, cor));
          ctx.lineCap = 'round';
          ctx.shadowColor = '#fff59d'; ctx.shadowBlur = 18;
          ctx.strokeStyle = gr; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(r.x1, r.y1); ctx.lineTo(r.x2, r.y2); ctx.stroke();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(r.x1, r.y1); ctx.lineTo(r.x2, r.y2); ctx.stroke();
          ctx.restore();
          emoji('🌟', r.x2, r.y2, 30 * (1 + (1 - a)));
        }
        // partículas
        for (const p of particulas) {
          ctx.globalAlpha = Math.max(0, Math.min(1, p.vida * 2));
          if (p.texto) { ctx.font = 'bold 20px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(31,45,61,.6)'; ctx.strokeText(p.texto, p.x, p.y); ctx.fillStyle = p.cor; ctx.fillText(p.texto, p.x, p.y); }
          else { ctx.fillStyle = p.cor; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
        }
        ctx.globalAlpha = 1;
        if (clarao > 0) { ctx.fillStyle = `rgba(255,243,190,${clarao * 0.7})`; ctx.fillRect(-20, -Math.max(0, sobraTopo) - 20, W + 40, ALTURA + Math.max(0, sobraTopo) + 100); }
      }
      // o gatinho como um bonequinho: corpo que galopa, bracinhos e patinhas alternando, cabeça e rabo com balanço
      function desenharGatinho(j) {
        const agora = performance.now() / 1000;
        const ph = j.passo, s1 = Math.sin(ph), c1 = Math.cos(ph);
        const chao = j.noChao, subindo = !chao && j.vy < 0;
        const machucado = j.invencivel > 1.2;
        ctx.translate(-j.w / 2 - 6, -j.h - 6);
        ctx.scale((j.w + 12) / 400, (j.h + 12) / 500);
        const pulo = chao ? -Math.abs(s1) * 22 : 0;
        ctx.translate(0, pulo);
        const parte = (im, px, py, ang = 0, dx = 0, dy = 0) => {
          ctx.save();
          ctx.translate(px + dx, py + dy); ctx.rotate(ang); ctx.translate(-px, -py);
          ctx.drawImage(im, 0, 0, 400, 500);
          ctx.restore();
        };
        // rabo: abana sempre; no ar fica para cima
        const rabo = Math.sin(agora * (chao ? 9 : 5)) * 0.2 + (chao ? 0 : subindo ? -0.35 : 0.15);
        parte(partes.costas, 200, 360, 0, 0, chao ? 0 : 6);
        parte(partes.rabo, 272, 440, rabo);
        parte(partes.corpo, 200, 470, chao ? Math.sin(ph * 2) * 0.03 : 0);
        // patinhas de trás: uma vai, a outra volta (no ar ficam encolhidas)
        if (chao) {
          parte(partes.pataE, 148, 470, 0, c1 * 16, -Math.max(0, s1) * 20);
          parte(partes.pataD, 252, 470, 0, -c1 * 16, -Math.max(0, -s1) * 20);
        } else {
          parte(partes.pataE, 148, 470, -0.3, -10, subindo ? -26 : -10);
          parte(partes.pataD, 252, 470, 0.3, 10, subindo ? -26 : -10);
        }
        // bracinhos: balançam correndo; sobem no pulo; abrem na queda
        if (chao) {
          // um bracinho sobe enquanto o outro desce, no ritmo das patinhas
          parte(partes.bracoE, 150, 372, 0.25 + s1 * 0.25, 4, -Math.max(0, -s1) * 22);
          parte(partes.bracoD, 250, 372, -0.25 + s1 * 0.25, -4, -Math.max(0, s1) * 22);
        } else {
          parte(partes.bracoE, 150, 372, subindo ? 1.9 : 0.8);
          parte(partes.bracoD, 250, 372, subindo ? -1.9 : -0.8);
        }
        // cabeça: balança um pouquinho atrás do corpo; chacoalha quando bate
        const cab = machucado ? Math.sin(agora * 40) * 0.12 : chao ? Math.sin(ph * 2 + 0.9) * 0.05 : subindo ? -0.1 : 0.08;
        const olhosFechados = machucado || (j.piscar < 0);
        parte(olhosFechados ? partes.piscando : partes.cabeca, 200, 330, cab, 0, chao ? Math.abs(Math.sin(ph + 0.5)) * 6 : 0);
      }
      // desenha uma imagem em pedacinhos, cada um deslocado por campo(u, v): dá movimento a uma figura parada
      function desenharMalha(im, x, y, w, h, campo, nx = 9, ny = 18) {
        const iw = im.naturalWidth, ih = im.naturalHeight, cw = w / nx, ch = h / ny;
        for (let i = 0; i < nx; i++) for (let k = 0; k < ny; k++) {
          const [dx, dy] = campo((i + 0.5) / nx, (k + 0.5) / ny);
          ctx.drawImage(im, i * iw / nx, k * ih / ny, iw / nx, ih / ny, x + i * cw + dx - 0.8, y + k * ch + dy - 0.8, cw + 1.6, ch + 1.6);
        }
      }
      function desenharPenelope() {
        const tam = 140, px = penelope.x, base = CHAO + 14;
        // sombra e brilho dourado
        ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.ellipse(px, CHAO + 4, 30, 6, 0, 0, 7); ctx.fill();
        const g = ctx.createRadialGradient(px, base - tam * 0.45, 5, px, base - tam * 0.45, tam * 0.7);
        g.addColorStop(0, 'rgba(255,240,170,.55)'); g.addColorStop(1, 'rgba(255,240,170,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, base - tam * 0.45, tam * 0.7, 0, 7); ctx.fill();
        if (telinhaPenelope) {
          telinhaPenelope.desenhar(penelope.anim, { correndo: true });
          ctx.drawImage(telinhaPenelope.canvas, px - tam / 2, base - tam, tam, tam);
        } else if (fotoPenelope.complete && fotoPenelope.naturalWidth) ctx.drawImage(fotoPenelope, px - 40, base - 92 + Math.abs(Math.sin(penelope.anim * 10)) * -6, 80, 92);
        else emoji('🐶', px, base - 40, 60);
      }
      function desenharHeroi() {
        const H = 104, W = H * 0.756, t = heroi.anim;
        ctx.save();
        ctx.translate(heroi.x, heroi.y);
        // chega dando uma pirueta; sai voando inclinado; empurra o corpo para trás quando solta o raio
        const pirueta = t < 0.7 ? (1 - t / 0.7) * Math.PI * 2 : 0;
        ctx.rotate((heroi.saindo ? -0.5 : -0.14 + Math.sin(t * 3) * 0.05) - pirueta - heroi.tiro * 0.12);
        ctx.translate(-heroi.tiro * 6, 0);
        // brilho dourado em volta
        const aura = ctx.createRadialGradient(0, 0, 10, 0, 0, H * 0.75);
        aura.addColorStop(0, 'rgba(255,236,130,.55)'); aura.addColorStop(1, 'rgba(255,236,130,0)');
        ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, 0, H * 0.75, 0, 7); ctx.fill();
        // capa vermelha balançando no vento
        const onda = (k) => Math.sin(t * 9 + k) * 7;
        const capa = ctx.createLinearGradient(0, -H * 0.1, -W * 1.1, H * 0.3);
        capa.addColorStop(0, '#e53935'); capa.addColorStop(1, '#b71c1c');
        ctx.fillStyle = capa; ctx.strokeStyle = '#7f0000'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-W * 0.12, -H * 0.14);
        ctx.quadraticCurveTo(-W * 0.6, -H * 0.12 + onda(0), -W * 1.15, -H * 0.02 + onda(1));
        ctx.lineTo(-W * 1.25, H * 0.12 + onda(1.6));
        ctx.lineTo(-W * 1.05, H * 0.2 + onda(2.2));
        ctx.lineTo(-W * 1.12, H * 0.34 + onda(2.8));
        ctx.quadraticCurveTo(-W * 0.55, H * 0.32 + onda(1.5), W * 0.12, -H * 0.06);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // o Miguel virado para a frente, com o dedo apontando o caminho
        if (imgHeroi.complete && imgHeroi.naturalWidth) {
          ctx.save(); ctx.scale(-1, 1);
          desenharMalha(imgHeroi, -W / 2, -H / 2, W, H, (u, v) => {
            // (u, v) na imagem original: o braço esticado fica à esquerda (vira a frente no espelho)
            let dx = 0, dy = 0;
            // pernas balançando juntas, como quem voa (sem separar uma da outra, para a imagem não abrir)
            if (v > 0.55) {
              const k = (v - 0.55) / 0.45;
              dx += k * k * 8 * Math.sin(t * 6);
              dy += k * k * 2 * Math.cos(t * 6);
            }
            // cabeça balançando de alegria
            if (v < 0.45) { const k = (0.45 - v) / 0.45; dx += k * Math.sin(t * 4) * 2.5; dy += k * Math.sin(t * 6) * 1.5; }
            // braço que aponta: estica para a frente quando solta o raio
            if (u < 0.4 && v > 0.08 && v < 0.5) { const k = (0.4 - u) / 0.4 * (1 - Math.abs(v - 0.29) / 0.21); dx -= k * (heroi.tiro * 10 + Math.sin(t * 5) * 1.5); }
            // o outro braço acena
            if (u > 0.68 && v > 0.3 && v < 0.62) { const k = (u - 0.68) / 0.32 * (1 - Math.abs(v - 0.46) / 0.16); dy += k * Math.sin(t * 10) * 5; }
            return [dx, dy];
          });
          ctx.restore();
          // brilho na ponta do dedo
          const brilhoDedo = 0.4 + heroi.tiro * 0.6 + Math.sin(t * 12) * 0.15;
          const gd = ctx.createRadialGradient(W * 0.46, -H * 0.32, 0, W * 0.46, -H * 0.32, 14 + heroi.tiro * 10);
          gd.addColorStop(0, `rgba(255,255,255,${brilhoDedo})`); gd.addColorStop(1, 'rgba(255,236,130,0)');
          ctx.fillStyle = gd; ctx.beginPath(); ctx.arc(W * 0.46, -H * 0.32, 24, 0, 7); ctx.fill();
        } else emoji('🦸', 0, 0, 70);
        // estrela de super-herói no peito
        emoji('⭐', W * 0.02, H * 0.06, 13);
        ctx.restore();
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
      // o botão Voltar do alto pausa a corrida (sair só pelo menu de pausa)
      nav.interceptarVoltar(() => { if (!acabou && !pausado) { c.querySelector('[data-acao="pausa"]').click(); return true; } return false; });
      document.addEventListener('visibilitychange', aoSumir);
      return () => {
        rodando = false;
        telinhaPenelope?.descartar();
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
