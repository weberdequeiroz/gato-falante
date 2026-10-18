// Mercadinho do Miguel: fazer compras com a lista, pagar com moedas, ser o caixa e arrumar as prateleiras
(() => {
  const M = window.Miguel;
  const NUMEROS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze'];
  const N = (n) => NUMEROS[n] || String(n);
  const moedas = (n) => `${n} ${n === 1 ? 'moeda' : 'moedas'}`;

  const SECOES = [
    { id: 'hortifruti', nome: 'Frutas e verduras', simbolo: '🥕', porque: 'são plantinhas que a gente come' },
    { id: 'padaria', nome: 'Padaria e mercearia', simbolo: '🍞', porque: 'são comidas para o lanche e para o almoço' },
    { id: 'bebidas', nome: 'Bebidas', simbolo: '🥛', porque: 'são coisas que a gente bebe' },
    { id: 'higiene', nome: 'Higiene e limpeza', simbolo: '🧼', porque: 'não são de comer: servem para limpar e cuidar do corpo' },
    { id: 'doces', nome: 'Doces', simbolo: '🍬', porque: 'são doces, e doce é só de vez em quando' },
  ];
  // [art, nome, figura, seção, preço em moedas]
  const PRODUTOS = [
    ['a', 'maçã', '🍎', 'hortifruti', 2], ['a', 'banana', '🍌', 'hortifruti', 1], ['a', 'uva', '🍇', 'hortifruti', 3], ['a', 'melancia', '🍉', 'hortifruti', 3],
    ['o', 'morango', '🍓', 'hortifruti', 2], ['a', 'laranja', '🍊', 'hortifruti', 1], ['a', 'cenoura', '🥕', 'hortifruti', 1], ['o', 'tomate', '🍅', 'hortifruti', 1],
    ['o', 'brócolis', '🥦', 'hortifruti', 2], ['o', 'milho', '🌽', 'hortifruti', 1], ['a', 'batata', '🥔', 'hortifruti', 1], ['o', 'abacaxi', '🍍', 'hortifruti', 3],
    ['o', 'pão', '🍞', 'padaria', 1], ['o', 'bolo', '🍰', 'padaria', 3], ['o', 'queijo', '🧀', 'padaria', 3], ['os', 'ovos', '🥚', 'padaria', 2],
    ['o', 'arroz', '🍚', 'padaria', 2], ['o', 'macarrão', '🍝', 'padaria', 2], ['o', 'croissant', '🥐', 'padaria', 2], ['o', 'biscoito', '🍪', 'padaria', 1],
    ['o', 'leite', '🥛', 'bebidas', 2], ['o', 'suco', '🧃', 'bebidas', 2], ['a', 'água', '💧', 'bebidas', 1], ['o', 'café', '☕', 'bebidas', 3],
    ['o', 'sabonete', '🧼', 'higiene', 1], ['o', 'papel higiênico', '🧻', 'higiene', 2], ['a', 'escova de dentes', '🪥', 'higiene', 2], ['a', 'esponja', '🧽', 'higiene', 1], ['o', 'xampu', '🧴', 'higiene', 3],
    ['o', 'chocolate', '🍫', 'doces', 2], ['o', 'pirulito', '🍭', 'doces', 1], ['o', 'sorvete', '🍦', 'doces', 3],
  ].map(([art, nome, fig, sec, preco], i) => ({ id: i, art, nome, fig, sec, preco }));
  const secao = (id) => SECOES.find(s => s.id === id);
  const Art = (p) => p.art[0].toUpperCase() + p.art.slice(1);
  const um = (p) => (p.art.endsWith('s') ? 'uns' : p.art.startsWith('a') ? 'uma' : 'um');
  const CLIENTES = [['🐻', 'O urso'], ['🐰', 'A coelha'], ['👵', 'A vovó'], ['🧒', 'O menino'], ['👧', 'A menina'], ['🐼', 'O panda'], ['🦊', 'A raposa'], ['🐸', 'O sapo'], ['👴', 'O vovô'], ['🐵', 'O macaco']];
  const htmlMoedas = (n) => Array.from({ length: n }, () => '<span class="moeda">1</span>').join('');

  function inicio(nav) {
    nav.ir('Mercadinho do Miguel', (c) => {
      c.innerHTML = `
        <div class="mercado-capa">
          <div class="toldo" aria-hidden="true"></div>
          <p class="mercado-placa">🛒 Mercadinho do Miguel</p>
          <p class="instrucao">Aqui as coisas custam <strong>moedas</strong> <span class="moeda">1</span>. Cada moeda vale um.</p>
        </div>
        <div class="lista-modos" style="--cor:#ff7a1a">
          <button class="modo" data-modo="compras"><span class="simbolo">🧺</span><span><strong>Fazer compras</strong><small>pegue o que está na lista e pague no caixa</small></span></button>
          <button class="modo" data-modo="caixa"><span class="simbolo">💰</span><span><strong>Ser o caixa</strong><small>some quanto o cliente vai pagar</small></span></button>
          <button class="modo" data-modo="prateleiras"><span class="simbolo">📦</span><span><strong>Arrumar as prateleiras</strong><small>cada coisa no seu lugar</small></span></button>
        </div>`;
      M.falar('Bem-vindo ao mercadinho do Miguel! Aqui as coisas custam moedas. O que você quer fazer?');
      c.onclick = (e) => {
        const b = e.target.closest('[data-modo]');
        if (!b) return;
        ({ compras: fazerCompras, caixa: serCaixa, prateleiras: arrumar })[b.dataset.modo](nav);
      };
    });
  }

  // ---------- fazer compras ----------
  function fazerCompras(nav) {
    nav.ir('Fazer compras', (c) => {
      const novaRodada = () => {
        const escolhidos = M.embaralhar(PRODUTOS.filter(p => p.sec !== 'doces')).slice(0, M.sortear([2, 2, 3]));
        const lista = escolhidos.map(p => ({ p, qtd: p.preco <= 2 && /^[a-zà-ú]+[aeo]$/.test(p.nome) && Math.random() < 0.4 ? 2 : 1 }));
        const naPrateleira = M.embaralhar([...escolhidos, ...M.embaralhar(PRODUTOS.filter(p => !escolhidos.includes(p))).slice(0, 9 - escolhidos.length)]);
        const cesta = [];
        const textoLista = lista.map(({ p, qtd }) => qtd === 1 ? `${um(p)} ${p.nome}` : `${N(qtd)} ${p.nome}s`).join(', ');
        c.innerHTML = `
          <div class="compras">
            <div class="lista-compras"><span class="titulo-lista">📝 Lista:</span><div id="itens-lista"></div></div>
            <div class="prateleira">${naPrateleira.map(p =>
              `<button class="produto" data-p="${p.id}" aria-label="${p.nome}, ${moedas(p.preco)}"><span class="fig">${p.fig}</span><span class="nome">${p.nome}</span><span class="etiqueta"><span class="moeda">1</span>×${p.preco}</span></button>`).join('')}</div>
            <div class="cesta"><span class="titulo-lista">🧺 Cesta:</span><div id="itens-cesta" class="itens-cesta"></div></div>
            <button class="botao-pronto" data-acao="caixa">✅ Ir para o caixa</button>
          </div>`;
        const atualizar = () => {
          c.querySelector('#itens-lista').innerHTML = lista.map(({ p, qtd }) => {
            const tem = cesta.filter(x => x === p).length;
            return `<span class="item-lista ${tem >= qtd ? 'ok' : ''}">${p.fig}<small>×${qtd}</small>${tem >= qtd ? '✓' : ''}</span>`;
          }).join('');
          c.querySelector('#itens-cesta').innerHTML = cesta.length
            ? cesta.map((p, i) => `<button class="na-cesta" data-tirar="${i}" aria-label="Tirar ${p.nome} da cesta">${p.fig}</button>`).join('')
            : '<small>vazia: toque nas coisas da prateleira</small>';
        };
        atualizar();
        M.falar(`A lista de hoje tem: ${textoLista}. Toque nas coisas da prateleira para colocar na cesta!`);
        c.onclick = (e) => {
          const b = e.target.closest('button');
          if (!b) return;
          if (b.dataset.p !== undefined) {
            const p = PRODUTOS[+b.dataset.p];
            cesta.push(p);
            b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 250 });
            M.tocarNota(700, 0, 0.12, 0.1);
            M.falar(`${Art(p)} ${p.nome}! Custa ${moedas(p.preco)}.`);
            atualizar();
          } else if (b.dataset.tirar !== undefined) {
            const [p] = cesta.splice(+b.dataset.tirar, 1);
            M.falar(`Devolvi ${p.art} ${p.nome} para a prateleira.`);
            atualizar();
          } else if (b.dataset.acao === 'caixa') {
            const falta = lista.filter(({ p, qtd }) => cesta.filter(x => x === p).length < qtd);
            const sobra = [...new Set(cesta)].filter(p => {
              const pedido = lista.find(l => l.p === p);
              return !pedido || cesta.filter(x => x === p).length > pedido.qtd;
            });
            if (falta.length) {
              const { p, qtd } = falta[0];
              const tem = cesta.filter(x => x === p).length;
              M.somErro();
              M.falar(`Ainda falta ${N(qtd - tem)} ${qtd - tem > 1 ? p.nome + 's' : p.nome}. Olhe a lista!`);
              return;
            }
            if (sobra.length) {
              M.somErro();
              M.falar(`Opa! Tem ${sobra[0].nome} a mais na cesta. Toque nele na cesta para devolver.`);
              return;
            }
            pagar(c, cesta, novaRodada);
          }
        };
      };
      novaRodada();
    });
  }

  function pagar(c, cesta, novaRodada) {
    const total = cesta.reduce((s, p) => s + p.preco, 0);
    let dei = 0;
    c.innerHTML = `
      <div class="caixa-tela">
        <p class="mercado-placa pequena">💰 Caixa</p>
        <div class="cupom">${cesta.map(p => `<div class="linha-cupom"><span>${p.fig} ${p.nome}</span><span>${htmlMoedas(p.preco)}</span></div>`).join('')}
          <div class="linha-cupom total"><span>Total</span><span><strong>${moedas(total)}</strong></span></div></div>
        <p class="instrucao">Toque nas moedas da carteira para pagar <strong>${moedas(total)}</strong>.</p>
        <div class="balcao"><span class="titulo-lista">Você deu: <strong id="dei">0</strong></span><div id="no-balcao" class="moedas-area"></div></div>
        <div class="carteira"><span class="titulo-lista">👛 Carteira</span><div class="moedas-area" id="na-carteira">${Array.from({ length: 12 }, (_, i) => `<button class="moeda grande" data-moeda="${i}" aria-label="Moeda">1</button>`).join('')}</div></div>
        <button class="botao-pronto" data-acao="pagar">💰 Pagar</button>
      </div>`;
    const somaFalada = cesta.map(p => N(p.preco)).join(' mais ');
    M.falar(cesta.length > 1 ? `Vamos somar: ${somaFalada}. Dá ${moedas(total)}. Toque nas moedas para pagar!` : `Custa ${moedas(total)}. Toque nas moedas para pagar!`);
    const balcao = c.querySelector('#no-balcao'), carteira = c.querySelector('#na-carteira');
    c.onclick = (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.moeda !== undefined) {
        const veioDaCarteira = b.parentElement === carteira;
        (veioDaCarteira ? balcao : carteira).appendChild(b);
        dei += veioDaCarteira ? 1 : -1;
        c.querySelector('#dei').textContent = dei;
        M.tocarNota(veioDaCarteira ? 900 : 600, 0, 0.08, 0.1);
        M.falar(N(dei));
      } else if (b.dataset.acao === 'pagar') {
        if (dei < total) { M.somErro(); M.falar(`Ainda falta ${moedas(total - dei)}.`); return; }
        if (dei > total) { M.somErro(); M.falar(`Você deu ${moedas(dei - total)} a mais. Toque nas moedas do balcão para pegar de volta.`); return; }
        M.jogos.ganharTrofeu('mercadinho');
        M.jogos.telaVitoria(c, {
          texto: 'Compra feita!',
          sub: `Você pagou ${moedas(total)} certinho. Obrigado e volte sempre! 🛒`,
          fala: `Muito bem! Você pagou ${moedas(total)} certinho. Obrigado e volte sempre!`,
          deNovo: novaRodada,
          outros: M.jogos.nav.voltar,
        });
      }
    };
  }

  // ---------- ser o caixa ----------
  function serCaixa(nav) {
    nav.ir('Ser o caixa', (c) => {
      let atendidos = 0;
      const META = 5;
      const proximo = () => {
        const [emoji, nome] = M.sortear(CLIENTES);
        const qtd = atendidos < 2 ? M.sortear([1, 2]) : M.sortear([2, 3]);
        const compra = M.embaralhar(PRODUTOS).slice(0, qtd);
        const total = compra.reduce((s, p) => s + p.preco, 0);
        const comTroco = atendidos >= 3;
        const pagou = comTroco ? (total < 5 ? 5 : 10) : total;
        const opcoes = (certo) => {
          const vals = new Set([certo]);
          while (vals.size < 3) { const v = certo + M.sortear([-2, -1, 1, 2]); if (v >= 0) vals.add(v); }
          return [...vals];
        };
        const pergunta = (texto, fala, certo, aoAcertar) => {
          const ops = M.embaralhar(opcoes(certo));
          c.querySelector('.pergunta-caixa').innerHTML = `<p class="instrucao">${texto}</p>
            <div class="opcoes">${ops.map(v => `<button class="opcao numero-opcao" data-v="${v}"><span class="numero">${v}</span><span class="moedinhas">${htmlMoedas(Math.min(v, 10))}</span></button>`).join('')}</div>`;
          M.falar(fala);
          c.onclick = (e) => {
            const b = e.target.closest('[data-v]');
            if (!b) return;
            if (+b.dataset.v === certo) { b.classList.add('certo'); M.somAcerto(); M.festa(b, 8); aoAcertar(); }
            else { b.classList.add('errado'); M.somErro(); M.falar(`Não é ${N(+b.dataset.v)}. Conte as moedas de novo!`); }
          };
        };
        c.innerHTML = `
          <div class="caixa-tela">
            <div class="estrelas">${Array.from({ length: META }, (_, i) => `<span class="${i < atendidos ? 'ganhou' : ''}">★</span>`).join('')}</div>
            <div class="cliente"><span class="cliente-fig">${emoji}</span><div class="balao-cliente">${nome} quer comprar:</div></div>
            <div class="cupom">${compra.map(p => `<div class="linha-cupom"><span>${p.fig} ${p.nome}</span><span>${htmlMoedas(p.preco)}</span></div>`).join('')}</div>
            <div class="pergunta-caixa"></div>
          </div>`;
        const descricao = compra.map(p => `${um(p)} ${p.nome} de ${moedas(p.preco)}`).join(', e ');
        const terminar = () => {
          atendidos++;
          setTimeout(() => {
            if (atendidos >= META) {
              M.jogos.ganharTrofeu('mercadinho');
              M.jogos.telaVitoria(c, { sub: `Você atendeu ${META} clientes!`, fala: 'Parabéns! Você é um ótimo caixa!', deNovo: () => { atendidos = 0; proximo(); }, outros: M.jogos.nav.voltar });
            } else proximo();
          }, 1800);
        };
        pergunta('Quanto deu a compra?', `${nome} comprou ${descricao}. Quanto deu a compra?`, total, () => {
          if (!comTroco) { M.falar(`Isso! Deu ${moedas(total)}. Obrigado, volte sempre!`); terminar(); return; }
          M.falar(`Isso! Deu ${moedas(total)}.`);
          setTimeout(() => pergunta(
            `${nome} pagou com ${pagou} moedas. Quanto de troco?`,
            `${nome} pagou com ${moedas(pagou)}. Quanto você devolve de troco? Pense: ${N(pagou)} menos ${N(total)}.`,
            pagou - total,
            () => { M.falar(`Muito bem! O troco é ${moedas(pagou - total)}.`); terminar(); },
          ), 1600);
        });
      };
      proximo();
    });
  }

  // ---------- arrumar as prateleiras ----------
  function arrumar() {
    let produto = null;
    M.jogos.telaJogar({
      chave: 'mercadinho', nome: 'Arrumar as prateleiras', simbolo: '📦', cor: '#ff7a1a',
      itens: SECOES,
      desenho: (s) => `<span class="emoji-grande">${s.simbolo}</span>`,
      rotulo: (s) => s.nome,
      fala: (s) => s.nome,
      perguntas: [() => {
        produto = M.sortear(PRODUTOS);
        return {
          certo: secao(produto.sec),
          texto: `Onde guardar ${produto.art} ${produto.nome}?`,
          mostrar: `<span class="produto-mostrar">${produto.fig}</span>`,
          comTexto: (s) => `<span class="simbolo-secao">${s.simbolo}</span><span class="palavra-opcao pequena">${s.nome}</span>`,
        };
      }],
      acerto: (s) => `Isso! ${Art(produto)} ${produto.nome} vai em ${s.nome}, porque ${s.porque}.`,
      erro: (s) => `Hum, ${s.nome}? Não. Pense: ${produto.art} ${produto.nome} é de comer, de beber ou de limpar?`,
    });
  }

  M.jogos.registrar({ id: 'mercadinho', nome: 'Mercadinho', simbolo: '🛒', cor: '#ff7a1a', secao: 'faz-de-conta', abrir: inicio });
})();
