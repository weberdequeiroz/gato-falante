// Quebra-cabeça: troque as peças de lugar até a figura ficar certa
(() => {
  const M = window.Miguel;
  const CENAS = [
    { fundo: ['#7cc6f2', '#c9ecff'], grande: '🐱', enfeites: ['☁️', '🌞', '🌷'], nome: 'um gatinho' },
    { fundo: ['#1e3a6e', '#5b7bd5'], grande: '🚀', enfeites: ['⭐', '🌙', '🪐'], nome: 'um foguete no espaço' },
    { fundo: ['#7fd3ff', '#2f8fd8'], grande: '🐳', enfeites: ['🐠', '🫧', '🐚'], nome: 'uma baleia no mar' },
    { fundo: ['#b9e59a', '#6fbf4b'], grande: '🦒', enfeites: ['🌳', '☀️', '🦋'], nome: 'uma girafa' },
    { fundo: ['#ffd1e6', '#ff9cc7'], grande: '🦄', enfeites: ['🌈', '✨', '💖'], nome: 'um unicórnio' },
    { fundo: ['#ffe9a8', '#ffc65c'], grande: '🦁', enfeites: ['🌴', '☀️', '🍃'], nome: 'um leão' },
    { fundo: ['#c9f1ff', '#86d6f5'], grande: '🐧', enfeites: ['❄️', '🧊', '⛄'], nome: 'um pinguim' },
    { fundo: ['#d7c4ff', '#9b7cf0'], grande: '🐉', enfeites: ['🏰', '⭐', '🔥'], nome: 'um dragão' },
    { fundo: ['#bff0c7', '#7cd68c'], grande: '🚜', enfeites: ['🌾', '🐄', '☀️'], nome: 'um trator na fazenda' },
    { fundo: ['#ffd8b0', '#ff9a5a'], grande: '🍰', enfeites: ['🎈', '🎉', '🍓'], nome: 'um bolo de festa' },
  ];
  // o Safari do iPhone não desenha emoji com letra muito grande no canvas:
  // desenha pequeno numa tela auxiliar e depois amplia
  const FONTE_EMOJI = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  function emoji(x, texto, cx, cy, tam) {
    const base = 96, aux = document.createElement('canvas');
    aux.width = aux.height = base * 1.25;
    const a = aux.getContext('2d');
    a.textAlign = 'center'; a.textBaseline = 'middle'; a.fillStyle = '#000';
    a.font = `${base}px ${FONTE_EMOJI}`;
    a.fillText(texto, aux.width / 2, aux.height / 2 + base * 0.06);
    const lado = tam * 1.25;
    x.drawImage(aux, cx - lado / 2, cy - lado / 2, lado, lado);
  }
  function imagem(cena) {
    const t = 480, cv = document.createElement('canvas');
    cv.width = cv.height = t;
    const x = cv.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, t);
    g.addColorStop(0, cena.fundo[0]); g.addColorStop(1, cena.fundo[1]);
    x.fillStyle = g; x.fillRect(0, 0, t, t);
    [[80, 80], [400, 90], [90, 400], [395, 395]].forEach(([a, b], i) => emoji(x, cena.enfeites[i % cena.enfeites.length], a, b, 90));
    emoji(x, cena.grande, t / 2, t / 2 + 15, 270);
    return cv.toDataURL();
  }
  function jogar(nav) {
    nav.ir('Quebra-cabeça', (c) => {
      c.innerHTML = `<div class="lista-modos" style="--cor:#8b5cf6">
        <p class="instrucao">Toque em duas peças para trocar de lugar!</p>
        <button class="modo" data-n="2"><span class="simbolo">🧩</span><span><strong>Fácil</strong><small>4 peças</small></span></button>
        <button class="modo" data-n="3"><span class="simbolo">🧩🧩</span><span><strong>Médio</strong><small>9 peças</small></span></button>
        <button class="modo" data-n="4"><span class="simbolo">🧩🧩🧩</span><span><strong>Difícil</strong><small>16 peças</small></span></button></div>`;
      M.falar('Quebra-cabeça! Escolha quantas peças.');
      c.onclick = (e) => { const b = e.target.closest('[data-n]'); if (b) montar(nav, +b.dataset.n); };
    });
  }
  function montar(nav, n) {
    nav.ir('Quebra-cabeça', (c) => {
      const partida = () => {
        const cena = M.sortear(CENAS), url = imagem(cena);
        let ordem;
        do { ordem = M.embaralhar([...Array(n * n).keys()]); } while (ordem.every((v, i) => v === i));
        let escolhida = null;
        c.innerHTML = `<div class="quebra">
          <p class="instrucao">Toque em duas peças para trocar.</p>
          <div class="tabuleiro" style="--n:${n}"></div>
          <div class="modelo"><span>Modelo:</span><img src="${url}" alt=""></div></div>`;
        const tab = c.querySelector('.tabuleiro');
        const desenhar = () => {
          tab.innerHTML = ordem.map((peca, pos) => {
            const lx = peca % n, ly = Math.floor(peca / n);
            return `<button class="peca ${escolhida === pos ? 'escolhida' : ''} ${peca === pos ? 'no-lugar' : ''}" data-pos="${pos}" aria-label="Peça ${pos + 1}"
              style="background-image:url(${url});background-size:${n * 100}% ${n * 100}%;background-position:${n > 1 ? lx / (n - 1) * 100 : 0}% ${n > 1 ? ly / (n - 1) * 100 : 0}%"></button>`;
          }).join('');
        };
        desenhar();
        M.falar('Olhe o modelo e arrume as peças!');
        c.onclick = (e) => {
          const b = e.target.closest('[data-pos]');
          if (!b) return;
          const pos = +b.dataset.pos;
          if (escolhida === null) { escolhida = pos; desenhar(); M.tocarNota(600, 0, 0.08, 0.08); return; }
          [ordem[escolhida], ordem[pos]] = [ordem[pos], ordem[escolhida]];
          escolhida = null;
          M.tocarNota(800, 0, 0.1, 0.1);
          desenhar();
          if (ordem.every((v, i) => v === i)) {
            c.onclick = null;
            tab.classList.add('pronto');
            M.jogos.ganharTrofeu('quebra');
            setTimeout(() => M.jogos.telaVitoria(c, { sub: `É ${cena.nome}!`, fala: `Parabéns! Você montou ${cena.nome}!`, deNovo: partida, outros: M.jogos.nav.voltar }), 900);
          }
        };
      };
      partida();
    });
  }
  M.catalogo.push(() => ['Quebra-cabeça! Escolha quantas peças.', 'Olhe o modelo e arrume as peças!', ...CENAS.map(c => `Parabéns! Você montou ${c.nome}!`)]);
  M.jogos.registrar({ id: 'quebra', nome: 'Quebra-cabeça', simbolo: '🧩', cor: '#8b5cf6', secao: 'brincar', abrir: jogar });
})();
