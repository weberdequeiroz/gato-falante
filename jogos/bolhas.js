// Bolhas de sabão: estoure bolhas para contar, ou só as de uma cor
(() => {
  const M = window.Miguel;
  const NUMEROS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte'];
  const CORES = [
    { nome: 'vermelha', cor: '#e53935' }, { nome: 'azul', cor: '#1e88e5' }, { nome: 'amarela', cor: '#fdd835' },
    { nome: 'verde', cor: '#43a047' }, { nome: 'roxa', cor: '#8e24aa' }, { nome: 'laranja', cor: '#fb8c00' },
  ];
  const META = 10;

  function inicio(nav) {
    nav.ir('Bolhas de sabão', (c) => {
      c.innerHTML = `
        <div class="lista-modos" style="--cor:#4fc3f7">
          <button class="modo" data-modo="contar"><span class="simbolo">🫧</span><span><strong>Estoure e conte</strong><small>conte as bolhas até ${META}</small></span></button>
          <button class="modo" data-modo="cor"><span class="simbolo">🎨</span><span><strong>Só uma cor</strong><small>estoure só as bolhas da cor pedida</small></span></button>
        </div>`;
      M.falar('Bolhas de sabão! Como você quer brincar?');
      c.onclick = (e) => {
        const b = e.target.closest('[data-modo]');
        if (b) jogar(nav, b.dataset.modo);
      };
    });
  }

  function jogar(nav, modo) {
    nav.ir('Bolhas de sabão', (c) => {
      let quadro = null, criar = null;
      const comecar = () => {
        const alvo = modo === 'cor' ? M.sortear(CORES) : null;
        let estouradas = 0, ultimoTempo = performance.now();
        const bolhas = [];
        c.innerHTML = `
          <div class="bolhas-jogo">
            <p class="instrucao">${alvo ? `Estoure as bolhas <strong style="color:${alvo.cor}">${alvo.nome}s</strong>!` : 'Estoure as bolhas e conte comigo!'}
              <span class="contador"><strong id="contador">0</strong> / ${META}</span></p>
            <div class="ceu-bolhas"></div>
          </div>`;
        const ceu = c.querySelector('.ceu-bolhas');
        M.falar(alvo ? `Estoure só as bolhas ${alvo.nome}s!` : 'Estoure as bolhas! Vamos contar juntos!');
        const nova = () => {
          const largura = ceu.clientWidth, altura = ceu.clientHeight;
          const tam = 64 + Math.random() * 36;
          const cor = alvo && Math.random() < 0.45 ? alvo : M.sortear(CORES);
          const el = document.createElement('button');
          el.className = 'bolha';
          el.style.width = el.style.height = tam + 'px';
          el.style.setProperty('--c', cor.cor);
          el.setAttribute('aria-label', 'Bolha ' + cor.nome);
          ceu.appendChild(el);
          bolhas.push({ el, cor, x: Math.random() * (largura - tam), y: altura + 10, vel: (M.calmo ? 30 : 45) + Math.random() * 40, fase: Math.random() * 6, tam });
        };
        criar = setInterval(nova, M.calmo ? 1300 : 850);
        nova(); nova();
        const passo = (agora) => {
          const dt = Math.min(0.05, (agora - ultimoTempo) / 1000);
          ultimoTempo = agora;
          for (let i = bolhas.length - 1; i >= 0; i--) {
            const b = bolhas[i];
            b.y -= b.vel * dt;
            b.fase += dt * 2;
            b.el.style.transform = `translate(${b.x + Math.sin(b.fase) * 14}px, ${b.y}px)`;
            if (b.y < -b.tam) { b.el.remove(); bolhas.splice(i, 1); }
          }
          quadro = requestAnimationFrame(passo);
        };
        quadro = requestAnimationFrame(passo);
        ceu.addEventListener('pointerdown', (e) => {
          const el = e.target.closest('.bolha');
          if (!el) return;
          e.preventDefault();
          const i = bolhas.findIndex(b => b.el === el);
          if (i < 0) return;
          const b = bolhas[i];
          if (alvo && b.cor !== alvo) {
            M.somErro();
            M.falar(`Essa é ${b.cor.nome}. Procure as ${alvo.nome}s!`);
            return;
          }
          bolhas.splice(i, 1);
          el.classList.add('estourou');
          setTimeout(() => el.remove(), 250);
          estouradas++;
          c.querySelector('#contador').textContent = estouradas;
          M.tocarNota(500 + estouradas * 60, 0, 0.12, 0.14);
          M.falar(NUMEROS[estouradas] || String(estouradas));
          if (estouradas >= META) {
            clearInterval(criar);
            cancelAnimationFrame(quadro);
            M.jogos.ganharTrofeu('bolhas');
            setTimeout(() => M.jogos.telaVitoria(c, {
              sub: `Você estourou ${META} bolhas!`,
              fala: `Parabéns! Você estourou ${NUMEROS[META]} bolhas!`,
              deNovo: comecar,
              outros: M.jogos.nav.voltar,
            }), 700);
          }
        });
      };
      comecar();
      return () => { clearInterval(criar); cancelAnimationFrame(quadro); };
    });
  }

  M.jogos.registrar({ id: 'bolhas', nome: 'Bolhas', simbolo: '🫧', cor: '#4fc3f7', secao: 'brincar', abrir: inicio });
})();
