// Encontre o diferente: uma figura não é igual às outras
(() => {
  const M = window.Miguel;
  const PARES = [['🍎', '🍏'], ['🐶', '🐱'], ['😀', '😮'], ['🚗', '🚕'], ['⭐', '🌟'], ['🐟', '🐠'], ['🌸', '🌼'], ['🐻', '🐼'], ['🍊', '🍋'], ['🐔', '🐤'],
    ['⚽', '🏀'], ['🌙', '⭐'], ['🐸', '🐢'], ['🍓', '🍒'], ['🚀', '✈️'], ['🎈', '🎀'], ['🐮', '🐷'], ['🌳', '🌲'], ['❤️', '💜'], ['🍦', '🍧'], ['🦁', '🐯'], ['🐝', '🐞']];
  const META = 6;
  function jogar(nav) {
    nav.ir('Encontre o diferente', (c) => {
      let rodada = 0;
      const proxima = () => {
        const tamanho = rodada < 2 ? 3 : rodada < 4 ? 4 : 5;
        const [igual, diferente] = M.embaralhar(M.sortear(PARES));
        const total = tamanho * tamanho, alvo = Math.floor(Math.random() * total);
        c.innerHTML = `
          <div class="diferente">
            <div class="estrelas">${Array.from({ length: META }, (_, i) => `<span class="${i < rodada ? 'ganhou' : ''}">★</span>`).join('')}</div>
            <p class="instrucao">Qual figura é diferente das outras? 🔍</p>
            <div class="grade-diferente" style="--n:${tamanho}">${Array.from({ length: total }, (_, i) =>
              `<button data-i="${i}" aria-label="Figura ${i + 1}">${i === alvo ? diferente : igual}</button>`).join('')}</div>
          </div>`;
        if (rodada === 0) M.falar('Encontre a figura que é diferente das outras!');
        c.onclick = (e) => {
          const b = e.target.closest('[data-i]');
          if (!b) return;
          if (+b.dataset.i !== alvo) { M.somErro(); b.animate([{ transform: 'rotate(-10deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(0)' }], { duration: 300 }); M.falar('Essa é igual às outras. Procure de novo!'); return; }
          b.classList.add('achou');
          M.somAcerto();
          M.festa(b, 8);
          rodada++;
          c.onclick = null;
          M.falar(M.sortear(['Achou!', 'Muito bem!', 'Que olho bom!', 'Isso mesmo!']));
          setTimeout(() => {
            if (rodada >= META) {
              M.jogos.ganharTrofeu('diferente');
              M.jogos.telaVitoria(c, { sub: 'Você encontrou todas!', fala: 'Parabéns! Você tem olhos de detetive!', deNovo: () => { rodada = 0; proxima(); }, outros: M.jogos.nav.voltar });
            } else proxima();
          }, 1300);
        };
      };
      proxima();
    });
  }
  M.catalogo.push(() => ['Encontre a figura que é diferente das outras!', 'Essa é igual às outras. Procure de novo!', 'Achou!', 'Muito bem!', 'Que olho bom!', 'Isso mesmo!', 'Parabéns! Você tem olhos de detetive!']);
  M.jogos.registrar({ id: 'diferente', nome: 'O diferente', simbolo: '🔍', cor: '#ef6c00', secao: 'brincar', abrir: jogar });
})();
