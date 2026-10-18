// Inglês e espanhol: cada tema tem "Conhecer" (ouve a palavra, a tradução e repete) e "Jogar"
(() => {
  const M = window.Miguel;
  const { sortear } = M;

  const IDIOMAS = {
    ingles: { nome: 'Inglês', idioma: 'inglês', lang: 'en-US', bandeira: '🇺🇸', cor: '#2f6fe8', col: 2 },
    espanhol: { nome: 'Espanhol', idioma: 'espanhol', lang: 'es-ES', bandeira: '🇪🇸', cor: '#e8432f', col: 3 },
  };

  // [figura, português, inglês, espanhol]
  const TOPICOS = [
    { id: 'ola', nome: 'Cumprimentos', simbolo: '👋', itens: [
      ['🙋', 'Olá', 'Hello', 'Hola'], ['👋', 'Tchau', 'Goodbye', 'Adiós'], ['🌅', 'Bom dia', 'Good morning', 'Buenos días'],
      ['🌙', 'Boa noite', 'Good night', 'Buenas noches'], ['🙏', 'Por favor', 'Please', 'Por favor'], ['💐', 'Obrigado', 'Thank you', 'Gracias'],
      ['😔', 'Desculpa', 'Sorry', 'Perdón'], ['👍', 'Sim', 'Yes', 'Sí'], ['👎', 'Não', 'No', 'No'], ['😀', 'Estou bem', 'I am fine', 'Estoy bien'],
      ['🤝', 'Prazer em conhecer', 'Nice to meet you', 'Mucho gusto'], ['❤️', 'Eu te amo', 'I love you', 'Te quiero'],
    ] },
    { id: 'cores', nome: 'Cores', simbolo: '🎨', itens: [
      ['#e53935', 'vermelho', 'red', 'rojo'], ['#1e88e5', 'azul', 'blue', 'azul'], ['#fdd835', 'amarelo', 'yellow', 'amarillo'],
      ['#43a047', 'verde', 'green', 'verde'], ['#fb8c00', 'laranja', 'orange', 'naranja'], ['#8e24aa', 'roxo', 'purple', 'morado'],
      ['#f06292', 'rosa', 'pink', 'rosa'], ['#795548', 'marrom', 'brown', 'marrón'], ['#212121', 'preto', 'black', 'negro'], ['#ffffff', 'branco', 'white', 'blanco'],
    ] },
    { id: 'numeros', nome: 'Números', simbolo: '🔢', itens: [
      ['1', 'um', 'one', 'uno'], ['2', 'dois', 'two', 'dos'], ['3', 'três', 'three', 'tres'], ['4', 'quatro', 'four', 'cuatro'], ['5', 'cinco', 'five', 'cinco'],
      ['6', 'seis', 'six', 'seis'], ['7', 'sete', 'seven', 'siete'], ['8', 'oito', 'eight', 'ocho'], ['9', 'nove', 'nine', 'nueve'], ['10', 'dez', 'ten', 'diez'],
    ] },
    { id: 'animais', nome: 'Animais', simbolo: '🐶', itens: [
      ['🐶', 'cachorro', 'dog', 'perro'], ['🐱', 'gato', 'cat', 'gato'], ['🐮', 'vaca', 'cow', 'vaca'], ['🦆', 'pato', 'duck', 'pato'],
      ['🐷', 'porco', 'pig', 'cerdo'], ['🐔', 'galinha', 'chicken', 'gallina'], ['🐴', 'cavalo', 'horse', 'caballo'], ['🐑', 'ovelha', 'sheep', 'oveja'],
      ['🦁', 'leão', 'lion', 'león'], ['🐸', 'sapo', 'frog', 'rana'], ['🐘', 'elefante', 'elephant', 'elefante'], ['🐵', 'macaco', 'monkey', 'mono'],
      ['🐟', 'peixe', 'fish', 'pez'], ['🐦', 'passarinho', 'bird', 'pájaro'], ['🐰', 'coelho', 'rabbit', 'conejo'], ['🐻', 'urso', 'bear', 'oso'],
    ] },
    { id: 'comidas', nome: 'Frutas e comidas', simbolo: '🍎', itens: [
      ['🍎', 'maçã', 'apple', 'manzana'], ['🍌', 'banana', 'banana', 'plátano'], ['🍇', 'uva', 'grape', 'uva'], ['🍉', 'melancia', 'watermelon', 'sandía'],
      ['🍓', 'morango', 'strawberry', 'fresa'], ['🍊', 'laranja', 'orange', 'naranja'], ['🍍', 'abacaxi', 'pineapple', 'piña'], ['🥕', 'cenoura', 'carrot', 'zanahoria'],
      ['🍞', 'pão', 'bread', 'pan'], ['🥛', 'leite', 'milk', 'leche'], ['🥚', 'ovo', 'egg', 'huevo'], ['🧀', 'queijo', 'cheese', 'queso'],
      ['💧', 'água', 'water', 'agua'], ['🍦', 'sorvete', 'ice cream', 'helado'],
    ] },
    { id: 'familia', nome: 'Família', simbolo: '👪', itens: [
      ['👩', 'mamãe', 'mom', 'mamá'], ['👨', 'papai', 'dad', 'papá'], ['👦', 'irmão', 'brother', 'hermano'], ['👧', 'irmã', 'sister', 'hermana'],
      ['👵', 'vovó', 'grandma', 'abuela'], ['👴', 'vovô', 'grandpa', 'abuelo'], ['👶', 'bebê', 'baby', 'bebé'], ['👪', 'família', 'family', 'familia'],
    ] },
    { id: 'corpo', nome: 'Corpo', simbolo: '🖐️', itens: [
      ['👀', 'olhos', 'eyes', 'ojos'], ['👂', 'orelha', 'ear', 'oreja'], ['👃', 'nariz', 'nose', 'nariz'], ['👄', 'boca', 'mouth', 'boca'],
      ['✋', 'mão', 'hand', 'mano'], ['🦶', 'pé', 'foot', 'pie'], ['🦷', 'dente', 'tooth', 'diente'], ['💪', 'braço', 'arm', 'brazo'],
      ['🦵', 'perna', 'leg', 'pierna'], ['💇', 'cabelo', 'hair', 'pelo'],
    ] },
    { id: 'roupas', nome: 'Roupas', simbolo: '👕', itens: [
      ['👕', 'camiseta', 't-shirt', 'camiseta'], ['👖', 'calça', 'pants', 'pantalones'], ['👗', 'vestido', 'dress', 'vestido'], ['👟', 'tênis', 'sneakers', 'zapatillas'],
      ['🧦', 'meias', 'socks', 'calcetines'], ['🧢', 'boné', 'cap', 'gorra'], ['🧥', 'casaco', 'coat', 'abrigo'], ['🩳', 'bermuda', 'shorts', 'pantalón corto'],
    ] },
    { id: 'coisas', nome: 'Casa e natureza', simbolo: '🏠', itens: [
      ['⚽', 'bola', 'ball', 'pelota'], ['🚗', 'carro', 'car', 'coche'], ['🏠', 'casa', 'house', 'casa'], ['📖', 'livro', 'book', 'libro'],
      ['☀️', 'sol', 'sun', 'sol'], ['🌙', 'lua', 'moon', 'luna'], ['⭐', 'estrela', 'star', 'estrella'], ['🌳', 'árvore', 'tree', 'árbol'],
      ['🌸', 'flor', 'flower', 'flor'], ['🏫', 'escola', 'school', 'escuela'], ['🛏️', 'cama', 'bed', 'cama'], ['🧸', 'ursinho', 'teddy bear', 'osito'],
    ] },
  ];

  function temaDoTopico(idi, top) {
    const L = idi.lang;
    const itens = top.itens.map(linha => ({ fig: linha[0], pt: linha[1], w: linha[idi.col] }));
    const figura = (it) => it.fig.startsWith('#')
      ? `<span class="bola-cor" style="background:${it.fig}"></span>`
      : /^\d+$/.test(it.fig) ? `<span class="numero">${it.fig}</span>` : `<span class="emoji-grande">${it.fig}</span>`;
    return {
      chave: `${idi === IDIOMAS.ingles ? 'ingles' : 'espanhol'}/${top.id}`,
      nome: `${top.nome} em ${idi.idioma}`,
      simbolo: top.simbolo,
      cor: idi.cor,
      itens,
      devagar: true,
      repita: true,
      desenho: (it) => figura(it),
      rotulo: (it) => it.w,
      legenda: (it) => `<strong class="palavra">${idi.bandeira} ${it.w}</strong><span class="traducao">🇧🇷 ${it.pt}</span>`,
      fala: (it) => [{ t: it.w + '!', lang: L }, { t: 'quer dizer ' + it.pt + '.' }, { t: it.w + '!', lang: L }],
      perguntas: [
        (lista) => { const c = sortear(lista); return { certo: c, texto: `Onde está: ${c.w}?`, fala: [{ t: 'Onde está:' }, { t: c.w + '?', lang: L }] }; },
        (lista) => { const c = sortear(lista); return { certo: c, texto: `Toque em: ${c.w}`, fala: [{ t: 'Toque em:' }, { t: c.w, lang: L }] }; },
        (lista) => {
          const c = sortear(lista);
          return {
            certo: c,
            texto: `Como se diz "${c.pt}" em ${idi.idioma}?`,
            mostrar: figura(c),
            comTexto: (it) => `<span class="palavra-opcao">${it.w}</span>`,
          };
        },
      ],
      acerto: (it) => [{ t: 'Isso!' }, { t: it.w + '!', lang: L }, { t: 'quer dizer ' + it.pt + '!' }],
      erro: (it) => [{ t: 'Essa palavra é' }, { t: it.w, lang: L }, { t: 'que quer dizer ' + it.pt + '. Tente de novo!' }],
    };
  }

  function abrirIdioma(chave, nav) {
    const idi = IDIOMAS[chave];
    nav.ir(idi.nome, (c) => {
      c.innerHTML = `
        <div class="idioma" style="--cor:${idi.cor}">
          <p class="idioma-intro"><span aria-hidden="true">${idi.bandeira}</span> Escolha um tema. Primeiro <strong>conheça</strong> as palavras, depois <strong>jogue</strong>!</p>
          <div class="grade-jogos">${TOPICOS.map(t => {
            const n = M.jogos.trofeus(`${chave}/${t.id}`);
            return `<button class="cartao-jogo" data-topico="${t.id}" style="--cor:${idi.cor}">
              <span class="simbolo" aria-hidden="true">${t.simbolo}</span><span class="nome">${t.nome}</span>
              ${n ? `<span class="selo">🏆${n}</span>` : ''}</button>`;
          }).join('')}</div>
        </div>`;
      M.falar([{ t: `Vamos aprender ${idi.idioma}! Escolha um tema.` }]);
      c.onclick = (e) => {
        const b = e.target.closest('[data-topico]');
        if (!b) return;
        M.jogos.abrirTema(temaDoTopico(idi, TOPICOS.find(t => t.id === b.dataset.topico)));
      };
    });
  }

  M.catalogo.push(() => Object.values(IDIOMAS).flatMap(idi => [
    `Vamos aprender ${idi.idioma}! Escolha um tema.`,
    ...TOPICOS.flatMap(t => M.jogos.falasDoTema(temaDoTopico(idi, t))),
  ]));
  M.jogos.registrar({ id: 'ingles', nome: 'Inglês', simbolo: '🇺🇸', cor: IDIOMAS.ingles.cor, secao: 'idiomas', abrir: (nav) => abrirIdioma('ingles', nav) });
  M.jogos.registrar({ id: 'espanhol', nome: 'Espanhol', simbolo: '🇪🇸', cor: IDIOMAS.espanhol.cor, secao: 'idiomas', abrir: (nav) => abrirIdioma('espanhol', nav) });
})();
