// Jogo da memória: vire as cartas e encontre os pares
(() => {
  const M = window.Miguel;
  const TEMAS = {
    animais: ['🐶', '🐱', '🐮', '🐷', '🐸', '🦁', '🐵', '🐰', '🐻', '🦒'],
    frutas: ['🍎', '🍌', '🍇', '🍉', '🍓', '🍊', '🍍', '🍐', '🥝', '🍒'],
    brinquedos: ['⚽', '🧸', '🚗', '🎈', '🪁', '🎨', '🚀', '🎲', '🪀', '🛴'],
  };
  const NIVEIS = [
    { nome: 'Fácil', pares: 3, colunas: 3 },
    { nome: 'Médio', pares: 6, colunas: 3 },
    { nome: 'Difícil', pares: 8, colunas: 4 },
  ];

  function inicio(nav) {
    nav.ir('Jogo da memória', (c) => {
      let tema = 'animais';
      c.innerHTML = `
        <div class="memoria-inicio">
          <p class="instrucao">Escolha as figuras:</p>
          <div class="escolhas">${Object.keys(TEMAS).map(t =>
            `<button data-tema="${t}" aria-pressed="${t === tema}">${TEMAS[t][0]} ${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>
          <p class="instrucao">E o tamanho do jogo:</p>
          ${NIVEIS.map((n, i) => `<button class="modo" data-nivel="${i}"><span class="simbolo">${'🃏'.repeat(i + 1)}</span><span><strong>${n.nome}</strong><small>${n.pares} pares</small></span></button>`).join('')}
        </div>`;
      M.falar('Jogo da memória! Escolha as figuras e o tamanho do jogo.');
      c.onclick = (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.tema) {
          tema = b.dataset.tema;
          c.querySelectorAll('[data-tema]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        } else if (b.dataset.nivel) jogar(nav, tema, NIVEIS[+b.dataset.nivel]);
      };
    });
  }

  function jogar(nav, tema, nivel) {
    nav.ir('Jogo da memória', (c) => {
      const novaPartida = () => {
        const figuras = M.embaralhar(TEMAS[tema]).slice(0, nivel.pares);
        const cartas = M.embaralhar([...figuras, ...figuras]);
        let abertas = [], achados = 0, jogadas = 0, travado = false;
        c.innerHTML = `
          <div class="memoria">
            <p class="instrucao">Pares encontrados: <strong id="achados">0</strong> de ${nivel.pares}</p>
            <div class="cartas" style="--colunas:${nivel.colunas}">${cartas.map((f, i) =>
              `<button class="carta" data-i="${i}" aria-label="Carta virada"><span class="frente">${f}</span><span class="verso">🐾</span></button>`).join('')}</div>
          </div>`;
        c.onclick = (e) => {
          const b = e.target.closest('.carta');
          if (!b || travado || b.classList.contains('virada')) return;
          b.classList.add('virada');
          b.setAttribute('aria-label', cartas[+b.dataset.i]);
          M.tocarNota(660, 0, 0.1, 0.08);
          abertas.push(b);
          if (abertas.length < 2) return;
          jogadas++;
          const [a, d] = abertas;
          abertas = [];
          if (cartas[+a.dataset.i] === cartas[+d.dataset.i]) {
            a.classList.add('par'); d.classList.add('par');
            achados++;
            c.querySelector('#achados').textContent = achados;
            M.somAcerto();
            M.festa(d, 6);
            if (achados === nivel.pares) {
              M.jogos.ganharTrofeu('memoria');
              setTimeout(() => M.jogos.telaVitoria(c, {
                sub: `Você achou todos os pares em ${jogadas} jogadas!`,
                fala: 'Parabéns! Você achou todos os pares! Que memória boa!',
                deNovo: novaPartida,
                outros: M.jogos.nav.voltar,
              }), 900);
            }
          } else {
            travado = true;
            setTimeout(() => {
              a.classList.remove('virada'); d.classList.remove('virada');
              a.setAttribute('aria-label', 'Carta virada'); d.setAttribute('aria-label', 'Carta virada');
              travado = false;
            }, 1000);
          }
        };
      };
      novaPartida();
      M.falar('Vire duas cartas e encontre as figuras iguais!');
    });
  }

  M.catalogo.push(() => ['Jogo da memória! Escolha as figuras e o tamanho do jogo.', 'Vire duas cartas e encontre as figuras iguais!', 'Parabéns! Você achou todos os pares! Que memória boa!']);
  M.jogos.registrar({ id: 'memoria', nome: 'Memória', simbolo: '🃏', cor: '#00a5bd', secao: 'brincar', abrir: inicio });
})();
