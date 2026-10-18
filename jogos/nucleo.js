// Jogos do Miguel: navegação entre telas, menu por seções e o motor de "Conhecer / Jogar"
(() => {
  const M = window.Miguel;
  const tela = document.getElementById('jogos');
  const corpo = document.getElementById('jogos-corpo');
  const titulo = document.getElementById('jogos-titulo');

  const SECOES = [
    { id: 'aventura', nome: 'Aventuras', simbolo: '🚀' },
    { id: 'aprender', nome: 'Aprender', simbolo: '📚' },
    { id: 'sons', nome: 'Sons e bichos', simbolo: '🔊' },
    { id: 'idiomas', nome: 'Inglês e espanhol', simbolo: '🌎' },
    { id: 'criar', nome: 'Criar', simbolo: '🎨' },
    { id: 'brincar', nome: 'Brincar', simbolo: '🧩' },
    { id: 'faz-de-conta', nome: 'Faz de conta', simbolo: '🛒' },
  ];
  const jogos = [];

  // ---------- navegação: uma pilha de telas, o botão Voltar desempilha ----------
  const pilha = [];
  let limparTela = null;
  function mostrarTopo() {
    if (limparTela) { limparTela(); limparTela = null; }
    const atual = pilha[pilha.length - 1];
    titulo.textContent = atual.titulo;
    corpo.innerHTML = '';
    corpo.onclick = null;
    corpo.className = atual.classe || '';
    corpo.scrollTop = 0;
    limparTela = atual.render(corpo) || null;
  }
  const nav = {
    ir(tituloTela, render, classe) {
      pilha.push({ titulo: tituloTela, render, classe });
      mostrarTopo();
    },
    trocar(tituloTela, render, classe) {
      pilha.pop();
      nav.ir(tituloTela, render, classe);
    },
    voltar() {
      M.calar();
      if (pilha.length <= 1) { fechar(); return; }
      pilha.pop();
      mostrarTopo();
    },
    inicio() {
      pilha.length = 1;
      mostrarTopo();
    },
  };

  function abrir() {
    tela.hidden = false;
    pilha.length = 0;
    nav.ir('Jogos do Miguel', menu);
    M.falar('Vamos jogar! Escolha um jogo!');
  }
  function fechar() {
    if (limparTela) { limparTela(); limparTela = null; }
    tela.hidden = true;
    M.calar();
  }
  document.getElementById('jogos-voltar').addEventListener('click', nav.voltar);

  function menu(c) {
    c.innerHTML = `<button class="modo surpresa-jogo" data-surpresa><span class="simbolo">🎲</span><span><strong>Jogo surpresa</strong><small>o Miguel escolhe um jogo para você</small></span></button>` + SECOES.map(sec => {
      const daSecao = jogos.filter(j => j.secao === sec.id);
      if (!daSecao.length) return '';
      return `<section class="secao-jogos">
        <h3><span aria-hidden="true">${sec.simbolo}</span> ${sec.nome}</h3>
        <div class="grade-jogos">${daSecao.map(j =>
          `<button class="cartao-jogo" data-jogo="${j.id}" style="--cor:${j.cor}">
            <span class="simbolo" aria-hidden="true">${j.simbolo}</span><span class="nome">${j.nome}</span>
            ${trofeus(j.id) ? `<span class="selo" aria-label="${trofeus(j.id)} troféus">🏆${trofeus(j.id)}</span>` : ''}
          </button>`).join('')}</div>
      </section>`;
    }).join('');
    c.onclick = (e) => {
      if (e.target.closest('[data-surpresa]')) {
        const j = M.sortear(jogos);
        M.falar('Surpresa! Vamos jogar: ' + j.nome + '!');
        j.abrir(nav);
        return;
      }
      const b = e.target.closest('[data-jogo]');
      if (!b) return;
      const j = jogos.find(x => x.id === b.dataset.jogo);
      M.falar(j.nome + '!');
      j.abrir(nav);
    };
  }

  // ---------- troféus guardados no aparelho ----------
  function trofeus(chave) { return parseInt(M.ler('miguel-trofeus-' + chave), 10) || 0; }
  function ganharTrofeu(chave) {
    M.guardar('miguel-trofeus-' + chave, String(trofeus(chave) + 1));
    const raiz = chave.split('/')[0];
    if (raiz !== chave) M.guardar('miguel-trofeus-' + raiz, String(trofeus(raiz) + 1));
  }

  // ---------- telas comuns ----------
  function telaVitoria(c, { texto = 'Parabéns!', sub = 'Você conseguiu!', fala, deNovo, outros }) {
    c.innerHTML = `
      <div class="vitoria">
        <div class="trofeu" aria-hidden="true">🏆</div>
        <img src="icones/miguel.png" alt="">
        <h2>${texto}</h2>
        <p>${sub}</p>
        <div class="vitoria-botoes">
          <button class="modo" data-acao="de-novo"><span class="simbolo">🔁</span><strong>Jogar de novo</strong></button>
          <button class="modo" data-acao="outros"><span class="simbolo">🎮</span><strong>Outros jogos</strong></button>
        </div>
      </div>`;
    M.tocarMusica();
    M.festa(c.querySelector('.trofeu'), 18);
    M.falar(fala || texto + ' ' + sub);
    c.onclick = (e) => {
      const b = e.target.closest('[data-acao]');
      if (!b) return;
      if (b.dataset.acao === 'de-novo') deNovo();
      else (outros || nav.inicio)();
    };
  }

  // ---------- motor de "Conhecer / Jogar" ----------
  // def: { chave, nome, simbolo, cor, itens, desenho(it, grande), rotulo(it), legenda(it), fala(it),
  //        perguntas: [itens => { certo, texto, fala, mostrar, apenas, comTexto }], acerto(it), erro(it) }
  // fala/acerto/erro podem devolver texto ou partes [{ t, lang }] para misturar idiomas
  const ACERTOS_PARA_GANHAR = 5;
  const textoDe = (partes) => (typeof partes === 'string' ? partes : partes.map(p => p.t).join(' '));

  function abrirTema(def) {
    nav.ir(def.nome, (c) => {
      c.innerHTML = `
        <div class="tema-escolha" style="--cor:${def.cor}">
          <div class="tema-heroi" aria-hidden="true">${def.simbolo}</div>
          ${trofeus(def.chave) ? `<p class="tema-trofeus">🏆 Você já ganhou ${trofeus(def.chave)} ${trofeus(def.chave) === 1 ? 'troféu' : 'troféus'} aqui!</p>` : ''}
          <button class="modo" data-modo="conhecer"><span class="simbolo">👀</span><span><strong>Conhecer</strong><small>toque e ouça</small></span></button>
          <button class="modo" data-modo="jogar"><span class="simbolo">🎯</span><span><strong>Jogar</strong><small>o Miguel pergunta, você responde</small></span></button>
        </div>`;
      c.onclick = (e) => {
        const b = e.target.closest('[data-modo]');
        if (!b) return;
        if (b.dataset.modo === 'conhecer') telaConhecer(def);
        else telaJogar(def);
      };
    });
  }

  function telaConhecer(def) {
    nav.ir(def.nome, (c) => {
      const mostrar = (it) => {
        const d = c.querySelector('.destaque-item');
        d.innerHTML = `
          <div class="desenho">${def.desenho(it, true)}</div>
          <p class="legenda">${def.legenda ? def.legenda(it) : textoDe(def.fala(it))}</p>
          <div class="botoes-ouvir">
            <button data-ouvir="normal" aria-label="Ouvir">🔊 Ouvir</button>
            ${def.devagar ? '<button data-ouvir="devagar" aria-label="Ouvir devagar">🐢 Devagar</button>' : ''}
          </div>
          ${def.repita ? '<p class="repita">🗣️ Agora repita em voz alta!</p>' : ''}`;
        d.animate([{ transform: 'scale(.94)' }, { transform: 'scale(1)' }], { duration: 220, easing: 'ease-out' });
      };
      c.innerHTML = `
        <div class="conhecer" style="--cor:${def.cor}">
          <div class="destaque-item"></div>
          <div class="grade-itens">${def.itens.map((it, i) =>
            `<button class="item" data-i="${i}" aria-label="${def.rotulo(it)}">${def.desenho(it, false)}<span class="rotulo">${def.rotulo(it)}</span></button>`).join('')}
          </div>
        </div>`;
      let atual = def.itens[0];
      mostrar(atual);
      M.falar('Toque em cada um para ouvir!');
      c.onclick = (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.ouvir) {
          M.falar(def.fala(atual), { forcar: true, devagar: b.dataset.ouvir === 'devagar' });
          return;
        }
        if (b.dataset.i === undefined) return;
        atual = def.itens[+b.dataset.i];
        for (const x of c.querySelectorAll('.item')) x.classList.toggle('ativo', x === b);
        mostrar(atual);
        M.falar(def.fala(atual), { forcar: true });
      };
    });
  }

  function telaJogar(def) {
    const rodada = { acertos: 0, recentes: [] };
    nav.ir(def.nome, (c) => {
      let pergunta, opcoes, travado, proximo;
      const nova = () => {
        // não repete a mesma resposta das últimas perguntas
        for (let t = 0; t < 12; t++) {
          pergunta = M.sortear(def.perguntas)(def.itens);
          if (!rodada.recentes.includes(pergunta.certo)) break;
        }
        rodada.recentes = [pergunta.certo, ...rodada.recentes].slice(0, 3);
        const outros = M.embaralhar(def.itens.filter(i => i !== pergunta.certo && (!pergunta.apenas || pergunta.apenas(i))));
        opcoes = M.embaralhar([pergunta.certo, ...outros.slice(0, 2)]);
        travado = false;
        const estrelas = Array.from({ length: ACERTOS_PARA_GANHAR }, (_, i) => `<span class="${i < rodada.acertos ? 'ganhou' : ''}">★</span>`).join('');
        c.innerHTML = `
          <div class="jogo" style="--cor:${def.cor}">
            <div class="estrelas" aria-label="${rodada.acertos} de ${ACERTOS_PARA_GANHAR} estrelas">${estrelas}</div>
            <div class="pergunta">
              <img src="icones/icone-192.png" alt="">
              <div class="pergunta-balao"><span>${pergunta.texto}</span><button class="ouvir-de-novo" aria-label="Ouvir a pergunta de novo">🔊</button></div>
            </div>
            ${pergunta.mostrar ? `<div class="mostrar">${pergunta.mostrar}</div>` : ''}
            <div class="opcoes">${opcoes.map((it, i) =>
              `<button class="opcao ${pergunta.comTexto ? 'com-texto' : ''}" data-i="${i}" aria-label="${def.rotulo(it)}">${pergunta.comTexto ? pergunta.comTexto(it) : def.desenho(it, false)}</button>`).join('')}
            </div>
          </div>`;
        M.falar(pergunta.fala || pergunta.texto, { pronto: () => { if (pergunta.tocar && c.isConnected) pergunta.tocar(); } });
        c.onclick = tratar;
      };
      const tratar = (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.classList.contains('ouvir-de-novo')) {
          if (pergunta.tocar) pergunta.tocar(); else M.falar(pergunta.fala || pergunta.texto, { forcar: true });
          return;
        }
        if (!b.classList.contains('opcao') || travado) return;
        const it = opcoes[+b.dataset.i];
        if (it === pergunta.certo) {
          travado = true;
          rodada.acertos++;
          b.classList.add('certo');
          M.somAcerto();
          M.festa(b, 10);
          M.falar(def.acerto(it));
          const estrela = c.querySelectorAll('.estrelas span')[rodada.acertos - 1];
          if (estrela) estrela.classList.add('ganhou');
          proximo = setTimeout(() => {
            if (rodada.acertos >= ACERTOS_PARA_GANHAR) {
              ganharTrofeu(def.chave);
              rodada.acertos = 0;
              telaVitoria(c, {
                sub: `Você ganhou ${ACERTOS_PARA_GANHAR} estrelas!`,
                fala: 'Parabéns! Você ganhou cinco estrelas! Você é demais!',
                deNovo: nova,
                outros: nav.voltar,
              });
            } else nova();
          }, M.calmo ? 2800 : 2200);
        } else {
          b.classList.add('errado');
          b.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }], { duration: 350 });
          M.somErro();
          M.falar(def.erro(it));
        }
      };
      nova();
      return () => clearTimeout(proximo);
    });
  }

  M.jogos = {
    abrir,
    nav,
    registrar: (j) => jogos.push(j),
    abrirTema,
    telaJogar,
    telaVitoria,
    trofeus,
    ganharTrofeu,
  };
})();
