// Ligar os pontinhos: toque nos números em ordem e descubra o desenho
(() => {
  const M = window.Miguel;
  const NUMEROS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte'];

  const estrela = () => { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 19 : 44; p.push([50 + Math.cos(a) * r, 54 + Math.sin(a) * r]); } return p; };
  const coracao = () => { const p = []; for (let i = 0; i < 14; i++) { const t = Math.PI + i * (Math.PI * 2) / 14; p.push([50 + 2.6 * 16 * Math.pow(Math.sin(t), 3), 48 - 2.6 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); } return p; };

  const FIGURAS = [
    { nome: 'uma estrela', simbolo: '⭐', cor: '#fdd835', pontos: estrela() },
    { nome: 'uma casinha', simbolo: '🏠', cor: '#ff8a65', pontos: [[20, 90], [20, 45], [50, 12], [80, 45], [80, 90], [60, 90], [60, 65], [40, 65], [40, 90]] },
    { nome: 'um coração', simbolo: '❤️', cor: '#f06292', pontos: coracao() },
    { nome: 'um peixe', simbolo: '🐟', cor: '#4fc3f7', pontos: [[10, 50], [28, 30], [52, 24], [72, 36], [92, 18], [86, 50], [92, 82], [72, 64], [52, 76], [28, 70]] },
    { nome: 'um barquinho', simbolo: '⛵', cor: '#90caf9', pontos: [[48, 8], [48, 62], [14, 62], [24, 80], [80, 80], [90, 62], [52, 62], [52, 14], [82, 54]] },
    { nome: 'um pinheiro', simbolo: '🎄', cor: '#66bb6a', pontos: [[50, 6], [70, 32], [60, 32], [80, 56], [68, 56], [88, 80], [56, 80], [56, 94], [44, 94], [44, 80], [12, 80], [32, 56], [20, 56], [40, 32], [30, 32]] },
    { nome: 'um diamante', simbolo: '💎', cor: '#80deea', pontos: [[30, 18], [70, 18], [90, 38], [50, 90], [10, 38]] },
    { nome: 'um foguete', simbolo: '🚀', cor: '#ef5350', pontos: [[50, 6], [64, 26], [64, 66], [78, 84], [62, 80], [56, 92], [44, 92], [38, 80], [22, 84], [36, 66], [36, 26]] },
    { nome: 'uma gatinha', simbolo: '🐱', cor: '#ffb74d', pontos: [[20, 40], [18, 10], [38, 26], [62, 26], [82, 10], [80, 40], [86, 62], [70, 84], [50, 90], [30, 84], [14, 62]] },
    { nome: 'um sorvete', simbolo: '🍦', cor: '#f8bbd0', pontos: [[50, 94], [26, 46], [22, 34], [30, 20], [44, 14], [56, 14], [70, 20], [78, 34], [74, 46]] },
  ];

  function lista(nav) {
    nav.ir('Ligar os pontinhos', (c) => {
      c.innerHTML = `<div class="grade-jogos">${FIGURAS.map((f, i) =>
        `<button class="cartao-jogo" data-f="${i}" style="--cor:#7c5cff"><span class="simbolo misterio">❓</span><span class="nome">Desenho ${i + 1}</span>${M.jogos.trofeus('pontos/' + i) ? `<span class="selo">${f.simbolo}</span>` : ''}</button>`).join('')}</div>`;
      M.falar('Escolha um desenho surpresa! Ligue os pontinhos para descobrir o que é.');
      c.onclick = (e) => {
        const b = e.target.closest('[data-f]');
        if (b) jogar(nav, +b.dataset.f);
      };
    });
  }

  function jogar(nav, indice) {
    const fig = FIGURAS[indice];
    nav.ir('Ligar os pontinhos', (c) => {
      let proximo = 0;
      const pts = fig.pontos;
      c.innerHTML = `
        <div class="pontos">
          <p class="instrucao" id="instrucao">Comece pelo número 1!</p>
          <svg viewBox="-4 -4 108 108" class="folha-pontos">
            <polygon class="preenchido" points="${pts.map(p => p.join(',')).join(' ')}" style="fill:${fig.cor}"/>
            <polyline class="ligacao" points=""/>
            ${pts.map(([x, y], i) => `
              <g class="ponto" data-i="${i}">
                <circle cx="${x}" cy="${y}" r="6.5" class="alvo"/>
                <circle cx="${x}" cy="${y}" r="2.6" class="bolinha"/>
                <text x="${x + 3.4}" y="${y - 3.4}">${i + 1}</text>
              </g>`).join('')}
          </svg>
          <div class="revelado" hidden><span>${fig.simbolo}</span><strong>É ${fig.nome}!</strong></div>
        </div>`;
      const linha = c.querySelector('.ligacao');
      const marcar = () => c.querySelectorAll('.ponto').forEach((g, i) => {
        g.classList.toggle('feito', i < proximo);
        g.classList.toggle('proximo', i === proximo);
      });
      marcar();
      M.falar('Ligue os pontinhos! Comece pelo número um.');
      c.querySelector('svg').addEventListener('pointerdown', (e) => {
        const g = e.target.closest('.ponto');
        if (!g) return;
        const i = +g.dataset.i;
        if (i !== proximo) {
          M.somErro();
          M.falar(`Esse é o ${NUMEROS[i + 1] || i + 1}. Procure o ${NUMEROS[proximo + 1] || proximo + 1}!`);
          return;
        }
        proximo++;
        M.tocarNota(400 + proximo * 40, 0, 0.18, 0.12);
        M.falar(NUMEROS[proximo] || String(proximo), { forcar: false });
        linha.setAttribute('points', pts.slice(0, proximo).map(p => p.join(',')).join(' '));
        marcar();
        c.querySelector('#instrucao').textContent = proximo < pts.length ? `Agora o número ${proximo + 1}!` : 'Você conseguiu!';
        if (proximo === pts.length) {
          linha.setAttribute('points', [...pts, pts[0]].map(p => p.join(',')).join(' '));
          c.querySelector('.pontos').classList.add('pronto');
          c.querySelector('.revelado').hidden = false;
          M.jogos.ganharTrofeu('pontos/' + indice);
          M.somAcerto();
          M.festa(c.querySelector('.revelado'), 14);
          setTimeout(() => M.falar(`Uau! É ${fig.nome}!`), 600);
        }
      });
    });
  }

  M.jogos.registrar({ id: 'pontos', nome: 'Ligar pontinhos', simbolo: '✏️', cor: '#7c5cff', secao: 'brincar', abrir: lista });
})();
