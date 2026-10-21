// Penélope em 3D: a cachorrinha maltês, montada com bolinhas de pelo (sem imagem: dá para ver de todos os lados).
// Usada no Mundo do Miguel (direto na cena) e na Corrida (desenhada numa telinha 3D e colada no jogo).
(() => {
  const M = window.Miguel;

  function criar(T) {
    const pelo = new T.MeshLambertMaterial({ color: 0xe9dfcf });
    const pelo2 = new T.MeshLambertMaterial({ color: 0xdccdb4 });
    const creme = new T.MeshLambertMaterial({ color: 0xdcb582 });
    const preto = new T.MeshPhongMaterial({ color: 0x141414, shininess: 90, specular: 0x666666 });
    const brilho = new T.MeshBasicMaterial({ color: 0xffffff });
    const rosa = new T.MeshLambertMaterial({ color: 0xff7f9a });
    const almofada = new T.MeshLambertMaterial({ color: 0x3a2c2a });
    const bola = new T.SphereGeometry(1, 14, 10);
    const esfera = (pai, mat, x, y, z, sx, sy = sx, sz = sx) => {
      const m = new T.Mesh(bola, mat);
      m.position.set(x, y, z); m.scale.set(sx, sy, sz);
      m.castShadow = true;
      pai.add(m);
      return m;
    };
    // sorteio fixo para os tufinhos de pelo ficarem sempre iguais
    let semente = 7;
    const rnd = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);

    const raiz = new T.Group();
    const corpo = new T.Group();
    raiz.add(corpo);

    // corpo fofinho, com tufos em volta
    esfera(corpo, pelo, 0, 0.62, 0, 0.42, 0.38, 0.55);
    for (let i = 0; i < 18; i++) {
      const a = rnd() * Math.PI * 2, b = (rnd() - 0.3) * 1.4;
      esfera(corpo, i % 3 ? pelo : pelo2, Math.cos(a) * 0.36 * Math.cos(b), 0.62 + Math.sin(b) * 0.3, Math.sin(a) * 0.48 * Math.cos(b), 0.13 + rnd() * 0.07);
    }
    esfera(corpo, pelo2, 0, 0.6, 0.42, 0.26, 0.28, 0.2); // peito

    // perninhas (cada uma num grupo para balançar a partir do quadril)
    const pernas = [];
    for (const [x, z] of [[-0.2, 0.32], [0.2, 0.32], [-0.2, -0.32], [0.2, -0.32]]) {
      const g = new T.Group(); g.position.set(x, 0.5, z); corpo.add(g);
      esfera(g, pelo, 0, -0.18, 0, 0.13, 0.22, 0.13);
      esfera(g, pelo2, 0, -0.38, 0.03, 0.12, 0.09, 0.14);
      esfera(g, almofada, 0, -0.43, 0.07, 0.05, 0.03, 0.05);
      pernas.push(g);
    }

    // rabo: um penacho que abana
    const rabo = new T.Group(); rabo.position.set(0, 0.85, -0.45); corpo.add(rabo);
    esfera(rabo, pelo, 0, 0.08, -0.05, 0.13);
    esfera(rabo, pelo, 0, 0.22, -0.12, 0.16);
    esfera(rabo, pelo2, 0, 0.36, -0.12, 0.18);
    esfera(rabo, pelo, 0, 0.46, -0.04, 0.14);

    // cabeça
    const cabeca = new T.Group(); cabeca.position.set(0, 1.12, 0.3); corpo.add(cabeca);
    esfera(cabeca, pelo, 0, 0, 0, 0.42, 0.4, 0.38);
    for (let i = 0; i < 16; i++) {
      const a = rnd() * Math.PI * 2, b = rnd() * 1.3 - 0.2;
      esfera(cabeca, i % 2 ? pelo : pelo2, Math.cos(a) * 0.36 * Math.cos(b), Math.sin(b) * 0.34 + 0.04, Math.sin(a) * 0.3 * Math.cos(b) - 0.04, 0.1 + rnd() * 0.07);
    }
    // topete
    esfera(cabeca, pelo, -0.08, 0.36, 0.05, 0.14); esfera(cabeca, pelo2, 0.08, 0.38, 0.02, 0.13); esfera(cabeca, pelo, 0, 0.42, -0.06, 0.12);
    // focinho, nariz e boquinha aberta com língua
    esfera(cabeca, pelo2, 0, -0.1, 0.32, 0.2, 0.16, 0.16);
    esfera(cabeca, preto, 0, -0.03, 0.47, 0.065, 0.05, 0.05);
    esfera(cabeca, brilho, -0.02, -0.01, 0.51, 0.015);
    esfera(cabeca, almofada, 0, -0.2, 0.39, 0.09, 0.05, 0.06);
    const lingua = esfera(cabeca, rosa, 0, -0.25, 0.41, 0.06, 0.08, 0.04);
    // olhos pretos brilhantes
    for (const x of [-0.15, 0.15]) {
      esfera(cabeca, preto, x, 0.06, 0.33, 0.07, 0.075, 0.05);
      esfera(cabeca, brilho, x - 0.02, 0.09, 0.375, 0.018);
    }
    // orelhas caídas e felpudas (cada uma num grupo para balançar)
    const orelhas = [];
    for (const lado of [-1, 1]) {
      const g = new T.Group(); g.position.set(lado * 0.33, 0.12, -0.02); cabeca.add(g);
      esfera(g, creme, lado * 0.07, -0.04, 0, 0.16, 0.19, 0.14);
      esfera(g, creme, lado * 0.15, -0.22, 0.01, 0.19, 0.21, 0.15);
      esfera(g, creme, lado * 0.19, -0.4, 0.0, 0.17, 0.17, 0.14);
      esfera(g, pelo2, lado * 0.2, -0.53, 0.02, 0.12, 0.1, 0.1);
      orelhas.push(g);
    }

    // anima: correndo (pernas trotando), voando (pernas remando) ou parada
    function animar(t, { correndo = true, voando = false } = {}) {
      const f = correndo ? 14 : 6;
      pernas.forEach((g, i) => {
        const fase = (i === 0 || i === 3) ? 0 : Math.PI;
        g.rotation.x = Math.sin(t * f + fase) * (voando ? 0.6 : 0.75);
      });
      corpo.position.y = correndo ? Math.abs(Math.sin(t * f)) * 0.08 : Math.sin(t * 3) * 0.03;
      corpo.rotation.x = correndo ? Math.sin(t * f * 2) * 0.03 : 0;
      rabo.rotation.z = Math.sin(t * 16) * 0.5;
      rabo.rotation.x = -0.2 + Math.sin(t * 8) * 0.1;
      orelhas.forEach((g, i) => { g.rotation.z = (i ? -1 : 1) * (0.1 + Math.sin(t * f + i) * 0.18); g.rotation.x = Math.sin(t * f * 0.5) * 0.15; });
      cabeca.rotation.z = Math.sin(t * 2.5) * 0.08;
      cabeca.rotation.x = Math.sin(t * 5) * 0.04;
      lingua.scale.y = 0.08 + Math.abs(Math.sin(t * 9)) * 0.03;
    }
    animar(0);
    return { grupo: raiz, animar };
  }

  // telinha 3D para jogos em 2D (a Corrida): desenha a Penélope de lado, correndo, num canvas pequeno
  // uma telinha só, reaproveitada em todas as corridas (criar várias telas 3D pesa e pode fechar o app)
  let telinhaPronta = null;
  function telinha(T, tam = 256) {
    if (telinhaPronta) return telinhaPronta;
    // preserveDrawingBuffer: a imagem fica guardada e a Corrida pode desenhar a Penélope 3D só em quadros alternados
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: false, preserveDrawingBuffer: true });
    renderer.setSize(tam, tam, false);
    renderer.setClearColor(0x000000, 0);
    const cena = new T.Scene();
    cena.add(new T.HemisphereLight(0xffffff, 0xc8b8a0, 1.0));
    const luz = new T.DirectionalLight(0xffffff, 0.7); luz.position.set(2, 3, 4); cena.add(luz);
    const camera = new T.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 1.0, 4.4); camera.lookAt(0, 0.82, 0);
    const p = criar(T);
    // virada para a direita da tela, um pouquinho de frente para mostrar o rostinho
    p.grupo.rotation.y = Math.PI / 2 - 0.55;
    cena.add(p.grupo);
    telinhaPronta = {
      canvas: renderer.domElement,
      desenhar(t, estado) { p.animar(t, estado); renderer.render(cena, camera); },
      descartar() {},
    };
    return telinhaPronta;
  }

  // carrega o three.js uma vez (o mesmo arquivo do Mundo do Miguel)
  let carregando = null;
  function carregarThree() {
    M.precarregarSons(['latido-fraquinho', 'super-penelope']);
    if (window.THREE) return Promise.resolve(window.THREE);
    if (!carregando) carregando = new Promise((ok, erro) => {
      const s = document.createElement('script');
      s.src = 'vendor/three-0.149.0.min.js';
      s.onload = () => ok(window.THREE); s.onerror = erro;
      document.head.appendChild(s);
    });
    return carregando;
  }

  // latidinho bem fraquinho
  function latir() { M.tocarSom('latido-fraquinho', M.calmo ? 0.35 : 0.55); }

  // grito de "Super Penélope!" quando ela chega, e logo depois um latidinho
  function gritar() {
    M.tocarSom('super-penelope', M.calmo ? 0.6 : 1);
    setTimeout(latir, 1400);
  }

  M.penelope3d = { criar, telinha, carregarThree, latir, gritar };
})();
