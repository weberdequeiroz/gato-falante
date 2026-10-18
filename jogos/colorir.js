// Colorir: toque numa parte do desenho para pintar (balde) ou pinte livre com o pincel
(() => {
  const M = window.Miguel;
  const T = 600; // tamanho do desenho

  // cada desenho é feito só de contornos; as partes fechadas viram áreas para pintar
  const DESENHOS = [
    { id: 'gato', nome: 'Gatinho', simbolo: '🐱', desenhar(d) {
      d.poli([[165, 215], [140, 70], [265, 150]]); d.poli([[435, 215], [460, 70], [335, 150]]);
      d.poli([[175, 180], [162, 105], [225, 150]]); d.poli([[425, 180], [438, 105], [375, 150]]);
      d.circ(300, 310, 170);
      d.elip(235, 290, 34, 44); d.elip(365, 290, 34, 44); d.circ(242, 298, 14); d.circ(358, 298, 14);
      d.poli([[282, 352], [318, 352], [300, 372]]);
      d.caminho('M300 372 L300 392 M300 392 Q282 418 258 400 M300 392 Q318 418 342 400');
      d.caminho('M220 360 L120 345 M220 378 L118 385 M380 360 L480 345 M380 378 L482 385');
      d.elip(300, 545, 120, 30);
    } },
    { id: 'casa', nome: 'Casinha', simbolo: '🏠', desenhar(d) {
      d.ret(385, 140, 45, 100);
      d.poli([[100, 300], [300, 120], [500, 300]]);
      d.ret(140, 300, 320, 220);
      d.ret(255, 395, 90, 125, 8); d.circ(328, 460, 7);
      d.ret(170, 330, 70, 70); d.caminho('M205 330 L205 400 M170 365 L240 365');
      d.ret(360, 330, 70, 70); d.caminho('M395 330 L395 400 M360 365 L430 365');
      d.caminho('M30 520 L570 520');
      d.circ(525, 75, 40);
      d.caminho('M70 90 q20 -40 50 -10 q30 -30 55 5 q30 5 15 30 l-110 0 q-30 -5 -10 -25 z');
    } },
    { id: 'peixe', nome: 'Peixinho', simbolo: '🐟', desenhar(d) {
      d.poli([[430, 300], [560, 200], [540, 300], [560, 400]]);
      d.caminho('M240 205 Q300 120 360 205');
      d.elip(270, 300, 190, 115);
      d.caminho('M250 188 Q290 300 250 412 M330 192 Q370 300 330 408');
      d.circ(165, 280, 24); d.circ(160, 280, 10);
      d.caminho('M95 320 Q115 335 135 322');
      d.caminho('M300 400 L280 470 L350 410');
      d.circ(70, 170, 20); d.circ(50, 110, 13); d.circ(80, 60, 9);
    } },
    { id: 'flor', nome: 'Florzinha', simbolo: '🌸', desenhar(d) {
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; d.circ(300 + Math.cos(a) * 92, 220 + Math.sin(a) * 92, 58); }
      d.circ(300, 220, 52);
      d.ret(292, 335, 16, 155);
      d.caminho('M300 420 Q360 360 420 395 Q360 450 300 420 Z');
      d.caminho('M300 450 Q240 390 180 425 Q240 480 300 450 Z');
      d.poli([[205, 480], [395, 480], [370, 575], [230, 575]]);
      d.caminho('M215 510 L385 510');
    } },
    { id: 'borboleta', nome: 'Borboleta', simbolo: '🦋', desenhar(d) {
      d.elip(195, 215, 115, 90); d.elip(405, 215, 115, 90);
      d.elip(215, 385, 85, 70); d.elip(385, 385, 85, 70);
      d.circ(185, 205, 32); d.circ(415, 205, 32); d.circ(210, 390, 25); d.circ(390, 390, 25);
      d.elip(300, 300, 22, 140);
      d.caminho('M290 170 Q260 90 220 70 M310 170 Q340 90 380 70');
      d.circ(218, 68, 12); d.circ(382, 68, 12);
    } },
    { id: 'carro', nome: 'Carrinho', simbolo: '🚗', desenhar(d) {
      d.poli([[165, 300], [220, 205], [395, 205], [450, 300]]);
      d.ret(80, 300, 440, 120, 30);
      d.poli([[195, 295], [232, 222], [298, 222], [298, 295]]);
      d.poli([[318, 295], [318, 222], [383, 222], [423, 295]]);
      d.circ(190, 430, 55); d.circ(190, 430, 22); d.circ(410, 430, 55); d.circ(410, 430, 22);
      d.circ(495, 340, 14); d.ret(85, 330, 26, 22, 6);
      d.caminho('M20 486 L580 486');
    } },
    { id: 'foguete', nome: 'Foguete', simbolo: '🚀', desenhar(d) {
      d.caminho('M260 450 L300 570 L340 450 Z');
      d.caminho('M250 360 L180 470 L250 450 Z M350 360 L420 470 L350 450 Z');
      d.caminho('M245 455 L245 230 Q300 60 355 230 L355 455 Z');
      d.circ(300, 260, 34); d.circ(300, 260, 22);
      d.caminho('M245 380 L355 380');
      d.estrela(90, 120, 30); d.estrela(500, 170, 24); d.estrela(470, 480, 28); d.estrela(110, 420, 22);
    } },
    { id: 'sorvete', nome: 'Sorvete', simbolo: '🍦', desenhar(d) {
      d.poli([[215, 310], [385, 310], [300, 570]]);
      d.caminho('M250 350 L340 470 M300 330 L370 400 M232 400 L315 520 M350 350 L265 470 M300 330 L230 395 M368 398 L285 520');
      d.circ(255, 260, 72); d.circ(345, 260, 72); d.circ(300, 175, 72);
      d.circ(300, 92, 22); d.caminho('M300 70 Q310 40 335 30');
    } },
    { id: 'arvore', nome: 'Árvore', simbolo: '🌳', desenhar(d) {
      d.ret(265, 360, 70, 175, 8);
      d.circ(200, 290, 85); d.circ(400, 290, 85); d.circ(300, 210, 120);
      [[240, 180], [350, 160], [300, 260], [190, 300], [410, 300]].forEach(([x, y]) => d.circ(x, y, 16));
      d.caminho('M30 535 L570 535');
      d.caminho('M80 535 l15 -30 l15 30 M480 535 l15 -30 l15 30');
    } },
    { id: 'arcoiris', nome: 'Arco-íris', simbolo: '🌈', desenhar(d) {
      [250, 215, 180, 145, 110].forEach(r => d.caminho(`M${300 - r} 440 A${r} ${r} 0 0 1 ${300 + r} 440`));
      d.caminho('M50 440 L550 440');
      d.caminho('M20 470 q0 -60 60 -50 q20 -50 75 -25 q40 -10 45 35 q30 25 0 50 l-150 0 q-40 0 -30 -10 z');
      d.caminho('M440 470 q0 -60 60 -50 q20 -50 75 -25 q30 0 15 40 q10 35 -20 45 l-110 0 q-30 0 -20 -10 z');
      d.circ(100, 110, 50);
    } },
    { id: 'livre', nome: 'Desenho livre', simbolo: '✏️', desenhar() {} },
  ];

  const CORES = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#f06292', '#795548', '#212121', '#ffffff', '#81d4fa', '#a5d6a7', '#ffcc80', '#f8bbd0', '#ffe0b2', '#c58c5c'];

  function caneta(ctx) {
    const d = {
      circ: (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); },
      elip: (x, y, rx, ry) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); },
      ret: (x, y, w, h, r = 0) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); ctx.stroke(); },
      poli: (pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke(); },
      caminho: (svg) => ctx.stroke(new Path2D(svg)),
      estrela: (x, y, r) => {
        const pts = [];
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
        d.poli(pts);
      },
    };
    return d;
  }

  function galeria(nav) {
    nav.ir('Colorir', (c) => {
      c.innerHTML = `<div class="grade-jogos">${DESENHOS.map(d =>
        `<button class="cartao-jogo" data-d="${d.id}" style="--cor:#ff8a3d"><span class="simbolo">${d.simbolo}</span><span class="nome">${d.nome}</span></button>`).join('')}</div>`;
      M.falar('Escolha um desenho para colorir!');
      c.onclick = (e) => {
        const b = e.target.closest('[data-d]');
        if (b) pintar(nav, DESENHOS.find(d => d.id === b.dataset.d));
      };
    });
  }

  function pintar(nav, desenho) {
    nav.ir(desenho.nome, (c) => {
      c.innerHTML = `
        <div class="colorir">
          <div class="ferramentas">
            <button data-ferr="balde" aria-pressed="${desenho.id !== 'livre'}">🪣 Pintar</button>
            <button data-ferr="pincel" aria-pressed="${desenho.id === 'livre'}">🖌️ Pincel</button>
            <button data-acao="desfazer" aria-label="Desfazer">↩️</button>
            <button data-acao="limpar" aria-label="Começar de novo">🗑️</button>
            <button data-acao="salvar" aria-label="Guardar desenho">💾</button>
          </div>
          <div class="tela-pintura">
            <canvas class="camada-cor" width="${T}" height="${T}"></canvas>
            <canvas class="camada-linha" width="${T}" height="${T}"></canvas>
          </div>
          <div class="paleta">${CORES.map((cor, i) =>
            `<button data-cor="${cor}" style="background:${cor}" aria-label="Cor ${i + 1}" aria-pressed="${i === 0}"></button>`).join('')}</div>
        </div>`;
      const corCanvas = c.querySelector('.camada-cor'), linhaCanvas = c.querySelector('.camada-linha');
      const cc = corCanvas.getContext('2d', { willReadFrequently: true });
      const lc = linhaCanvas.getContext('2d', { willReadFrequently: true });
      let ferramenta = desenho.id === 'livre' ? 'pincel' : 'balde', cor = CORES[0];
      const historico = [];

      cc.fillStyle = '#fff';
      cc.fillRect(0, 0, T, T);
      lc.lineWidth = 7;
      lc.lineJoin = lc.lineCap = 'round';
      lc.strokeStyle = '#1f2d3d';
      desenho.desenhar(caneta(lc));
      const linhas = lc.getImageData(0, 0, T, T).data;

      const guardarPasso = () => {
        historico.push(cc.getImageData(0, 0, T, T));
        if (historico.length > 15) historico.shift();
      };
      const ponto = (e) => {
        const r = linhaCanvas.getBoundingClientRect();
        return [Math.floor((e.clientX - r.left) / r.width * T), Math.floor((e.clientY - r.top) / r.height * T)];
      };

      // balde de tinta: pinta a área fechada, parando nos contornos
      const baldeEm = (x, y) => {
        if (x < 0 || y < 0 || x >= T || y >= T || linhas[(y * T + x) * 4 + 3] > 60) return;
        const img = cc.getImageData(0, 0, T, T), px = img.data;
        const i0 = (y * T + x) * 4, alvo = [px[i0], px[i0 + 1], px[i0 + 2]];
        const nova = [parseInt(cor.slice(1, 3), 16), parseInt(cor.slice(3, 5), 16), parseInt(cor.slice(5, 7), 16)];
        if (Math.abs(alvo[0] - nova[0]) + Math.abs(alvo[1] - nova[1]) + Math.abs(alvo[2] - nova[2]) < 6) return;
        guardarPasso();
        const igual = (p) => linhas[p * 4 + 3] <= 60 &&
          Math.abs(px[p * 4] - alvo[0]) + Math.abs(px[p * 4 + 1] - alvo[1]) + Math.abs(px[p * 4 + 2] - alvo[2]) < 40;
        const visto = new Uint8Array(T * T);
        const pilha = [y * T + x];
        while (pilha.length) {
          const p = pilha.pop();
          if (visto[p] || !igual(p)) continue;
          let e = p, d = p;
          const linha = Math.floor(p / T) * T;
          while (e > linha && !visto[e - 1] && igual(e - 1)) e--;
          while (d < linha + T - 1 && !visto[d + 1] && igual(d + 1)) d++;
          for (let q = e; q <= d; q++) {
            visto[q] = 1;
            px[q * 4] = nova[0]; px[q * 4 + 1] = nova[1]; px[q * 4 + 2] = nova[2]; px[q * 4 + 3] = 255;
            if (q >= T && !visto[q - T]) pilha.push(q - T);
            if (q < T * (T - 1) && !visto[q + T]) pilha.push(q + T);
          }
        }
        cc.putImageData(img, 0, 0);
        M.tocarNota(500 + Math.random() * 500, 0, 0.15, 0.08);
      };

      let pintando = false, ultimo = null;
      linhaCanvas.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const [x, y] = ponto(e);
        if (ferramenta === 'balde') { baldeEm(x, y); return; }
        guardarPasso();
        pintando = true;
        ultimo = [x, y];
        linhaCanvas.setPointerCapture(e.pointerId);
        cc.fillStyle = cor;
        cc.beginPath(); cc.arc(x, y, 11, 0, Math.PI * 2); cc.fill();
      });
      linhaCanvas.addEventListener('pointermove', (e) => {
        if (!pintando) return;
        const [x, y] = ponto(e);
        cc.strokeStyle = cor; cc.lineWidth = 22; cc.lineCap = 'round';
        cc.beginPath(); cc.moveTo(ultimo[0], ultimo[1]); cc.lineTo(x, y); cc.stroke();
        ultimo = [x, y];
      });
      const parar = () => { pintando = false; };
      linhaCanvas.addEventListener('pointerup', parar);
      linhaCanvas.addEventListener('pointercancel', parar);

      c.onclick = (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.cor) {
          cor = b.dataset.cor;
          c.querySelectorAll('[data-cor]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        } else if (b.dataset.ferr) {
          ferramenta = b.dataset.ferr;
          c.querySelectorAll('[data-ferr]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
          M.falar(ferramenta === 'balde' ? 'Toque numa parte do desenho para pintar.' : 'Passe o dedo para pintar.');
        } else if (b.dataset.acao === 'desfazer' && historico.length) cc.putImageData(historico.pop(), 0, 0);
        else if (b.dataset.acao === 'limpar') { guardarPasso(); cc.fillStyle = '#fff'; cc.fillRect(0, 0, T, T); }
        else if (b.dataset.acao === 'salvar') {
          const junto = document.createElement('canvas');
          junto.width = junto.height = T;
          const j = junto.getContext('2d');
          j.drawImage(corCanvas, 0, 0); j.drawImage(linhaCanvas, 0, 0);
          const a = document.createElement('a');
          a.href = junto.toDataURL('image/png');
          a.download = `desenho-${desenho.id}.png`;
          a.click();
          M.festa(b, 8);
          M.falar('Que lindo! Guardei o seu desenho.');
        }
      };
      M.falar(ferramenta === 'balde' ? 'Escolha uma cor e toque numa parte do desenho!' : 'Escolha uma cor e desenhe com o dedo!');
    });
  }

  M.jogos.registrar({ id: 'colorir', nome: 'Colorir', simbolo: '🖍️', cor: '#ff8a3d', secao: 'criar', abrir: galeria });
})();
