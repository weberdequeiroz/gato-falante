// Guarda-roupa do Miguel: roupas desenhadas em camadas por cima do gato, com cores e estampas.
// A escolha fica guardada no aparelho e aparece toda vez que o jogo abre (e nos jogos de correr e no mundo 3D).
(() => {
  const M = window.Miguel = window.Miguel || {};

  const CORES = [
    ['#e53935', 'vermelho'], ['#fb8c00', 'laranja'], ['#fdd835', 'amarelo'], ['#43a047', 'verde'], ['#1e88e5', 'azul'], ['#4fc3f7', 'azul-claro'],
    ['#8e24aa', 'roxo'], ['#f06292', 'rosa'], ['#2b2b2b', 'preto'], ['#f5f5f5', 'branco'], ['#8d6e63', 'marrom'], ['#3f5f8f', 'jeans'],
  ];
  const nomeCor = (c) => (CORES.find(x => x[0] === c) || [, ''])[1];

  // escurece uma cor para contornos e detalhes
  function tom(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const ajusta = (v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
    return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(ajusta).map(v => v.toString(16).padStart(2, '0')).join('');
  }
  const contorno = (c) => tom(c, -0.35);
  const espelhar = (d) => d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${400 - parseFloat(x)} ${y}`);

  // ---------- peças (cada uma devolve o desenho de cada camada) ----------
  const PECAS = {
    cabeca: [
      { id: 'bone', nome: 'Boné', icone: '🧢', camadas: (c) => ({ cabeca: `
        <path d="M120 128 C 118 62, 282 62, 280 128 C 230 118, 170 118, 120 128 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
        <path d="M200 66 L200 122 M158 72 Q 150 96 148 124 M242 72 Q 250 96 252 124" stroke="${contorno(c)}" stroke-width="2.5" fill="none" opacity=".6"/>
        <circle cx="200" cy="64" r="7" fill="${contorno(c)}"/>
        <path d="M236 120 C 290 110, 338 118, 352 134 C 320 142, 270 140, 232 130 Z" fill="${tom(c, -0.15)}" stroke="${contorno(c)}" stroke-width="3"/>
        <ellipse cx="170" cy="86" rx="22" ry="9" fill="#fff" opacity=".25"/>` }) },
      { id: 'chapeu', nome: 'Chapéu', icone: '👒', camadas: (c) => ({ cabeca: `
        <ellipse cx="200" cy="120" rx="150" ry="26" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
        <path d="M140 120 C 136 50, 264 50, 260 120 Z" fill="${tom(c, 0.12)}" stroke="${contorno(c)}" stroke-width="3"/>
        <path d="M140 102 L 260 102 L 261 118 L 139 118 Z" fill="${contorno(c)}"/>
        <circle cx="236" cy="108" r="11" fill="#fff"/><circle cx="236" cy="108" r="5" fill="#fdd835"/>` }) },
      { id: 'gorro', nome: 'Gorro', icone: '🧶', camadas: (c) => ({ cabeca: `
        <path d="M124 130 C 116 46, 284 46, 276 130 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
        <path d="M160 60 L 156 116 M200 52 L 200 116 M240 60 L 244 116" stroke="${contorno(c)}" stroke-width="2" opacity=".35"/>
        <rect x="116" y="110" width="168" height="30" rx="14" fill="${tom(c, -0.12)}" stroke="${contorno(c)}" stroke-width="3"/>
        <circle cx="200" cy="44" r="20" fill="${tom(c, 0.55)}" stroke="${contorno(c)}" stroke-width="2.5"/>` }) },
      { id: 'coroa', nome: 'Coroa', icone: '👑', camadas: (c) => ({ cabeca: `
        <path d="M140 120 L 134 56 L 168 86 L 200 40 L 232 86 L 266 56 L 260 120 Z" fill="#ffca28" stroke="#b8860b" stroke-width="3" stroke-linejoin="round"/>
        <rect x="140" y="104" width="120" height="16" fill="#ffb300" stroke="#b8860b" stroke-width="2"/>
        <circle cx="200" cy="92" r="9" fill="${c}" stroke="#fff" stroke-width="2"/><circle cx="166" cy="100" r="6" fill="${c}"/><circle cx="234" cy="100" r="6" fill="${c}"/>
        <circle cx="134" cy="54" r="6" fill="#fff59d"/><circle cx="200" cy="38" r="7" fill="#fff59d"/><circle cx="266" cy="54" r="6" fill="#fff59d"/>` }) },
      { id: 'cartola', nome: 'Cartola', icone: '🎩', camadas: (c) => ({ cabeca: `
        <ellipse cx="200" cy="118" rx="96" ry="15" fill="${contorno(c)}"/>
        <path d="M148 118 L 154 28 L 246 28 L 252 118 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
        <ellipse cx="200" cy="28" rx="46" ry="8" fill="${tom(c, 0.15)}" stroke="${contorno(c)}" stroke-width="2"/>
        <path d="M151 92 L 249 92 L 251 108 L 149 108 Z" fill="${c === '#e53935' ? '#fdd835' : '#e53935'}"/>` }) },
      { id: 'festa', nome: 'Chapéu de festa', icone: '🥳', camadas: (c) => ({ cabeca: `
        <g transform="rotate(14 200 122)">
          <path d="M200 14 L 248 124 L 152 124 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M184 50 L 216 50 M172 78 L 228 78 M162 104 L 238 104" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/>
          <circle cx="200" cy="14" r="13" fill="#fdd835" stroke="#c99400" stroke-width="2"/>
        </g>` }) },
      { id: 'laco', nome: 'Laço', icone: '🎀', camadas: (c) => ({ cabeca: `
        <path d="M262 100 C 222 64, 216 128, 262 106 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
        <path d="M262 100 C 304 64, 310 128, 262 106 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
        <circle cx="262" cy="103" r="10" fill="${tom(c, -0.15)}" stroke="${contorno(c)}" stroke-width="2.5"/>` }) },
    ],
    rosto: [
      { id: 'oculos', nome: 'Óculos', icone: '👓', camadas: (c) => ({ rosto: `
        <g fill="rgba(255,255,255,.14)" stroke="${c}" stroke-width="7">
          <circle cx="150" cy="215" r="45"/><circle cx="250" cy="215" r="45"/>
        </g>
        <path d="M193 208 Q 200 198 207 208 M105 206 L 72 196 M295 206 L 328 196" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/>` }) },
      { id: 'sol', nome: 'Óculos de sol', icone: '🕶️', camadas: (c) => ({ rosto: `
        <path d="M100 196 Q 150 186 196 196 Q 196 252 148 256 Q 102 252 100 196 Z" fill="#1d1d24" opacity=".92" stroke="${c}" stroke-width="6"/>
        <path d="M204 196 Q 250 186 300 196 Q 298 252 252 256 Q 204 252 204 196 Z" fill="#1d1d24" opacity=".92" stroke="${c}" stroke-width="6"/>
        <path d="M196 200 L 204 200 M100 200 L 70 192 M300 200 L 330 192" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
        <path d="M118 206 L 140 206 M222 206 L 244 206" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>` }) },
      { id: 'coracao', nome: 'Óculos de coração', icone: '😍', camadas: (c) => ({ rosto: [150, 250].map(x => `
        <path transform="translate(${x} 222) scale(1.65)" d="M0 16 C -38 -6, -26 -38, 0 -20 C 26 -38, 38 -6, 0 16 Z" fill="${c}" fill-opacity=".85" stroke="${contorno(c)}" stroke-width="3"/>`).join('') + `
        <path d="M188 210 L 212 210" stroke="${contorno(c)}" stroke-width="5" stroke-linecap="round"/>` }) },
    ],
    pescoco: [
      { id: 'gravata', nome: 'Gravata borboleta', icone: '🎀', camadas: (c) => ({ pescoco: `
        <path d="M200 348 L 166 330 L 166 366 Z M200 348 L 234 330 L 234 366 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="190" y="338" width="20" height="20" rx="6" fill="${tom(c, -0.15)}" stroke="${contorno(c)}" stroke-width="2.5"/>` }) },
      { id: 'cachecol', nome: 'Cachecol', icone: '🧣', camadas: (c) => ({ pescoco: `
        <path d="M124 330 C 160 354, 240 354, 276 330 L 280 354 C 240 376, 160 376, 120 354 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
        <path d="M232 356 L 258 352 L 266 414 L 238 418 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
        <path d="M244 372 L 262 370 M246 392 L 264 390 M150 344 L 150 366 M180 350 L 180 372 M220 350 L 220 372 M250 344 L 250 366" stroke="${tom(c, 0.45)}" stroke-width="5" opacity=".8"/>
        <path d="M240 418 L 238 428 M248 417 L 247 428 M256 416 L 256 426 M264 415 L 266 425" stroke="${contorno(c)}" stroke-width="3" stroke-linecap="round"/>` }) },
      { id: 'sininho', nome: 'Coleira com sininho', icone: '🔔', camadas: (c) => ({ pescoco: `
        <path d="M128 332 C 160 352, 240 352, 272 332 L 274 346 C 240 366, 160 366, 126 346 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/>
        <circle cx="200" cy="368" r="14" fill="#ffca28" stroke="#b8860b" stroke-width="2.5"/>
        <path d="M190 370 L 210 370" stroke="#8a6200" stroke-width="2.5"/><circle cx="200" cy="376" r="2.5" fill="#8a6200"/>
        <circle cx="195" cy="362" r="3.5" fill="#fff8c4"/>` }) },
      { id: 'colar', nome: 'Colar de coração', icone: '💖', camadas: (c) => ({ pescoco: `
        <path d="M146 336 Q 200 376 254 336" fill="none" stroke="#ffca28" stroke-width="4"/>
        <path transform="translate(200 370)" d="M0 12 C -24 -2, -16 -22, 0 -10 C 16 -22, 24 -2, 0 12 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/>` }) },
    ],
    blusa: [
      { id: 'camiseta', nome: 'Camiseta', icone: '👕', camadas: (c, e) => {
        const manga = 'M128 352 C 112 368, 106 394, 110 412 L 166 414 C 166 392, 162 370, 150 350 Z';
        return {
          tronco: `<path d="M132 356 C 150 340, 175 338, 200 338 C 225 338, 250 340, 268 356 L 276 438 C 240 448, 160 448, 124 438 Z" fill="${e}" stroke="${contorno(c)}" stroke-width="3"/>
            <path d="M174 340 Q 200 362 226 340" fill="none" stroke="${contorno(c)}" stroke-width="4"/>`,
          mangas: `<path class="lado-e" d="${manga}" fill="${e}" stroke="${contorno(c)}" stroke-width="3"/><path d="${espelhar(manga)}" fill="${e}" stroke="${contorno(c)}" stroke-width="3"/>`,
        };
      } },
      { id: 'regata', nome: 'Regata', icone: '🎽', camadas: (c, e) => ({
        tronco: `<path d="M148 342 L 170 342 C 176 362, 224 362, 230 342 L 252 342 C 264 356, 272 386, 276 438 C 240 448, 160 448, 124 438 C 128 386, 136 356, 148 342 Z" fill="${e}" stroke="${contorno(c)}" stroke-width="3"/>`,
      }) },
      { id: 'moletom', nome: 'Moletom', icone: '🧥', camadas: (c, e) => {
        const manga = 'M126 352 C 104 382, 102 422, 124 446 L 166 442 C 172 420, 168 388, 152 350 Z';
        const punho = 'M122 434 L 166 430 L 167 444 L 124 448 Z';
        return {
          tronco: `<path d="M130 354 C 150 338, 175 336, 200 336 C 225 336, 250 338, 270 354 L 278 440 C 240 452, 160 452, 122 440 Z" fill="${e}" stroke="${contorno(c)}" stroke-width="3"/>
            <path d="M156 404 L 244 404 L 252 436 L 148 436 Z" fill="${tom(c, -0.12)}" stroke="${contorno(c)}" stroke-width="2.5"/>
            <path d="M186 346 L 184 384 M214 346 L 216 384" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
            <circle cx="184" cy="388" r="5" fill="#fff"/><circle cx="216" cy="388" r="5" fill="#fff"/>`,
          mangas: `<g class="lado-e"><path d="${manga}" fill="${e}" stroke="${contorno(c)}" stroke-width="3"/><path d="${punho}" fill="${tom(c, -0.15)}"/></g>
            <path d="${espelhar(manga)}" fill="${e}" stroke="${contorno(c)}" stroke-width="3"/><path d="${espelhar(punho)}" fill="${tom(c, -0.15)}"/>`,
        };
      } },
    ],
    baixo: [
      { id: 'shorts', nome: 'Shorts', icone: '🩳', camadas: (c) => ({ baixo: `
        <path d="M122 428 C 160 440, 240 440, 278 428 L 286 462 L 210 466 L 200 446 L 190 466 L 114 462 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M124 436 C 160 448, 240 448, 276 436" fill="none" stroke="${contorno(c)}" stroke-width="2.5" opacity=".6"/>` }) },
      { id: 'bermuda', nome: 'Bermuda', icone: '👖', camadas: (c) => ({ baixo: `
        <path d="M120 428 C 160 440, 240 440, 280 428 L 290 476 L 212 480 L 200 450 L 188 480 L 110 476 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M150 452 L 170 452 L 168 466 L 150 466 Z M230 452 L 250 452 L 250 466 L 232 466 Z" fill="${tom(c, -0.12)}"/>` }) },
      { id: 'calca', nome: 'Calça', icone: '👖', camadas: (c) => ({ baixo: `
        <path d="M118 426 C 160 438, 240 438, 282 426 L 294 482 L 212 486 L 200 454 L 188 486 L 106 482 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M160 440 L 156 482 M240 440 L 244 482" stroke="${tom(c, 0.3)}" stroke-width="2" stroke-dasharray="5 5"/>` }) },
      { id: 'saia', nome: 'Saia', icone: '👗', camadas: (c) => ({ baixo: `
        <path d="M126 426 C 160 436, 240 436, 274 426 L 304 476 C 240 492, 160 492, 96 476 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M160 436 L 140 482 M200 438 L 200 488 M240 436 L 260 482" stroke="${contorno(c)}" stroke-width="2.5" opacity=".5"/>` }) },
    ],
    pes: [
      { id: 'tenis', nome: 'Tênis', icone: '👟', camadas: (c) => {
        const corpo = 'M112 476 C 110 456, 136 450, 152 452 C 174 452, 188 462, 186 478 Z';
        const sola = 'M110 476 L 188 476 L 188 486 C 150 492, 118 492, 110 486 Z';
        const um = (d, s) => `<path d="${d}" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/><path d="${s}" fill="#fff" stroke="#c9c9c9" stroke-width="2"/>`;
        return { pes: um(corpo, sola) + um(espelhar(corpo), espelhar(sola)) + `<path d="M138 458 L 162 458 M140 466 L 164 466 M238 458 L 262 458 M236 466 L 260 466" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` };
      } },
      { id: 'botas', nome: 'Botas', icone: '🥾', camadas: (c) => {
        const bota = 'M114 482 L 118 436 C 132 428, 166 428, 176 440 L 188 482 Z';
        const sola = 'M112 478 L 190 478 L 190 488 L 112 488 Z';
        return { pes: [[bota, sola], [espelhar(bota), espelhar(sola)]].map(([b, s]) => `<path d="${b}" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/><path d="${s}" fill="${contorno(c)}"/>`).join('') };
      } },
      { id: 'sapatilha', nome: 'Sapatilha', icone: '🩰', camadas: (c) => {
        const s = 'M112 478 C 112 460, 186 460, 186 478 C 160 488, 136 488, 112 478 Z';
        return { pes: [s, espelhar(s)].map(d => `<path d="${d}" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/>`).join('') + `<circle cx="150" cy="466" r="6" fill="#fff"/><circle cx="250" cy="466" r="6" fill="#fff"/>` };
      } },
    ],
    costas: [
      { id: 'capa', nome: 'Capa de herói', icone: '🦸', camadas: (c) => ({ costas: `
        <path d="M146 346 C 120 400, 96 450, 84 490 L 316 490 C 304 450, 280 400, 254 346 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
        <path d="M84 490 L 316 490" stroke="${tom(c, -0.25)}" stroke-width="8"/>`, pescoco: `
        <circle cx="146" cy="346" r="9" fill="#ffca28" stroke="#b8860b" stroke-width="2"/><circle cx="254" cy="346" r="9" fill="#ffca28" stroke="#b8860b" stroke-width="2"/>` }) },
      { id: 'asas', nome: 'Asas', icone: '🧚', camadas: (c) => ({ costas: `
        <g fill="${c}" fill-opacity=".55" stroke="${contorno(c)}" stroke-width="3">
          <path d="M150 360 C 60 250, 10 330, 70 390 C 30 430, 90 470, 150 400 Z"/>
          <path d="M250 360 C 340 250, 390 330, 330 390 C 370 430, 310 470, 250 400 Z"/>
        </g>
        <path d="M70 330 Q 110 350 140 372 M330 330 Q 290 350 260 372" stroke="#fff" stroke-width="3" opacity=".7" fill="none"/>` }) },
      { id: 'mochila', nome: 'Mochila', icone: '🎒', camadas: (c) => ({ costas: `
        <rect x="96" y="356" width="208" height="104" rx="30" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>`, pescoco: `
        <path d="M150 346 C 140 380, 140 410, 148 436 M250 346 C 260 380, 260 410, 252 436" stroke="${contorno(c)}" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M150 346 C 140 380, 140 410, 148 436 M250 346 C 260 380, 260 410, 252 436" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>` }) },
    ],
  };

  const ESTAMPAS = [
    { id: 'lisa', nome: 'Lisa', icone: '⬜' },
    { id: 'listras', nome: 'Listras', icone: '🦓' },
    { id: 'bolinhas', nome: 'Bolinhas', icone: '⚪' },
    { id: 'estrela', nome: 'Estrela', icone: '⭐' },
    { id: 'coracao', nome: 'Coração', icone: '❤️' },
    { id: 'raio', nome: 'Raio', icone: '⚡' },
  ];
  function estampa(defs, c, tipo) {
    const id = 'estampa-blusa';
    const claro = c === '#f5f5f5' || c === '#fdd835' ? tom(c, -0.25) : tom(c, 0.55);
    let fundo = c, desenho = '';
    if (tipo === 'listras') defs.innerHTML = `<pattern id="${id}" patternUnits="userSpaceOnUse" width="20" height="22"><rect width="20" height="22" fill="${c}"/><rect y="12" width="20" height="9" fill="${claro}"/></pattern>`;
    else if (tipo === 'bolinhas') defs.innerHTML = `<pattern id="${id}" patternUnits="userSpaceOnUse" width="26" height="26"><rect width="26" height="26" fill="${c}"/><circle cx="7" cy="7" r="4.5" fill="${claro}"/><circle cx="20" cy="20" r="4.5" fill="${claro}"/></pattern>`;
    else defs.innerHTML = '';
    if (tipo === 'listras' || tipo === 'bolinhas') fundo = `url(#${id})`;
    if (tipo === 'estrela') desenho = `<path transform="translate(200 396) scale(1.25)" d="M0 -22 L6 -7 L22 -7 L9 3 L14 19 L0 9 L-14 19 L-9 3 L-22 -7 L-6 -7 Z" fill="${claro}" stroke="${contorno(c)}" stroke-width="1.5"/>`;
    if (tipo === 'coracao') desenho = `<path transform="translate(200 398) scale(1.2)" d="M0 16 C -30 -4, -20 -30, 0 -12 C 20 -30, 30 -4, 0 16 Z" fill="${claro}" stroke="${contorno(c)}" stroke-width="1.5"/>`;
    if (tipo === 'raio') desenho = `<path d="M206 368 L 182 402 L 200 402 L 192 428 L 220 390 L 202 390 Z" fill="#fdd835" stroke="${contorno(c)}" stroke-width="2"/>`;
    return { fundo, desenho };
  }

  const PADRAO = { cabeca: null, rosto: null, pescoco: { id: 'sininho', cor: '#e53935' }, blusa: null, baixo: null, pes: null, costas: null };
  let roupa;
  try { roupa = Object.assign({}, PADRAO, JSON.parse(localStorage.getItem('miguel-roupas') || 'null') || {}); } catch (e) { roupa = { ...PADRAO }; }
  const salvar = () => { try { localStorage.setItem('miguel-roupas', JSON.stringify(roupa)); } catch (e) {} };

  // desenha a roupa dentro de um desenho do Miguel (o da tela ou uma cópia)
  function vestir(raiz) {
    const camadas = { costas: '', baixo: '', pes: '', tronco: '', mangas: '', pescoco: '', rosto: '', cabeca: '' };
    const defs = raiz.querySelector('#roupa-defs');
    if (defs) defs.innerHTML = '';
    for (const cat of Object.keys(PECAS)) {
      const escolha = roupa[cat];
      if (!escolha) continue;
      const peca = PECAS[cat].find(p => p.id === escolha.id);
      if (!peca) continue;
      let fundo = escolha.cor, extra = '';
      if (cat === 'blusa' && defs) ({ fundo, desenho: extra } = estampa(defs, escolha.cor, escolha.estampa || 'lisa'));
      const partes = peca.camadas(escolha.cor, fundo);
      for (const [camada, svg] of Object.entries(partes)) camadas[camada] += svg;
      if (extra) camadas.tronco += extra;
    }
    for (const [camada, svg] of Object.entries(camadas)) {
      const g = raiz.querySelector('#roupa-' + camada);
      if (g) g.innerHTML = svg;
    }
  }

  // imagem do Miguel vestido (para os jogos de correr e o mundo 3D)
  function imagemMiguel() {
    const original = document.getElementById('gato');
    const copia = original.cloneNode(true);
    copia.removeAttribute('class');
    copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    copia.setAttribute('width', '400');
    copia.setAttribute('height', '500');
    copia.querySelector('#mao-orelha')?.remove();
    copia.querySelector('#boca-aberta')?.remove();
    copia.querySelector('.olho-fechado')?.remove();
    vestir(copia);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(copia));
  }

  // ---------- guarda-roupa (tela) ----------
  const CATEGORIAS = [
    ['cabeca', '🎩', 'Cabeça'], ['rosto', '👓', 'Rosto'], ['pescoco', '🎀', 'Pescoço'], ['blusa', '👕', 'Blusa'],
    ['baixo', '🩳', 'Calça e short'], ['pes', '👟', 'Pés'], ['costas', '🦸', 'Costas'],
  ];
  let painel = null, categoria = 'cabeca';

  function abrir() {
    if (!painel) criarPainel();
    document.querySelector('.app').classList.add('vestindo');
    painel.hidden = false;
    desenharPainel();
    M.falar?.('Vamos trocar a minha roupa? Escolha uma parte, um modelo e uma cor!');
  }
  function fechar() {
    painel.hidden = true;
    document.querySelector('.app').classList.remove('vestindo');
    M.falar?.(M.sortear ? M.sortear(['Adorei a minha roupa!', 'Fiquei lindo!', 'Que estiloso!', 'Obrigado pela roupa nova!']) : 'Adorei!');
  }
  function criarPainel() {
    painel = document.createElement('div');
    painel.id = 'guarda-roupa';
    painel.setAttribute('role', 'dialog');
    painel.setAttribute('aria-label', 'Guarda-roupa do Miguel');
    painel.hidden = true;
    document.body.appendChild(painel);
    painel.addEventListener('click', aoClicar);
  }
  function desenharPainel() {
    const escolha = roupa[categoria];
    const pecas = PECAS[categoria];
    painel.innerHTML = `
      <div class="gr-topo">
        <strong>👕 Roupas</strong>
        <div class="gr-acoes">
          <button data-acao="sortear" aria-label="Sortear uma roupa">🎲</button>
          <button data-acao="tirar" aria-label="Tirar todas as roupas">🧼</button>
          <button data-acao="pronto" class="gr-pronto">✅ Pronto</button>
        </div>
      </div>
      <div class="gr-abas">${CATEGORIAS.map(([id, ic, nome]) =>
        `<button data-cat="${id}" aria-selected="${id === categoria}" aria-label="${nome}"><span>${ic}</span><small>${nome}</small>${roupa[id] ? '<i class="gr-ponto"></i>' : ''}</button>`).join('')}</div>
      <div class="gr-rolagem">
        <p class="gr-titulo">Modelo</p>
        <div class="gr-pecas">
          <button data-peca="" aria-pressed="${!escolha}"><span>🚫</span><small>Nenhum</small></button>
          ${pecas.map(p => `<button data-peca="${p.id}" aria-pressed="${escolha?.id === p.id}"><span>${p.icone}</span><small>${p.nome}</small></button>`).join('')}
        </div>
        ${escolha ? `
          <p class="gr-titulo">Cor</p>
          <div class="gr-cores">${CORES.map(([c, n]) => `<button data-cor="${c}" style="background:${c}" aria-label="${n}" aria-pressed="${escolha.cor === c}"></button>`).join('')}</div>
          ${categoria === 'blusa' ? `<p class="gr-titulo">Estampa</p>
          <div class="gr-pecas">${ESTAMPAS.map(e => `<button data-estampa="${e.id}" aria-pressed="${(escolha.estampa || 'lisa') === e.id}"><span>${e.icone}</span><small>${e.nome}</small></button>`).join('')}</div>` : ''}` : ''}
      </div>`;
  }
  function aplicar(falarTexto) {
    salvar();
    vestir(document.getElementById('gato'));
    const g = document.getElementById('gato');
    g.classList.remove('cutucado'); void g.getBoundingClientRect(); g.classList.add('cutucado');
    if (falarTexto) M.falar?.(falarTexto);
    try { M.tocarNota?.(880, 0, 0.12, 0.1); M.tocarNota?.(1320, 0.08, 0.15, 0.08); } catch (e) {}
  }
  function aoClicar(e) {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.cat) { categoria = b.dataset.cat; desenharPainel(); return; }
    if (b.dataset.peca !== undefined) {
      if (!b.dataset.peca) { roupa[categoria] = null; aplicar('Sem nada aqui.'); }
      else {
        const peca = PECAS[categoria].find(p => p.id === b.dataset.peca);
        roupa[categoria] = { id: peca.id, cor: roupa[categoria]?.cor || CORES[Math.floor(Math.random() * CORES.length)][0], estampa: roupa[categoria]?.estampa };
        aplicar(`${peca.nome}!`);
      }
      desenharPainel();
    } else if (b.dataset.cor && roupa[categoria]) {
      roupa[categoria].cor = b.dataset.cor;
      aplicar(nomeCor(b.dataset.cor) + '!');
      desenharPainel();
    } else if (b.dataset.estampa && roupa[categoria]) {
      roupa[categoria].estampa = b.dataset.estampa;
      aplicar('Estampa ' + ESTAMPAS.find(x => x.id === b.dataset.estampa).nome + '!');
      desenharPainel();
    } else if (b.dataset.acao === 'sortear') {
      const s = (l) => l[Math.floor(Math.random() * l.length)];
      for (const cat of Object.keys(PECAS)) {
        const usar = cat === 'blusa' || cat === 'baixo' || Math.random() < 0.5;
        roupa[cat] = usar ? { id: s(PECAS[cat]).id, cor: s(CORES)[0], estampa: s(ESTAMPAS).id } : null;
      }
      aplicar('Roupa surpresa! Ficou demais!');
      desenharPainel();
    } else if (b.dataset.acao === 'tirar') {
      for (const cat of Object.keys(PECAS)) roupa[cat] = null;
      aplicar('Tirei tudo! Agora escolha uma roupa nova.');
      desenharPainel();
    } else if (b.dataset.acao === 'pronto') fechar();
  }

  function iniciar() {
    const g = document.getElementById('gato');
    if (g) vestir(g);
    document.getElementById('abrir-roupas')?.addEventListener('click', abrir);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();

  M.catalogo?.push(() => [
    'Vamos trocar a minha roupa? Escolha uma parte, um modelo e uma cor!', 'Adorei a minha roupa!', 'Fiquei lindo!', 'Que estiloso!', 'Obrigado pela roupa nova!',
    'Sem nada aqui.', 'Roupa surpresa! Ficou demais!', 'Tirei tudo! Agora escolha uma roupa nova.',
    ...CORES.map(([, n]) => n + '!'),
    ...ESTAMPAS.map(e => 'Estampa ' + e.nome + '!'),
    ...Object.values(PECAS).flat().map(p => `${p.nome}!`),
  ]);
  M.roupas = { abrir, vestir, imagemMiguel, atual: () => roupa, tom };
})();
