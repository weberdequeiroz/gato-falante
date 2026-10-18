// Sombras: descubra de quem é a sombra
(() => {
  const M = window.Miguel;
  const COISAS = [
    ['o', 'cachorro', '🐕'], ['o', 'gato', '🐈'], ['o', 'coelho', '🐇'], ['o', 'elefante', '🐘'], ['a', 'girafa', '🦒'], ['o', 'cavalo', '🐎'],
    ['o', 'pato', '🦆'], ['a', 'tartaruga', '🐢'], ['o', 'caracol', '🐌'], ['a', 'borboleta', '🦋'], ['o', 'dinossauro', '🦖'], ['a', 'baleia', '🐋'],
    ['o', 'avião', '✈️'], ['a', 'bicicleta', '🚲'], ['o', 'carro', '🚗'], ['o', 'guarda-chuva', '☂️'], ['a', 'tesoura', '✂️'], ['a', 'chave', '🔑'],
    ['a', 'banana', '🍌'], ['a', 'maçã', '🍎'], ['a', 'pera', '🍐'], ['o', 'abacaxi', '🍍'], ['a', 'casa', '🏠'], ['a', 'árvore', '🌳'],
    ['a', 'estrela', '⭐'], ['a', 'lua', '🌙'], ['o', 'coração', '❤️'], ['a', 'guitarra', '🎸'], ['o', 'foguete', '🚀'], ['o', 'sorvete', '🍦'],
  ].map(([art, nome, fig]) => ({ art, nome, fig }));
  const Art = (i) => (i.art === 'o' ? 'O' : 'A');
  M.jogos.registrar({
    id: 'sombras', nome: 'Sombras', simbolo: '👤', cor: '#5c6bc0', secao: 'brincar',
    abrir: () => M.jogos.telaJogar({
      chave: 'sombras', nome: 'De quem é a sombra?', simbolo: '👤', cor: '#5c6bc0', itens: COISAS,
      desenho: (i) => `<span class="emoji-grande">${i.fig}</span>`,
      rotulo: (i) => i.nome,
      fala: (i) => `${Art(i)} ${i.nome}!`,
      perguntas: [(lista) => { const c = M.sortear(lista); return { certo: c, texto: 'De quem é essa sombra?', mostrar: `<span class="sombra">${c.fig}</span>` }; }],
      acerto: (i) => `Isso! É ${i.art} ${i.nome}!`,
      erro: (i) => `Esse é ${i.art} ${i.nome}. Olhe bem o formato da sombra!`,
    }),
  });
})();
