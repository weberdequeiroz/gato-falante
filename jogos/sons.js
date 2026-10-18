// Biblioteca de sons (gravações reais) e o jogo "Que som é esse?"
(() => {
  const M = window.Miguel;

  const CATEGORIAS = [
    { id: 'bichos', nome: 'Bichos', simbolo: '🐾', fundo: 'linear-gradient(#bfe8a8, #8fd16b)' },
    { id: 'natureza', nome: 'Natureza', simbolo: '🌧️', fundo: 'linear-gradient(#b9e3ff, #7cc6f2)' },
    { id: 'cidade', nome: 'Casa e cidade', simbolo: '🏙️', fundo: 'linear-gradient(#ffe2b8, #ffbe76)' },
    { id: 'pessoas', nome: 'Pessoas', simbolo: '🙂', fundo: 'linear-gradient(#ffd6e7, #f9a8c9)' },
  ];

  // som: arquivo em sons/; cenario: figurinhas do lugar onde o som acontece
  const SONS = [
    { som: 'cachorro', cat: 'bichos', art: 'o', nome: 'cachorro', fig: '🐶', cenario: '🏡🦴', fato: 'O cachorro late para avisar, brincar ou chamar a gente. Au au!' },
    { som: 'gato', cat: 'bichos', art: 'o', nome: 'gato', fig: '🐱', cenario: '🧶🏠', fato: 'O gato mia para conversar com as pessoas. Igual ao Miguel! Miau!' },
    { som: 'vaca', cat: 'bichos', art: 'a', nome: 'vaca', fig: '🐮', cenario: '🌾🚜', fato: 'A vaca faz muuu e dá o leite que a gente bebe.' },
    { som: 'porco', cat: 'bichos', art: 'o', nome: 'porco', fig: '🐷', cenario: '🌾🪵', fato: 'O porquinho faz óinc óinc e adora brincar na lama para se refrescar.' },
    { som: 'galo', cat: 'bichos', art: 'o', nome: 'galo', fig: '🐓', cenario: '🌅🌾', fato: 'O galo canta cocoricó bem cedinho, quando o sol nasce.' },
    { som: 'galinha', cat: 'bichos', art: 'a', nome: 'galinha', fig: '🐔', cenario: '🥚🌾', fato: 'A galinha faz có có có e bota os ovos.' },
    { som: 'ovelha', cat: 'bichos', art: 'a', nome: 'ovelha', fig: '🐑', cenario: '⛰️🌿', fato: 'A ovelha faz mééé. A lã dela vira roupa quentinha.' },
    { som: 'sapo', cat: 'bichos', art: 'o', nome: 'sapo', fig: '🐸', cenario: '🪷💧', fato: 'O sapo coaxa perto da água, principalmente quando chove.' },
    { som: 'corvo', cat: 'bichos', art: 'o', nome: 'corvo', fig: '🐦‍⬛', cenario: '🌳☁️', fato: 'O corvo é um pássaro preto muito inteligente. Ele faz cróc cróc.' },
    { som: 'passarinhos', cat: 'bichos', art: 'os', nome: 'passarinhos', fig: '🐦', cenario: '🌳🌸', fato: 'Os passarinhos cantam nas árvores, principalmente de manhã.' },
    { som: 'grilos', cat: 'bichos', art: 'os', nome: 'grilos', fig: '🦗', cenario: '🌙🌿', fato: 'Os grilos cantam de noite esfregando as asinhas. Cri cri cri!' },
    { som: 'insetos', cat: 'bichos', art: 'os', nome: 'insetos voando', fig: '🐝', cenario: '🌻🌼', fato: 'Abelhas e moscas fazem zzzz porque batem as asas muito rápido.' },
    { som: 'chuva', cat: 'natureza', art: 'a', nome: 'chuva', fig: '🌧️', cenario: '☔💧', fato: 'A chuva molha as plantas e enche os rios. Plic, ploc!' },
    { som: 'trovao', cat: 'natureza', art: 'o', nome: 'trovão', fig: '⛈️', cenario: '⚡☁️', fato: 'O trovão faz um barulhão no céu durante a tempestade. Não precisa ter medo: dentro de casa estamos protegidos.' },
    { som: 'mar', cat: 'natureza', art: 'o', nome: 'mar', fig: '🌊', cenario: '🏖️🐚', fato: 'As ondas do mar vão e voltam na areia da praia.' },
    { som: 'vento', cat: 'natureza', art: 'o', nome: 'vento', fig: '🌬️', cenario: '🍃🪁', fato: 'O vento é o ar se mexendo. Ele balança as árvores e leva a pipa lá no alto.' },
    { som: 'fogueira', cat: 'natureza', art: 'a', nome: 'fogueira', fig: '🔥', cenario: '🏕️🪵', fato: 'A lenha da fogueira estala quando queima. Fogo só perto de um adulto!' },
    { som: 'gotas', cat: 'natureza', art: 'as', nome: 'gotas de água', fig: '💧', cenario: '🚰💦', fato: 'Pinga, pinga... Torneira pingando gasta água. Feche bem a torneira!' },
    { som: 'trem', cat: 'cidade', art: 'o', nome: 'trem', fig: '🚂', cenario: '🛤️🌄', fato: 'O trem anda nos trilhos e leva muitas pessoas de uma vez. Piuí!' },
    { som: 'buzina', cat: 'cidade', art: 'a', nome: 'buzina do carro', fig: '🚗', cenario: '🛣️🚦', fato: 'O carro buzina para avisar. Na rua, sempre de mão dada com um adulto!' },
    { som: 'sirene', cat: 'cidade', art: 'a', nome: 'sirene', fig: '🚑', cenario: '🏥🚦', fato: 'A sirene da ambulância avisa que ela está indo ajudar alguém. Os carros abrem caminho.' },
    { som: 'helicoptero', cat: 'cidade', art: 'o', nome: 'helicóptero', fig: '🚁', cenario: '☁️🏙️', fato: 'O helicóptero tem uma hélice grande em cima que gira bem rápido.' },
    { som: 'aviao', cat: 'cidade', art: 'o', nome: 'avião', fig: '✈️', cenario: '☁️🌤️', fato: 'O avião voa bem alto, acima das nuvens, e leva as pessoas para longe.' },
    { som: 'sinos', cat: 'cidade', art: 'os', nome: 'sinos da igreja', fig: '🔔', cenario: '⛪🕊️', fato: 'Os sinos da igreja tocam para chamar as pessoas e para festejar.' },
    { som: 'fogos', cat: 'cidade', art: 'os', nome: 'fogos de artifício', fig: '🎆', cenario: '🌃✨', fato: 'Os fogos colorem o céu nas festas. Os bichinhos se assustam com o barulho!' },
    { som: 'despertador', cat: 'cidade', art: 'o', nome: 'despertador', fig: '⏰', cenario: '🛏️🌅', fato: 'O despertador toca para acordar a gente na hora certa.' },
    { som: 'porta', cat: 'cidade', art: 'a', nome: 'batida na porta', fig: '🚪', cenario: '🏠✊', fato: 'Toc toc! Quem será? Só abra a porta com um adulto.' },
    { som: 'aspirador', cat: 'cidade', art: 'o', nome: 'aspirador de pó', fig: '🧹', cenario: '🛋️🏠', fato: 'O aspirador puxa a sujeira e deixa a casa limpinha.' },
    { som: 'maquina', cat: 'cidade', art: 'a', nome: 'máquina de lavar', fig: '🧺', cenario: '👕🫧', fato: 'A máquina de lavar gira as roupas com água e sabão.' },
    { som: 'descarga', cat: 'cidade', art: 'a', nome: 'descarga', fig: '🚽', cenario: '🧻🚿', fato: 'Usou o banheiro? Dê descarga e lave as mãos!' },
    { som: 'escovar', cat: 'cidade', art: 'a', nome: 'escova de dentes', fig: '🪥', cenario: '🦷✨', fato: 'Escove os dentes depois de comer e antes de dormir. Bem escovadinho!' },
    { som: 'risada', cat: 'pessoas', art: 'a', nome: 'risada', fig: '😂', cenario: '🎉😄', fato: 'Rir faz bem para o coração e deixa todo mundo feliz!' },
    { som: 'palmas', cat: 'pessoas', art: 'as', nome: 'palmas', fig: '👏', cenario: '🎭⭐', fato: 'A gente bate palmas para comemorar e dizer "muito bem!"' },
    { som: 'espirro', cat: 'pessoas', art: 'o', nome: 'espirro', fig: '🤧', cenario: '🤒🧻', fato: 'Atchim! Espirrou? Cubra com o braço e diga: saúde!' },
    { som: 'ronco', cat: 'pessoas', art: 'o', nome: 'ronco', fig: '😴', cenario: '🛏️🌙', fato: 'Algumas pessoas roncam quando estão dormindo bem pesado. Zzzz!' },
    { som: 'bebe', cat: 'pessoas', art: 'o', nome: 'bebê chorando', fig: '👶', cenario: '🍼🧸', fato: 'O bebê chora para avisar que está com fome, sono ou precisa de carinho.' },
    { som: 'beber', cat: 'pessoas', art: 'o', nome: 'gole de água', fig: '🥤', cenario: '💧😋', fato: 'Glub glub! Beber água ajuda o corpo a funcionar bem.' },
  ];
  const Art = (s) => s.art[0].toUpperCase() + s.art.slice(1);
  const categoria = (id) => CATEGORIAS.find(c => c.id === id);

  let tocando = null;
  function tocarSom(s) {
    if (tocando) { tocando.pause(); tocando.currentTime = 0; }
    tocando = new Audio('sons/' + s.som + '.mp3');
    tocando.volume = M.calmo ? 0.6 : 1;
    tocando.play().catch(() => {});
    return tocando;
  }
  function pararSom() { if (tocando) tocando.pause(); }

  function figura(s, grande) {
    return `<span class="som-cartao ${grande ? 'grande' : ''}" style="background:${categoria(s.cat).fundo}">
      <span class="som-cenario" aria-hidden="true">${s.cenario}</span><span class="som-fig">${s.fig}</span></span>`;
  }

  // ---------- biblioteca ----------
  function biblioteca(nav) {
    nav.ir('Biblioteca de sons', (c) => {
      let cat = 'bichos', atual = null;
      const desenhar = () => {
        const lista = SONS.filter(s => s.cat === cat);
        c.innerHTML = `
          <div class="biblioteca">
            <div class="abas" role="tablist">${CATEGORIAS.map(k =>
              `<button role="tab" data-cat="${k.id}" aria-selected="${k.id === cat}">${k.simbolo} ${k.nome}</button>`).join('')}</div>
            <div class="som-destaque" ${atual ? '' : 'hidden'}></div>
            <p class="instrucao">Toque numa figura para ouvir o som de verdade! 🔊</p>
            <div class="grade-sons">${lista.map(s =>
              `<button class="botao-som" data-som="${s.som}" aria-label="${s.nome}">${figura(s, false)}<span class="nome">${s.nome}</span></button>`).join('')}</div>
            <button class="creditos-sons" data-creditos>ℹ️ De onde vêm esses sons?</button>
          </div>`;
        if (atual) mostrar(atual, false);
      };
      const mostrar = (s, tocar = true) => {
        atual = s;
        const d = c.querySelector('.som-destaque');
        d.hidden = false;
        d.innerHTML = `${figura(s, true)}
          <div class="som-info"><strong>${Art(s)} ${s.nome}</strong><p>${s.fato}</p>
          <div class="botoes-ouvir"><button data-ouvir>🔊 Ouvir de novo</button><button data-explicar>💬 O Miguel explica</button></div></div>`;
        d.animate([{ transform: 'scale(.95)' }, { transform: 'scale(1)' }], { duration: 220, easing: 'ease-out' });
        if (!tocar) return;
        const a = tocarSom(s);
        const falarNome = () => M.falar(`${Art(s)} ${s.nome}!`);
        a.onended = falarNome;
        d.querySelector('.som-cartao').animate([{ transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0)' }], { duration: 400, iterations: 2 });
      };
      desenhar();
      M.falar('Biblioteca de sons! Toque numa figura para ouvir o som de verdade.');
      c.onclick = (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.cat) { cat = b.dataset.cat; atual = null; pararSom(); desenhar(); M.falar(categoria(cat).nome + '!'); }
        else if (b.dataset.som) { mostrar(SONS.find(s => s.som === b.dataset.som)); c.querySelector('.som-destaque').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
        else if (b.hasAttribute('data-ouvir') && atual) tocarSom(atual);
        else if (b.hasAttribute('data-explicar') && atual) { pararSom(); M.falar(atual.fato, { forcar: true }); }
        else if (b.hasAttribute('data-creditos')) creditos(nav);
      };
      return pararSom;
    });
  }

  function creditos(nav) {
    nav.ir('De onde vêm os sons', (c) => {
      c.innerHTML = `<div class="creditos"><p>Todos os sons são <strong>gravações reais</strong> feitas por pessoas do mundo todo e doadas ao domínio público (licença CC0), no site Freesound. Eles foram reunidos no banco de sons ESC-50. Obrigado a todos!</p><ul id="lista-creditos"><li>Carregando...</li></ul></div>`;
      fetch('sons/creditos.json').then(r => r.json()).then(lista => {
        c.querySelector('#lista-creditos').innerHTML = lista.map(x => {
          const s = SONS.find(y => y.som === x.som);
          return `<li>${s ? s.fig + ' ' + s.nome : x.som}: “${x.original}”, por ${x.autor} (CC0)</li>`;
        }).join('');
      }).catch(() => { c.querySelector('#lista-creditos').innerHTML = '<li>Não consegui carregar a lista agora.</li>'; });
    });
  }

  // ---------- jogo: que som é esse? ----------
  function quiz(nav) {
    nav.ir('Que som é esse?', (c) => {
      c.innerHTML = `
        <div class="lista-modos" style="--cor:#34b25a">
          <p class="instrucao">O Miguel toca um som de verdade. Você descobre quem fez!</p>
          <button class="modo" data-modo="bichos"><span class="simbolo">🐾</span><span><strong>Sons dos bichos</strong><small>cachorro, vaca, galo, sapo...</small></span></button>
          <button class="modo" data-modo="todos"><span class="simbolo">🔊</span><span><strong>Todos os sons</strong><small>bichos, chuva, trem, risada...</small></span></button>
        </div>`;
      M.falar('Que som é esse? Escolha um jogo!');
      c.onclick = (e) => {
        const b = e.target.closest('[data-modo]');
        if (!b) return;
        const itens = b.dataset.modo === 'bichos' ? SONS.filter(s => s.cat === 'bichos') : SONS;
        M.jogos.telaJogar({
          chave: 'sons', nome: 'Que som é esse?', simbolo: '🔊', cor: '#34b25a', itens,
          desenho: (s) => figura(s, false),
          rotulo: (s) => s.nome,
          fala: (s) => `${Art(s)} ${s.nome}!`,
          perguntas: [(lista) => {
            const s = M.sortear(lista);
            return { certo: s, texto: 'Escute... Que som é esse? 👂', fala: 'Escute com atenção. Que som é esse?', tocar: () => tocarSom(s), apenas: (i) => i.cat === s.cat || itens.length < 13 };
          }],
          acerto: (s) => `Isso! ${Art(s)} ${s.nome}! ${s.fato}`,
          erro: (s) => `${M.esse(s.art)} ${s.nome}. Escute de novo no alto-falante e tente outra vez!`,
        });
      };
      return pararSom;
    });
  }

  M.catalogo.push(() => [
    'Biblioteca de sons! Toque numa figura para ouvir o som de verdade.', 'Que som é esse? Escolha um jogo!',
    'Escute com atenção. Que som é esse?',
    ...CATEGORIAS.map(k => k.nome + '!'),
    ...SONS.flatMap(s => [`${Art(s)} ${s.nome}!`, s.fato, `Isso! ${Art(s)} ${s.nome}! ${s.fato}`, `${M.esse(s.art)} ${s.nome}. Escute de novo no alto-falante e tente outra vez!`]),
  ]);
  M.jogos.registrar({ id: 'biblioteca-sons', nome: 'Biblioteca de sons', simbolo: '📚', cor: '#34b25a', secao: 'sons', abrir: biblioteca });
  M.jogos.registrar({ id: 'que-som', nome: 'Que som é esse?', simbolo: '👂', cor: '#2bb3a3', secao: 'sons', abrir: quiz });
  M.sons = { SONS, tocarSom, figura, parar: pararSom };
})();
