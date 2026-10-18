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

  // ---------- peças novas (desenhadas e revisadas em imagens) ----------
  PECAS.cabeca.push(...[
  { id: 'chapeu-cauboi', nome: 'Chapéu de caubói', icone: '🤠', camadas: (c) => {
    const faixa = c === '#2b2b2b' ? '#8d6e63' : contorno(c);
    return { cabeca: `
    <path d="M140 136 C 132 96, 134 58, 148 44 C 164 32, 182 50, 200 44 C 218 50, 236 32, 252 44 C 266 58, 268 96, 260 136 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M176 50 Q 200 64 224 50" fill="none" stroke="${contorno(c)}" stroke-width="2.5" opacity=".5"/>
    <path d="M137 113 C 170 119, 230 119, 263 113 L 261 134 C 230 139, 170 139, 139 134 Z" fill="${faixa}"/>
    <path transform="translate(200 126) scale(.9)" d="M0 -10 L2.5 -3.4 L9.5 -3.1 L4 1.3 L5.9 8.1 L0 4.2 L-5.9 8.1 L-4 1.3 L-9.5 -3.1 L-2.5 -3.4 Z" fill="#ffca28" stroke="#b8860b" stroke-width="1.5"/>
    <path d="M30 98 C 44 142, 112 158, 200 158 C 288 158, 356 142, 370 98 C 342 126, 290 136, 200 136 C 110 136, 58 126, 30 98 Z" fill="${tom(c, -0.1)}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M52 118 C 90 140, 150 147, 200 147 C 250 147, 310 140, 348 118" fill="none" stroke="${contorno(c)}" stroke-width="2" stroke-dasharray="6 6" opacity=".5"/>
    <ellipse cx="166" cy="76" rx="9" ry="20" fill="#fff" opacity=".25"/>` };
  } },
  { id: 'capacete-bombeiro', nome: 'Capacete de bombeiro', icone: '🚒', camadas: (c) => ({ cabeca: `
    <path d="M114 134 C 108 70, 148 40, 200 40 C 252 40, 292 70, 286 134 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
    <path d="M189 44 C 189 32, 211 32, 211 44 L 213 112 L 187 112 Z" fill="${tom(c, 0.18)}" stroke="${contorno(c)}" stroke-width="2.5"/>
    <path d="M128 112 C 170 102, 230 102, 272 112" fill="none" stroke="${contorno(c)}" stroke-width="2.5" opacity=".5"/>
    <ellipse cx="200" cy="136" rx="126" ry="16" fill="${tom(c, -0.12)}" stroke="${contorno(c)}" stroke-width="3"/>
    <path d="M168 68 L 232 68 L 232 104 C 232 120, 216 130, 200 138 C 184 130, 168 120, 168 104 Z" fill="#ffca28" stroke="#b8860b" stroke-width="3" stroke-linejoin="round"/>
    <path transform="translate(200 98) scale(1.4)" d="M0 -10 L2.5 -3.4 L9.5 -3.1 L4 1.3 L5.9 8.1 L0 4.2 L-5.9 8.1 L-4 1.3 L-9.5 -3.1 L-2.5 -3.4 Z" fill="#fff" stroke="#b8860b" stroke-width="1.2"/>
    <ellipse cx="146" cy="80" rx="10" ry="20" fill="#fff" opacity=".3" transform="rotate(24 146 80)"/>` }) },
  { id: 'chapeu-cozinheiro', nome: 'Chapéu de cozinheiro', icone: '👨‍🍳', camadas: (c) => {
    const pano = tom(c, 0.82);
    return { cabeca: `
    <path d="M148 110 C 112 106, 102 70, 126 50 C 130 24, 162 12, 184 28 C 194 8, 228 6, 238 28 C 260 14, 294 28, 286 56 C 304 74, 290 106, 252 110 Z" fill="${pano}" stroke="${contorno(pano)}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M168 52 Q 174 78 168 104 M200 40 L 200 104 M232 52 Q 226 78 232 104" fill="none" stroke="${contorno(pano)}" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>
    <ellipse cx="156" cy="46" rx="13" ry="8" fill="#fff" opacity=".6"/>
    <path d="M140 104 C 180 98, 220 98, 260 104 L 262 138 C 220 132, 180 132, 138 138 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M160 104 L 159 134 M180 101 L 180 132 M200 100 L 200 132 M220 101 L 220 132 M240 104 L 241 134" stroke="${contorno(c)}" stroke-width="2" opacity=".45"/>` };
  } },
  { id: 'gorro-noel', nome: 'Gorro de Papai Noel', icone: '🎅', camadas: (c) => ({ cabeca: `
    <path d="M126 122 C 128 72, 160 34, 214 30 C 262 28, 300 52, 318 92 C 300 80, 284 78, 276 90 C 276 100, 276 112, 274 122 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M168 56 Q 200 40 236 42" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".3"/>
    <path d="M114 118 C 150 104, 250 104, 286 118 C 294 124, 294 140, 286 144 C 250 132, 150 132, 114 144 C 106 140, 106 124, 114 118 Z" fill="#fafafa" stroke="#cfcfcf" stroke-width="2.5"/>
    <g fill="#e6e6e6"><circle cx="134" cy="126" r="3"/><circle cx="160" cy="120" r="3.5"/><circle cx="188" cy="124" r="3"/><circle cx="214" cy="119" r="3.5"/><circle cx="242" cy="125" r="3"/><circle cx="268" cy="121" r="3.5"/></g>
    <circle cx="318" cy="96" r="18" fill="#fafafa" stroke="#cfcfcf" stroke-width="2.5"/>
    <circle cx="312" cy="90" r="5" fill="#fff"/><circle cx="324" cy="102" r="3" fill="#e6e6e6"/>` }) },
  { id: 'chapeu-mago', nome: 'Chapéu de mago', icone: '🧙', camadas: (c) => {
    const brilho = c === '#fdd835' ? '#fff' : '#ffe066';
    const estrela = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 L2.5 -3.4 L9.5 -3.1 L4 1.3 L5.9 8.1 L0 4.2 L-5.9 8.1 L-4 1.3 L-9.5 -3.1 L-2.5 -3.4 Z" fill="${brilho}" stroke="#b8860b" stroke-width="${1.5 / s}"/>`;
    return { cabeca: `
    <ellipse cx="200" cy="126" rx="132" ry="19" fill="${tom(c, -0.15)}" stroke="${contorno(c)}" stroke-width="3"/>
    <path d="M134 126 C 164 96, 184 50, 198 16 C 202 6, 214 2, 226 6 C 240 10, 250 20, 256 30 C 242 24, 228 26, 222 38 C 226 70, 244 102, 266 126 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M140 118 C 180 110, 222 110, 260 118" fill="none" stroke="${contorno(c)}" stroke-width="2.5" opacity=".5"/>
    ${estrela(192, 90, 1.5)}${estrela(166, 112, 0.9)}${estrela(240, 110, 0.8)}${estrela(206, 52, 0.7)}${estrela(254, 30, 0.6)}
    <path d="M234 72 A 11 11 0 1 0 238 92 A 9 9 0 1 1 234 72 Z" fill="${brilho}" stroke="#b8860b" stroke-width="1.5"/>
    <path d="M166 104 Q 182 70 196 36" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".25"/>` };
  } },
  { id: 'orelhas-coelho', nome: 'Orelhas de coelho', icone: '🐰', camadas: (c) => {
    const orelha = (x, ang) => `<g transform="rotate(${ang} ${x} 112)">
      <path d="M${x} 114 C ${x - 30} 80, ${x - 27} 8, ${x} 4 C ${x + 27} 8, ${x + 30} 80, ${x} 114 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
      <path d="M${x} 102 C ${x - 16} 76, ${x - 14} 22, ${x} 18 C ${x + 14} 22, ${x + 16} 76, ${x} 102 Z" fill="#ffd1df"/>
      <path d="M${x - 14} 70 Q ${x - 15} 40 ${x - 8} 22" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35"/></g>`;
    return { cabeca: `${orelha(170, -14)}${orelha(230, 14)}
    <path d="M78 176 C 84 120, 130 106, 200 106 C 270 106, 316 120, 322 176" fill="none" stroke="${contorno(c)}" stroke-width="17" stroke-linecap="round"/>
    <path d="M78 176 C 84 120, 130 106, 200 106 C 270 106, 316 120, 322 176" fill="none" stroke="${c}" stroke-width="11" stroke-linecap="round"/>
    <path d="M110 128 C 130 114, 160 110, 186 108" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35"/>` };
  } },
  { id: 'chifre-unicornio', nome: 'Chifre de unicórnio', icone: '🦄', camadas: (c) => {
    const flor = (x, y, cor) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<circle cx="0" cy="-8.5" r="7.5" fill="${cor}" stroke="#fff" stroke-width="1.5" transform="rotate(${a})"/>`).join('')}<circle r="5.5" fill="#ffca28" stroke="#fff" stroke-width="1.5"/></g>`;
    const folha = (x, y, a) => `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0 Q 8 -10 18 0 Q 8 8 0 0 Z" fill="#66bb6a"/>`;
    return { cabeca: `
    <path d="M78 176 C 84 120, 130 106, 200 106 C 270 106, 316 120, 322 176" fill="none" stroke="${contorno(c)}" stroke-width="15" stroke-linecap="round"/>
    <path d="M78 176 C 84 120, 130 106, 200 106 C 270 106, 316 120, 322 176" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>
    <path d="M174 114 Q 182 56, 200 6 Q 218 56, 226 114 Q 200 124 174 114 Z" fill="${tom(c, 0.35)}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M178 98 Q 200 100 219 86 M183 76 Q 200 78 214 64 M188 54 Q 200 56 209 42 M194 32 Q 200 33 204 22" fill="none" stroke="${contorno(c)}" stroke-width="3" stroke-linecap="round" opacity=".45"/>
    <path d="M184 100 Q 190 60 198 22" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>
    ${folha(144, 112, 200)}${folha(256, 112, -20)}
    ${flor(158, 108, '#f48fb1')}${flor(242, 108, '#81d4fa')}${flor(130, 116, '#ce93d8')}${flor(270, 116, '#fff59d')}` };
  } },
  { id: 'fones-ouvido', nome: 'Fones de ouvido', icone: '🎧', camadas: (c) => {
    const lado = `<ellipse cx="68" cy="200" rx="10" ry="30" fill="#3b3b45"/>
      <ellipse cx="52" cy="200" rx="20" ry="36" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
      <ellipse cx="46" cy="186" rx="6" ry="12" fill="#fff" opacity=".35"/>`;
    return { cabeca: `
    <path d="M56 170 C 44 90, 120 60, 200 60 C 280 60, 356 90, 344 170" fill="none" stroke="${contorno(c)}" stroke-width="17" stroke-linecap="round"/>
    <path d="M56 170 C 44 90, 120 60, 200 60 C 280 60, 356 90, 344 170" fill="none" stroke="${c}" stroke-width="11" stroke-linecap="round"/>
    <path d="M150 66 C 180 58, 220 58, 250 66" fill="none" stroke="#3b3b45" stroke-width="9" stroke-linecap="round"/>
    ${lado}<g transform="translate(400 0) scale(-1 1)">${lado}</g>` };
  } },
  { id: 'chapeu-pirata', nome: 'Chapéu de pirata', icone: '🏴‍☠️', camadas: (c) => {
    const osso = (c === '#f5f5f5' || c === '#fdd835') ? '#2b2b2b' : '#fff';
    const debrum = c === '#fdd835' ? '#ef6c00' : '#ffca28';
    return { cabeca: `
    <path d="M132 104 C 126 52, 160 30, 200 30 C 240 30, 274 52, 268 104 Z" fill="${tom(c, -0.15)}" stroke="${contorno(c)}" stroke-width="3"/>
    <ellipse cx="172" cy="52" rx="14" ry="7" fill="#fff" opacity=".2" transform="rotate(-18 172 52)"/>
    <path d="M44 86 C 66 122, 130 144, 200 144 C 270 144, 334 122, 356 86 C 326 102, 276 102, 240 90 C 226 84, 214 68, 200 66 C 186 68, 174 84, 160 90 C 124 102, 74 102, 44 86 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M56 94 C 84 106, 126 106, 162 97 C 178 92, 188 76, 200 75 C 212 76, 222 92, 238 97 C 274 106, 316 106, 344 94" fill="none" stroke="${debrum}" stroke-width="5" stroke-linecap="round"/>
    <g fill="${osso}"><path d="M180 112 L 220 130 M220 112 L 180 130" stroke="${osso}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="176" cy="114" r="4.5"/><circle cx="180" cy="108" r="4.5"/><circle cx="224" cy="114" r="4.5"/><circle cx="220" cy="108" r="4.5"/>
      <circle cx="176" cy="128" r="4.5"/><circle cx="180" cy="134" r="4.5"/><circle cx="224" cy="128" r="4.5"/><circle cx="220" cy="134" r="4.5"/>
      <circle cx="200" cy="100" r="14"/><rect x="191" y="105" width="18" height="12" rx="4"/></g>
    <circle cx="195" cy="100" r="4" fill="${c}"/><circle cx="205" cy="100" r="4" fill="${c}"/>
    <path d="M196 112 L 196 117 M200 112 L 200 117 M204 112 L 204 117" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>` };
  } },
]);
  PECAS.rosto.push(...[
  { id: 'mascara-heroi', nome: 'Máscara de herói', icone: '🦸', camadas: (c) => ({ rosto: `
    <path d="M330 168 C 352 170, 372 186, 384 206 L 368 212 C 360 196, 346 186, 328 182 Z" fill="${tom(c, -0.12)}" stroke="${contorno(c)}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M330 176 C 348 190, 360 214, 362 238 L 346 236 C 346 216, 338 198, 326 186 Z" fill="${tom(c, -0.12)}" stroke="${contorno(c)}" stroke-width="2.5" stroke-linejoin="round"/>
    <path fill-rule="evenodd" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round" d="
      M200 184 C 184 162, 140 140, 104 154 C 88 160, 76 156, 64 146 C 70 176, 76 236, 108 262
      C 134 280, 172 272, 186 252 C 192 242, 208 242, 214 252
      C 228 272, 266 280, 292 262 C 324 236, 330 176, 336 146 C 324 156, 312 160, 296 154 C 260 140, 216 162, 200 184 Z
      M109 213 a 41 45 0 1 0 82 0 a 41 45 0 1 0 -82 0 Z
      M209 213 a 41 45 0 1 0 82 0 a 41 45 0 1 0 -82 0 Z"/>
    <path d="M92 172 Q 104 162 124 160" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".45"/>` }) },

  { id: 'mascara-carnaval', nome: 'Máscara de carnaval', icone: '🎭', camadas: (c) => {
    const forma = `M200 182 C 182 156, 136 138, 104 150 C 90 154, 78 146, 70 126 C 62 160, 70 236, 108 264
      C 134 282, 172 274, 186 254 C 192 246, 208 246, 214 254
      C 228 274, 266 282, 292 264 C 330 236, 338 160, 330 126 C 322 146, 310 154, 296 150 C 264 138, 218 156, 200 182 Z`;
    const pena = (x, y, r, cor) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0 C -16 -30, -12 -70, 0 -96 C 12 -70, 16 -30, 0 0 Z" fill="${cor}" stroke="${contorno(c)}" stroke-width="2"/><path d="M0 -4 L 0 -86" stroke="#ffca28" stroke-width="2.5"/></g>`;
    return { rosto: `
    ${pena(318, 150, 8, tom(c, 0.45))}${pena(322, 152, 34, '#ffca28')}${pena(314, 150, -18, c)}
    <path d="${forma}" fill="none" stroke="#e0a800" stroke-width="9" stroke-linejoin="round"/>
    <path fill-rule="evenodd" fill="${c}" stroke="#8a6200" stroke-width="2" stroke-linejoin="round" d="${forma}
      M111 214 a 39 43 0 1 0 78 0 a 39 43 0 1 0 -78 0 Z
      M211 214 a 39 43 0 1 0 78 0 a 39 43 0 1 0 -78 0 Z"/>
    <g fill="none" stroke="#ffca28" stroke-width="3">
      <ellipse cx="150" cy="214" rx="40" ry="44"/><ellipse cx="250" cy="214" rx="40" ry="44"/>
    </g>
    <g fill="none" stroke="${tom(c, 0.5)}" stroke-width="3" stroke-linecap="round">
      <path d="M86 232 q 4 -16 18 -10 q 8 6 0 12"/><path d="M314 232 q -4 -16 -18 -10 q -8 6 0 12"/>
    </g>
    <path d="M200 180 L 208 194 L 200 208 L 192 194 Z" fill="#4fc3f7" stroke="#fff" stroke-width="2"/>
    <g fill="#fff59d">
      <circle cx="120" cy="158" r="2.5"/><circle cx="86" cy="190" r="2"/><circle cx="104" cy="256" r="2.5"/><circle cx="160" cy="268" r="2"/>
      <circle cx="280" cy="158" r="2.5"/><circle cx="314" cy="190" r="2"/><circle cx="296" cy="256" r="2.5"/><circle cx="240" cy="268" r="2"/>
    </g>` };
  } },

  { id: 'oculos-mergulho', nome: 'Óculos de mergulho', icone: '🤿', camadas: (c) => {
    const lente = `M118 160 C 160 150, 240 150, 282 160 C 306 166, 312 196, 308 226 C 304 256, 290 266, 262 266
      C 236 266, 226 256, 218 242 C 212 232, 188 232, 182 242 C 174 256, 164 266, 138 266 C 110 266, 96 256, 92 226 C 88 196, 94 166, 118 160 Z`;
    return { rosto: `
    <rect x="58" y="202" width="40" height="22" rx="6" fill="${tom(c, -0.3)}" stroke="${contorno(c)}" stroke-width="2"/>
    <rect x="302" y="202" width="40" height="22" rx="6" fill="${tom(c, -0.3)}" stroke="${contorno(c)}" stroke-width="2"/>
    <path d="M334 254 C 346 240, 348 220, 346 190 L 344 100" fill="none" stroke="#5a3b00" stroke-width="17" stroke-linecap="round"/>
    <path d="M334 254 C 346 240, 348 220, 346 190 L 344 100" fill="none" stroke="#ffca28" stroke-width="12" stroke-linecap="round"/>
    <rect x="335" y="88" width="18" height="16" rx="4" fill="${c}" stroke="${contorno(c)}" stroke-width="2"/>
    <circle cx="358" cy="72" r="6" fill="rgba(200,240,255,.5)" stroke="#4fc3f7" stroke-width="2"/><circle cx="366" cy="54" r="4" fill="rgba(200,240,255,.5)" stroke="#4fc3f7" stroke-width="2"/>
    <path d="${lente}" fill="rgba(225,246,255,.22)" stroke="${contorno(c)}" stroke-width="16" stroke-linejoin="round"/>
    <path d="${lente}" fill="none" stroke="${c}" stroke-width="11" stroke-linejoin="round"/>
    <path d="M122 176 L 104 206 M140 172 L 112 220 M262 176 L 244 206" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>
    <rect x="336" y="206" width="18" height="14" rx="3" fill="${tom(c, -0.3)}" stroke="${contorno(c)}" stroke-width="2"/>` };
  } },

  { id: 'oculos-estrela', nome: 'Óculos de estrela', icone: '🌟', camadas: (c) => {
    const estrela = (cx, cy, R, r, giro) => Array.from({ length: 10 }, (_, i) => {
      const a = (giro - 90 + i * 36) * Math.PI / 180, raio = i % 2 ? r : R;
      return (i ? 'L' : 'M') + (cx + raio * Math.cos(a)).toFixed(1) + ' ' + (cy + raio * Math.sin(a)).toFixed(1);
    }).join(' ') + ' Z';
    const e1 = estrela(140, 214, 66, 44, 0), e2 = estrela(260, 214, 66, 44, 0);
    const brilho = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 Q 1.5 -1.5 10 0 Q 1.5 1.5 0 10 Q -1.5 1.5 -10 0 Q -1.5 -1.5 0 -10 Z" fill="#fff"/>`;
    return { rosto: `
    <path d="M80 196 L 62 190 M320 196 L 338 190" stroke="${contorno(c)}" stroke-width="6" stroke-linecap="round"/>
    <g stroke-linejoin="round">
      <path d="${e1}" fill="${c}" fill-opacity=".09" stroke="${contorno(c)}" stroke-width="12"/>
      <path d="${e2}" fill="${c}" fill-opacity=".09" stroke="${contorno(c)}" stroke-width="12"/>
      <path d="${e1}" fill="none" stroke="${c}" stroke-width="7"/>
      <path d="${e2}" fill="none" stroke="${c}" stroke-width="7"/>
    </g>
    ${brilho(96, 150, 1)}${brilho(310, 262, 0.8)}${brilho(214, 150, 0.6)}` };
  } },

  { id: 'nariz-palhaco', nome: 'Nariz de palhaço', icone: '🤡', camadas: (c) => ({ rosto: `
    <circle cx="200" cy="254" r="22" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
    <path d="M182 264 C 190 278, 212 278, 220 262 C 214 272, 190 274, 182 264 Z" fill="${tom(c, -0.2)}" opacity=".7"/>
    <ellipse cx="192" cy="245" rx="8" ry="5" fill="#fff" opacity=".75" transform="rotate(-25 192 245)"/>
    <circle cx="207" cy="241" r="2.5" fill="#fff" opacity=".6"/>` }) },

  { id: 'bigode', nome: 'Bigode', icone: '🥸', camadas: (c) => {
    const metade = 'M200 266 C 186 256, 166 254, 152 264 C 140 272, 124 270, 118 258 C 114 248, 120 238, 130 240 C 124 246, 128 256, 138 256 C 152 258, 164 280, 184 284 C 193 285, 198 282, 200 278 Z';
    return { rosto: `
    <g fill="${c}" stroke="${contorno(c)}" stroke-width="2.5" stroke-linejoin="round">
      <path d="${metade}"/><path d="${espelhar(metade)}"/>
    </g>
    <path d="M150 266 Q 166 262 182 268 M250 266 Q 234 262 218 268" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".35"/>` };
  } },

  { id: 'tapa-olho', nome: 'Tapa-olho de pirata', icone: '🏴‍☠️', camadas: (c) => {
    const n = parseInt(c.slice(1), 16), claro = ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) > 170;
    const caveira = claro ? '#3a2a20' : '#fff';
    return { rosto: `
    <path d="M170 182 L 268 104" stroke="${contorno(c)}" stroke-width="7" stroke-linecap="round"/>
    <path d="M110 226 L 62 234" stroke="${contorno(c)}" stroke-width="7" stroke-linecap="round"/>
    <path d="M106 206 C 106 176, 126 166, 150 166 C 176 166, 194 180, 194 208 C 194 240, 176 262, 150 264 C 124 262, 106 240, 106 206 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
    <path d="M114 206 C 114 182, 130 174, 150 174 C 172 174, 186 186, 186 208 C 186 236, 172 254, 150 256 C 128 254, 114 236, 114 206 Z" fill="none" stroke="${tom(c, claro ? -0.25 : 0.35)}" stroke-width="2" stroke-dasharray="5 4"/>
    <g fill="${caveira}">
      <path d="M140 210 C 140 198, 160 198, 160 210 C 160 216, 156 218, 156 222 L 144 222 C 144 218, 140 216, 140 210 Z"/>
      <path d="M134 228 L 166 240 M166 228 L 134 240" stroke="${caveira}" stroke-width="4" stroke-linecap="round"/>
    </g>
    <circle cx="146" cy="210" r="2.6" fill="${c}"/><circle cx="154" cy="210" r="2.6" fill="${c}"/>
    <ellipse cx="128" cy="186" rx="9" ry="5" fill="#fff" opacity=".3" transform="rotate(-30 128 186)"/>` };
  } },

  { id: 'adesivos-coracao', nome: 'Adesivos de coração', icone: '💕', camadas: (c) => {
    const coracao = (x, y, s, giro) => `<path transform="translate(${x} ${y}) rotate(${giro}) scale(${s})" d="M0 12 C -22 -2, -16 -22, 0 -9 C 16 -22, 22 -2, 0 12 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="${2.2 / s}"/>
      <ellipse transform="translate(${x} ${y}) rotate(${giro}) scale(${s})" cx="-8" cy="-8" rx="3.5" ry="2.2" fill="#fff" opacity=".7"/>`;
    return { rosto: coracao(108, 264, 1.4, -12) + coracao(84, 240, 0.8, -20) + coracao(292, 264, 1.4, 12) + coracao(316, 240, 0.8, 20) };
  } },

  { id: 'pintura-borboleta', nome: 'Pintura de borboleta', icone: '🦋', camadas: (c) => {
    const asa = `<path fill-rule="evenodd" d="M196 190 C 184 140, 136 104, 100 120 C 70 136, 74 190, 96 218 C 82 246, 92 284, 124 288 C 154 290, 180 266, 196 232 Z
      M106 214 A 44 48 0 0 1 192 200 L 192 230 A 44 48 0 0 1 106 214 Z" fill="${c}" fill-opacity=".88" stroke="${contorno(c)}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="100" cy="150" r="9" fill="${tom(c, 0.55)}"/><circle cx="122" cy="132" r="5" fill="${tom(c, 0.55)}"/><circle cx="108" cy="270" r="7" fill="${tom(c, 0.55)}"/>
      <circle cx="88" cy="182" r="3" fill="#fff59d"/><circle cx="150" cy="140" r="3" fill="#fff59d"/><circle cx="132" cy="278" r="2.5" fill="#fff59d"/>`;
    return { rosto: `${asa}<g transform="matrix(-1 0 0 1 400 0)">${asa}</g>
    <ellipse cx="200" cy="206" rx="6" ry="34" fill="${contorno(c)}"/>
    <path d="M198 174 C 194 160, 186 150, 178 146 M202 174 C 206 160, 214 150, 222 146" fill="none" stroke="${contorno(c)}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="178" cy="146" r="4" fill="${contorno(c)}"/><circle cx="222" cy="146" r="4" fill="${contorno(c)}"/>` };
  } },
]);
  PECAS.pescoco.push(...[
  { id: 'gravata-comprida', nome: 'Gravata comprida', icone: '👔', camadas: (c) => {
    const lista = c === '#f5f5f5' || c === '#fdd835' ? tom(c, -0.3) : tom(c, 0.5);
    const lamina = 'M190 362 L 210 362 L 222 420 L 200 440 L 178 420 Z';
    return { pescoco: `
      <path d="M198 344 L 166 332 L 174 366 Z" fill="#fff" stroke="#b0bec5" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M202 344 L 234 332 L 226 366 Z" fill="#fff" stroke="#b0bec5" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="${lamina}" fill="${c}"/>
      <path d="M186 382 L 212 372 M182 400 L 216 390 M178.5 418 L 219.5 408" stroke="${lista}" stroke-width="5"/>
      <path d="${lamina}" fill="none" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M187 342 L 213 342 L 208 364 L 192 364 Z" fill="${tom(c, -0.12)}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="196" cy="348" rx="4" ry="3" fill="#fff" opacity=".35"/>` };
  } },
  { id: 'medalha', nome: 'Medalha de ouro', icone: '🥇', camadas: (c) => ({ pescoco: `
      <path d="M144 316 L 168 316 L 210 390 L 194 394 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M156 316 L 202 392" stroke="#fff" stroke-width="5" opacity=".75"/>
      <path d="M256 316 L 232 316 L 190 390 L 206 394 Z" fill="${tom(c, -0.1)}" stroke="${contorno(c)}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M244 316 L 198 392" stroke="#fff" stroke-width="5" opacity=".75"/>
      <rect x="194" y="378" width="12" height="10" rx="3" fill="#ffca28" stroke="#b8860b" stroke-width="2"/>
      <circle cx="200" cy="406" r="22" fill="#ffca28" stroke="#b8860b" stroke-width="3"/>
      <circle cx="200" cy="406" r="15" fill="#ffd54f" stroke="#e0a800" stroke-width="2"/>
      <path transform="translate(200 407) scale(.55)" d="M0 -22 L6 -7 L22 -7 L9 3 L14 19 L0 9 L-14 19 L-9 3 L-22 -7 L-6 -7 Z" fill="#fff59d" stroke="#c99400" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="190" cy="396" rx="5" ry="3.5" fill="#fff" opacity=".55"/>` }) },
  { id: 'colar-flores', nome: 'Colar de flores', icone: '🌺', camadas: (c) => {
    const outra = c === '#f5f5f5' ? '#f8bbd0' : c === '#fdd835' ? '#fff59d' : tom(c, 0.4);
    const miolo = c === '#fdd835' ? '#fb8c00' : '#ffeb3b';
    const ponto = (t) => [(1 - t) * (1 - t) * 126 + 2 * t * (1 - t) * 200 + t * t * 274, (1 - t) * (1 - t) * 330 + 2 * t * (1 - t) * 436 + t * t * 330];
    const petalas = (r) => [0, 72, 144, 216, 288].map(a => [Math.cos((a - 90) * Math.PI / 180) * r * 0.85, Math.sin((a - 90) * Math.PI / 180) * r * 0.85]);
    const flor = ([x, y], cor, r) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      ${petalas(r).map(([px, py]) => `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(r * 0.62).toFixed(1)}" fill="${cor}" stroke="${contorno(c)}" stroke-width="3"/>`).join('')}
      ${petalas(r).map(([px, py]) => `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(r * 0.62 - 1.4).toFixed(1)}" fill="${cor}"/>`).join('')}
      <circle r="${(r * 0.36).toFixed(1)}" fill="${miolo}" stroke="#e0a800" stroke-width="1.2"/></g>`;
    const folhas = [1, 3, 5, 7, 9, 11, 13, 15].map(i => { const [x, y] = ponto(i / 16); return `<ellipse cx="${x.toFixed(1)}" cy="${(y + 8).toFixed(1)}" rx="9" ry="4.5" transform="rotate(${(x - 200) / 4} ${x.toFixed(1)} ${(y + 8).toFixed(1)})" fill="#43a047" stroke="#2e7d32" stroke-width="1.5"/>`; }).join('');
    const flores = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => [ponto(i / 8), i % 2 ? outra : c]).sort((a, b) => a[0][1] - b[0][1]);
    return { pescoco: folhas + flores.map(([p, cor]) => flor(p, cor, 13)).join('') };
  } },
  { id: 'babador', nome: 'Babador', icone: '🍼', camadas: (c) => {
    const borda = 'M152 334 C 147 372, 164 414, 200 416 C 236 414, 253 372, 248 334';
    const peixe = c === '#f5f5f5' ? '#4fc3f7' : '#fff';
    return { pescoco: `
      <path d="${borda}" fill="none" stroke="#cfd8dc" stroke-width="17" stroke-dasharray="0 12.6" stroke-linecap="round"/>
      <path d="${borda}" fill="none" stroke="#fff" stroke-width="13" stroke-dasharray="0 12.6" stroke-linecap="round"/>
      <path d="${borda} Q 200 362 152 334 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M152 334 Q 200 362 248 334" fill="none" stroke="${tom(c, -0.15)}" stroke-width="7" stroke-linecap="round"/>
      <path d="M152 334 Q 200 362 248 334" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 4" opacity=".8"/>
      <g transform="translate(200 388)">
        <path d="M-16 0 C -8 -12, 10 -12, 14 0 C 10 12, -8 12, -16 0 Z M14 0 L 24 -9 L 24 9 Z" fill="${peixe}" stroke="${contorno(c)}" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="-7" cy="-2" r="2.4" fill="${contorno(c)}"/>
      </g>` };
  } },
  { id: 'lenco-cauboi', nome: 'Lenço de caubói', icone: '🤠', camadas: (c) => {
    const p = c === '#f5f5f5' || c === '#fdd835' ? contorno(c) : '#fff';
    const lenco = 'M128 322 C 160 350, 240 350, 272 322 C 254 360, 226 392, 200 414 C 174 392, 146 360, 128 322 Z';
    return { pescoco: `
      <path d="${lenco}" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M146 342 C 160 366, 182 392, 200 404 C 218 392, 240 366, 254 342" fill="none" stroke="${p}" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>
      <g fill="${p}">
        <circle cx="200" cy="372" r="5"/><circle cx="182" cy="360" r="3.5"/><circle cx="218" cy="360" r="3.5"/><circle cx="200" cy="390" r="3"/>
        <path d="M168 352 c 6 -2 10 4 6 8 c -2 2 -6 2 -8 6 c -2 -6 -2 -12 2 -14 Z"/>
        <path d="M232 352 c -6 -2 -10 4 -6 8 c 2 2 6 2 8 6 c 2 -6 2 -12 -2 -14 Z"/>
      </g>` };
  } },
  { id: 'gola-palhaco', nome: 'Gola de palhaço', icone: '🤡', camadas: (c) => {
    const b = c === '#f5f5f5' ? '#e53935' : '#fff';
    const lobos = [];
    for (let i = 0; i <= 12; i++) { const a = (-12 + i * 17) * Math.PI / 180; lobos.push([200 + 80 * Math.cos(a), 330 + 34 * Math.sin(a), i]); }
    lobos.sort((p, q) => p[1] - q[1]);
    const pompom = c === '#fdd835' ? '#e53935' : '#fdd835';
    const prega = (x, y) => { const dx = 200 - x, dy = 318 - y, n = Math.hypot(dx, dy); return `M${(x - dx / n * 12).toFixed(1)} ${(y - dy / n * 12).toFixed(1)} L ${(x + dx / n * 4).toFixed(1)} ${(y + dy / n * 4).toFixed(1)}`; };
    return { pescoco: lobos.map(([x, y, i]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="18" fill="${i % 2 ? b : c}" stroke="${contorno(c)}" stroke-width="2.5"/>
      <path d="${prega(x, y)}" stroke="${contorno(c)}" stroke-width="2" stroke-linecap="round" opacity=".35"/>`).join('') + `
      <circle cx="200" cy="372" r="11" fill="${pompom}" stroke="${tom(pompom, -0.3)}" stroke-width="2.5"/>
      <circle cx="196" cy="368" r="3.5" fill="#fff" opacity=".6"/>` };
  } },
  { id: 'coleira-peixe', nome: 'Coleira de peixinho', icone: '🐟', camadas: (c) => ({ pescoco: `
      <path d="M128 332 C 160 352, 240 352, 272 332 L 274 346 C 240 366, 160 366, 126 346 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/>
      <path d="M134 340 C 164 358, 236 358, 266 340" fill="none" stroke="${c === '#f5f5f5' ? '#b0bec5' : '#fff'}" stroke-width="2" stroke-dasharray="5 5" opacity=".8"/>
      <circle cx="200" cy="361" r="5" fill="none" stroke="#9e9e9e" stroke-width="3"/>
      <g transform="translate(200 383) scale(1.2)">
        <path d="M-20 0 C -12 -14, 8 -14, 14 0 C 8 14, -12 14, -20 0 Z" fill="#ffca28" stroke="#b8860b" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M14 0 L 26 -11 L 24 0 L 26 11 Z" fill="#ffca28" stroke="#b8860b" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M-6 -9 Q 0 0 -6 9" fill="none" stroke="#b8860b" stroke-width="2"/>
        <circle cx="-12" cy="-2" r="2.5" fill="#5d4037"/>
        <ellipse cx="2" cy="-6" rx="5" ry="2.5" fill="#fff8c4"/>
      </g>
      <path d="M200 366 L 200 370" stroke="#9e9e9e" stroke-width="3"/>` }) },
  { id: 'laco-presente', nome: 'Laço de presente', icone: '🎁', camadas: (c) => {
    const alca = 'M200 360 C 176 330, 136 336, 140 360 C 144 384, 176 384, 200 360 Z';
    const dentro = 'M196 360 C 178 346, 156 348, 156 360 C 158 372, 178 372, 196 360 Z';
    const ponta = 'M196 366 L 172 412 L 182 408 L 186 418 L 206 368 Z';
    return { pescoco: `
      <path d="M130 334 C 160 352, 240 352, 270 334 L 271 344 C 240 362, 160 362, 129 344 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/>
      <path d="${ponta}" fill="${tom(c, -0.1)}" stroke="${contorno(c)}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="${espelhar(ponta)}" fill="${tom(c, -0.1)}" stroke="${contorno(c)}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="${alca}" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      <path d="${espelhar(alca)}" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      <path d="${dentro}" fill="${tom(c, -0.2)}" opacity=".7"/>
      <path d="${espelhar(dentro)}" fill="${tom(c, -0.2)}" opacity=".7"/>
      <rect x="188" y="348" width="24" height="24" rx="8" fill="${tom(c, -0.1)}" stroke="${contorno(c)}" stroke-width="3"/>
      <ellipse cx="156" cy="350" rx="7" ry="4" fill="#fff" opacity=".4" transform="rotate(-20 156 350)"/>` };
  } },
  { id: 'estetoscopio', nome: 'Estetoscópio', icone: '🩺', camadas: (c) => {
    const tubo = 'M150 318 C 154 350, 172 366, 184 380 M250 318 C 252 362, 232 388, 216 398';
    const metal = 'M184 380 C 176 388, 173 396, 173 404 M184 380 C 192 388, 195 396, 195 404';
    return { pescoco: `
      <path d="${tubo}" fill="none" stroke="${contorno(c)}" stroke-width="11" stroke-linecap="round"/>
      <path d="${tubo}" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
      <path d="${metal}" fill="none" stroke="#78909c" stroke-width="6" stroke-linecap="round"/>
      <path d="${metal}" fill="none" stroke="#e0e6ea" stroke-width="3" stroke-linecap="round"/>
      <circle cx="184" cy="380" r="5.5" fill="#b0bec5" stroke="#78909c" stroke-width="2"/>
      <ellipse cx="173" cy="407" rx="5" ry="6" fill="#37474f"/><ellipse cx="195" cy="407" rx="5" ry="6" fill="#37474f"/>
      <circle cx="215" cy="410" r="12" fill="#cfd8dc" stroke="#78909c" stroke-width="3"/>
      <circle cx="215" cy="410" r="6.5" fill="#eceff1" stroke="#90a4ae" stroke-width="2"/>
      <ellipse cx="210.5" cy="405.5" rx="3.2" ry="2.3" fill="#fff"/>` };
  } },
]);
  PECAS.blusa.push(...[
  { id: 'camisa-botao', nome: 'Camisa de botão', icone: '👔', camadas: (c, e) => {
    const k = contorno(c);
    const corpo = 'M132 356 C 150 340, 175 338, 200 338 C 225 338, 250 340, 268 356 L 276 438 C 240 448, 160 448, 124 438 Z';
    const manga = 'M128 352 C 112 368, 106 394, 110 412 L 166 414 C 166 392, 162 370, 150 350 Z';
    const barra = 'M110 401 C 128 403, 148 404, 165.5 403';
    const gola = 'M200 352 L 166 337 C 163 350, 167 362, 178 372 Z';
    return {
      tronco: `<path d="${corpo}" fill="${e}" stroke="${k}" stroke-width="3"/>
        <path d="M200 352 L 200 446" stroke="${k}" stroke-width="2.5"/>
        ${[378, 400, 422].map(y => `<circle cx="200" cy="${y}" r="4.2" fill="#fff" stroke="${k}" stroke-width="1.5"/>`).join('')}
        <path d="M210 382 L 232 382 L 232 400 Q 221 406 210 400 Z" fill="${e}" stroke="${k}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M210 388 L 232 388" stroke="${k}" stroke-width="2"/>
        <path d="${gola}" fill="${e}" stroke="${k}" stroke-width="3" stroke-linejoin="round"/>
        <path d="${espelhar(gola)}" fill="${e}" stroke="${k}" stroke-width="3" stroke-linejoin="round"/>`,
      mangas: `<g class="lado-e"><path d="${manga}" fill="${e}" stroke="${k}" stroke-width="3"/><path d="${barra}" fill="none" stroke="${k}" stroke-width="2"/></g>
        <path d="${espelhar(manga)}" fill="${e}" stroke="${k}" stroke-width="3"/><path d="${espelhar(barra)}" fill="none" stroke="${k}" stroke-width="2"/>`,
    };
  } },

  { id: 'camisa-futebol', nome: 'Camisa de futebol', icone: '⚽', camadas: (c, e) => {
    const k = contorno(c);
    const f = c === '#f5f5f5' ? '#e53935' : c === '#fdd835' ? '#43a047' : '#fff';
    const corpo = 'M132 356 C 150 340, 175 338, 200 338 C 225 338, 250 340, 268 356 L 276 438 C 240 448, 160 448, 124 438 Z';
    const manga = 'M128 352 C 112 368, 106 394, 110 412 L 166 414 C 166 392, 162 370, 150 350 Z';
    const faixa = 'M108 402 L 166 404 L 166 414 L 110 412 Z';
    const um = (m, b) => `<path d="${m}" fill="${e}"/><path d="${b}" fill="${f}"/><path d="${m}" fill="none" stroke="${k}" stroke-width="3"/>`;
    return {
      tronco: `<path d="${corpo}" fill="${e}" stroke="${k}" stroke-width="3"/>
        <path d="M172 340 L 200 370 L 228 340" fill="none" stroke="${k}" stroke-width="11" stroke-linejoin="round"/>
        <path d="M172 340 L 200 370 L 228 340" fill="none" stroke="${f}" stroke-width="6" stroke-linejoin="round"/>
        <text x="200" y="432" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="36" fill="${f}" stroke="${k}" stroke-width="2" paint-order="stroke">10</text>`,
      mangas: `<g class="lado-e">${um(manga, faixa)}</g>${um(espelhar(manga), espelhar(faixa))}`,
    };
  } },

  { id: 'roupa-heroi', nome: 'Roupa de super-herói', icone: '💪', camadas: (c, e) => {
    const k = contorno(c);
    const o = c === '#fdd835' ? '#fff' : '#ffca28';
    const m = c === '#f5f5f5' || c === '#fdd835' ? '#e53935' : c;
    const corpo = 'M132 356 C 150 340, 175 338, 200 338 C 225 338, 250 340, 268 356 L 276 438 C 240 448, 160 448, 124 438 Z';
    const manga = 'M126 352 C 104 382, 102 422, 124 446 L 166 442 C 172 420, 168 388, 152 350 Z';
    const luva = 'M110.6 423 L 140 411 L 168.6 423 L 168.2 432 L 166 442 L 124 446 C 117 440, 112.5 432, 110.6 423 Z';
    const um = (a, l) => `<path d="${a}" fill="${e}"/><path d="${l}" fill="${o}" stroke="${k}" stroke-width="2" stroke-linejoin="round"/><path d="${a}" fill="none" stroke="${k}" stroke-width="3"/>`;
    return {
      tronco: `<path d="${corpo}" fill="${e}" stroke="${k}" stroke-width="3"/>
        <path d="M200 420 L 172 390 L 182 374 L 218 374 L 228 390 Z" fill="${o}" stroke="${k}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M188 400 L 188 383 L 200 395 L 212 383 L 212 400" fill="none" stroke="${m}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="M125.2 426 C 160 436, 240 436, 274.8 426 L 276 438 C 240 448, 160 448, 124 438 Z" fill="${o}" stroke="${k}" stroke-width="2"/>
        <rect x="189" y="428" width="22" height="16" rx="4" fill="${o}" stroke="${k}" stroke-width="2.5"/>`,
      mangas: `<g class="lado-e">${um(manga, luva)}</g>${um(espelhar(manga), espelhar(luva))}`,
    };
  } },

  { id: 'sueter', nome: 'Suéter de tricô', icone: '❄️', camadas: (c, e) => {
    const k = contorno(c);
    const t = c === '#f5f5f5' ? '#e53935' : c === '#fdd835' ? k : '#fff';
    const corpo = 'M132 356 C 150 340, 175 338, 200 338 C 225 338, 250 340, 268 356 L 276 438 C 240 448, 160 448, 124 438 Z';
    const manga = 'M126 352 C 104 382, 102 422, 124 446 L 166 442 C 172 420, 168 388, 152 350 Z';
    const punho = 'M113.7 430 L 168.2 430 L 166 442 L 124 446 C 118.5 441.5, 115.5 436, 113.7 430 Z';
    const zz = (x0, x1, a, b) => { let d = `M${x0} ${a}`, i = 0; for (let x = x0 + 6; x <= x1; x += 6) d += ` L${x} ${++i % 2 ? b : a}`; return d; };
    const faixa = (x0, x1) => `<path d="${zz(x0, x1, 395, 405)} ${zz(x0, x1, 405, 395)}" fill="none" stroke="${t}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M${x0} 388 L ${x1} 388 M${x0} 412 L ${x1} 412" stroke="${t}" stroke-width="3"/>`;
    const um = (lado) => {
      const f = lado === 'e' ? (d) => d : espelhar;
      const [x0, x1] = lado === 'e' ? [110, 168] : [232, 290];
      return `<path d="${f(manga)}" fill="${e}"/>${faixa(x0, x1)}
        <path d="${f(punho)}" fill="${tom(c, -0.12)}"/><path d="${f('M119 438 L 166 436')}" stroke="${k}" stroke-width="10" stroke-dasharray="1.5 4" opacity=".45"/>
        <path d="${f(manga)}" fill="none" stroke="${k}" stroke-width="3"/>`;
    };
    return {
      tronco: `<path d="${corpo}" fill="${e}" stroke="${k}" stroke-width="3"/>${faixa(128, 272)}
        <path d="M125 428 C 160 438, 240 438, 275 428 L 276 438 C 240 448, 160 448, 124 438 Z" fill="${tom(c, -0.12)}" stroke="${k}" stroke-width="2"/>
        <path d="M128 434 C 160 443, 240 443, 272 434" fill="none" stroke="${k}" stroke-width="8" stroke-dasharray="1.5 4" opacity=".45"/>
        <path d="M168 340 Q 200 362 232 340" fill="none" stroke="${k}" stroke-width="13" stroke-linecap="round"/>
        <path d="M168 340 Q 200 362 232 340" fill="none" stroke="${tom(c, -0.12)}" stroke-width="9" stroke-linecap="round"/>
        <path d="M168 340 Q 200 362 232 340" fill="none" stroke="${k}" stroke-width="9" stroke-dasharray="1.5 4" opacity=".45"/>`,
      mangas: `<g class="lado-e">${um('e')}</g>${um('d')}`,
    };
  } },

  { id: 'avental-cozinheiro', nome: 'Avental de cozinheiro', icone: '🍳', camadas: (c, e) => {
    const k = contorno(c);
    const b = c === '#f5f5f5' ? '#cfe8fc' : '#fafafa';
    const corpo = 'M132 356 C 150 340, 175 338, 200 338 C 225 338, 250 340, 268 356 L 276 438 C 240 448, 160 448, 124 438 Z';
    const manga = 'M128 352 C 112 368, 106 394, 110 412 L 166 414 C 166 392, 162 370, 150 350 Z';
    return {
      tronco: `<path d="${corpo}" fill="${b}" stroke="#b0bec5" stroke-width="3"/>
        <path d="M174 340 Q 200 360 226 340" fill="none" stroke="#b0bec5" stroke-width="3"/>
        <path d="M172 366 L 162 338 M228 366 L 238 338" stroke="${k}" stroke-width="8" stroke-linecap="round"/>
        <path d="M172 366 L 162 338 M228 366 L 238 338" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
        <path d="M168 362 C 186 359, 214 359, 232 362 L 236 404 C 256 406, 268 412, 275 428 L 276 438 C 240 448, 160 448, 124 438 L 125 428 C 132 412, 144 406, 164 404 Z" fill="${e}" stroke="${k}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M182 412 L 218 412 L 218 428 Q 200 436 182 428 Z" fill="${e}" stroke="${k}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M200 412 L 200 432" stroke="${k}" stroke-width="2"/>`,
      mangas: `<path class="lado-e" d="${manga}" fill="${b}" stroke="#b0bec5" stroke-width="3"/><path d="${espelhar(manga)}" fill="${b}" stroke="#b0bec5" stroke-width="3"/>`,
    };
  } },

  { id: 'roupa-astronauta', nome: 'Roupa de astronauta', icone: '🚀', camadas: (c, e) => {
    const k = contorno(c);
    const corpo = 'M132 356 C 150 340, 175 338, 200 338 C 225 338, 250 340, 268 356 L 276 438 C 240 448, 160 448, 124 438 Z';
    const manga = 'M126 352 C 104 382, 102 422, 124 446 L 166 442 C 172 420, 168 388, 152 350 Z';
    const anel = 'M113 428 L 168.2 428 L 167.5 436 L 116 438 Z';
    const dobras = 'M109 396 C 128 400, 150 400, 167 396 M108.6 404 C 128 408, 150 408, 167.6 404';
    const um = (f) => `<ellipse cx="${f === espelhar ? 237 : 163}" cy="449" rx="22" ry="14" fill="#fafafa" stroke="#90a4ae" stroke-width="2.5"/>
      <path d="${f(manga)}" fill="${e}"/><path d="${f(dobras)}" fill="none" stroke="${k}" stroke-width="2" opacity=".6"/>
      <path d="${f(anel)}" fill="#cfd8dc" stroke="#78909c" stroke-width="2"/><path d="${f(manga)}" fill="none" stroke="${k}" stroke-width="3"/>`;
    return {
      tronco: `<path d="${corpo}" fill="${e}" stroke="${k}" stroke-width="3"/>
        <ellipse cx="200" cy="342" rx="50" ry="12" fill="#cfd8dc" stroke="#78909c" stroke-width="3"/>
        <rect x="178" y="384" width="44" height="34" rx="5" fill="#eceff1" stroke="#607d8b" stroke-width="2.5"/>
        <circle cx="189" cy="394" r="4" fill="#e53935"/><circle cx="200" cy="394" r="4" fill="#fdd835"/><circle cx="211" cy="394" r="4" fill="#43a047"/>
        <rect x="184" y="402" width="32" height="10" rx="2" fill="#4fc3f7" stroke="#607d8b" stroke-width="1.5"/>`,
      mangas: `<g class="lado-e">${um((d) => d)}</g>${um(espelhar)}`,
    };
  } },

  { id: 'quimono', nome: 'Quimono', icone: '🥋', camadas: (c, e) => {
    const k = contorno(c);
    const fx = c === '#2b2b2b' ? '#e53935' : '#2b2b2b';
    const corpo = 'M132 356 C 150 340, 175 338, 200 338 C 225 338, 250 340, 268 356 L 276 438 C 240 448, 160 448, 124 438 Z';
    const manga = 'M126 352 C 102 378, 96 412, 102 434 L 172 428 C 172 400, 166 372, 152 350 Z';
    const barra = 'M100.5 424 L 172 418 L 172 428 L 102 434 Z';
    const gola = (d) => `<path d="${d}" fill="none" stroke="${k}" stroke-width="13" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${tom(c, -0.1)}" stroke-width="9" stroke-linecap="round"/>`;
    const um = (m, b) => `<path d="${m}" fill="${e}"/><path d="${b}" fill="${tom(c, -0.1)}"/><path d="${m}" fill="none" stroke="${k}" stroke-width="3"/>`;
    return {
      tronco: `<path d="${corpo}" fill="${e}" stroke="${k}" stroke-width="3"/>
        ${gola('M176 340 L 202 392')}${gola('M226 340 L 172 432')}
        <path d="M126.4 413 C 160 423, 240 423, 273.6 413 L 274.8 426 C 240 436, 160 436, 125.2 426 Z" fill="${fx}" stroke="${tom(fx, -0.3)}" stroke-width="2"/>
        <path d="M195 430 L 184 456 L 195 458 L 203 432 Z M205 430 L 216 456 L 205 459 L 197 432 Z" fill="${fx}" stroke="${tom(fx, -0.3)}" stroke-width="2" stroke-linejoin="round"/>
        <rect x="189" y="417" width="22" height="16" rx="4" fill="${fx}" stroke="${tom(fx, -0.3)}" stroke-width="2"/>`,
      mangas: `<g class="lado-e">${um(manga, barra)}</g>${um(espelhar(manga), espelhar(barra))}`,
    };
  } },

  { id: 'roupa-bombeiro', nome: 'Roupa de bombeiro', icone: '🚒', camadas: (c, e) => {
    const k = contorno(c);
    const am = c === '#fdd835' || c === '#f5f5f5' ? '#fb8c00' : '#fdd835';
    const corpo = 'M132 356 C 150 340, 175 338, 200 338 C 225 338, 250 340, 268 356 L 276 438 C 240 448, 160 448, 124 438 Z';
    const manga = 'M126 352 C 104 382, 102 422, 124 446 L 166 442 C 172 420, 168 388, 152 350 Z';
    const borda = (y) => (132 - 8 * (y - 356) / 82).toFixed(1);
    const faixa = (y) => `<path d="M${borda(y)} ${y} L ${400 - borda(y)} ${y} L ${400 - borda(y + 12)} ${y + 12} L ${borda(y + 12)} ${y + 12} Z" fill="${am}"/><path d="M${borda(y + 4)} ${y + 4} L ${400 - borda(y + 4)} ${y + 4} L ${400 - borda(y + 8)} ${y + 8} L ${borda(y + 8)} ${y + 8} Z" fill="#e0e0e0"/>`;
    const fm = 'M110.3 420 L 168.6 420 L 168.2 432 L 114.7 432 Z';
    const fm2 = 'M111.4 424 L 168.5 424 L 168.4 428 L 113 428 Z';
    const um = (f) => `<path d="${f(manga)}" fill="${e}"/><path d="${f(fm)}" fill="${am}"/><path d="${f(fm2)}" fill="#e0e0e0"/><path d="${f(manga)}" fill="none" stroke="${k}" stroke-width="3"/>`;
    return {
      tronco: `<path d="${corpo}" fill="${e}" stroke="${k}" stroke-width="3"/>
        ${faixa(384)}${faixa(420)}<path d="${corpo}" fill="none" stroke="${k}" stroke-width="3"/>
        <path d="M200 356 L 200 446" stroke="${k}" stroke-width="3"/>
        ${[372, 412].map(y => `<rect x="192" y="${y}" width="16" height="6" rx="2" fill="#37474f"/>`).join('')}
        <path d="M164 342 C 186 350, 214 350, 236 342 L 238 354 C 214 362, 186 362, 162 354 Z" fill="${tom(c, -0.15)}" stroke="${k}" stroke-width="2.5" stroke-linejoin="round"/>`,
      mangas: `<g class="lado-e">${um((d) => d)}</g>${um(espelhar)}`,
    };
  } },

  { id: 'camisa-florida', nome: 'Camisa florida', icone: '🌺', camadas: (c, e) => {
    const k = contorno(c);
    const p = c === '#f5f5f5' ? '#f06292' : c === '#fdd835' ? '#e53935' : '#fff';
    const mi = c === '#fdd835' ? '#fff' : '#fdd835';
    const corpo = 'M132 356 C 150 340, 175 338, 200 338 C 225 338, 250 340, 268 356 L 276 438 C 240 448, 160 448, 124 438 Z';
    const manga = 'M128 352 C 112 368, 106 394, 110 412 L 166 414 C 166 392, 162 370, 150 350 Z';
    const barra = 'M110 401 C 128 403, 148 404, 165.5 403';
    const gola = 'M182 339 L 199 376 L 180 378 L 160 345 Z';
    const flor = (x, y, r) => [0, 72, 144, 216, 288].map(a => `<circle cx="${(x + Math.sin(a * Math.PI / 180) * r * 0.62).toFixed(1)}" cy="${(y - Math.cos(a * Math.PI / 180) * r * 0.62).toFixed(1)}" r="${(r * 0.5).toFixed(1)}" fill="${p}"/>`).join('') + `<circle cx="${x}" cy="${y}" r="${(r * 0.32).toFixed(1)}" fill="${mi}"/>`;
    const um = (f, x) => `<path d="${f(manga)}" fill="${e}" stroke="${k}" stroke-width="3"/>${flor(x, 380, 12)}<path d="${f(barra)}" fill="none" stroke="${k}" stroke-width="2"/>`;
    return {
      tronco: `<path d="${corpo}" fill="${e}" stroke="${k}" stroke-width="3"/>
        <path d="M181 339 L 200 378 L 219 339 Z" fill="url(#g-creme)"/>
        ${flor(222, 404, 13)}${flor(180, 424, 11)}
        ${[392, 414, 434].map(y => `<circle cx="200" cy="${y}" r="3.5" fill="#fff" stroke="${k}" stroke-width="1.5"/>`).join('')}
        <path d="${gola}" fill="${e}" stroke="${k}" stroke-width="3" stroke-linejoin="round"/>
        <path d="${espelhar(gola)}" fill="${e}" stroke="${k}" stroke-width="3" stroke-linejoin="round"/>`,
      mangas: `<g class="lado-e">${um((d) => d, 136)}</g>${um(espelhar, 264)}`,
    };
  } },
]);
  PECAS.baixo.push(...[
  { id: 'tutu', nome: 'Saia de bailarina', icone: '🩰', camadas: (c) => {
    const claro = c === '#f5f5f5' || c === '#fdd835' ? tom(c, -0.18) : tom(c, 0.45);
    const babado = (x0, x1, yb, curva, n, h) => {
      let d = '', w = (x1 - x0) / n;
      for (let i = 0; i < n; i++) {
        const xa = x0 + i * w, xb = xa + w, xm = (xa + xb) / 2;
        const yy = (x) => yb + curva * (1 - Math.pow((x - 200) / ((x1 - x0) / 2), 2));
        d += ` Q ${xm.toFixed(1)} ${(yy(xm) + h).toFixed(1)} ${xb.toFixed(1)} ${yy(xb).toFixed(1)}`;
      }
      return d;
    };
    return { baixo: `
      <path d="M130 428 C 108 442, 86 458, 76 472 ${babado(76, 324, 472, 8, 10, 13)} C 314 458, 292 442, 270 428 Z" fill="${claro}" stroke="${contorno(c)}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M128 428 C 112 440, 98 452, 92 460 ${babado(92, 308, 460, 6, 8, 12)} C 302 452, 288 440, 272 428 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M104 456 Q 112 444 126 436 M296 456 Q 288 444 274 436 M168 448 L 166 466 M200 450 L 200 470 M232 448 L 234 466" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".55"/>
      <path d="M126 424 C 160 436, 240 436, 274 424 L 276 434 C 240 446, 160 446, 124 434 Z" fill="${tom(c, -0.15)}" stroke="${contorno(c)}" stroke-width="2.5"/>
      <g fill="#fff"><circle cx="110" cy="462" r="2.5"/><circle cx="290" cy="462" r="2.5"/><circle cx="188" cy="462" r="2"/><circle cx="214" cy="456" r="2.5"/><circle cx="92" cy="474" r="2"/><circle cx="308" cy="474" r="2"/><circle cx="124" cy="448" r="1.8"/><circle cx="278" cy="448" r="1.8"/></g>` };
  } },
  { id: 'babado', nome: 'Saia de babado', icone: '💃', camadas: (c) => {
    const claro = c === '#f5f5f5' || c === '#fdd835' ? tom(c, -0.2) : tom(c, 0.6);
    let onda = '';
    for (let i = 0; i < 12; i++) { const xa = 300 - i * 17, xb = xa - 17; onda += ` Q ${xa - 8.5} ${494} ${xb} ${486}`; }
    return { baixo: `
      <path d="M96 470 L 304 470 L 304 486 ${onda} L 96 470 Z" fill="${claro}" stroke="${contorno(c)}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M126 426 C 160 436, 240 436, 274 426 L 302 474 C 240 488, 160 488, 98 474 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M150 440 Q 140 460 134 482 M178 442 Q 174 462 172 486 M222 442 Q 226 462 228 486 M250 440 Q 260 460 266 482" stroke="${contorno(c)}" stroke-width="2" fill="none" opacity=".4"/>
      <path d="M100 474 C 160 488, 240 488, 300 474" stroke="${claro}" stroke-width="4" fill="none" stroke-dasharray="2 7" stroke-linecap="round"/>
      <path d="M200 438 C 186 428, 178 444, 196 442 Z M204 438 C 218 428, 226 444, 208 442 Z" fill="${claro}" stroke="${contorno(c)}" stroke-width="2"/>
      <circle cx="202" cy="439" r="4.5" fill="${claro}" stroke="${contorno(c)}" stroke-width="2"/>` };
  } },
  { id: 'pijama', nome: 'Calça de pijama', icone: '🌙', camadas: (c) => {
    const claro = c === '#f5f5f5' || c === '#fdd835' ? '#5c6bc0' : '#fff59d';
    const estrela = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 L3 -3 L10 -3 L4.5 1.5 L6.5 9 L0 4.5 L-6.5 9 L-4.5 1.5 L-10 -3 L-3 -3 Z" fill="${claro}"/>`;
    const lua = (x, y) => `<path transform="translate(${x} ${y})" d="M2 -8 A 8 8 0 1 0 8 4 A 6.5 6.5 0 1 1 2 -8 Z" fill="${claro}"/>`;
    return { baixo: `
      <path d="M118 426 C 160 438, 240 438, 282 426 L 296 484 L 212 488 L 200 456 L 188 488 L 104 484 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      ${estrela(114, 448, 0.8)}${lua(286, 446)}${estrela(200, 444, 0.7)}${lua(112, 472)}${estrela(290, 470, 0.8)}
      ${estrela(150, 448, 0.9)}${lua(250, 450)}${estrela(170, 470, 0.8)}${estrela(232, 472, 0.8)}${lua(140, 474)}${estrela(262, 474, 0.7)}
      <path d="M118 426 C 160 438, 240 438, 282 426 L 284 436 C 240 448, 160 448, 116 436 Z" fill="${tom(c, -0.12)}" stroke="${contorno(c)}" stroke-width="2.5"/>
      <path d="M104 476 L 186 480 L 188 488 L 104 484 Z M296 476 L 214 480 L 212 488 L 296 484 Z" fill="${tom(c, -0.12)}" stroke="${contorno(c)}" stroke-width="2"/>` };
  } },
  { id: 'praia', nome: 'Short de praia', icone: '🌺', camadas: (c) => {
    const flor = (x, y, cor) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="4.5" ry="7" cy="-6" transform="rotate(${a})" fill="${cor}" stroke="${contorno(c)}" stroke-width="1"/>`).join('')}<circle r="3.2" fill="#ff8f00"/></g>`;
    const folha = (x, y, r) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M0 0 Q 7 -10 0 -18 Q -7 -10 0 0 Z" fill="#66bb6a" stroke="#2e7d32" stroke-width="1"/>`;
    const f1 = c === '#f5f5f5' ? '#f06292' : '#fff', f2 = c === '#fdd835' ? '#f06292' : '#ffee58';
    return { baixo: `
      <path d="M120 428 C 160 440, 240 440, 280 428 L 290 468 L 210 472 L 200 448 L 190 472 L 110 468 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      ${folha(122, 452, -40)}${folha(280, 450, 40)}${folha(206, 452, 30)}${folha(160, 462, 60)}${folha(240, 462, -60)}
      ${flor(118, 452, f1)}${flor(284, 450, f2)}${flor(194, 452, f2)}${flor(150, 450, f2)}${flor(254, 448, f1)}${flor(174, 466, f1)}${flor(228, 466, f2)}${flor(286, 466, f1)}${flor(114, 466, f2)}
      <path d="M120 428 C 160 440, 240 440, 280 428 L 281 436 C 240 448, 160 448, 119 436 Z" fill="${tom(c, -0.15)}"/>
      <path d="M196 440 Q 192 452 186 456 M204 440 Q 208 452 214 456" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>` };
  } },
  { id: 'moletom-calca', nome: 'Calça de moletom', icone: '🏃', camadas: (c) => {
    const punho = 'M100 470 L 186 474 L 188 490 L 98 488 Z';
    const fita = c === '#f5f5f5' ? '#8e8e8e' : '#fff';
    return { baixo: `
      <path d="M118 428 C 160 440, 240 440, 282 428 L 300 476 L 214 480 L 200 456 L 186 480 L 100 476 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M114 436 L 104 472 M286 436 L 296 472" stroke="${fita}" stroke-width="5" stroke-linecap="round" opacity=".9"/>
      <path d="${punho}" fill="${tom(c, -0.15)}" stroke="${contorno(c)}" stroke-width="2.5"/><path d="${espelhar(punho)}" fill="${tom(c, -0.15)}" stroke="${contorno(c)}" stroke-width="2.5"/>
      <path d="M106 472 L 106 488 M114 472 L 113 489 M294 472 L 294 488 M286 472 L 287 489" stroke="${contorno(c)}" stroke-width="1.5" opacity=".6"/>
      <path d="M118 424 C 160 436, 240 436, 282 424 L 284 438 C 240 450, 160 450, 116 438 Z" fill="${tom(c, -0.15)}" stroke="${contorno(c)}" stroke-width="2.5"/>
      <path d="M150 432 L 150 446 M170 434 L 170 448 M230 434 L 230 448 M250 432 L 250 446 M130 428 L 130 442 M270 428 L 270 442" stroke="${contorno(c)}" stroke-width="1.5" opacity=".5"/>
      <path d="M200 442 C 190 438, 186 448, 198 446 M202 442 C 212 438, 216 448, 204 446 M198 446 L 192 462 M204 446 L 210 462" stroke="${fita}" stroke-width="3" fill="none" stroke-linecap="round"/>` };
  } },
  { id: 'heroi-calca', nome: 'Calça de super-herói', icone: '⚡', camadas: (c) => {
    const ouro = c === '#fdd835' ? '#e53935' : '#ffca28', ouroC = c === '#fdd835' ? '#8e1b18' : '#b8860b';
    const raio = 'M118 444 L 108 462 L 116 462 L 110 480 L 124 456 L 116 456 Z';
    return { baixo: `
      <path d="M118 426 C 160 438, 240 438, 282 426 L 294 482 L 212 486 L 200 454 L 188 486 L 106 482 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      <path d="${raio}" fill="${ouro}" stroke="${ouroC}" stroke-width="1.5" stroke-linejoin="round"/><path d="${espelhar(raio)}" fill="${ouro}" stroke="${ouroC}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M118 424 C 160 436, 240 436, 282 424 L 284 436 C 240 448, 160 448, 116 436 Z" fill="${ouro}" stroke="${ouroC}" stroke-width="2.5"/>
      <rect x="184" y="428" width="32" height="24" rx="7" fill="${ouro}" stroke="${ouroC}" stroke-width="2.5"/>
      <path d="M204 431 L 194 441 L 200 441 L 196 449 L 207 438 L 201 438 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="1"/>
      <path d="M188 432 L 196 432" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>` };
  } },
  { id: 'futebol', nome: 'Short de futebol', icone: '⚽', camadas: (c) => {
    const faixa = c === '#f5f5f5' ? '#1e88e5' : '#fff';
    return { baixo: `
      <path d="M120 428 C 160 440, 240 440, 280 428 L 290 468 L 210 472 L 200 448 L 190 472 L 110 468 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M121 434 L 113 466 M279 434 L 287 466" stroke="${faixa}" stroke-width="7"/>
      <path d="M112 462 L 190 466 M288 462 L 210 466" stroke="${faixa}" stroke-width="4"/>
      <path d="M120 428 C 160 440, 240 440, 280 428 L 281 436 C 240 448, 160 448, 119 436 Z" fill="${faixa}" stroke="${contorno(c)}" stroke-width="1.5"/>
      <g transform="translate(232 452)"><circle r="8" fill="#fff" stroke="#333" stroke-width="1.5"/><path d="M0 -3.5 L 3.3 -1 L 2 3 L -2 3 L -3.3 -1 Z" fill="#333"/><path d="M0 -3.5 L 0 -8 M3.3 -1 L 7.6 -2.4 M2 3 L 4.6 6.4 M-2 3 L -4.6 6.4 M-3.3 -1 L -7.6 -2.4" stroke="#333" stroke-width="1.2"/></g>` };
  } },
  { id: 'palhaco', nome: 'Calça de palhaço', icone: '🤡', camadas: (c) => {
    const cores = ['#fdd835', '#1e88e5', '#43a047', '#e53935', '#f06292', '#fff'].filter(x => x !== c && !(c === '#f5f5f5' && x === '#fff'));
    const bolas = [[112, 452, 8], [146, 448, 9], [200, 446, 8], [252, 448, 9], [288, 452, 8], [126, 474, 9], [170, 468, 8], [230, 468, 8], [276, 474, 9], [100, 476, 6], [300, 476, 6]];
    const susp = c === '#e53935' ? '#1e88e5' : '#e53935';
    return { baixo: `
      <path d="M164 432 L 160 350 M236 432 L 240 350" stroke="${tom(susp, -0.35)}" stroke-width="12" stroke-linecap="round"/>
      <path d="M164 432 L 160 350 M236 432 L 240 350" stroke="${susp}" stroke-width="8" stroke-linecap="round"/>
      <path d="M116 426 C 160 440, 240 440, 284 426 C 296 446, 306 466, 308 484 L 214 488 L 200 458 L 186 488 L 92 484 C 94 466, 104 446, 116 426 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      ${bolas.map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${cores[i % cores.length]}" stroke="${contorno(c)}" stroke-width="1"/>`).join('')}
      <path d="M116 426 C 160 440, 240 440, 284 426 L 285 434 C 240 448, 160 448, 115 434 Z" fill="${tom(c, -0.15)}"/>
      <circle cx="164" cy="434" r="6" fill="#ffca28" stroke="#b8860b" stroke-width="1.5"/><circle cx="236" cy="434" r="6" fill="#ffca28" stroke="#b8860b" stroke-width="1.5"/>` };
  } },
  { id: 'jardineira', nome: 'Jardineira', icone: '🌼', camadas: (c) => {
    const alca = 'M172 378 L 160 352';
    return { baixo: `
      <path d="${alca} ${espelhar(alca)}" stroke="${contorno(c)}" stroke-width="13" stroke-linecap="round"/>
      <path d="${alca} ${espelhar(alca)}" stroke="${c}" stroke-width="9" stroke-linecap="round"/>
      <path d="M166 374 L 234 374 L 238 432 L 162 432 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M120 428 C 160 438, 240 438, 280 428 L 290 476 L 212 480 L 200 450 L 188 480 L 110 476 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M182 388 L 218 388 L 216 414 L 184 414 Z" fill="${tom(c, -0.12)}" stroke="${contorno(c)}" stroke-width="2"/>
      <path d="M170 380 L 230 380 L 233 428 L 167 428 Z M114 470 L 188 474 M286 470 L 212 474" fill="none" stroke="${tom(c, 0.4)}" stroke-width="1.5" stroke-dasharray="4 4"/>
      <g transform="translate(200 401)">${[0, 60, 120, 180, 240, 300].map(a => `<ellipse rx="3.6" ry="5.5" cy="-5" transform="rotate(${a})" fill="#fff"/>`).join('')}<circle r="3.4" fill="#fdd835"/></g>
      <circle cx="172" cy="380" r="5" fill="#ffca28" stroke="#b8860b" stroke-width="1.5"/><circle cx="228" cy="380" r="5" fill="#ffca28" stroke="#b8860b" stroke-width="1.5"/>` };
  } },
]);
  PECAS.pes.push(...[
  { id: 'galochas', nome: 'Galochas', icone: '☔', camadas: (c) => {
    const bota = 'M114 486 C 106 476, 110 450, 117 428 L 179 428 C 186 450, 192 474, 186 486 Z';
    const borda = 'M113 420 L 183 420 L 181 436 L 115 436 Z';
    const bico = 'M112 478 C 130 468, 168 468, 188 478';
    const sola = 'M108 482 L 192 482 L 192 490 C 150 496, 118 496, 108 490 Z';
    const brilho = 'M180 446 L 183 470';
    const um = (b, o, s, l, k) => `<path d="${b}" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/><path d="${o}" fill="${tom(c, 0.35)}" stroke="${contorno(c)}" stroke-width="2.5"/><path d="${k}" fill="none" stroke="${contorno(c)}" stroke-width="2" opacity=".7"/><path d="${s}" fill="${contorno(c)}"/><path d="${l}" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>`;
    const gota = (x) => `<path transform="translate(${x} 462)" d="M0 -9 C 4 -3, 7 1, 7 4 C 7 9, -7 9, -7 4 C -7 1, -4 -3, 0 -9 Z" fill="#4fc3f7" stroke="#fff" stroke-width="2"/>`;
    return { pes: um(bota, borda, sola, brilho, bico) + um(espelhar(bota), espelhar(borda), espelhar(sola), espelhar(brilho), espelhar(bico)) + gota(124) + gota(276) };
  } },
  { id: 'chinelo', nome: 'Chinelo', icone: '🩴', camadas: (c) => {
    const sola = 'M110 484 C 110 474, 186 474, 186 484 C 186 494, 110 494, 110 484 Z';
    const tira = 'M120 481 Q 134 468 146 466 Q 160 468 176 481';
    const um = (s, t, x) => `<path d="${s}" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/><path d="${t}" fill="none" stroke="${contorno(c)}" stroke-width="8" stroke-linecap="round"/><path d="${t}" fill="none" stroke="${tom(c, 0.45)}" stroke-width="4" stroke-linecap="round"/><circle cx="${x}" cy="466" r="6" fill="#fff" stroke="${contorno(c)}" stroke-width="2"/><circle cx="${x}" cy="466" r="2.5" fill="#fdd835"/>`;
    return { pes: um(sola, tira, 146) + um(espelhar(sola), espelhar(tira), 254) };
  } },
  { id: 'pantufas-coelho', nome: 'Pantufas de coelhinho', icone: '🐰', camadas: (c) => {
    const corpo = 'M110 480 C 106 456, 134 450, 148 450 C 162 450, 190 456, 186 480 C 182 492, 114 492, 110 480 Z';
    const orelha = (x, r) => `<ellipse cx="${x}" cy="446" rx="7.5" ry="17" transform="rotate(${r} ${x} 456)" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/><ellipse cx="${x}" cy="447" rx="3.2" ry="11" transform="rotate(${r} ${x} 456)" fill="#f8bbd0"/>`;
    const rosto = (x) => `<circle cx="${x - 10}" cy="470" r="3.2" fill="#2b2b2b"/><circle cx="${x + 10}" cy="470" r="3.2" fill="#2b2b2b"/><path d="M${x - 4} 476 L ${x + 4} 476 L ${x} 480 Z" fill="#f06292"/><ellipse cx="${x - 18}" cy="478" rx="5" ry="3" fill="#ff8fab" opacity=".6"/><ellipse cx="${x + 18}" cy="478" rx="5" ry="3" fill="#ff8fab" opacity=".6"/>`;
    const um = (d, x, s) => orelha(x - 26, -38 * s) + orelha(x + 26, 38 * s) + `<path d="${d}" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/><path d="${d}" fill="#fff" opacity=".18"/>` + rosto(x);
    return { pes: um(corpo, 148, 1) + um(espelhar(corpo), 252, 1) };
  } },
  { id: 'patins', nome: 'Patins', icone: '🛼', camadas: (c) => {
    const bota = 'M114 476 C 112 446, 120 436, 148 436 C 176 436, 184 446, 182 476 Z';
    const base = 'M108 474 L 188 474 L 188 482 L 108 482 Z';
    const um = (b, s, x) => `<path d="${b}" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/><path d="M${x - 14} 450 L ${x + 14} 456 M${x - 14} 460 L ${x + 14} 466 M${x + 14} 450 L ${x - 14} 456" stroke="${(c === '#f5f5f5' || c === '#fdd835' ? contorno(c) : '#fff')}" stroke-width="3" stroke-linecap="round"/><path d="${s}" fill="#9e9e9e" stroke="#616161" stroke-width="2"/>` +
      [x - 26, x + 26].map(w => `<circle cx="${w}" cy="489" r="8" fill="#fdd835" stroke="#c99400" stroke-width="2"/><circle cx="${w}" cy="489" r="2.5" fill="#fff"/>`).join('');
    return { pes: um(bota, base, 148) + um(espelhar(bota), espelhar(base), 252) };
  } },
  { id: 'tenis-luzinha', nome: 'Tênis de luzinha', icone: '✨', camadas: (c) => {
    const corpo = 'M112 476 C 110 456, 136 450, 152 452 C 174 452, 188 462, 186 478 Z';
    const sola = 'M110 476 L 188 476 L 188 487 C 150 493, 118 493, 110 487 Z';
    const luzes = ['#ff5252', '#ffeb3b', '#69f0ae', '#40c4ff', '#e040fb'];
    const um = (d, s, x) => `<path d="${d}" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/><path d="${s}" fill="#fff" stroke="#c9c9c9" stroke-width="2"/>` +
      luzes.map((l, i) => `<circle cx="${x - 28 + i * 14}" cy="483" r="6" fill="${l}" opacity=".35"/><circle cx="${x - 28 + i * 14}" cy="483" r="3.2" fill="${l}"/>`).join('') +
      `<path d="M${x - 10} 458 L ${x + 14} 458 M${x - 8} 466 L ${x + 16} 466" stroke="${(c === '#f5f5f5' || c === '#fdd835' ? contorno(c) : '#fff')}" stroke-width="3" stroke-linecap="round"/>`;
    return { pes: um(corpo, sola, 148) + um(espelhar(corpo), espelhar(sola), 252) };
  } },
  { id: 'sapato-social', nome: 'Sapato social', icone: '👞', camadas: (c) => {
    const corpo = 'M110 482 C 108 462, 132 456, 150 456 C 170 456, 190 464, 188 482 Z';
    const sola = 'M108 480 L 190 480 L 190 488 C 150 492, 118 492, 108 488 Z';
    const linha = 'M126 470 Q 148 462 172 470';
    const brilho = 'M122 468 Q 128 462 136 461';
    const um = (d, s, l, b) => `<path d="${d}" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/><path d="${l}" fill="none" stroke="${contorno(c)}" stroke-width="2" stroke-dasharray="3 3"/><path d="${b}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/><path d="${s}" fill="#3e2723"/>`;
    return { pes: um(corpo, sola, linha, brilho) + um(espelhar(corpo), espelhar(sola), espelhar(linha), espelhar(brilho)) };
  } },
  { id: 'chuteira', nome: 'Chuteira', icone: '⚽', camadas: (c) => {
    const corpo = 'M112 478 C 110 456, 136 450, 152 452 C 174 452, 188 462, 186 478 Z';
    const sola = 'M110 476 L 188 476 L 188 484 L 110 484 Z';
    const faixas = 'M126 458 L 120 474 M136 456 L 130 474 M146 455 L 140 474';
    const travas = 'M116 484 L 122 484 L 121 491 L 117 491 Z M134 484 L 140 484 L 139 491 L 135 491 Z M158 484 L 164 484 L 163 491 L 159 491 Z M176 484 L 182 484 L 181 491 L 177 491 Z';
    const um = (d, s, f, t) => `<path d="${d}" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/><path d="${f}" stroke="${(c === '#f5f5f5' || c === '#fdd835' ? contorno(c) : '#fff')}" stroke-width="3.5" stroke-linecap="round"/><path d="${s}" fill="#2b2b2b"/><path d="${t}" fill="#9e9e9e" stroke="#555" stroke-width="1"/>`;
    return { pes: um(corpo, sola, faixas, travas) + um(espelhar(corpo), espelhar(sola), espelhar(faixas), espelhar(travas)) };
  } },
  { id: 'meias-listradas', nome: 'Meias listradas', icone: '🧦', camadas: (c) => {
    const listra = c === '#f5f5f5' ? '#e53935' : '#fff';
    // meia cobrindo a patinha (elipse em 148,472) e subindo por trás do braço
    const meia = (cx) => {
      const corpo = `<path d="M${cx - 30} 470 L ${cx - 30} 430 L ${cx + 30} 430 L ${cx + 30} 470 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/><rect x="${cx - 32}" y="424" width="64" height="12" rx="5" fill="${tom(c, -0.15)}" stroke="${contorno(c)}" stroke-width="2"/><ellipse cx="${cx}" cy="473" rx="38" ry="20" fill="${c}" stroke="${contorno(c)}" stroke-width="2.5"/>`;
      const faixas = [446, 458, 470, 482].map(y => {
        const dy = (y - 473) / 20, m = dy * dy < 1 ? 38 * Math.sqrt(1 - dy * dy) : 0;
        const w = y < 462 ? Math.max(30, m) : m;
        return w > 4 ? `<path d="M${cx - w + 2} ${y} L ${cx + w - 2} ${y}" stroke="${listra}" stroke-width="6"/>` : '';
      }).join('');
      return corpo + faixas;
    };
    return { pes: meia(148) + meia(252) };
  } },
  { id: 'botas-astronauta', nome: 'Botas de astronauta', icone: '🚀', camadas: (c) => {
    const bota = 'M112 486 C 102 470, 110 446, 116 426 L 180 426 C 186 446, 196 470, 188 486 Z';
    const faixa = 'M113 440 L 183 440 L 185 452 L 111 452 Z';
    const sola = 'M106 480 L 194 480 L 194 492 C 150 497, 118 497, 106 492 Z';
    const a = c === '#f5f5f5' ? '#78909c' : c;
    const um = (b, f, s) => `<path d="${b}" fill="#eceff1" stroke="#90a4ae" stroke-width="2.5"/><path d="${f}" fill="${a}" stroke="${contorno(a)}" stroke-width="2"/><path d="${s}" fill="${tom(a, -0.2)}" stroke="${contorno(a)}" stroke-width="2"/>`;
    return { pes: um(bota, faixa, sola) + um(espelhar(bota), espelhar(faixa), espelhar(sola)) + `<path d="M116 470 C 136 464, 164 464, 184 470 M216 470 C 236 464, 264 464, 284 470" stroke="#b0bec5" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M118 487 L 118 493 M134 488 L 134 494 M150 488 L 150 494 M166 488 L 166 494 M182 487 L 182 493 M218 487 L 218 493 M234 488 L 234 494 M250 488 L 250 494 M266 488 L 266 494 M282 487 L 282 493" stroke="${contorno(a)}" stroke-width="2.5"/>` };
  } },
]);
  PECAS.costas.push(...[
  { id: 'asas-anjo', nome: 'Asas de anjo', icone: '😇', camadas: (c) => {
    const asa = 'M152 372 C 120 320 70 266 20 242 C 6 290 14 342 32 364 Q 18 384 44 394 Q 34 414 62 418 Q 60 440 90 432 Q 98 450 122 438 Q 138 446 152 420 Z';
    const pena = 'M36 296 Q 80 320 140 372 M40 340 Q 90 360 142 392 M66 392 Q 110 400 146 408';
    return { costas: [asa, espelhar(asa)].map(d => `<path d="${d}" fill="${tom(c, 0.35)}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>`).join('')
      + [pena, espelhar(pena)].map(d => `<path d="${d}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`).join('')
      + `<ellipse cx="60" cy="296" rx="16" ry="7" transform="rotate(30 60 296)" fill="#fff" opacity=".5"/>` };
  } },
  { id: 'asas-morcego', nome: 'Asas de morcego', icone: '🦇', camadas: (c) => {
    const asa = 'M152 372 C 116 320 76 282 28 252 L 36 302 Q 14 316 8 352 Q 44 342 58 380 Q 78 362 102 402 Q 124 386 152 418 Z';
    const osso = 'M150 376 L 30 256 M150 380 L 36 302 L 10 350 M150 384 L 58 378 M150 390 L 102 400';
    return { costas: [asa, espelhar(asa)].map(d => `<path d="${d}" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>`).join('')
      + [osso, espelhar(osso)].map(d => `<path d="${d}" fill="none" stroke="${contorno(c)}" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>`).join('')
      + `<circle cx="30" cy="254" r="4" fill="${contorno(c)}"/><circle cx="370" cy="254" r="4" fill="${contorno(c)}"/>` };
  } },
  { id: 'asas-borboleta', nome: 'Asas de borboleta', icone: '🦋', camadas: (c) => {
    const cima = 'M160 384 C 110 300 30 252 18 312 C 8 364 90 392 160 392 Z';
    const baixo = 'M160 398 C 110 396 44 418 58 458 C 72 492 140 462 160 408 Z';
    const desenha = (d) => `<path d="${d}" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>`;
    const pintas = (x, s) => `<circle cx="${x(52)}" cy="318" r="16" fill="#fff" opacity=".85"/><circle cx="${x(52)}" cy="318" r="8" fill="${contorno(c)}"/>
      <circle cx="${x(82)}" cy="352" r="9" fill="#fdd835" stroke="${contorno(c)}" stroke-width="2"/><circle cx="${x(84)}" cy="444" r="11" fill="#fff" opacity=".85"/><circle cx="${x(84)}" cy="444" r="5" fill="${contorno(c)}"/>`;
    return { costas: [cima, baixo, espelhar(cima), espelhar(baixo)].map(desenha).join('') + pintas(x => x) + pintas(x => 400 - x) };
  } },
  { id: 'mochila-jato', nome: 'Mochila a jato', icone: '🚀', camadas: (c) => {
    const tanque = (x) => `<path d="M${x - 22} 448 L ${x - 14} 470 L ${x + 14} 470 L ${x + 22} 448 Z" fill="#9e9e9e" stroke="#555" stroke-width="2.5"/>
      <path d="M${x - 14} 470 Q ${x - 18} 488 ${x} 500 Q ${x + 18} 488 ${x + 14} 470 Z" fill="#ff9800"/><path d="M${x - 7} 470 Q ${x - 8} 482 ${x} 490 Q ${x + 8} 482 ${x + 7} 470 Z" fill="#ffeb3b"/>
      <rect x="${x - 24}" y="336" width="48" height="114" rx="22" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
      <rect x="${x - 24}" y="372" width="48" height="10" fill="${contorno(c)}" opacity=".6"/><ellipse cx="${x - 9}" cy="356" rx="6" ry="14" fill="#fff" opacity=".35"/>`;
    return { costas: tanque(92) + tanque(308) + `<rect x="100" y="380" width="200" height="40" fill="#9e9e9e" stroke="#555" stroke-width="2.5"/>`, pescoco: `
      <path d="M150 346 C 140 380 140 410 148 436 M250 346 C 260 380 260 410 252 436" stroke="#555" stroke-width="9" fill="none" stroke-linecap="round"/>` };
  } },
  { id: 'aljava', nome: 'Aljava com flechas', icone: '🏹', camadas: (c) => ({ costas: `
    <g transform="rotate(-24 100 400)">
      <g stroke="#6d4c41" stroke-width="4"><path d="M86 330 L 86 250 M100 330 L 100 240 M114 330 L 114 254"/></g>
      <g fill="#fff" stroke="#9e9e9e" stroke-width="1.5"><path d="M86 266 L 76 252 L 76 236 L 86 250 L 96 236 L 96 252 Z"/><path d="M100 256 L 90 242 L 90 226 L 100 240 L 110 226 L 110 242 Z"/><path d="M114 270 L 104 256 L 104 240 L 114 254 L 124 240 L 124 256 Z"/></g>
      <rect x="74" y="300" width="52" height="170" rx="16" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
      <rect x="72" y="300" width="56" height="16" rx="6" fill="#8d6e63" stroke="#5d4037" stroke-width="2"/>
      <path d="M100 340 L 108 354 L 100 368 L 92 354 Z" fill="#fdd835" stroke="${contorno(c)}" stroke-width="2"/>
    </g>`, pescoco: `
    <path d="M148 346 L 236 452" stroke="#6d4c41" stroke-width="9" stroke-linecap="round"/>` }) },
  { id: 'violao', nome: 'Violão', icone: '🎸', camadas: (c) => ({ costas: `
    <g transform="rotate(-16 90 400)">
      <rect x="80" y="210" width="20" height="170" fill="#8d6e63" stroke="#5d4037" stroke-width="2.5"/>
      <rect x="76" y="186" width="28" height="34" rx="6" fill="#5d4037"/>
      <g fill="#ddd"><circle cx="74" cy="194" r="4"/><circle cx="74" cy="210" r="4"/><circle cx="106" cy="194" r="4"/><circle cx="106" cy="210" r="4"/></g>
      <path d="M90 330 C 50 330 52 372 64 384 C 34 400 40 470 90 470 C 140 470 146 400 116 384 C 128 372 130 330 90 330 Z" fill="${c}" stroke="${contorno(c)}" stroke-width="3"/>
      <circle cx="90" cy="400" r="14" fill="#3e2723"/>
      <rect x="74" y="438" width="32" height="8" rx="3" fill="#5d4037"/>
      <path d="M86 220 L 86 440 M94 220 L 94 440" stroke="#eee" stroke-width="1.2"/>
    </g>` }) },
  { id: 'baloes', nome: 'Balões', icone: '🎈', camadas: (c) => {
    const balao = (x, y, cor) => `<path d="M${x} ${y + 34} L ${x - 5} ${y + 42} L ${x + 5} ${y + 42} Z" fill="${tom(cor, -0.2)}"/>
      <ellipse cx="${x}" cy="${y}" rx="28" ry="34" fill="${cor}" stroke="${contorno(cor)}" stroke-width="2.5"/><ellipse cx="${x - 10}" cy="${y - 12}" rx="7" ry="11" fill="#fff" opacity=".5"/>`;
    return { costas: `<g fill="none" stroke="#777" stroke-width="2"><path d="M130 400 Q 40 300 40 226 M140 400 Q 60 220 36 140 M270 400 Q 380 300 362 196"/></g>`
      + balao(40, 190, c) + balao(36, 106, c === '#fdd835' ? '#f06292' : '#fdd835') + balao(362, 160, c === '#43a047' ? '#1e88e5' : '#43a047') };
  } },
  { id: 'espinhos-dino', nome: 'Espinhos de dinossauro', icone: '🦖', camadas: (c) => {
    const esp = (d) => `<path d="${d}" fill="${c}" stroke="${contorno(c)}" stroke-width="3" stroke-linejoin="round"/>`;
    const lado = ['M122 344 L 80 318 L 112 368 Z', 'M110 380 L 66 366 L 106 414 Z', 'M106 422 L 64 416 L 108 456 Z'];
    return { costas: esp('M168 112 Q 168 76 200 34 Q 232 76 232 112 Z') + esp('M150 118 Q 148 92 166 64 Q 184 92 188 112 Z') + esp('M250 118 Q 252 92 234 64 Q 216 92 212 112 Z')
      + lado.map(esp).join('') + lado.map(d => esp(espelhar(d))).join('') + `<path d="M200 50 L 200 96 M166 78 L 168 108 M234 78 L 232 108" stroke="${tom(c, 0.45)}" stroke-width="3" stroke-linecap="round" opacity=".7"/>` };
  } },
]);

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
    // guarda a rolagem para a lista não pular para o começo a cada toque
    const rolagemAntes = painel.querySelector('.gr-rolagem');
    const posicao = rolagemAntes && rolagemAntes.dataset.cat === categoria ? rolagemAntes.scrollTop : 0;
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
      ${escolha ? `<div class="gr-cores" aria-label="Cor">${CORES.map(([c, n]) => `<button data-cor="${c}" style="background:${c}" aria-label="${n}" aria-pressed="${escolha.cor === c}"></button>`).join('')}</div>
        ${categoria === 'blusa' ? `<div class="gr-estampas" aria-label="Estampa">${ESTAMPAS.map(e => `<button data-estampa="${e.id}" aria-pressed="${(escolha.estampa || 'lisa') === e.id}" aria-label="Estampa ${e.nome}"><span>${e.icone}</span><small>${e.nome}</small></button>`).join('')}</div>` : ''}` : ''}
      <div class="gr-rolagem" data-cat="${categoria}">
        <div class="gr-pecas">
          <button data-peca="" aria-pressed="${!escolha}"><span>🚫</span><small>Nenhum</small></button>
          ${pecas.map(p => `<button data-peca="${p.id}" aria-pressed="${escolha?.id === p.id}"><span>${p.icone}</span><small>${p.nome}</small></button>`).join('')}
        </div>
      </div>`;
    painel.querySelector('.gr-rolagem').scrollTop = posicao;
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
  // o Miguel vestido, separado em partes (para animar como um bonequinho nos jogos)
  // cada parte é uma imagem 400 x 500, no mesmo lugar do desenho inteiro
  const GRUPO_DA_PARTE = {
    'sombra-chao': null, 'mao-orelha': null, 'maos-orar': null, 'roupa-costas': 'costas', rabo: 'rabo',
    'patas-tras': 'patas', 'patas-tras-dedos': 'patas', 'roupa-pes': 'patas',
    'braco-e': 'bracoE', 'braco-d': 'bracoD', 'roupa-mangas': 'mangas', cabeca: 'cabeca',
  };
  const PARTES = {
    costas: { grupos: ['costas'] }, rabo: { grupos: ['rabo'] }, corpo: { grupos: ['corpo'] },
    pataE: { grupos: ['patas'], lado: 'e' }, pataD: { grupos: ['patas'], lado: 'd' },
    bracoE: { grupos: ['bracoE', 'mangas'], lado: 'e' }, bracoD: { grupos: ['bracoD', 'mangas'], lado: 'd' },
    cabeca: { grupos: ['cabeca'] }, piscando: { grupos: ['cabeca'], piscar: true },
  };
  function partesMiguel() {
    const original = document.getElementById('gato');
    const partes = {};
    for (const [nome, cfg] of Object.entries(PARTES)) {
      const copia = original.cloneNode(true);
      copia.removeAttribute('class');
      copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      copia.setAttribute('width', '400');
      copia.setAttribute('height', '500');
      copia.querySelector('#boca-aberta')?.remove();
      copia.querySelector(cfg.piscar ? '.olho-aberto' : '.olho-fechado')?.remove();
      vestir(copia);
      const corpoTodo = copia.querySelector('#corpo-todo');
      corpoTodo.removeAttribute('style');
      for (const filho of [...corpoTodo.children]) {
        const grupo = filho.id in GRUPO_DA_PARTE ? GRUPO_DA_PARTE[filho.id] : 'corpo';
        if (!cfg.grupos.includes(grupo)) filho.remove();
      }
      if (cfg.lado) {
        const ns = 'http://www.w3.org/2000/svg';
        const clip = document.createElementNS(ns, 'clipPath');
        clip.id = 'lado-' + cfg.lado;
        clip.innerHTML = cfg.lado === 'e' ? '<rect x="0" y="0" width="200" height="500"/>' : '<rect x="200" y="0" width="200" height="500"/>';
        copia.querySelector('defs').appendChild(clip);
        corpoTodo.setAttribute('clip-path', `url(#lado-${cfg.lado})`);
      }
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(copia));
      partes[nome] = img;
    }
    return partes;
  }

  // para testar peças novas sem salvar (usado pelos testes automáticos)
  const _teste = { PECAS, tom, contorno, espelhar, provar(cat, id, cor, est) {
    const antes = roupa[cat]; roupa[cat] = id ? { id, cor, estampa: est } : null; vestir(document.getElementById('gato')); roupa[cat] = antes;
  } };

  M.roupas = { abrir, vestir, imagemMiguel, partesMiguel, atual: () => roupa, tom, _teste };
})();
