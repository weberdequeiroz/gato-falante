// Aprender: cores, números, letras, animais e alimentos
(() => {
  const M = window.Miguel;
  const { sortear } = M;
  const NOMES_LETRAS = { A: 'á', B: 'bê', C: 'cê', D: 'dê', E: 'é', F: 'éfe', G: 'gê', H: 'agá', I: 'i', J: 'jota', K: 'cá', L: 'éle', M: 'ême', N: 'ene', O: 'ó', P: 'pê', Q: 'quê', R: 'érre', S: 'ésse', T: 'tê', U: 'u', V: 'vê', W: 'dáblio', X: 'xis', Y: 'ípsilon', Z: 'zê' };
  const NUMEROS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
  const Art = (it) => (it.art === 'o' ? 'O' : 'A');

  const TEMAS = [
    {
      chave: 'cores', nome: 'Cores', simbolo: '🎨', cor: '#ff4f8b',
      itens: [
        { nome: 'vermelho', cor: '#e53935', ex: '🍓', frase: 'Vermelho, como o morango!' },
        { nome: 'azul', cor: '#1e88e5', ex: '🐳', frase: 'Azul, como o céu e o mar!' },
        { nome: 'amarelo', cor: '#fdd835', ex: '🌻', frase: 'Amarelo, como o sol e o girassol!' },
        { nome: 'verde', cor: '#43a047', ex: '🐸', frase: 'Verde, como o sapo e as folhas!' },
        { nome: 'laranja', cor: '#fb8c00', ex: '🍊', frase: 'Laranja, como a fruta laranja!' },
        { nome: 'roxo', cor: '#8e24aa', ex: '🍇', frase: 'Roxo, como a uva!' },
        { nome: 'rosa', cor: '#f06292', ex: '🌸', frase: 'Rosa, como a flor!' },
        { nome: 'marrom', cor: '#795548', ex: '🐻', frase: 'Marrom, como o ursinho e o chocolate!' },
        { nome: 'preto', cor: '#212121', ex: '🐈‍⬛', frase: 'Preto, como a noite!' },
        { nome: 'branco', cor: '#ffffff', ex: '☁️', frase: 'Branco, como a nuvem e o leite!' },
      ],
      desenho: (it, grande) => `<span class="bola-cor" style="background:${it.cor}"></span>${grande ? `<span class="exemplo">${it.ex}</span>` : ''}`,
      rotulo: (it) => it.nome,
      fala: (it) => it.frase,
      perguntas: [(itens) => { const c = sortear(itens); return { certo: c, texto: `Toque no ${c.nome}!` }; }],
      acerto: (it) => `Isso! É o ${it.nome}!`,
      erro: (it) => `Esse é o ${it.nome}. Tente de novo!`,
    },
    {
      chave: 'numeros', nome: 'Números', simbolo: '🔢', cor: '#2f9be8',
      itens: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({ n, nome: NUMEROS[n], ex: ['🍎', '⭐', '🐥', '🎈', '🐟', '🌸', '🍌', '🚗', '🦋', '🧸'][n - 1] })),
      desenho: (it, grande) => `<span class="numero">${it.n}</span>${grande ? `<span class="contas">${it.ex.repeat(it.n)}</span>` : ''}`,
      rotulo: (it) => it.nome,
      fala: (it) => `${it.nome[0].toUpperCase() + it.nome.slice(1)}! Vamos contar: ${NUMEROS.slice(1, it.n + 1).join(', ')}!`,
      perguntas: [
        (itens) => { const c = sortear(itens); return { certo: c, texto: `Toque no número ${c.nome}!` }; },
        (itens) => {
          const c = sortear(itens.filter(i => i.n <= 6));
          return { certo: c, texto: 'Quantos tem aqui? Conte comigo!', mostrar: sortear(['🐥', '🍎', '⭐', '🐟', '🎈']).repeat(c.n) };
        },
      ],
      acerto: (it) => `Muito bem! É o ${it.nome}!`,
      erro: (it) => `Esse é o ${it.nome}. Tente de novo!`,
    },
    {
      chave: 'letras', nome: 'Letras', simbolo: '🔤', cor: '#8b5cf6',
      itens: [
        ['A', 'Abelha', '🐝'], ['B', 'Bola', '⚽'], ['C', 'Casa', '🏠'], ['D', 'Dado', '🎲'], ['E', 'Elefante', '🐘'],
        ['F', 'Foca', '🦭'], ['G', 'Gato', '🐱'], ['H', 'Hipopótamo', '🦛'], ['I', 'Ilha', '🏝️'], ['J', 'Jacaré', '🐊'],
        ['K', 'Kiwi', '🥝'], ['L', 'Leão', '🦁'], ['M', 'Macaco', '🐒'], ['N', 'Navio', '🚢'], ['O', 'Ovo', '🥚'],
        ['P', 'Pato', '🦆'], ['Q', 'Queijo', '🧀'], ['R', 'Rato', '🐭'], ['S', 'Sapo', '🐸'], ['T', 'Tartaruga', '🐢'],
        ['U', 'Uva', '🍇'], ['V', 'Vaca', '🐄'], ['W', 'Waffle', '🧇'], ['X', 'Xícara', '☕'], ['Y', 'Yoga', '🧘'], ['Z', 'Zebra', '🦓'],
      ].map(([letra, palavra, ex]) => ({ letra, palavra, ex, nome: NOMES_LETRAS[letra] })),
      desenho: (it, grande) => `<span class="letra">${it.letra}<small>${it.letra.toLowerCase()}</small></span>${grande ? `<span class="exemplo">${it.ex}</span>` : ''}`,
      rotulo: (it) => it.letra,
      legenda: (it) => `${it.letra} de ${it.palavra}!`,
      fala: (it) => `${it.nome}! ${it.nome} de ${it.palavra}!`,
      perguntas: [
        (itens) => { const c = sortear(itens); return { certo: c, texto: `Toque na letra ${c.letra}!`, fala: `Toque na letra ${c.nome}!` }; },
        (itens) => { const c = sortear(itens); return { certo: c, texto: `${c.palavra} começa com qual letra?`, mostrar: c.ex }; },
      ],
      acerto: (it) => `Isso! ${it.nome} de ${it.palavra}!`,
      erro: (it) => `Essa é a letra ${it.nome}. Tente de novo!`,
    },
    {
      chave: 'animais', nome: 'Animais', simbolo: '🐾', cor: '#34b25a',
      itens: [
        ['o', 'cachorro', '🐶', 'au au'], ['o', 'gato', '🐱', 'miau'], ['a', 'vaca', '🐮', 'muuu'], ['o', 'pato', '🦆', 'quá quá'],
        ['o', 'porco', '🐷', 'óinc óinc'], ['a', 'galinha', '🐔', 'có có có'], ['o', 'cavalo', '🐴', 'iiirrí'], ['a', 'ovelha', '🐑', 'mééé'],
        ['o', 'leão', '🦁', 'roarr'], ['o', 'sapo', '🐸', 'croac'], ['o', 'elefante', '🐘', 'fuuu'], ['o', 'macaco', '🐵', 'uh uh ah ah'],
        ['a', 'coruja', '🦉', 'uhu uhu'], ['a', 'abelha', '🐝', 'zzzz'], ['o', 'passarinho', '🐦', 'piu piu'], ['o', 'coelho', '🐰', ''],
        ['a', 'girafa', '🦒', ''], ['a', 'tartaruga', '🐢', ''], ['o', 'peixe', '🐟', ''], ['a', 'borboleta', '🦋', ''],
      ].map(([art, nome, ex, som]) => ({ art, nome, ex, som })),
      desenho: (it) => `<span class="emoji-grande">${it.ex}</span>`,
      rotulo: (it) => it.nome,
      fala: (it) => `${Art(it)} ${it.nome}!` + (it.som ? ` Faz ${it.som}!` : ''),
      perguntas: [
        (itens) => { const c = sortear(itens); return { certo: c, texto: `Onde está ${c.art} ${c.nome}?` }; },
        (itens) => { const c = sortear(itens.filter(i => i.som)); return { certo: c, texto: `Quem faz ${c.som}?`, apenas: (i) => i.som !== c.som }; },
      ],
      acerto: (it) => `Isso! ${Art(it)} ${it.nome}!` + (it.som ? ` ${it.som}!` : ''),
      erro: (it) => `${M.esse(it.art)} ${it.nome}. Tente de novo!`,
    },
    {
      chave: 'alimentos', nome: 'Alimentos', simbolo: '🍎', cor: '#ff7a1a',
      itens: [
        ['a', 'maçã', '🍎', 'fruta'], ['a', 'banana', '🍌', 'fruta'], ['a', 'uva', '🍇', 'fruta'], ['a', 'melancia', '🍉', 'fruta'],
        ['o', 'morango', '🍓', 'fruta'], ['a', 'laranja', '🍊', 'fruta'], ['o', 'abacaxi', '🍍', 'fruta'], ['a', 'pera', '🍐', 'fruta'],
        ['o', 'abacate', '🥑', 'fruta'], ['a', 'cereja', '🍒', 'fruta'], ['a', 'cenoura', '🥕', 'legume'], ['o', 'brócolis', '🥦', 'verdura'],
        ['o', 'milho', '🌽', 'legume'], ['o', 'tomate', '🍅', 'fruto'], ['a', 'batata', '🥔', 'legume'], ['o', 'pepino', '🥒', 'fruto'],
        ['o', 'pão', '🍞', 'outro'], ['o', 'queijo', '🧀', 'outro'], ['o', 'ovo', '🥚', 'outro'], ['o', 'leite', '🥛', 'outro'], ['o', 'arroz', '🍚', 'outro'],
      ].map(([art, nome, ex, tipo]) => ({ art, nome, ex, tipo })),
      desenho: (it) => `<span class="emoji-grande">${it.ex}</span>`,
      rotulo: (it) => it.nome,
      fala: (it) => `${Art(it)} ${it.nome}!` + ({ fruta: ' É uma fruta gostosa e saudável!', legume: ' É um legume que deixa a gente forte!', verdura: ' É uma verdura que faz muito bem!', fruto: ' Ele é um fruto, porque nasce da flor e tem sementes, mas na cozinha a gente usa como legume na salada!', outro: '' })[it.tipo],
      perguntas: [
        (itens) => { const c = sortear(itens); return { certo: c, texto: `Onde está ${c.art} ${c.nome}?` }; },
        (itens) => { const c = sortear(itens.filter(i => i.tipo === 'fruta')); return { certo: c, texto: 'Qual destes é uma fruta?', apenas: (i) => i.tipo !== 'fruta' && i.tipo !== 'fruto' }; },
      ],
      acerto: (it) => `Isso! ${Art(it)} ${it.nome}!`,
      erro: (it) => `${M.esse(it.art)} ${it.nome}. Tente de novo!`,
    },
  ];

  M.catalogo.push(() => TEMAS.flatMap(t => [t.nome + '!', ...M.jogos.falasDoTema(t)]));
  for (const t of TEMAS) {
    M.jogos.registrar({ id: t.chave, nome: t.nome, simbolo: t.simbolo, cor: t.cor, secao: 'aprender', abrir: () => M.jogos.abrirTema(t) });
  }
})();
