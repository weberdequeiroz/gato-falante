// Música: instrumentos para explorar todas as notas, músicas para aprender, gravar a própria música
// e um jogo de memória musical. Todos os sons são criados na hora (Web Audio), sem arquivos de áudio.
(() => {
  const M = window.Miguel;
  const NOMES = ['Dó', 'Dó♯', 'Ré', 'Ré♯', 'Mi', 'Fá', 'Fá♯', 'Sol', 'Sol♯', 'Lá', 'Lá♯', 'Si'];
  const FALADO = ['dó', 'dó sustenido', 'ré', 'ré sustenido', 'mi', 'fá', 'fá sustenido', 'sol', 'sol sustenido', 'lá', 'lá sustenido', 'si'];
  const CORES = ['#e53935', '#e53935', '#fb8c00', '#fb8c00', '#f2b705', '#43a047', '#43a047', '#00a5bd', '#00a5bd', '#5e35b1', '#5e35b1', '#d81b60'];
  const PRETAS = [1, 3, 6, 8, 10];
  const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const nomeNota = (m) => NOMES[m % 12];
  const oitavaDe = (m) => Math.floor(m / 12) - 1;

  // ---------- sintetizador ----------
  let mestre = null, ruido = null;
  function audio() {
    const ac = M.obterContexto();
    if (!mestre) {
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      mestre = ac.createGain();
      mestre.connect(comp);
      comp.connect(ac.destination);
      ruido = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = ruido.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    mestre.gain.value = M.calmo ? 0.45 : 0.8;
    return ac;
  }
  function envelope(g, t, ataque, pico, duracao) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(pico, t + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + ataque + duracao);
  }
  function osc(ac, tipo, f, t, fim, destino) {
    const o = ac.createOscillator();
    o.type = tipo;
    o.frequency.value = f;
    o.connect(destino);
    o.start(t);
    o.stop(fim);
    return o;
  }
  function ganho(ac, destino) {
    const g = ac.createGain();
    g.connect(destino);
    return g;
  }
  function filtro(ac, tipo, f, destino, q = 1) {
    const b = ac.createBiquadFilter();
    b.type = tipo;
    b.frequency.value = f;
    b.Q.value = q;
    b.connect(destino);
    return b;
  }
  function vibrato(ac, alvo, f, t, fim, profundidade) {
    const lfo = ac.createOscillator();
    lfo.frequency.value = 5.5;
    const g = ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(f * profundidade, t + 0.25);
    lfo.connect(g);
    g.connect(alvo.frequency);
    lfo.start(t);
    lfo.stop(fim);
  }
  function ruidoCurto(ac, t, duracao, destino, pico = 0.8) {
    const s = ac.createBufferSource();
    s.buffer = ruido;
    const g = ganho(ac, destino);
    envelope(g, t, 0.002, pico, duracao);
    s.connect(g);
    s.start(t);
    s.stop(t + duracao + 0.05);
  }
  // corda dedilhada (Karplus-Strong): parece um violão de verdade
  const cordas = {};
  function corda(ac, m) {
    if (cordas[m]) return cordas[m];
    const sr = ac.sampleRate, N = Math.round(sr / freq(m)), tam = Math.round(sr * 1.8);
    const b = ac.createBuffer(1, tam, sr), y = b.getChannelData(0);
    for (let i = 0; i < N; i++) y[i] = Math.random() * 2 - 1;
    for (let i = N; i < tam; i++) y[i] = 0.497 * (y[i - N] + y[i - N - 1]);
    return (cordas[m] = b);
  }

  const INSTRUMENTOS = [
    { id: 'piano', nome: 'Piano', simbolo: '🎹', cor: '#5b6cff', oitava: 4, tocar(ac, m, t) {
      const f = freq(m), d = Math.max(0.6, 1.8 - (m - 48) * 0.025);
      const lp = filtro(ac, 'lowpass', Math.min(8000, f * 8), mestre);
      const g = ganho(ac, lp); envelope(g, t, 0.006, 0.45, d);
      osc(ac, 'triangle', f, t, t + d + 0.1, g);
      const g2 = ganho(ac, lp); envelope(g2, t, 0.004, 0.12, d * 0.5);
      osc(ac, 'sine', f * 2, t, t + d, g2);
    } },
    { id: 'xilofone', nome: 'Xilofone', simbolo: '🪘', cor: '#ff7a1a', oitava: 5, tocar(ac, m, t) {
      const f = freq(m);
      const g = ganho(ac, mestre); envelope(g, t, 0.002, 0.5, 0.7);
      osc(ac, 'sine', f, t, t + 0.8, g);
      const g2 = ganho(ac, mestre); envelope(g2, t, 0.001, 0.18, 0.12);
      osc(ac, 'sine', f * 4, t, t + 0.2, g2);
    } },
    { id: 'violao', nome: 'Violão', simbolo: '🎸', cor: '#b5651d', oitava: 3, tocar(ac, m, t) {
      const s = ac.createBufferSource();
      s.buffer = corda(ac, m);
      const g = ganho(ac, filtro(ac, 'lowpass', 4500, mestre)); g.gain.value = 0.9;
      s.connect(g);
      s.start(t);
    } },
    { id: 'flauta', nome: 'Flauta', simbolo: '🪈', cor: '#2bb3a3', oitava: 5, tocar(ac, m, t) {
      const f = freq(m), fim = t + 1.1;
      const g = ganho(ac, mestre);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.32, t + 0.08);
      g.gain.setValueAtTime(0.32, t + 0.75);
      g.gain.exponentialRampToValueAtTime(0.0001, fim);
      const o = osc(ac, 'sine', f, t, fim, g);
      vibrato(ac, o, f, t, fim, 0.008);
      const g2 = ganho(ac, g); g2.gain.value = 0.15;
      osc(ac, 'triangle', f * 2, t, fim, g2);
      ruidoCurto(ac, t, 0.12, filtro(ac, 'bandpass', f * 2, mestre, 2), 0.08);
    } },
    { id: 'violino', nome: 'Violino', simbolo: '🎻', cor: '#a8326b', oitava: 4, tocar(ac, m, t) {
      const f = freq(m), fim = t + 1.2;
      const lp = filtro(ac, 'lowpass', 3200, mestre);
      const g = ganho(ac, lp);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.12);
      g.gain.setValueAtTime(0.2, t + 0.85);
      g.gain.exponentialRampToValueAtTime(0.0001, fim);
      const o = osc(ac, 'sawtooth', f, t, fim, g);
      vibrato(ac, o, f, t, fim, 0.01);
    } },
    { id: 'trompete', nome: 'Trompete', simbolo: '🎺', cor: '#e0a800', oitava: 4, tocar(ac, m, t) {
      const f = freq(m), fim = t + 0.8;
      const lp = filtro(ac, 'lowpass', 900, mestre, 2);
      lp.frequency.setValueAtTime(900, t);
      lp.frequency.exponentialRampToValueAtTime(3500, t + 0.06);
      lp.frequency.exponentialRampToValueAtTime(1800, fim);
      const g = ganho(ac, lp);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.28, t + 0.04);
      g.gain.setValueAtTime(0.25, t + 0.55);
      g.gain.exponentialRampToValueAtTime(0.0001, fim);
      osc(ac, 'sawtooth', f, t, fim, g);
    } },
    { id: 'sininhos', nome: 'Sininhos', simbolo: '🔔', cor: '#d4a017', oitava: 5, tocar(ac, m, t) {
      const f = freq(m);
      [[1, 0.35, 2.4], [2.76, 0.16, 1.4], [5.4, 0.08, 0.8], [8.93, 0.04, 0.4]].forEach(([r, a, d]) => {
        const g = ganho(ac, mestre); envelope(g, t, 0.002, a, d);
        osc(ac, 'sine', f * r, t, t + d + 0.1, g);
      });
    } },
    { id: 'caixinha', nome: 'Caixinha de música', simbolo: '🎁', cor: '#e66fb0', oitava: 5, tocar(ac, m, t) {
      const f = freq(m);
      const g = ganho(ac, mestre); envelope(g, t, 0.002, 0.35, 1.3);
      osc(ac, 'sine', f, t, t + 1.4, g);
      const g2 = ganho(ac, mestre); envelope(g2, t, 0.002, 0.1, 0.4);
      osc(ac, 'sine', f * 3, t, t + 0.5, g2);
    } },
    { id: 'bateria', nome: 'Bateria', simbolo: '🥁', cor: '#3c4a5c', bateria: true },
  ];
  const instrumento = (id) => INSTRUMENTOS.find(i => i.id === id);

  const PECAS = [
    { id: 'bumbo', nome: 'Bumbo', simbolo: '🥁', cor: '#e53935', tocar(ac, t) {
      const g = ganho(ac, mestre); envelope(g, t, 0.002, 1, 0.45);
      const o = osc(ac, 'sine', 150, t, t + 0.5, g);
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.15);
    } },
    { id: 'caixa', nome: 'Caixa', simbolo: '🪘', cor: '#fb8c00', tocar(ac, t) {
      ruidoCurto(ac, t, 0.2, filtro(ac, 'highpass', 1200, mestre), 0.6);
      const g = ganho(ac, mestre); envelope(g, t, 0.002, 0.4, 0.1);
      osc(ac, 'triangle', 190, t, t + 0.15, g);
    } },
    { id: 'chimbal', nome: 'Chimbal', simbolo: '✨', cor: '#f2b705', tocar(ac, t) { ruidoCurto(ac, t, 0.06, filtro(ac, 'highpass', 7500, mestre), 0.5); } },
    { id: 'prato', nome: 'Prato', simbolo: '💫', cor: '#43a047', tocar(ac, t) { ruidoCurto(ac, t, 1.3, filtro(ac, 'highpass', 5000, mestre), 0.45); } },
    { id: 'tom', nome: 'Tambor', simbolo: '🛢️', cor: '#00a5bd', tocar(ac, t) {
      const g = ganho(ac, mestre); envelope(g, t, 0.002, 0.8, 0.35);
      const o = osc(ac, 'sine', 230, t, t + 0.4, g);
      o.frequency.exponentialRampToValueAtTime(110, t + 0.3);
    } },
    { id: 'palmas', nome: 'Palmas', simbolo: '👏', cor: '#5e35b1', tocar(ac, t) {
      const bp = filtro(ac, 'bandpass', 1300, mestre, 1.5);
      [0, 0.012, 0.024].forEach(d => ruidoCurto(ac, t + d, 0.04, bp, 0.9));
      ruidoCurto(ac, t + 0.036, 0.15, bp, 0.5);
    } },
    { id: 'chocalho', nome: 'Chocalho', simbolo: '🪇', cor: '#d81b60', tocar(ac, t) {
      const g = ganho(ac, filtro(ac, 'bandpass', 6500, mestre, 1));
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.7, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      const s = ac.createBufferSource(); s.buffer = ruido; s.connect(g); s.start(t); s.stop(t + 0.2);
    } },
    { id: 'triangulo', nome: 'Triângulo', simbolo: '🔺', cor: '#8d6e63', tocar(ac, t) {
      [[1250, 0.18, 1.6], [3420, 0.08, 1.0], [5100, 0.05, 0.6]].forEach(([f, a, d]) => {
        const g = ganho(ac, mestre); envelope(g, t, 0.002, a, d);
        osc(ac, 'sine', f, t, t + d + 0.1, g);
      });
    } },
  ];

  function tocarNotaInst(instId, m, quando = 0) {
    const ac = audio();
    const t = ac.currentTime + quando + 0.005;
    if (instId === 'bateria') PECAS.find(p => p.id === m)?.tocar(ac, t);
    else instrumento(instId).tocar(ac, m, t);
  }

  // ---------- músicas (notação: NOTA[:batidas], R = pausa) ----------
  const MUSICAS = [
    { nome: 'Brilha, brilha, estrelinha', simbolo: '⭐', bpm: 100, notas: 'C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2 G4 G4 F4 F4 E4 E4 D4:2 G4 G4 F4 F4 E4 E4 D4:2 C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2' },
    { nome: 'Parabéns a você', simbolo: '🎂', bpm: 100, notas: 'G4:0.75 G4:0.25 A4 G4 C5 B4:2 G4:0.75 G4:0.25 A4 G4 D5 C5:2 G4:0.75 G4:0.25 G5 E5 C5 B4 A4:2 F5:0.75 F5:0.25 E5 C5 D5 C5:2' },
    { nome: 'Escadinha: Dó, Ré, Mi...', simbolo: '🪜', bpm: 110, notas: 'C4 D4 E4 F4 G4 A4 B4 C5:2 C5 B4 A4 G4 F4 E4 D4 C4:2' },
    { nome: 'Maria tinha um carneirinho', simbolo: '🐑', bpm: 110, notas: 'E4 D4 C4 D4 E4 E4 E4:2 D4 D4 D4:2 E4 G4 G4:2 E4 D4 C4 D4 E4 E4 E4 E4 D4 D4 E4 D4 C4:4' },
    { nome: 'Pãozinho quente', simbolo: '🥐', bpm: 100, notas: 'E4 D4 C4:2 E4 D4 C4:2 C4:0.5 C4:0.5 C4:0.5 C4:0.5 D4:0.5 D4:0.5 D4:0.5 D4:0.5 E4 D4 C4:2' },
    { nome: 'Seu Lobato tinha um sítio', simbolo: '🐮', bpm: 120, notas: 'G4 G4 G4 D4 E4 E4 D4:2 B4 B4 A4 A4 G4:3 D4 G4 G4 G4 D4 E4 E4 D4:2 B4 B4 A4 A4 G4:3' },
    { nome: 'Rema, rema, remador', simbolo: '🚣', bpm: 100, notas: 'C4:1.5 C4:1.5 C4 D4:0.5 E4:1.5 E4 D4:0.5 E4 F4:0.5 G4:3 C5:0.5 C5:0.5 C5:0.5 G4:0.5 G4:0.5 G4:0.5 E4:0.5 E4:0.5 E4:0.5 C4:0.5 C4:0.5 C4:0.5 G4 F4:0.5 E4 D4:0.5 C4:3' },
    { nome: 'A dona aranha', simbolo: '🕷️', bpm: 110, notas: 'G4 C5 C5 C5 D5 E5:2 E5 E5 D5 C5 D5 E5 C5:2 E5:2 E5 F5 G5:2 G5 F5 E5 F5 G5 E5:2 C5:2 C5 D5 E5:2 E5 D5 C5 D5 E5 C5:2 G4 G4 C5 C5 C5 D5 E5:2 E5 E5 D5 C5 D5 E5 C5:2' },
    { nome: 'A ponte de Londres', simbolo: '🌉', bpm: 110, notas: 'G4:1.5 A4:0.5 G4 F4 E4 F4 G4:2 D4 E4 F4:2 E4 F4 G4:2 G4:1.5 A4:0.5 G4 F4 E4 F4 G4:2 D4:2 G4 E4 C4:2' },
    { nome: 'Irmão Jacó (Frère Jacques)', simbolo: '😴', bpm: 110, notas: 'G4 A4 B4 G4 G4 A4 B4 G4 B4 C5 D5:2 B4 C5 D5:2 D5:0.5 E5:0.5 D5:0.5 C5:0.5 B4 G4 D5:0.5 E5:0.5 D5:0.5 C5:0.5 B4 G4 G4 D4 G4:2 G4 D4 G4:2' },
    { nome: 'Bate o sino (Jingle Bells)', simbolo: '🔔', bpm: 120, notas: 'E4 E4 E4:2 E4 E4 E4:2 E4 G4 C4:1.5 D4:0.5 E4:4 F4 F4 F4:1.5 F4:0.5 F4 E4 E4 E4:0.5 E4:0.5 E4 D4 D4 E4 D4:2 G4:2 E4 E4 E4:2 E4 E4 E4:2 E4 G4 C4:1.5 D4:0.5 E4:4 F4 F4 F4:1.5 F4:0.5 F4 E4 E4 E4:0.5 E4:0.5 G4 G4 F4 D4 C4:4' },
    { nome: 'Noite feliz', simbolo: '🌟', bpm: 90, notas: 'G4:1.5 A4:0.5 G4 E4:3 G4:1.5 A4:0.5 G4 E4:3 D5:2 D5 B4:3 C5:2 C5 G4:3 A4:2 A4 C5:1.5 B4:0.5 A4 G4:1.5 A4:0.5 G4 E4:3 A4:2 A4 C5:1.5 B4:0.5 A4 G4:1.5 A4:0.5 G4 E4:3 D5:2 D5 F5:1.5 D5:0.5 B4 C5:3 E5:3 C5:1.5 G4:0.5 E4 G4:1.5 F4:0.5 D4 C4:3' },
    { nome: 'Jesus me ama', simbolo: '✝️', bpm: 100, notas: 'G4 E4 E4 D4 E4 G4 G4:2 A4 A4 C5 A4 A4 G4 G4:2 G4 E4 E4 D4 E4 G4 G4:2 A4 A4 G4 C4 E4 D4 C4:2' },
    { nome: 'Graça maravilhosa', simbolo: '🕊️', bpm: 80, notas: 'C4 F4:2 A4:0.5 F4:0.5 A4:2 G4 F4:2 D4 C4:2 C4 F4:2 A4:0.5 F4:0.5 A4:2 G4 C5:3 C5:2 A4 C5:1.5 A4:0.5 C5:0.5 A4:0.5 F4:2 C4 D4:1.5 F4:0.5 F4:0.5 D4:0.5 C4:2 C4 F4:2 A4:0.5 F4:0.5 A4:2 G4 F4:3' },
    { nome: 'Canção de ninar (Brahms)', simbolo: '🌙', bpm: 90, notas: 'E4:0.5 E4:0.5 G4:2 E4:0.5 E4:0.5 G4:2 E4:0.5 G4:0.5 C5 B4:1.5 A4:0.5 A4 G4 D4:0.5 E4:0.5 F4 D4 D4:0.5 E4:0.5 F4:2 D4:0.5 F4:0.5 B4 A4 G4 B4 C5:2' },
    { nome: 'Ode à alegria (Beethoven)', simbolo: '🎻', bpm: 110, notas: 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4:1.5 D4:0.5 D4:2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2' },
    { nome: 'Quando os santos vão marchando', simbolo: '🎺', bpm: 130, notas: 'C4 E4 F4 G4:4 C4 E4 F4 G4:4 C4 E4 F4 G4:2 E4:2 C4:2 E4:2 D4:4 E4 E4 D4 C4:3 C4 E4 G4:2 G4 F4:3 E4 F4 G4:2 E4:2 C4:2 D4:2 C4:4' },
    { nome: 'Minueto em Sol (Bach)', simbolo: '🎼', bpm: 110, notas: 'D5 G4:0.5 A4:0.5 B4:0.5 C5:0.5 D5 G4 G4 E5 C5:0.5 D5:0.5 E5:0.5 F#5:0.5 G5 G4 G4 C5 D5:0.5 C5:0.5 B4:0.5 A4:0.5 B4 C5:0.5 B4:0.5 A4:0.5 G4:0.5 F#4 G4:0.5 A4:0.5 B4:0.5 G4:0.5 A4:3' },
    { nome: 'Para Elisa (Beethoven)', simbolo: '🎹', bpm: 100, notas: 'E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4 R:0.5 C4:0.5 E4:0.5 A4:0.5 B4 R:0.5 E4:0.5 G#4:0.5 B4:0.5 C5 R:0.5 E4:0.5 E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4 R:0.5 C4:0.5 E4:0.5 A4:0.5 B4 R:0.5 E4:0.5 C5:0.5 B4:0.5 A4:2' },
    { nome: 'Arco-íris das notas', simbolo: '🌈', bpm: 120, notas: 'C4 E4 G4 C5:2 G4 E4 C4:2 D4 F4 A4 D5:2 A4 F4 D4:2 C4 E4 G4 C5:4' },
  ];
  const PASSOS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function lerNotas(texto) {
    return texto.trim().split(/\s+/).map(tok => {
      const [n, d] = tok.split(':');
      const dur = d ? parseFloat(d) : 1;
      if (n === 'R') return { m: null, dur };
      const r = /^([A-G])(#?)(\d)$/.exec(n);
      return { m: (parseInt(r[3], 10) + 1) * 12 + PASSOS[r[1]] + (r[2] ? 1 : 0), dur };
    });
  }

  // melodias surpresa: sempre bonitas (escala pentatônica), uma diferente a cada toque
  let numeroSurpresa = parseInt(M.ler('miguel-surpresa'), 10) || 0;
  function musicaSurpresa() {
    numeroSurpresa++;
    M.guardar('miguel-surpresa', String(numeroSurpresa));
    const escala = [60, 62, 64, 67, 69, 72, 74, 76];
    let i = M.sortear([0, 2, 4]);
    const notas = [];
    const total = 12 + Math.floor(Math.random() * 6);
    for (let k = 0; k < total; k++) {
      const fimDeFrase = (k + 1) % 4 === 0;
      if (Math.random() < 0.25 && !fimDeFrase) {
        notas.push({ m: escala[i], dur: 0.5 });
        i = Math.max(0, Math.min(escala.length - 1, i + M.sortear([-1, 1])));
        notas.push({ m: escala[i], dur: 0.5 });
      } else notas.push({ m: escala[i], dur: fimDeFrase ? 2 : 1 });
      i = Math.max(0, Math.min(escala.length - 1, i + M.sortear([-2, -1, -1, 1, 1, 2, 0])));
    }
    notas.push({ m: 60, dur: 2 });
    return { nome: `Música surpresa nº ${numeroSurpresa}`, simbolo: M.sortear(['🎲', '🦄', '🚀', '🌈', '🐳', '🦋', '🍭', '🎈']), bpm: 110, lista: notas };
  }

  // ---------- teclado de duas fileiras (cabe no celular) ----------
  function htmlTeclado(oitava, sustenidos) {
    return [oitava + 1, oitava].map(o => {
      const base = (o + 1) * 12;
      const brancas = [0, 2, 4, 5, 7, 9, 11, 12].map(s => base + s);
      const pretas = sustenidos ? [[1, 0], [3, 1], [6, 3], [8, 4], [10, 5]].map(([s, pos]) => ({ m: base + s, pos })) : [];
      return `<div class="fileira">${brancas.map(m =>
        `<button class="tecla" data-m="${m}" style="--c:${CORES[m % 12]}" aria-label="${nomeNota(m)}"><span class="nome-nota">${nomeNota(m)}</span>${m % 12 === 0 ? `<small>${oitavaDe(m)}</small>` : ''}</button>`).join('')}
        ${pretas.map(p => `<button class="tecla preta" data-m="${p.m}" style="left:calc(${(p.pos + 1) * 12.5}% - 4.5%)" aria-label="${nomeNota(p.m)}"><span class="nome-nota">${nomeNota(p.m)}</span></button>`).join('')}
      </div>`;
    }).join('');
  }
  function acenderTecla(raiz, m, classe = 'tocando', tempo = 220) {
    for (const t of raiz.querySelectorAll(`[data-m="${m}"]`)) {
      t.classList.add(classe);
      if (tempo) setTimeout(() => t.classList.remove(classe), tempo);
    }
  }
  function htmlBateria() {
    return `<div class="pads">${PECAS.map(p =>
      `<button class="pad" data-m="${p.id}" style="--c:${p.cor}"><span class="simbolo">${p.simbolo}</span><span>${p.nome}</span></button>`).join('')}</div>`;
  }

  // toca uma lista de notas no ritmo, acendendo as teclas
  function tocarLista(instId, lista, bpm, raiz, aoTerminar) {
    const batida = 60 / bpm;
    let t = 0;
    const timers = [];
    for (const n of lista) {
      if (n.m !== null) {
        const quando = t, m = n.m;
        tocarNotaInst(instId, m, quando);
        timers.push(setTimeout(() => raiz && acenderTecla(raiz, m, 'tocando', Math.max(150, n.dur * batida * 900)), quando * 1000));
      }
      t += n.dur * batida;
    }
    timers.push(setTimeout(() => aoTerminar && aoTerminar(), t * 1000 + 300));
    return () => { timers.forEach(clearTimeout); };
  }

  // ---------- minhas músicas ----------
  const lerGravacoes = () => { try { return JSON.parse(M.ler('miguel-musicas') || '[]'); } catch (e) { return []; } };
  const guardarGravacoes = (l) => M.guardar('miguel-musicas', JSON.stringify(l.slice(0, 30)));
  function tocarGravacao(g, raiz, aoTerminar) {
    const timers = g.eventos.map(([ms, m]) => setTimeout(() => {
      tocarNotaInst(g.inst, m);
      if (raiz) acenderTecla(raiz, m);
    }, ms));
    const fim = (g.eventos.length ? g.eventos[g.eventos.length - 1][0] : 0) + 1200;
    timers.push(setTimeout(() => aoTerminar && aoTerminar(), fim));
    return () => timers.forEach(clearTimeout);
  }

  // ---------- telas ----------
  function inicio(nav) {
    nav.ir('Música', (c) => {
      c.innerHTML = `
        <div class="lista-modos" style="--cor:#e66fb0">
          <button class="modo" data-ir="instrumentos"><span class="simbolo">🎹</span><span><strong>Instrumentos</strong><small>toque e descubra todas as notas</small></span></button>
          <button class="modo" data-ir="aprender"><span class="simbolo">🎼</span><span><strong>Aprender músicas</strong><small>o Miguel mostra qual nota tocar</small></span></button>
          <button class="modo" data-ir="memoria"><span class="simbolo">🧠</span><span><strong>Repita a melodia</strong><small>ouça e toque igualzinho</small></span></button>
          <button class="modo" data-ir="minhas"><span class="simbolo">💾</span><span><strong>Minhas músicas</strong><small>as músicas que você gravou</small></span></button>
        </div>`;
      M.falar('Vamos fazer música! O que você quer fazer?');
      c.onclick = (e) => {
        const b = e.target.closest('[data-ir]');
        if (!b) return;
        ({ instrumentos: escolherInstrumento, aprender: listaMusicas, memoria: jogoMemoria, minhas: minhasMusicas })[b.dataset.ir](nav);
      };
    });
  }

  function escolherInstrumento(nav) {
    nav.ir('Instrumentos', (c) => {
      c.innerHTML = `<div class="grade-jogos">${INSTRUMENTOS.map(i =>
        `<button class="cartao-jogo" data-inst="${i.id}" style="--cor:${i.cor}"><span class="simbolo">${i.simbolo}</span><span class="nome">${i.nome}</span></button>`).join('')}</div>`;
      M.falar('Escolha um instrumento!');
      c.onclick = (e) => {
        const b = e.target.closest('[data-inst]');
        if (!b) return;
        const inst = instrumento(b.dataset.inst);
        M.falar(inst.nome + '!');
        if (inst.bateria) tocarNotaInst('bateria', 'bumbo'); else tocarNotaInst(inst.id, 60 + 12 * (inst.oitava - 4));
        telaInstrumento(nav, inst);
      };
    });
  }

  function telaInstrumento(nav, inst) {
    nav.ir(inst.nome, (c) => {
      let oitava = inst.oitava - 1, sustenidos = false;
      let gravando = null, ultima = null, pararTocar = null;
      c.innerHTML = `
        <div class="instrumento" style="--cor:${inst.cor}">
          <div class="barra-inst">
            ${inst.bateria ? '' : `
              <button data-acao="grave" aria-label="Notas mais graves">◀</button>
              <span class="oitava" id="oitava"></span>
              <button data-acao="agudo" aria-label="Notas mais agudas">▶</button>
              <button data-acao="sustenidos" class="alternar" aria-pressed="false">♯ Mais notas</button>`}
          </div>
          <div class="area-teclas"></div>
          <div class="barra-gravar">
            <button data-acao="gravar" class="gravar">⏺ Gravar</button>
            ${inst.bateria ? '<button data-acao="ritmo">🎵 Ritmo pronto</button>' : '<button data-acao="surpresa">🎲 Surpresa</button>'}
          </div>
          <div class="depois-gravar" hidden>
            <button data-acao="ouvir">▶ Ouvir</button>
            <button data-acao="guardar">💾 Guardar</button>
            <button data-acao="apagar" aria-label="Apagar gravação">🗑️</button>
          </div>
          <p class="dica-inst">${inst.bateria ? 'Toque nas peças da bateria!' : 'Use ◀ ▶ para ouvir notas mais graves ou mais agudas.'}</p>
        </div>`;
      const area = c.querySelector('.area-teclas');
      const desenhar = () => {
        area.innerHTML = inst.bateria ? htmlBateria() : htmlTeclado(oitava, sustenidos);
        const o = c.querySelector('#oitava');
        if (o) o.textContent = `Dó${oitava} → Dó${oitava + 2}`;
      };
      desenhar();
      area.addEventListener('pointerdown', (e) => {
        const t = e.target.closest('[data-m]');
        if (!t) return;
        e.preventDefault();
        const m = inst.bateria ? t.dataset.m : +t.dataset.m;
        tocarNotaInst(inst.id, m);
        t.classList.add('tocando');
        setTimeout(() => t.classList.remove('tocando'), 180);
        if (gravando) gravando.eventos.push([Math.round(performance.now() - gravando.inicio), m]);
      });
      const botaoGravar = c.querySelector('[data-acao="gravar"]');
      const depois = c.querySelector('.depois-gravar');
      c.onclick = (e) => {
        const b = e.target.closest('[data-acao]');
        if (!b) return;
        const acao = b.dataset.acao;
        if (acao === 'grave' && oitava > 1) { oitava--; desenhar(); }
        else if (acao === 'agudo' && oitava < 6) { oitava++; desenhar(); }
        else if (acao === 'sustenidos') { sustenidos = !sustenidos; b.setAttribute('aria-pressed', String(sustenidos)); desenhar(); }
        else if (acao === 'gravar') {
          if (!gravando) {
            gravando = { inicio: performance.now(), eventos: [] };
            botaoGravar.textContent = '⏹ Parar';
            botaoGravar.classList.add('ativo');
            depois.hidden = true;
            M.falar('Gravando! Pode tocar.');
          } else {
            ultima = gravando.eventos.length ? { inst: inst.id, eventos: gravando.eventos } : null;
            gravando = null;
            botaoGravar.textContent = '⏺ Gravar';
            botaoGravar.classList.remove('ativo');
            depois.hidden = !ultima;
            M.falar(ultima ? 'Pronto! Quer ouvir a sua música?' : 'Você não tocou nenhuma nota.');
          }
        } else if (acao === 'ouvir' && ultima) {
          if (pararTocar) pararTocar();
          pararTocar = tocarGravacao(ultima, area);
        } else if (acao === 'guardar' && ultima) {
          const lista = lerGravacoes();
          const nome = `Minha música ${lista.length + 1}`;
          lista.unshift({ nome, simbolo: M.sortear(['🎵', '🎶', '🌟', '🦄', '🚀', '🌈', '🐱', '💖']), quando: Date.now(), ...ultima });
          guardarGravacoes(lista);
          depois.hidden = true;
          M.somAcerto();
          M.festa(b, 8);
          M.falar(`Guardei! Ela se chama ${nome}. Está em Minhas músicas.`);
          ultima = null;
        } else if (acao === 'apagar') { ultima = null; depois.hidden = true; }
        else if (acao === 'surpresa') {
          const s = musicaSurpresa();
          M.falar(s.nome + '! Escute.');
          if (pararTocar) pararTocar();
          oitava = 3; sustenidos = false; desenhar();
          pararTocar = tocarLista(inst.id, s.lista, s.bpm, area);
        } else if (acao === 'ritmo') {
          const batida = [['bumbo', 0], ['chimbal', 0.25], ['caixa', 0.5], ['chimbal', 0.75]];
          const eventos = [];
          for (let compasso = 0; compasso < 4; compasso++) batida.forEach(([p, t]) => eventos.push([Math.round((compasso + t) * 1000), p]));
          eventos.push([4000, 'prato']);
          if (pararTocar) pararTocar();
          pararTocar = tocarGravacao({ inst: 'bateria', eventos }, area);
        }
      };
      return () => { if (pararTocar) pararTocar(); };
    });
  }

  function listaMusicas(nav) {
    nav.ir('Aprender músicas', (c) => {
      c.innerHTML = `
        <button class="modo destaque-surpresa" data-surpresa><span class="simbolo">🎲</span><span><strong>Música surpresa</strong><small>uma melodia nova a cada toque, sem fim!</small></span></button>
        <div class="lista-musicas">${MUSICAS.map((m, i) => {
          const n = M.jogos.trofeus('musica/' + i);
          return `<button class="musica" data-i="${i}"><span class="simbolo">${m.simbolo}</span><span class="nome">${m.nome}</span>${n ? `<span class="selo">🏆${n}</span>` : ''}</button>`;
        }).join('')}</div>`;
      M.falar('Escolha uma música para aprender!');
      c.onclick = (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.hasAttribute('data-surpresa')) aprenderMusica(nav, musicaSurpresa(), null);
        else if (b.dataset.i !== undefined) {
          const m = MUSICAS[+b.dataset.i];
          aprenderMusica(nav, { ...m, lista: lerNotas(m.notas) }, 'musica/' + b.dataset.i);
        }
      };
    });
  }

  function aprenderMusica(nav, musica, chave) {
    nav.ir(musica.nome, (c) => {
      const tocaveis = musica.lista.filter(n => n.m !== null);
      const minimo = Math.min(...tocaveis.map(n => n.m));
      const oitava = oitavaDe(minimo);
      const sustenidos = tocaveis.some(n => PRETAS.includes(n.m % 12));
      let instId = 'piano', pos = 0, pararTocar = null;
      c.innerHTML = `
        <div class="aprender-musica">
          <div class="escolher-inst">${INSTRUMENTOS.filter(i => !i.bateria).map(i =>
            `<button data-inst="${i.id}" aria-pressed="${i.id === instId}" aria-label="${i.nome}">${i.simbolo}</button>`).join('')}</div>
          <div class="trilha" aria-label="Notas da música">${tocaveis.map((n, i) =>
            `<span class="nota-trilha" data-k="${i}" style="--c:${CORES[n.m % 12]}">${nomeNota(n.m)}</span>`).join('')}</div>
          <div class="progresso"><span></span></div>
          <div class="area-teclas">${htmlTeclado(oitava, sustenidos)}</div>
          <div class="barra-gravar">
            <button data-acao="ouvir">▶ Ouvir a música</button>
            <button data-acao="recomecar">🔁 Recomeçar</button>
          </div>
        </div>`;
      const area = c.querySelector('.area-teclas');
      const trilha = c.querySelector('.trilha');
      const barra = c.querySelector('.progresso span');
      const marcar = () => {
        for (const t of area.querySelectorAll('.proxima')) t.classList.remove('proxima');
        trilha.querySelectorAll('.nota-trilha').forEach((s, k) => {
          s.classList.toggle('feita', k < pos);
          s.classList.toggle('atual', k === pos);
        });
        const atual = trilha.querySelector('.atual');
        if (atual) trilha.scrollTo({ left: atual.offsetLeft - trilha.clientWidth / 2 + atual.clientWidth / 2, behavior: 'smooth' });
        barra.style.width = (pos / tocaveis.length * 100) + '%';
        if (pos < tocaveis.length) acenderTecla(area, tocaveis[pos].m, 'proxima', 0);
      };
      marcar();
      M.falar('Toque na tecla que está brilhando! Ou toque em Ouvir a música primeiro.');
      area.addEventListener('pointerdown', (e) => {
        const t = e.target.closest('[data-m]');
        if (!t) return;
        e.preventDefault();
        const m = +t.dataset.m;
        tocarNotaInst(instId, m);
        t.classList.add('tocando');
        setTimeout(() => t.classList.remove('tocando'), 180);
        if (pos >= tocaveis.length || m !== tocaveis[pos].m) return;
        pos++;
        marcar();
        if (pos === tocaveis.length) {
          if (chave) M.jogos.ganharTrofeu(chave);
          M.festa(area, 16);
          setTimeout(() => {
            M.somAcerto();
            M.falar(`Parabéns! Você tocou ${musica.nome}! Escute como ficou.`);
            pararTocar = tocarLista(instId, musica.lista, musica.bpm, area);
          }, 600);
        }
      });
      c.onclick = (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.inst) {
          instId = b.dataset.inst;
          c.querySelectorAll('[data-inst]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
          tocarNotaInst(instId, tocaveis[Math.min(pos, tocaveis.length - 1)].m);
        } else if (b.dataset.acao === 'ouvir') {
          if (pararTocar) pararTocar();
          pararTocar = tocarLista(instId, musica.lista, musica.bpm, area, marcar);
        } else if (b.dataset.acao === 'recomecar') { pos = 0; marcar(); }
      };
      return () => { if (pararTocar) pararTocar(); };
    });
  }

  // memória musical: o Miguel toca, a criança repete; a sequência cresce
  function jogoMemoria(nav) {
    const NOTAS = [60, 62, 64, 67, 69];
    nav.ir('Repita a melodia', (c) => {
      let sequencia = [], vez = 0, ouvindo = false, timers = [];
      c.innerHTML = `
        <div class="memoria-musical">
          <p class="nivel">Nível <strong id="nivel">1</strong></p>
          <p class="instrucao" id="instrucao">Escute o Miguel...</p>
          <div class="pads cinco">${NOTAS.map(m =>
            `<button class="pad" data-m="${m}" style="--c:${CORES[m % 12]}"><span class="simbolo">${['🔴', '🟠', '🟡', '🔵', '🟣'][NOTAS.indexOf(m)]}</span><span>${nomeNota(m)}</span></button>`).join('')}</div>
          <button class="modo" data-acao="ouvir"><span class="simbolo">🔁</span><strong>Ouvir de novo</strong></button>
        </div>`;
      const instrucao = c.querySelector('#instrucao');
      const tocarSequencia = () => {
        ouvindo = false;
        timers.forEach(clearTimeout);
        instrucao.textContent = 'Escute o Miguel... 👂';
        sequencia.forEach((m, i) => timers.push(setTimeout(() => {
          tocarNotaInst('xilofone', m);
          acenderTecla(c, m, 'tocando', 380);
        }, 900 + i * 650)));
        timers.push(setTimeout(() => { ouvindo = true; vez = 0; instrucao.textContent = 'Agora é a sua vez! 👆'; }, 900 + sequencia.length * 650));
      };
      const proximoNivel = () => {
        sequencia.push(M.sortear(NOTAS));
        c.querySelector('#nivel').textContent = sequencia.length;
        tocarSequencia();
      };
      c.querySelector('.pads').addEventListener('pointerdown', (e) => {
        const t = e.target.closest('[data-m]');
        if (!t || !ouvindo) return;
        e.preventDefault();
        const m = +t.dataset.m;
        tocarNotaInst('xilofone', m);
        acenderTecla(c, m, 'tocando', 250);
        if (m !== sequencia[vez]) {
          ouvindo = false;
          M.somErro();
          instrucao.textContent = 'Quase! Vamos ouvir de novo. 💛';
          M.falar('Quase! Vamos ouvir de novo.');
          timers.push(setTimeout(tocarSequencia, 1200));
          return;
        }
        vez++;
        if (vez === sequencia.length) {
          ouvindo = false;
          M.festa(t, 8);
          instrucao.textContent = 'Muito bem! 🌟';
          if (sequencia.length === 5) { M.jogos.ganharTrofeu('musica'); M.falar('Uau! Cinco notas! Você ganhou um troféu!'); }
          timers.push(setTimeout(proximoNivel, 1300));
        }
      });
      c.onclick = (e) => { if (e.target.closest('[data-acao="ouvir"]')) tocarSequencia(); };
      M.falar('Escute as notas e depois toque igualzinho!');
      timers.push(setTimeout(proximoNivel, 1500));
      return () => timers.forEach(clearTimeout);
    });
  }

  function minhasMusicas(nav) {
    nav.ir('Minhas músicas', (c) => {
      let parar = null;
      const desenhar = () => {
        const lista = lerGravacoes();
        c.innerHTML = lista.length ? `<div class="lista-musicas">${lista.map((g, i) =>
          `<div class="musica gravada"><span class="simbolo">${g.simbolo}</span><span class="nome">${g.nome}<small>${instrumento(g.inst).simbolo} ${instrumento(g.inst).nome}</small></span>
            <button data-tocar="${i}" aria-label="Ouvir">▶</button><button data-apagar="${i}" aria-label="Apagar">🗑️</button></div>`).join('')}</div>`
          : '<div class="vazio"><span>🎙️</span><p>Você ainda não gravou nenhuma música.</p><p>Escolha um instrumento, toque em <strong>⏺ Gravar</strong> e crie a sua!</p></div>';
      };
      desenhar();
      c.onclick = (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        const lista = lerGravacoes();
        if (b.dataset.tocar !== undefined) {
          if (parar) parar();
          parar = tocarGravacao(lista[+b.dataset.tocar]);
        } else if (b.dataset.apagar !== undefined) {
          lista.splice(+b.dataset.apagar, 1);
          guardarGravacoes(lista);
          desenhar();
        }
      };
      return () => { if (parar) parar(); };
    });
  }

  M.jogos.registrar({ id: 'musica', nome: 'Música', simbolo: '🎵', cor: '#e66fb0', secao: 'criar', abrir: inicio });
  M.musica = { tocarNotaInst, lerNotas, MUSICAS };
})();
