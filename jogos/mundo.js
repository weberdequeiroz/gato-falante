// Mundo do Miguel: um "obby" em 3D (percurso de obstáculos, como os do Roblox) com fases infinitas.
// Cada fase termina numa bandeira; ao chegar nela o jogo salva sozinho e da próxima vez continua dali.
(() => {
  const M = window.Miguel;
  let carregando = null;
  function carregarThree() {
    if (window.THREE) return Promise.resolve();
    if (!carregando) carregando = new Promise((ok, erro) => {
      const s = document.createElement('script');
      s.src = 'vendor/three-0.149.0.min.js';
      s.onload = ok; s.onerror = erro;
      document.head.appendChild(s);
    });
    return carregando;
  }

  const lerDados = () => { try { return Object.assign({ fase: 1, estrelas: 0, recorde: 1 }, JSON.parse(M.ler('miguel-mundo') || '{}')); } catch (e) { return { fase: 1, estrelas: 0, recorde: 1 }; } };
  const guardarDados = (d) => M.guardar('miguel-mundo', JSON.stringify(d));

  // sorteio que sempre dá o mesmo resultado para a mesma fase
  function sorteador(semente) {
    let a = semente * 2654435761 >>> 0;
    return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  const TEMAS = [
    { ceu: 0x8fd3ff, chao: 0x7ccb68, cores: [0xff7a1a, 0x2f9be8, 0x34b25a, 0xf5b301, 0x8b5cf6, 0xff4f8b] },
    { ceu: 0xffd2a8, chao: 0xf4d58d, cores: [0x00a5bd, 0xff7043, 0xffca28, 0x26a69a, 0xec407a, 0x7e57c2] },
    { ceu: 0xb9a7ff, chao: 0x9575cd, cores: [0xff80ab, 0x80deea, 0xfff176, 0xa5d6a7, 0xffab91, 0x90caf9] },
    { ceu: 0xa8e6cf, chao: 0x66bb6a, cores: [0x43a047, 0x8d6e63, 0xffb300, 0x1e88e5, 0xe53935, 0x5e35b1] },
    { ceu: 0x1b2350, chao: 0x3949ab, cores: [0x00e5ff, 0xff4081, 0x76ff03, 0xffea00, 0xd500f9, 0xff9100], noite: true },
  ];
  const tema = (fase) => TEMAS[Math.floor((fase - 1) / 5) % TEMAS.length];

  // ---------- sons ----------
  function som(tipo) {
    const ac = M.obterContexto(), t = ac.currentTime + 0.01, vol = M.calmo ? 0.5 : 1;
    const nota = (f, ini, dur, v, forma = 'triangle', f2) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = forma; o.frequency.setValueAtTime(f, t + ini);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + ini + dur);
      g.gain.setValueAtTime(0.0001, t + ini); g.gain.exponentialRampToValueAtTime(v * vol, t + ini + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + ini + dur);
      o.connect(g); g.connect(ac.destination); o.start(t + ini); o.stop(t + ini + dur + 0.02);
    };
    if (tipo === 'pulo') nota(300, 0, 0.16, 0.1, 'square', 620);
    else if (tipo === 'mola') nota(180, 0, 0.35, 0.14, 'sine', 900);
    else if (tipo === 'estrela') { nota(1047, 0, 0.08, 0.09); nota(1568, 0.07, 0.18, 0.09); }
    else if (tipo === 'bandeira') [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => nota(f, i * 0.09, 0.2, 0.09, 'square'));
    else if (tipo === 'cair') { nota(600, 0, 0.45, 0.1, 'sawtooth', 120); }
    else if (tipo === 'voltar') nota(200, 0, 0.3, 0.1, 'sine', 800);
  }

  // ---------- telas ----------
  const MIGUEL = () => (M.roupas ? M.roupas.imagemMiguel() : 'icones/miguel.png');
  const TUTORIAL = () => [
    { titulo: 'Ande com o círculo!', texto: 'Arraste o dedo no círculo da esquerda para o Miguel andar para qualquer lado.',
      ilustracao: `<div class="ilu-cena"><div class="ilu-joystick"><span class="ilu-bolinha"></span></div><img class="ilu-gato anda" src="${MIGUEL()}" alt=""><div class="ilu-chao"></div></div>` },
    { titulo: 'Toque para pular!', texto: 'O botão da direita faz o Miguel pular de um bloco para o outro.',
      ilustracao: `<div class="ilu-cena"><span class="ilu-bloco"></span><img class="ilu-gato pula" src="${MIGUEL()}" alt=""><span class="ilu-bloco dir"></span><span class="ilu-pular">⬆️<small>Pular</small></span><span class="ilu-dedo">👆</span></div>` },
    { titulo: 'Gire a câmera!', texto: 'Arraste o dedo no lado direito da tela para olhar em volta.',
      ilustracao: `<div class="ilu-cena"><img class="ilu-gato" src="${MIGUEL()}" alt=""><span class="ilu-dedo arrasta">👆</span><span class="ilu-seta">↔️</span></div>` },
    { titulo: 'Chegue nas bandeiras!', texto: 'Cada bandeira é uma fase nova, e o jogo salva sozinho. Pegue as estrelas no caminho!',
      ilustracao: `<div class="ilu-itens"><span>🚩<small>salva</small></span><span>⭐<small>estrela</small></span><span>🟨<small>mola</small></span><span>♾️<small>sem fim</small></span></div>` },
    { titulo: 'Penélope!', texto: 'Pegue o osso dourado e a cachorrinha Penélope vem ajudar: pulo duplo no ar, ímã de estrelas, e ela te salva se você cair!',
      ilustracao: `<div class="ilu-itens"><span>🦴<small>osso</small></span><span><img src="icones/penelope.png" alt="" style="height:64px"><small>Penélope</small></span><span>⏫<small>pulo duplo</small></span><span>🛟<small>te salva</small></span></div>` },
    { titulo: 'Cuidado!', texto: 'Fuja do chão vermelho e das barras que giram. Se cair, você volta para a última bandeira.',
      ilustracao: `<div class="ilu-itens"><span>🟥<small>quente</small></span><span>💫<small>barra</small></span><span>🌀<small>caiu?</small></span><span>🚩<small>volta</small></span></div>` },
  ];

  function inicio(nav) {
    nav.ir('Mundo do Miguel', (c) => {
      const d = lerDados();
      c.innerHTML = `
        <div class="corrida-capa">
          <div class="corrida-titulo mundo-titulo"><span>🌍</span> Mundo do Miguel</div>
          <img class="corrida-miguel" src="${M.roupas ? M.roupas.imagemMiguel() : 'icones/miguel.png'}" alt="">
          <div class="corrida-recordes">
            <span>🚩 Fase: <strong>${d.fase}</strong></span>
            <span>⭐ Estrelas: <strong>${d.estrelas}</strong></span>
            <span>🏆 Mais longe: <strong>${d.recorde}</strong></span>
          </div>
          <button class="botao-pronto" data-fase="${d.fase}">▶ ${d.fase > 1 ? `Continuar na fase ${d.fase}` : 'Começar a aventura'}</button>
          ${d.fase > 1 ? '<button class="botao-largo" data-fase="1">🔁 Começar da fase 1 (sem perder estrelas)</button>' : ''}
          <button class="botao-largo" data-tutorial>❓ Como jogar</button>
          <details class="como-jogar">
            <summary><strong>📖 Ler as regras</strong></summary>
            <p>🕹️ Use o <strong>círculo da esquerda</strong> para andar.</p>
            <p>⬆️ Toque no <strong>botão de pular</strong> (à direita).</p>
            <p>👉 Arraste o dedo no lado direito da tela para <strong>girar a câmera</strong>.</p>
            <p>🚩 Chegue nas <strong>bandeiras</strong>: o jogo salva sozinho. As fases não acabam nunca!</p>
            <p>🦴 Pegue o <strong>osso dourado</strong>: a cachorrinha <strong>Penélope</strong> vem ajudar com pulo duplo, ímã de estrelas e te salva se cair!</p>
            <p>🔥 Cuidado com o chão vermelho e com as barras que giram. Se cair, você volta para a última bandeira.</p>
          </details>
        </div>`;
      M.falar(d.fase > 1 ? (d.fase <= 60 ? `Mundo do Miguel! Você parou na fase ${d.fase}. Vamos continuar?` : 'Mundo do Miguel! Vamos continuar a aventura?') : 'Mundo do Miguel! Ande, pule e chegue nas bandeiras. As fases não acabam nunca!');
      c.onclick = (e) => {
        if (e.target.closest('[data-tutorial]')) { M.jogos.tutorial(TUTORIAL()); return; }
        const b = e.target.closest('[data-fase]');
        if (!b) return;
        // na primeira vez, o Miguel mostra como jogar enquanto o mundo carrega
        if (M.ler('miguel-tutorial-mundo') !== '1') {
          M.guardar('miguel-tutorial-mundo', '1');
          const pronto = carregarThree().catch(() => null);
          M.jogos.tutorial(TUTORIAL(), () => pronto.then(() => { if (window.THREE) jogar(nav, +b.dataset.fase); }));
          return;
        }
        b.disabled = true;
        b.textContent = '⏳ Carregando o mundo...';
        carregarThree().then(() => jogar(nav, +b.dataset.fase)).catch(() => {
          b.disabled = false;
          b.textContent = 'Não consegui abrir o mundo. Toque para tentar de novo.';
        });
      };
    });
  }

  function jogar(nav, faseInicial) {
    nav.ir('Mundo do Miguel', (c) => {
      const T = window.THREE;
      c.innerHTML = `
        <div class="mundo">
          <canvas class="mundo-tela"></canvas>
          <div class="corrida-hud">
            <span class="hud-caixa">🚩 Fase <strong id="m-fase"></strong></span>
            <span class="hud-caixa">⭐ <strong id="m-estrelas"></strong></span>
            <span class="hud-caixa" id="m-poder" hidden></span>
            <span style="margin-left:auto"></span>
            <button class="hud-botao" data-acao="musica" aria-label="Música">🎵</button>
            <button class="hud-botao" data-acao="pausa" aria-label="Pausar">⏸️</button>
          </div>
          <div class="joystick" id="joystick"><div class="joystick-bolinha" id="bolinha"></div></div>
          <button class="botao-pular" id="botao-pular" aria-label="Pular">⬆️<small>Pular</small></button>
          <div class="corrida-aviso" id="aviso" hidden></div>
          <div class="corrida-pausa" id="pausa" hidden>
            <div class="cartao-camada"><h2>⏸️ Pausa</h2>
              <p>Seu jogo está salvo na fase <strong id="m-salvo"></strong>.</p>
              <button class="botao-pronto" data-acao="continuar">▶ Continuar</button>
              <button class="botao-largo" data-acao="como-jogar">❓ Como jogar</button>
              <button class="botao-largo" data-acao="voltar-bandeira">🚩 Voltar para a bandeira</button>
              <button class="botao-largo" data-acao="sair">🏠 Sair do mundo</button></div>
          </div>
        </div>`;
      const tela = c.querySelector('canvas');
      const dados = lerDados();
      let fase = faseInicial;

      // ---------- three.js ----------
      const renderer = new T.WebGLRenderer({ canvas: tela, antialias: true });
      renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      const cena = new T.Scene();
      const camera = new T.PerspectiveCamera(62, 1, 0.1, 400);
      const luzCeu = new T.HemisphereLight(0xffffff, 0xb0b8c8, 1.05);
      cena.add(luzCeu, new T.AmbientLight(0xffffff, 0.3));
      const sol = new T.DirectionalLight(0xffffff, 0.85);
      sol.castShadow = true;
      sol.shadow.mapSize.set(1024, 1024);
      Object.assign(sol.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 80 });
      cena.add(sol, sol.target);
      function aplicarTema() {
        const tm = tema(fase);
        cena.background = new T.Color(tm.ceu);
        cena.fog = new T.Fog(tm.ceu, 40, 120);
        luzCeu.intensity = tm.noite ? 0.75 : 1.05;
      }
      aplicarTema();
      function ajustar() {
        const r = tela.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / Math.max(1, r.height);
        camera.updateProjectionMatrix();
      }
      ajustar();
      window.addEventListener('resize', ajustar);

      // nuvens / estrelas de enfeite
      const enfeitesCeu = new T.Group();
      cena.add(enfeitesCeu);
      const matNuvem = new T.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 });
      for (let i = 0; i < 26; i++) {
        const n = new T.Group();
        for (let k = 0; k < 3; k++) {
          const b = new T.Mesh(new T.SphereGeometry(2 + Math.random() * 1.6, 10, 8), matNuvem);
          b.position.set(k * 2.6, Math.random(), Math.random());
          n.add(b);
        }
        n.position.set((Math.random() - 0.5) * 160, 16 + Math.random() * 20, Math.random() * 400 - 40);
        enfeitesCeu.add(n);
      }

      // ---------- o Miguel em blocos ----------
      const roupa = M.roupas ? M.roupas.atual() : {};
      const corBlusa = roupa.blusa ? parseInt(roupa.blusa.cor.slice(1), 16) : null;
      const corCalca = roupa.baixo ? parseInt(roupa.baixo.cor.slice(1), 16) : null;
      const PELO = 0xf39a3b, CREME = 0xfde3c2;
      const mat = (cor) => new T.MeshLambertMaterial({ color: cor });
      const caixa = (w, h, d, cor) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat(cor)); m.castShadow = true; return m; };
      const boneco = new T.Group();
      const corpoG = new T.Group();
      boneco.add(corpoG);
      const tronco = caixa(0.9, 0.85, 0.5, corBlusa ?? PELO); tronco.position.y = 1.25; corpoG.add(tronco);
      if (corBlusa === null) { const barriga = caixa(0.6, 0.6, 0.05, CREME); barriga.position.set(0, 1.2, 0.26); corpoG.add(barriga); }
      const membro = (w, h, cor, x, y) => {
        const p = new T.Group(); p.position.set(x, y, 0);
        const m = caixa(w, h, w, cor); m.position.y = -h / 2; p.add(m);
        corpoG.add(p); return p;
      };
      const pernaE = membro(0.38, 0.85, corCalca ?? PELO, -0.22, 0.85), pernaD = membro(0.38, 0.85, corCalca ?? PELO, 0.22, 0.85);
      const bracoE = membro(0.28, 0.75, corBlusa ?? PELO, -0.6, 1.62), bracoD = membro(0.28, 0.75, corBlusa ?? PELO, 0.6, 1.62);
      const cabeca = new T.Group(); cabeca.position.y = 2.1; corpoG.add(cabeca);
      const cranio = caixa(1, 0.85, 0.85, PELO); cabeca.add(cranio);
      const focinho = caixa(0.55, 0.3, 0.1, CREME); focinho.position.set(0, -0.2, 0.44); cabeca.add(focinho);
      const nariz = caixa(0.14, 0.1, 0.06, 0xff6b8b); nariz.position.set(0, -0.08, 0.5); cabeca.add(nariz);
      for (const x of [-0.24, 0.24]) {
        const olho = caixa(0.18, 0.24, 0.05, 0x2d6a17); olho.position.set(x, 0.08, 0.44); cabeca.add(olho);
        const brilhoOlho = caixa(0.06, 0.06, 0.02, 0xffffff); brilhoOlho.position.set(x + 0.04, 0.14, 0.47); cabeca.add(brilhoOlho);
        const orelha = new T.Mesh(new T.ConeGeometry(0.2, 0.38, 4), mat(PELO)); orelha.position.set(x * 1.4, 0.58, 0); orelha.rotation.y = Math.PI / 4; orelha.castShadow = true; cabeca.add(orelha);
      }
      const rabo = caixa(0.14, 0.14, 0.8, PELO); rabo.position.set(0, 1.0, -0.55); rabo.rotation.x = -0.6; corpoG.add(rabo);
      if (roupa.cabeca) {
        const cor = parseInt(roupa.cabeca.cor.slice(1), 16);
        const chapeu = roupa.cabeca.id === 'coroa' ? new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 0.3, 8), mat(0xffca28))
          : roupa.cabeca.id === 'festa' ? new T.Mesh(new T.ConeGeometry(0.32, 0.7, 12), mat(cor))
          : new T.Mesh(new T.CylinderGeometry(0.46, 0.52, 0.28, 12), mat(cor));
        chapeu.position.y = roupa.cabeca.id === 'festa' ? 0.75 : 0.55;
        cabeca.add(chapeu);
        if (roupa.cabeca.id === 'bone') { const aba = caixa(0.6, 0.06, 0.4, cor); aba.position.set(0, 0.45, 0.55); cabeca.add(aba); }
        if (roupa.cabeca.id === 'chapeu' || roupa.cabeca.id === 'cartola') { const aba = new T.Mesh(new T.CylinderGeometry(0.8, 0.8, 0.06, 16), mat(cor)); aba.position.y = 0.43; cabeca.add(aba); }
      }
      if (roupa.costas?.id === 'capa') { const capa = caixa(0.85, 1.2, 0.05, parseInt(roupa.costas.cor.slice(1), 16)); capa.position.set(0, 1.1, -0.3); capa.rotation.x = 0.15; corpoG.add(capa); }
      const sombraBoneco = new T.Mesh(new T.CircleGeometry(0.55, 20), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 }));
      sombraBoneco.rotation.x = -Math.PI / 2;
      cena.add(boneco, sombraBoneco);

      // ---------- fases ----------
      const fases = new Map(); // número -> { grupo, coisas, inicio, fim }
      const pegas = new Set(JSON.parse(sessionStorage.getItem('miguel-mundo-pegas') || '[]'));
      const geoCaixa = new T.BoxGeometry(1, 1, 1);
      const materiais = {};
      const material = (cor, brilha) => materiais[cor + (brilha ? 'b' : '')] || (materiais[cor + (brilha ? 'b' : '')] = brilha ? new T.MeshBasicMaterial({ color: cor }) : new T.MeshLambertMaterial({ color: cor }));
      const matBorda = new T.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 });
      const geoBorda = new T.EdgesGeometry(geoCaixa);
      const geoEstrela = (() => {
        const s = new T.Shape();
        for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.22 : 0.5; s[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); }
        return new T.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1 });
      })();
      const matEstrela = new T.MeshLambertMaterial({ color: 0xffd23f, emissive: 0x7a5200 });

      function placaTexto(texto, cor = '#ff7a1a') {
        // a placa cresce com o texto; a letra nunca passa de 54px (o iPhone não desenha emoji muito grande)
        const medir = document.createElement('canvas').getContext('2d');
        medir.font = 'bold 54px Nunito, sans-serif';
        const larg = Math.min(720, Math.max(256, Math.ceil(medir.measureText(texto).width) + 70));
        const cv = document.createElement('canvas'); cv.width = larg; cv.height = 128;
        const x = cv.getContext('2d');
        x.fillStyle = '#fff'; x.beginPath(); x.roundRect ? x.roundRect(6, 6, larg - 12, 116, 30) : x.rect(6, 6, larg - 12, 116); x.fill();
        x.lineWidth = 8; x.strokeStyle = cor; x.stroke();
        x.fillStyle = cor; x.font = 'bold 54px Nunito, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText(texto, larg / 2, 68, larg - 40);
        const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(cv) }));
        sp.scale.set(1.6 * larg / 128, 1.6, 1);
        return sp;
      }

      // ilhas flutuantes com árvores, cogumelos, flores e balões dos lados do caminho
      const geoBola = new T.SphereGeometry(1, 14, 10);
      function enfeitar(grupo, coisas, caminho, tm, rnd) {
        const CORES_BALAO = [0xff4f8b, 0xffd23f, 0x2f9be8, 0x34b25a, 0x8b5cf6, 0xff7a1a];
        const pecaBola = (r, cor, x, y, z, g) => { const m = new T.Mesh(geoBola, material(cor)); m.scale.setScalar(r); m.position.set(x, y, z); g.add(m); return m; };
        for (const pt of caminho) {
          if (rnd() < 0.3) continue;
          const lado = rnd() < 0.5 ? -1 : 1;
          const ilha = new T.Group();
          ilha.position.set(pt.x + lado * (7 + rnd() * 5), pt.y - 1.5 - rnd() * 2, pt.z + rnd() * 3);
          const terra = new T.Mesh(new T.CylinderGeometry(2.2, 1.2, 1.2, 10), material(0x9c6b3e)); terra.position.y = -0.7; ilha.add(terra);
          const grama = new T.Mesh(new T.CylinderGeometry(2.3, 2.3, 0.3, 10), material(tm.noite ? 0x3949ab : tm.chao)); ilha.add(grama);
          const tipo = rnd();
          if (tipo < 0.4) { // árvore
            const tronco = new T.Mesh(new T.CylinderGeometry(0.2, 0.28, 1.6, 8), material(0x8d5a2b)); tronco.position.y = 0.9; ilha.add(tronco);
            pecaBola(1, tm.noite ? 0x26a69a : 0x43a047, 0, 2.2, 0, ilha); pecaBola(0.7, tm.noite ? 0x4db6ac : 0x66bb6a, 0.5, 2.7, 0.2, ilha);
            pecaBola(0.16, 0xe53935, 0.6, 2.0, 0.8, ilha); pecaBola(0.16, 0xe53935, -0.5, 2.4, 0.7, ilha);
          } else if (tipo < 0.65) { // cogumelo
            const pe = new T.Mesh(new T.CylinderGeometry(0.3, 0.38, 1, 10), material(0xfff3e0)); pe.position.y = 0.6; ilha.add(pe);
            const chapeu = new T.Mesh(new T.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), material(0xe53935)); chapeu.position.y = 1.05; chapeu.scale.set(1.1, 0.8, 1.1); ilha.add(chapeu);
            for (let k = 0; k < 4; k++) pecaBola(0.14, 0xffffff, Math.cos(k * 1.6) * 0.7, 1.55, Math.sin(k * 1.6) * 0.7, ilha);
          } else { // flores
            for (let k = 0; k < 5; k++) {
              const fx = (rnd() - 0.5) * 3, fz = (rnd() - 0.5) * 3;
              const caule = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.6, 5), material(0x388e3c)); caule.position.set(fx, 0.45, fz); ilha.add(caule);
              pecaBola(0.22, CORES_BALAO[Math.floor(rnd() * CORES_BALAO.length)], fx, 0.8, fz, ilha); pecaBola(0.1, 0xffeb3b, fx, 0.8, fz + 0.15, ilha);
            }
          }
          grupo.add(ilha);
          coisas.push({ flutua: ilha, y0: ilha.position.y, fase: rnd() * 6, devagar: true });
          if (rnd() < 0.45) { // balão colorido
            const b = new T.Group();
            pecaBola(0.7, CORES_BALAO[Math.floor(rnd() * CORES_BALAO.length)], 0, 0, 0, b).scale.set(0.7, 0.85, 0.7);
            const fio = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 1.4, 4), material(0xffffff)); fio.position.y = -1.3; b.add(fio);
            b.position.set(pt.x - lado * (4 + rnd() * 3), pt.y + 3 + rnd() * 2, pt.z + rnd() * 4);
            grupo.add(b);
            coisas.push({ flutua: b, y0: b.position.y, fase: rnd() * 6 });
          }
        }
      }

      function criarFase(n, inicio) {
        const rnd = sorteador(n * 7919 + 13);
        const tm = tema(n);
        const dif = Math.min(1, (n - 1) / 30);
        const grupo = new T.Group();
        const coisas = [];
        const corDe = () => tm.cores[Math.floor(rnd() * tm.cores.length)];
        const bloco = (x, y, z, w, h, d, cor, extra = {}) => {
          const m = new T.Mesh(geoCaixa, material(cor, extra.brilha));
          m.scale.set(w, h, d); m.position.set(x, y - h / 2, z);
          m.castShadow = !extra.brilha; m.receiveShadow = true;
          const borda = new T.LineSegments(geoBorda, matBorda); m.add(borda);
          grupo.add(m);
          const o = { malha: m, w, h, d, x, y, z, base: { x, y, z }, solido: true, ...extra };
          coisas.push(o);
          return o;
        };
        const estrela = (x, y, z) => {
          const id = `${n}:${Math.round(x * 10)}:${Math.round(z * 10)}`;
          if (pegas.has(id)) return;
          const m = new T.Mesh(geoEstrela, matEstrela);
          m.position.set(x, y + 1, z);
          m.castShadow = true;
          grupo.add(m);
          coisas.push({ estrela: true, id, malha: m, x, y: y + 1, z });
        };
        // plaquinha de dica que flutua em cima dos blocos especiais
        const dica = (texto, x, y, z, cor) => {
          const sp = placaTexto(texto, cor);
          sp.scale.multiplyScalar(0.62);
          sp.position.set(x, y + 3, z);
          grupo.add(sp);
          coisas.push({ flutua: sp, y0: y + 3, fase: rnd() * 6, placa: true });
        };
        const caminho = [];
        // osso dourado: chama a Penélope (um por fase, no máximo)
        const rndOsso = sorteador(n * 31 + 7);
        let temOsso = false;
        const osso = (x, y, z) => {
          const g = new T.Group();
          const matOsso = new T.MeshLambertMaterial({ color: 0xffe9a8, emissive: 0x8a6a00 });
          const meio = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.9, 10), matOsso); meio.rotation.z = Math.PI / 2; g.add(meio);
          for (const [dx, dy] of [[-0.5, 0.15], [-0.5, -0.15], [0.5, 0.15], [0.5, -0.15]]) { const b = new T.Mesh(new T.SphereGeometry(0.22, 10, 8), matOsso); b.position.set(dx, dy, 0); g.add(b); }
          g.position.set(x, y + 1.2, z);
          grupo.add(g);
          coisas.push({ osso: true, malha: g, x, y: y + 1.2, z });
          dica('🦴 Chame a Penélope!', x, y + 0.8, z, '#c99400');
          temOsso = true;
        };
        // bandeira (ponto de salvar) no começo de cada fase
        const p = { ...inicio };
        bloco(p.x, p.y, p.z, 6, 1, 6, 0x43a047, { bandeira: n });
        const mastro = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 3.2, 8), material(0xffffff));
        mastro.position.set(p.x + 2.2, p.y + 1.6, p.z - 2.2); grupo.add(mastro);
        const pano = new T.Mesh(new T.PlaneGeometry(1.3, 0.8), new T.MeshLambertMaterial({ color: 0xff4f8b, side: T.DoubleSide }));
        pano.position.set(p.x + 2.9, p.y + 2.8, p.z - 2.2); grupo.add(pano);
        const placa = placaTexto(`Fase ${n}`); placa.position.set(p.x - 2.2, p.y + 3.6, p.z + 2.4); placa.scale.set(2.4, 1.2, 1); grupo.add(placa);
        coisas.push({ pano, enfeite: true });
        p.z += 3;

        const tipos = ['salto', 'salto', 'escada'];
        if (n >= 2) tipos.push('mola', 'salto');
        if (n >= 3) tipos.push('movel');
        if (n >= 4) tipos.push('lava');
        if (n >= 5) tipos.push('elevador');
        if (n >= 6) tipos.push('viga');
        if (n >= 8) tipos.push('some');
        if (n >= 10) tipos.push('giro');
        const quantos = 4 + Math.floor(dif * 5) + Math.floor(rnd() * 2);
        for (let i = 0; i < quantos; i++) {
          const tipo = i === 0 ? 'salto' : tipos[Math.floor(rnd() * tipos.length)];
          const vao = 1.8 + dif * 1.9 + rnd() * 0.9;
          const lado = (rnd() - 0.5) * 3;
          caminho.push({ ...p });
          if (tipo === 'salto') {
            const w = Math.max(1.6, 3.6 - dif * 1.8 + rnd() * 0.8), dy = (rnd() - 0.35) * 1.6;
            p.z += vao + w / 2; p.x += lado; p.y += dy;
            bloco(p.x, p.y, p.z, w, 1, w, corDe());
            if (n <= 2 && i === 0) dica('⬆️ Pule!', p.x, p.y, p.z, '#2f9be8');
            const comEstrela = rnd() < 0.45;
            if (!temOsso && i >= 1 && !comEstrela && rndOsso() < 0.5) osso(p.x, p.y, p.z);
            if (comEstrela) estrela(p.x, p.y, p.z);
            p.z += w / 2;
          } else if (tipo === 'escada') {
            for (let k = 0; k < 4; k++) { p.z += 1.6; p.y += 0.75; bloco(p.x, p.y, p.z, 2.4, 1, 1.6, corDe()); }
            estrela(p.x, p.y, p.z);
            p.z += 0.8;
          } else if (tipo === 'mola') {
            p.z += vao + 1.2; p.x += lado;
            bloco(p.x, p.y, p.z, 2.4, 1, 2.4, 0xffd23f, { mola: true });
            // a mola: almofada vermelha com setas, para a criança saber que ela joga para cima
            const almofada = new T.Mesh(new T.CylinderGeometry(0.95, 0.95, 0.22, 20), material(0xff4f8b));
            almofada.position.set(p.x, p.y + 0.11, p.z); grupo.add(almofada);
            const seta = placaTexto('⬆️⬆️', '#ff4f8b'); seta.scale.multiplyScalar(0.45); seta.position.set(p.x, p.y + 1.2, p.z); grupo.add(seta);
            coisas.push({ flutua: seta, y0: p.y + 1.2, fase: 0, rapido: true });
            dica('🟡 Mola! Pule nela!', p.x, p.y + 1.4, p.z, '#f08c1a');
            p.z += 4.5; p.y += 4.2;
            bloco(p.x, p.y, p.z, 3.2, 1, 3.2, corDe());
            estrela(p.x, p.y + 1.2, p.z);
            p.z += 1.6;
          } else if (tipo === 'movel') {
            p.z += vao + 1.5;
            bloco(p.x, p.y, p.z, 2.6, 0.8, 2.6, corDe(), { move: { eixo: 'x', amp: 2.6 + dif * 1.5, vel: 0.9 + dif * 0.8, fase: rnd() * 6 } });
            dica('↔️ Espere e pule!', p.x, p.y + 1, p.z - 1.5, '#2f9be8');
            p.z += 1.3;
          } else if (tipo === 'elevador') {
            p.z += vao + 1.5;
            bloco(p.x, p.y, p.z, 2.6, 0.8, 2.6, corDe(), { move: { eixo: 'y', amp: 2, vel: 1, fase: rnd() * 6 } });
            dica('↕️ Elevador!', p.x + 2.5, p.y + 2, p.z, '#8b5cf6');
            p.z += 1.3;
          } else if (tipo === 'lava') {
            const comp = 8 + rnd() * 4;
            bloco(p.x, p.y - 0.6, p.z + comp / 2 + 1, 5, 0.6, comp, 0xff3d00, { lava: true, brilha: true });
            dica('🔥 Chão quente! Pule nos blocos', p.x, p.y + 1, p.z + 1, '#e53935');
            let z = p.z + 1.5;
            while (z < p.z + comp) { bloco(p.x + (rnd() - 0.5) * 2.4, p.y, z + 0.7, 1.5, 0.8, 1.5, corDe()); z += 2.4 + dif * 0.6; }
            p.z += comp + 1.5;
            bloco(p.x, p.y, p.z, 3, 1, 3, corDe());
            p.z += 1.5;
          } else if (tipo === 'viga') {
            const comp = 6 + rnd() * 3;
            p.z += vao * 0.6 + comp / 2;
            bloco(p.x, p.y, p.z, Math.max(0.55, 0.9 - dif * 0.3), 0.7, comp, corDe());
            dica('🐾 Ande com cuidado!', p.x, p.y + 0.6, p.z - comp / 2 + 1, '#34b25a');
            estrela(p.x, p.y, p.z);
            p.z += comp / 2;
          } else if (tipo === 'some') {
            dica('⚠️ Esses caem! Corra!', p.x, p.y + 1, p.z + 2.6, '#607d8b');
            for (let k = 0; k < 3; k++) { p.z += 2.6; bloco(p.x + (rnd() - 0.5) * 2, p.y, p.z, 2, 0.6, 2, 0xb0bec5, { some: true }); }
            p.z += 1;
          } else if (tipo === 'giro') {
            p.z += vao + 4;
            bloco(p.x, p.y, p.z, 8, 1, 8, corDe());
            const barra = new T.Mesh(new T.BoxGeometry(7.2, 0.45, 0.45), material(0xff1744, true));
            barra.position.set(p.x, p.y + 0.9, p.z); grupo.add(barra);
            coisas.push({ giro: true, malha: barra, x: p.x, y: p.y + 0.9, z: p.z, vel: 1.4 + dif * 1.2, comp: 3.6 });
            dica('💫 Pule a barra!', p.x, p.y + 1.6, p.z - 3, '#e53935');
            estrela(p.x + 2.5, p.y, p.z + 2.5);
            p.z += 4;
          }
        }
        p.z += 2.8 + dif * 1.2;
        enfeitar(grupo, coisas, caminho, tm, rnd);
        cena.add(grupo);
        return { grupo, coisas, inicio, fim: { x: p.x, y: p.y, z: p.z + 3 } };
      }
      function garantirFases() {
        let anterior = null;
        for (let n = Math.max(1, fase - 1); n <= fase + 2; n++) {
          if (!fases.has(n)) {
            const ini = n === faseRaiz ? { x: 0, y: 0, z: 0 } : fases.has(n - 1) ? fases.get(n - 1).fim : null;
            if (!ini) continue;
            fases.set(n, criarFase(n, ini));
          }
          anterior = fases.get(n);
        }
        for (const [n, f] of fases) if (n < fase - 1 || n > fase + 3) { cena.remove(f.grupo); fases.delete(n); }
        return anterior;
      }
      const faseRaiz = fase; // a fase em que a criança começou fica na origem do mundo
      garantirFases();

      // ---------- jogador ----------
      const ALTURA = 2.3, MEIO = 0.38, GRAV = 32, VPULO = 12.5, VANDAR = 7.2;
      const jog = { pos: new T.Vector3(), vel: new T.Vector3(), noChao: false, apoio: null, tempoNoAr: 0, virado: 0, passo: 0 };
      let yaw = Math.PI, pitch = 0.35, pularCamera = true;
      function irParaBandeira() {
        const f = fases.get(fase);
        jog.pos.set(f.inicio.x, f.inicio.y + 0.01, f.inicio.z);
        jog.vel.set(0, 0, 0);
        yaw = Math.PI;
        pularCamera = true;
        for (const fs of fases.values()) for (const o of fs.coisas) if (o.some) { o.caiu = false; o.timer = 0; o.vy = 0; o.y = o.base.y; o.malha.visible = true; }
      }
      irParaBandeira();

      // ---------- controles ----------
      const entrada = { x: 0, y: 0, pular: false };
      const joy = c.querySelector('#joystick'), bolinha = c.querySelector('#bolinha');
      let dedoJoy = null, joyCentro = null, dedoCam = null, ultimoCam = null;
      const area = c.querySelector('.mundo');
      area.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return;
        const r = area.getBoundingClientRect();
        if (e.clientX - r.left < r.width * 0.45 && dedoJoy === null) {
          dedoJoy = e.pointerId;
          joyCentro = { x: e.clientX, y: e.clientY };
          joy.style.left = (e.clientX - r.left - 60) + 'px';
          joy.style.top = (e.clientY - r.top - 60) + 'px';
          joy.classList.add('ativo');
        } else if (dedoCam === null) { dedoCam = e.pointerId; ultimoCam = { x: e.clientX, y: e.clientY }; }
        area.setPointerCapture?.(e.pointerId);
      });
      area.addEventListener('pointermove', (e) => {
        if (e.pointerId === dedoJoy) {
          let dx = e.clientX - joyCentro.x, dy = e.clientY - joyCentro.y;
          const d = Math.hypot(dx, dy), max = 50;
          if (d > max) { dx = dx / d * max; dy = dy / d * max; }
          bolinha.style.transform = `translate(${dx}px, ${dy}px)`;
          entrada.x = dx / max; entrada.y = -dy / max;
        } else if (e.pointerId === dedoCam) {
          yaw -= (e.clientX - ultimoCam.x) * 0.008;
          pitch = Math.max(-0.1, Math.min(1.1, pitch + (e.clientY - ultimoCam.y) * 0.005));
          ultimoCam = { x: e.clientX, y: e.clientY };
        }
      });
      const soltar = (e) => {
        if (e.pointerId === dedoJoy) { dedoJoy = null; entrada.x = entrada.y = 0; bolinha.style.transform = ''; joy.classList.remove('ativo'); joy.style.left = ''; joy.style.top = ''; }
        if (e.pointerId === dedoCam) dedoCam = null;
      };
      area.addEventListener('pointerup', soltar);
      area.addEventListener('pointercancel', soltar);
      const botaoPular = c.querySelector('#botao-pular');
      botaoPular.addEventListener('pointerdown', (e) => { e.preventDefault(); entrada.pular = true; botaoPular.classList.add('apertado'); });
      botaoPular.addEventListener('pointerup', () => botaoPular.classList.remove('apertado'));
      const teclas = {};
      const aoTeclar = (e) => {
        teclas[e.code] = e.type === 'keydown';
        if (e.code === 'Space' && e.type === 'keydown') { entrada.pular = true; e.preventDefault(); }
      };
      window.addEventListener('keydown', aoTeclar);
      window.addEventListener('keyup', aoTeclar);

      // ---------- avisos e HUD ----------
      let avisoTimer = null;
      function aviso(texto, tempo = 2000) {
        const a = c.querySelector('#aviso');
        a.textContent = texto; a.hidden = false;
        a.animate([{ transform: 'translate(-50%, -50%) scale(.6)', opacity: 0 }, { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }], { duration: 300, easing: 'ease-out' });
        clearTimeout(avisoTimer); avisoTimer = setTimeout(() => { a.hidden = true; }, tempo);
      }
      const hud = () => { c.querySelector('#m-fase').textContent = fase; c.querySelector('#m-estrelas').textContent = dados.estrelas; };

      // ---------- Penélope: a cachorrinha maltês que ajuda o Miguel ----------
      const latir = () => M.penelope3d.latir();
      let penelope = null, texHalo = null;
      const brilhos = [];
      const penelopeAtiva = () => penelope && !penelope.saindo;
      function chamarPenelope() {
        som('estrela');
        if (penelope && !penelope.saindo) { latir(); penelope.t = 15; aviso('🐶 Mais tempo com a Penélope!', 1800); return; }
        if (penelope) { cena.remove(penelope.modelo.grupo); cena.remove(penelope.halo); }
        // a Penélope de verdade em 3D (dá para ver de todos os lados)
        const modelo = M.penelope3d.criar(T);
        modelo.grupo.scale.setScalar(1.05);
        modelo.grupo.position.set(jog.pos.x, jog.pos.y + 6, jog.pos.z);
        cena.add(modelo.grupo);
        // brilho dourado atrás dela, para aparecer bem em qualquer cenário
        if (!texHalo) {
          const cv = document.createElement('canvas'); cv.width = cv.height = 128;
          const x = cv.getContext('2d'), g = x.createRadialGradient(64, 64, 8, 64, 64, 64);
          g.addColorStop(0, 'rgba(255,240,170,.75)'); g.addColorStop(.55, 'rgba(255,214,90,.3)'); g.addColorStop(1, 'rgba(255,214,90,0)');
          x.fillStyle = g; x.fillRect(0, 0, 128, 128);
          texHalo = new T.CanvasTexture(cv);
        }
        const halo = new T.Sprite(new T.SpriteMaterial({ map: texHalo, transparent: true, depthWrite: false }));
        halo.scale.set(3.2, 3.2, 1);
        cena.add(halo);
        penelope = { modelo, halo, t: 15, anim: 0, saindo: false, sumindo: 1 };
        M.penelope3d.gritar();
        aviso('🐶 Penélope chegou! Pulo duplo, ímã de estrelas e ela te salva se cair!', 3200);
      }
      if (/teste/.test(location.search)) window.__chamarPenelope = chamarPenelope; // só para testes automáticos
      function brilho(x, y, z, cor) {
        const m = new T.Mesh(new T.SphereGeometry(0.09, 6, 4), new T.MeshBasicMaterial({ color: cor, transparent: true }));
        m.position.set(x, y, z); cena.add(m);
        brilhos.push({ m, vida: 0.7, vy: 0.4 + Math.random() * 0.6 });
      }
      function animarPenelope(dt, t) {
        for (let i = brilhos.length - 1; i >= 0; i--) {
          const b = brilhos[i]; b.vida -= dt; b.m.position.y += b.vy * dt; b.m.material.opacity = Math.max(0, b.vida / 0.7); b.m.scale.setScalar(0.5 + b.vida);
          if (b.vida <= 0) { cena.remove(b.m); brilhos.splice(i, 1); }
        }
        const poder = c.querySelector('#m-poder');
        if (!penelope) { poder.hidden = true; return; }
        penelope.anim += dt;
        penelope.t -= dt;
        if (penelope.t <= 0 && !penelope.saindo) { penelope.saindo = true; aviso('🐶 Tchau, Penélope! 👋', 1600); latir(); }
        const g = penelope.modelo.grupo;
        penelope.modelo.animar(penelope.anim, { correndo: !penelope.saindo, voando: true });
        penelope.halo.position.set(g.position.x, g.position.y + 0.9, g.position.z);
        if (penelope.saindo) {
          g.position.y += 6 * dt; g.rotation.y += dt * 6;
          penelope.sumindo -= dt * 0.8;
          g.scale.setScalar(Math.max(0.01, 1.05 * penelope.sumindo)); penelope.halo.material.opacity = Math.max(0, penelope.sumindo);
          if (penelope.sumindo <= 0) { cena.remove(g); cena.remove(penelope.halo); penelope = null; poder.hidden = true; return; }
        } else {
          // voa do lado do Miguel (à direita da câmera), olhando para onde ele vai, balançando de alegria
          const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = -fz, rz = fx;
          const alvo = new T.Vector3(jog.pos.x + rx * 1.5 - fx * 0.4, jog.pos.y + 0.9 + Math.sin(penelope.anim * 4) * 0.25, jog.pos.z + rz * 1.5 - fz * 0.4);
          g.position.lerp(alvo, Math.min(1, dt * 5));
          let dif = boneco.rotation.y - g.rotation.y;
          while (dif > Math.PI) dif -= Math.PI * 2;
          while (dif < -Math.PI) dif += Math.PI * 2;
          g.rotation.y += dif * Math.min(1, dt * 6);
          g.rotation.z = Math.sin(penelope.anim * 3) * 0.1;
          penelope.halo.scale.setScalar(3.0 + Math.sin(penelope.anim * 5) * 0.25);
          if (Math.random() < dt * 14) brilho(g.position.x + (Math.random() - 0.5) * 0.8, g.position.y + 0.3, g.position.z + (Math.random() - 0.5) * 0.8, [0xffffff, 0xffd23f, 0xff9ecb, 0x9ee7ff][Math.floor(Math.random() * 4)]);
        }
        poder.hidden = !penelopeAtiva();
        if (penelopeAtiva()) poder.textContent = '🐶 ' + Math.ceil(penelope.t);
      }
      hud();
      aviso(`🚩 Fase ${fase}! Siga em frente!`);

      function chegouNaBandeira(n) {
        if (n <= fase) return;
        fase = n;
        dados.fase = n;
        dados.recorde = Math.max(dados.recorde, n);
        guardarDados(dados);
        garantirFases();
        aplicarTema();
        som('bandeira');
        aviso(`🚩 Fase ${n}! Jogo salvo ✓`, 2200);
        M.miar('feliz');
        M.jogos.ganharMoedas(2);
        if (n % 5 === 0) { M.jogos.ganharTrofeu('mundo'); aviso(`🏆 Fase ${n}! Você ganhou um troféu!`, 2600); }
        hud();
      }
      function morreu(motivo) {
        // com a Penélope por perto, ela busca o Miguel e devolve no último bloco seguro
        if (penelopeAtiva() && jog.ultimoSeguro) {
          const o = jog.ultimoSeguro;
          jog.pos.set(o.x, o.y + 0.01, o.z); jog.vel.set(0, 0, 0);
          latir(); som('mola'); M.vibrar && M.vibrar(40);
          for (let k = 0; k < 14; k++) brilho(o.x + (Math.random() - 0.5) * 2, o.y + Math.random() * 2, o.z + (Math.random() - 0.5) * 2, 0xffd23f);
          aviso('🐶 A Penélope te salvou!', 1600);
          return;
        }
        som(motivo === 'lava' ? 'cair' : 'voltar');
        M.miar('ai');
        M.vibrar && M.vibrar(motivo === 'lava' ? [80, 50, 80, 50, 120] : [150, 60, 80]);
        aviso(motivo === 'lava' ? '🔥 Ui! Chão quente! Volte para a bandeira.' : motivo === 'giro' ? '💫 A barra te pegou! Tente de novo.' : '🌀 Caiu! Tente de novo.', 1600);
        irParaBandeira();
      }

      // ---------- física ----------
      const sobrepoe = (px, py, pz, o) => Math.abs(px - o.x) < MEIO + o.w / 2 && Math.abs(pz - o.z) < MEIO + o.d / 2 && py < o.y && py + ALTURA > o.y - o.h;
      function solidosPerto() {
        const lista = [];
        for (const f of fases.values()) for (const o of f.coisas) if (o.solido && !(o.some && o.caiu && o.y < o.base.y - 3) && Math.abs(o.z - jog.pos.z) < 14 && Math.abs(o.x - jog.pos.x) < 14) lista.push(o);
        return lista;
      }
      function fisica(dt, t) {
        // plataformas que se mexem
        for (const f of fases.values()) for (const o of f.coisas) {
          if (o.move) {
            const antes = { x: o.x, y: o.y };
            const v = Math.sin(t * o.move.vel + o.move.fase) * o.move.amp;
            if (o.move.eixo === 'x') o.x = o.base.x + v; else o.y = o.base.y + v + o.move.amp;
            o.dx = o.x - antes.x; o.dy = o.y - antes.y;
          }
          if (o.some && o.timer > 0 && !o.caiu) { o.timer -= dt; if (o.timer <= 0) { o.caiu = true; o.vy = 0; } }
          if (o.some && o.caiu) { o.vy -= 20 * dt; o.y += o.vy * dt; if (o.y < o.base.y - 40) o.malha.visible = false; }
          if (o.malha && o.solido) o.malha.position.set(o.x, o.y - o.h / 2, o.z);
          if (o.giro) o.malha.rotation.y = t * o.vel;
        }
        if (jog.apoio && jog.noChao && (jog.apoio.dx || jog.apoio.dy)) { jog.pos.x += jog.apoio.dx || 0; jog.pos.y += jog.apoio.dy || 0; }

        // andar (em relação à câmera)
        let ix = entrada.x, iy = entrada.y;
        if (teclas.KeyW || teclas.ArrowUp) iy = 1; if (teclas.KeyS || teclas.ArrowDown) iy = -1;
        if (teclas.KeyA || teclas.ArrowLeft) ix = -1; if (teclas.KeyD || teclas.ArrowRight) ix = 1;
        const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = -fz, rz = fx;
        let mx = fx * iy + rx * ix, mz = fz * iy + rz * ix;
        const forca = Math.min(1, Math.hypot(mx, mz));
        if (forca > 0.05) { const len = Math.hypot(mx, mz); mx /= len; mz /= len; jog.virado = Math.atan2(mx, mz); }
        const alvoX = mx * VANDAR * forca, alvoZ = mz * VANDAR * forca;
        const aceleracao = jog.noChao ? 14 : 6;
        jog.vel.x += (alvoX - jog.vel.x) * Math.min(1, aceleracao * dt);
        jog.vel.z += (alvoZ - jog.vel.z) * Math.min(1, aceleracao * dt);
        jog.tempoNoAr = jog.noChao ? 0 : jog.tempoNoAr + dt;
        if (jog.noChao) jog.pulouDuplo = false;
        if (entrada.pular && jog.tempoNoAr < 0.12) { jog.vel.y = VPULO; jog.noChao = false; jog.tempoNoAr = 1; som('pulo'); }
        else if (entrada.pular && penelopeAtiva() && !jog.pulouDuplo) {
          // pulo duplo: a Penélope dá um impulso no ar
          jog.vel.y = VPULO * 0.95; jog.pulouDuplo = true; som('mola');
          for (let k = 0; k < 8; k++) brilho(jog.pos.x + (Math.random() - 0.5), jog.pos.y, jog.pos.z + (Math.random() - 0.5), 0xff9ecb);
        }
        entrada.pular = false;
        jog.vel.y -= GRAV * dt;

        const solidos = solidosPerto();
        // eixo x, depois z, depois y
        jog.pos.x += jog.vel.x * dt;
        for (const o of solidos) if (sobrepoe(jog.pos.x, jog.pos.y, jog.pos.z, o)) { if (jog.pos.y > o.y - 0.45) { jog.pos.y = o.y; continue; } jog.pos.x = jog.vel.x > 0 ? o.x - o.w / 2 - MEIO - 0.001 : o.x + o.w / 2 + MEIO + 0.001; jog.vel.x = 0; }
        jog.pos.z += jog.vel.z * dt;
        for (const o of solidos) if (sobrepoe(jog.pos.x, jog.pos.y, jog.pos.z, o)) { if (jog.pos.y > o.y - 0.45) { jog.pos.y = o.y; continue; } jog.pos.z = jog.vel.z > 0 ? o.z - o.d / 2 - MEIO - 0.001 : o.z + o.d / 2 + MEIO + 0.001; jog.vel.z = 0; }
        jog.pos.y += jog.vel.y * dt;
        jog.noChao = false; jog.apoio = null;
        for (const o of solidos) {
          if (!sobrepoe(jog.pos.x, jog.pos.y, jog.pos.z, o)) continue;
          if (jog.vel.y <= 0 && jog.pos.y > o.y - 0.6) {
            jog.pos.y = o.y; jog.vel.y = 0; jog.noChao = true; jog.apoio = o;
          } else if (jog.vel.y > 0) { jog.pos.y = o.y - o.h - ALTURA - 0.001; jog.vel.y = 0; M.vibrar && M.vibrar(50); }
        }
        const a = jog.apoio;
        if (a && !a.lava && !a.some && !a.move) jog.ultimoSeguro = a;
        if (a) {
          if (a.lava) return morreu('lava');
          if (a.mola) { jog.vel.y = 21; jog.noChao = false; som('mola'); }
          if (a.some && !a.timer && !a.caiu) a.timer = 0.55;
          if (a.bandeira) chegouNaBandeira(a.bandeira);
        }
        // barras que giram
        for (const f of fases.values()) for (const o of f.coisas) {
          if (!o.giro || Math.abs(jog.pos.y + 0.4 - o.y) > 1) continue;
          const ang = o.malha.rotation.y, cx = Math.cos(ang), sz = -Math.sin(ang);
          const px = jog.pos.x - o.x, pz = jog.pos.z - o.z;
          const proj = Math.max(-o.comp, Math.min(o.comp, px * cx + pz * sz));
          if (Math.hypot(px - proj * cx, pz - proj * sz) < MEIO + 0.25) return morreu('giro');
        }
        // osso dourado
        for (const f of fases.values()) for (const o of f.coisas) {
          if (!o.osso || o.pega) continue;
          o.malha.rotation.y = t * 3;
          o.malha.position.y = o.y + Math.sin(t * 3) * 0.2;
          if (Math.hypot(jog.pos.x - o.x, jog.pos.y + 1 - o.y, jog.pos.z - o.z) < 1.4) { o.pega = true; o.malha.visible = false; chamarPenelope(); }
        }
        // estrelas
        for (const f of fases.values()) for (const o of f.coisas) {
          if (!o.estrela || o.pega) continue;
          if (penelopeAtiva() && Math.hypot(jog.pos.x - o.x, jog.pos.z - o.z) < 7) {
            // ímã: as estrelas vêm voando até o Miguel
            o.x += (jog.pos.x - o.x) * Math.min(1, dt * 4); o.z += (jog.pos.z - o.z) * Math.min(1, dt * 4); o.y += (jog.pos.y + 1 - o.y) * Math.min(1, dt * 4);
            o.malha.position.x = o.x; o.malha.position.z = o.z;
          }
          o.malha.rotation.y = t * 2.5;
          o.malha.position.y = o.y + Math.sin(t * 3 + o.x) * 0.15;
          if (Math.hypot(jog.pos.x - o.x, jog.pos.y + 1 - o.y, jog.pos.z - o.z) < 1.25) {
            o.pega = true; o.malha.visible = false; pegas.add(o.id);
            sessionStorage.setItem('miguel-mundo-pegas', JSON.stringify([...pegas]));
            dados.estrelas++; guardarDados(dados); hud(); som('estrela');
          }
        }
        const f0 = fases.get(fase);
        const fundo = Math.min(f0 ? f0.inicio.y : 0, ...[...fases.values()].map(f => f.inicio.y)) - 18;
        if (jog.pos.y < fundo) morreu('cair');
      }

      // ---------- animação do boneco e câmera ----------
      function animarBoneco(dt, t) {
        boneco.position.copy(jog.pos);
        let dif = jog.virado - boneco.rotation.y;
        while (dif > Math.PI) dif -= Math.PI * 2;
        while (dif < -Math.PI) dif += Math.PI * 2;
        boneco.rotation.y += dif * Math.min(1, dt * 12);
        const vel = Math.hypot(jog.vel.x, jog.vel.z);
        jog.passo += dt * vel * 1.6;
        const balanco = jog.noChao ? Math.sin(jog.passo) * Math.min(1, vel / 5) * 0.8 : 0.5;
        pernaE.rotation.x = balanco; pernaD.rotation.x = -balanco;
        bracoE.rotation.x = -balanco * 0.9; bracoD.rotation.x = balanco * 0.9;
        if (!jog.noChao) { bracoE.rotation.z = -0.6; bracoD.rotation.z = 0.6; } else { bracoE.rotation.z = 0; bracoD.rotation.z = 0; }
        corpoG.position.y = jog.noChao ? Math.abs(Math.sin(jog.passo)) * 0.08 * Math.min(1, vel / 5) : 0;
        rabo.rotation.y = Math.sin(t * 6) * 0.4;
        // sombra no chão logo abaixo
        let chaoY = -999;
        for (const o of solidosPerto()) if (Math.abs(jog.pos.x - o.x) < o.w / 2 && Math.abs(jog.pos.z - o.z) < o.d / 2 && o.y <= jog.pos.y + 0.01) chaoY = Math.max(chaoY, o.y);
        sombraBoneco.visible = chaoY > -999;
        sombraBoneco.position.set(jog.pos.x, chaoY + 0.02, jog.pos.z);
        const s = Math.max(0.4, 1 - (jog.pos.y - chaoY) / 10);
        sombraBoneco.scale.set(s, s, s);

        const dist = 9;
        const alvo = new T.Vector3(jog.pos.x + Math.sin(yaw) * dist * Math.cos(pitch), jog.pos.y + 2.5 + Math.sin(pitch) * dist, jog.pos.z + Math.cos(yaw) * dist * Math.cos(pitch));
        if (pularCamera) { camera.position.copy(alvo); pularCamera = false; } else camera.position.lerp(alvo, Math.min(1, dt * 8));
        camera.lookAt(jog.pos.x, jog.pos.y + 1.6, jog.pos.z);
        sol.position.set(jog.pos.x + 8, jog.pos.y + 20, jog.pos.z + 6);
        sol.target.position.set(jog.pos.x, jog.pos.y, jog.pos.z);
        enfeitesCeu.position.z = jog.pos.z * 0.7;
        for (const f of fases.values()) for (const o of f.coisas) {
          if (o.pano) o.pano.rotation.y = Math.sin(t * 3) * 0.3;
          else if (o.flutua) o.flutua.position.y = o.y0 + Math.sin(t * (o.rapido ? 5 : o.devagar ? 0.8 : 2) + o.fase) * (o.rapido ? 0.25 : o.devagar ? 0.35 : 0.2);
          if (o.placa) { // a dica some quando o Miguel chega perto, para não tapar a visão
            const d = Math.hypot(o.flutua.position.x - jog.pos.x, o.flutua.position.z - jog.pos.z);
            o.flutua.material.opacity = Math.max(0.12, Math.min(1, (d - 1.5) / 3));
          }
        }
      }

      // ---------- música calma de aventura ----------
      let musicaLigada = M.ler('miguel-mundo-musica') !== '0' && !M.calmo, proximaNota = 0, passoMusica = 0, timerMusica = null;
      const ESCALA = [60, 62, 64, 67, 69, 72, 74, 76];
      function tocarMusica() {
        const ac = M.obterContexto();
        while (proximaNota < ac.currentTime + 0.3) {
          const m = passoMusica % 4 === 3 ? null : ESCALA[(passoMusica * 3 + Math.floor(passoMusica / 8)) % ESCALA.length];
          const tocar = (f, v, d, forma) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = forma; o.frequency.value = f; g.gain.setValueAtTime(0.0001, proximaNota); g.gain.exponentialRampToValueAtTime(v, proximaNota + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, proximaNota + d); o.connect(g); g.connect(ac.destination); o.start(proximaNota); o.stop(proximaNota + d + 0.05); };
          if (m) tocar(440 * Math.pow(2, (m - 69) / 12), 0.04, 0.5, 'triangle');
          if (passoMusica % 4 === 0) tocar(440 * Math.pow(2, ([48, 53, 55, 50][Math.floor(passoMusica / 4) % 4] - 69) / 12), 0.06, 1.4, 'sine');
          proximaNota += 0.3; passoMusica++;
        }
      }
      const ligarMusica = () => { if (musicaLigada && !timerMusica) { proximaNota = M.obterContexto().currentTime + 0.05; timerMusica = setInterval(tocarMusica, 80); } };
      const desligarMusica = () => { clearInterval(timerMusica); timerMusica = null; };
      ligarMusica();
      c.querySelector('[data-acao="musica"]').style.opacity = musicaLigada ? 1 : 0.45;

      // ---------- laço ----------
      let ultimo = performance.now(), quadro = null, pausado = false, rodando = true, tempo = 0;
      function laco(agora) {
        let dt = Math.min(0.05, (agora - ultimo) / 1000);
        ultimo = agora;
        if (!pausado) {
          tempo += dt;
          const dt0 = dt;
          while (dt > 0) { const d = Math.min(dt, 1 / 120); fisica(d, tempo); dt -= d; }
          animarBoneco(1 / 60, tempo);
          animarPenelope(dt0, tempo);
        }
        renderer.render(cena, camera);
        if (rodando) quadro = requestAnimationFrame(laco);
      }
      quadro = requestAnimationFrame(laco);
      M.miar('miau');

      c.onclick = (e) => {
        const b = e.target.closest('[data-acao]');
        if (!b) return;
        const acao = b.dataset.acao;
        if (acao === 'pausa') { pausado = true; desligarMusica(); c.querySelector('#m-salvo').textContent = dados.fase; c.querySelector('#pausa').hidden = false; }
        else if (acao === 'continuar') { pausado = false; ultimo = performance.now(); c.querySelector('#pausa').hidden = true; ligarMusica(); }
        else if (acao === 'como-jogar') M.jogos.tutorial(TUTORIAL());
        else if (acao === 'voltar-bandeira') { irParaBandeira(); c.querySelector('[data-acao="continuar"]').click(); }
        else if (acao === 'musica') { musicaLigada = !musicaLigada; M.guardar('miguel-mundo-musica', musicaLigada ? '1' : '0'); musicaLigada ? ligarMusica() : desligarMusica(); b.style.opacity = musicaLigada ? 1 : 0.45; }
        else if (acao === 'sair') nav.voltar();
      };
      const aoSumir = () => { if (document.hidden && !pausado) c.querySelector('[data-acao="pausa"]').click(); };
      nav.interceptarVoltar(() => { if (!pausado) { c.querySelector('[data-acao="pausa"]').click(); return true; } return false; });
      document.addEventListener('visibilitychange', aoSumir);
      return () => {
        rodando = false;
        cancelAnimationFrame(quadro);
        desligarMusica();
        clearTimeout(avisoTimer);
        window.removeEventListener('resize', ajustar);
        window.removeEventListener('keydown', aoTeclar);
        window.removeEventListener('keyup', aoTeclar);
        document.removeEventListener('visibilitychange', aoSumir);
        renderer.dispose();
      };
    }, 'corpo-jogo');
  }

  M.catalogo.push(() => {
    const f = ['Mundo do Miguel! Ande, pule e chegue nas bandeiras. As fases não acabam nunca!', 'Mundo do Miguel!', 'Vamos continuar?', ...M.jogos.textoTutorial(TUTORIAL())];
    f.push('Mundo do Miguel! Vamos continuar a aventura?');
    for (let n = 2; n <= 60; n++) f.push(`Mundo do Miguel! Você parou na fase ${n}. Vamos continuar?`);
    return f;
  });
  M.jogos.registrar({ id: 'mundo', nome: 'Mundo do Miguel', simbolo: '🌍', cor: '#2f9be8', secao: 'aventura', abrir: inicio });
})();
