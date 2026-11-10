// Ranking dos jogadores: no fim da partida manda o resultado ao coletor e mostra o pódio,
// a lista dos 10 melhores (da semana e de todos os tempos) e quanto falta para passar o próximo.
(() => {
  const M = window.Miguel;
  const AVATARES = ['🐱', '🐶', '🦊', '🐼', '🦁', '🐯', '🐸', '🐵', '🐰', '🐻', '🐨', '🦄', '🐲', '🐧', '🦖', '🚀'];
  const lerJogador = () => { try { return JSON.parse(M.ler('miguel-jogador') || 'null'); } catch (e) { return null; } };
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const coletor = () => (window.MiguelControle && MiguelControle.coletor()) || '';
  const codigo = () => (window.MiguelControle && MiguelControle.codigo) || '';

  // primeira vez: a criança escolhe um nome de jogador e um bichinho
  function pedirNome(tela) {
    return new Promise((pronto) => {
      const atual = lerJogador() || { nome: (M.ler('miguel-apelido') || '').slice(0, 14), avatar: M.sortear(AVATARES) };
      tela.innerHTML = `
        <div class="rk-cartao rk-entra">
          <div class="rk-faixa">${cfg.titulo}</div>
          <h2 class="rk-titulo">Como você quer aparecer?</h2>
          <p class="rk-sub">Escolha um bichinho e um nome de jogador (pode ser um apelido).</p>
          <div class="rk-avatares">${AVATARES.map(a => `<button class="rk-avatar${a === atual.avatar ? ' escolhido' : ''}" data-avatar="${a}" aria-label="Bichinho ${a}">${a}</button>`).join('')}</div>
          <input class="rk-nome" maxlength="14" placeholder="Seu nome de jogador" value="${esc(atual.nome)}" autocomplete="off">
          <p class="rk-dica">🔒 Não use o nome completo nem o sobrenome.</p>
          <button class="botao-pronto rk-confirmar">✅ Entrar no ranking</button>
        </div>`;
      let avatar = atual.avatar;
      tela.querySelector('.rk-avatares').addEventListener('click', (e) => {
        const b = e.target.closest('[data-avatar]');
        if (!b) return;
        avatar = b.dataset.avatar;
        tela.querySelectorAll('.rk-avatar').forEach(x => x.classList.toggle('escolhido', x === b));
      });
      const campo = tela.querySelector('.rk-nome');
      tela.querySelector('.rk-confirmar').addEventListener('click', () => {
        const nome = campo.value.replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 14);
        if (!nome) { campo.focus(); campo.classList.add('rk-tremer'); setTimeout(() => campo.classList.remove('rk-tremer'), 500); return; }
        const j = { nome, avatar };
        M.guardar('miguel-jogador', JSON.stringify(j));
        pronto(j);
      });
    });
  }

  // cada jogo conta de um jeito: a Corrida em pontos, o Mundo pela fase mais longe
  const JOGOS = {
    corrida: { titulo: '🏆 Ranking dos corredores', valor: (n) => String(n), falta: (n) => n + (n === 1 ? ' ponto' : ' pontos'), resultado: (n) => '<b>' + n + '</b> pontos' },
    mundo: { titulo: '🏆 Ranking dos aventureiros', valor: (n) => 'Fase ' + n, falta: (n) => n + (n === 1 ? ' fase' : ' fases'), resultado: (n) => 'fase <b>' + n + '</b>' },
  };
  let cfg = JOGOS.corrida;
  const MEDALHAS = ['🥇', '🥈', '🥉'];
  function desenhar(tela, dados, info, aba) {
    const r = dados[aba] || { top: [], eu: null, jogadores: 0 };
    const top = r.top || [];
    const podio = [top[1], top[0], top[2]]; // 2º, 1º, 3º
    const eu = r.eu;
    const naLista = top.some(x => x.eu);
    let recado = '';
    if (eu && eu.pos === 1) recado = `👑 Você é o <b>campeão</b>${aba === 'semana' ? ' da semana' : ''}! Ninguém te alcança!`;
    else if (eu && eu.alvo) recado = `🎯 Faltam <b>${cfg.falta(eu.alvo.faltam)}</b> para passar ${esc(eu.alvo.avatar)} <b>${esc(eu.alvo.nome)}</b>!`;
    tela.innerHTML = `
      <div class="rk-cartao rk-entra">
        <div class="rk-faixa">${cfg.titulo}</div>
        ${info.novoRecorde ? '<div class="rk-recorde">✨ Novo recorde seu! ✨</div>' : ''}
        <div class="rk-abas" role="tablist">
          <button class="rk-aba${aba === 'semana' ? ' ativa' : ''}" data-aba="semana" role="tab">📅 Esta semana</button>
          <button class="rk-aba${aba === 'geral' ? ' ativa' : ''}" data-aba="geral" role="tab">🌎 De todos os tempos</button>
        </div>
        ${top.length ? `
        <div class="rk-podio">
          ${podio.map((p, i) => {
            const lugar = [2, 1, 3][i];
            if (!p) return `<div class="rk-degrau rk-l${lugar} vazio"><div class="rk-bicho">❔</div><div class="rk-bloco"><span>${lugar}º</span></div></div>`;
            return `<div class="rk-degrau rk-l${lugar}${p.eu ? ' eu' : ''}" style="animation-delay:${[0.35, 0.15, 0.55][i]}s">
              ${lugar === 1 ? '<div class="rk-coroa">👑</div>' : ''}
              <div class="rk-bicho">${esc(p.avatar)}</div>
              <div class="rk-nome-p">${esc(p.nome)}${p.eu ? ' <small>(você)</small>' : ''}</div>
              <div class="rk-pts">${cfg.valor(p.pontos)}</div>
              <div class="rk-bloco"><span>${MEDALHAS[lugar - 1]}</span></div>
            </div>`;
          }).join('')}
        </div>
        <ol class="rk-lista">
          ${top.slice(3).map((p, i) => `<li class="${p.eu ? 'eu' : ''}" style="animation-delay:${0.7 + i * 0.06}s"><span class="rk-pos">${p.pos}º</span><span class="rk-av">${esc(p.avatar)}</span><span class="rk-n">${esc(p.nome)}${p.eu ? ' <small>(você)</small>' : ''}</span><span class="rk-pt">${cfg.valor(p.pontos)}</span></li>`).join('')}
          ${eu && !naLista ? `<li class="rk-sep">⋯</li><li class="eu"><span class="rk-pos">${eu.pos}º</span><span class="rk-av">${esc(eu.avatar)}</span><span class="rk-n">${esc(eu.nome)} <small>(você)</small></span><span class="rk-pt">${cfg.valor(eu.pontos)}</span></li>` : ''}
        </ol>` : '<p class="rk-vazio">Ninguém jogou ainda esta semana. Seja o primeiro! 🚀</p>'}
        ${recado ? `<p class="rk-recado">${recado}</p>` : ''}
        <p class="rk-rodape">${r.jogadores} ${r.jogadores === 1 ? 'jogador' : 'jogadores'}${info.pontos != null ? ` · seu resultado agora: ${cfg.resultado(info.pontos)}` : ''} · <button class="rk-trocar">✏️ trocar nome</button></p>
        <button class="botao-pronto rk-continuar">▶ Continuar</button>
      </div>`;
  }

  // sem resposta: diz "sem internet" só quando o aparelho está mesmo desconectado
  function mostrarSemInternet(tela, info) {
    const offline = navigator.onLine === false;
    const guardado = info.pontos != null ? `Seu resultado (${cfg.resultado(info.pontos)}) ficou guardado e entra no ranking ${offline ? 'quando tiver internet' : 'assim que ele voltar'}.` : '';
    tela.innerHTML = `
      <div class="rk-cartao rk-entra">
        <div class="rk-faixa">${cfg.titulo}</div>
        <div class="rk-bicho-grande">${offline ? '📶' : '🛠️'}</div>
        <h2 class="rk-titulo">${offline ? 'Sem internet agora' : 'O ranking não respondeu'}</h2>
        <p class="rk-sub">${guardado || (offline ? 'O ranking aparece quando tiver internet.' : 'Tente de novo daqui a pouquinho.')}</p>
        <button class="botao-largo rk-tentar">🔄 Tentar de novo</button>
        <button class="botao-pronto rk-continuar">▶ Continuar</button>
      </div>`;
  }

  // resultados que não conseguiram ser enviados (sem internet) ficam para a próxima
  const lerPendentes = () => { try { return JSON.parse(M.ler('miguel-ranking-pendente') || '[]'); } catch (e) { return []; } };
  function enviar(url, jogo, pontos, nivel, j) {
    // sem pontos: só olha o ranking (botão da capa do jogo)
    if (pontos == null) return fetch(url + (url.indexOf('?') < 0 ? '?' : '&') + 'ranking=' + encodeURIComponent(jogo) + '&aparelho=' + encodeURIComponent(codigo()) + '&t=' + Date.now()).then(r => r.json());
    return fetch(url, { method: 'POST', body: JSON.stringify({ aparelho: codigo(), ranking: { jogo, pontos, nivel, nome: j.nome, avatar: j.avatar } }) })
      .then(r => r.json());
  }
  function enviarPendentes(url, j) {
    const lista = lerPendentes();
    if (!lista.length) return Promise.resolve();
    M.guardar('miguel-ranking-pendente', '[]');
    return Promise.all(lista.map(p => enviar(url, p.jogo, p.pontos, p.nivel, j).catch(() => {
      const ainda = lerPendentes(); ainda.push(p); M.guardar('miguel-ranking-pendente', JSON.stringify(ainda.slice(-10)));
    })));
  }

  // mostra o ranking por cima do jogo; resolve quando a criança toca em Continuar
  function mostrar({ jogo, pontos, nivel, novoRecorde, dentro, fixo }) {
    return new Promise((fim) => {
      cfg = JOGOS[jogo] || JOGOS.corrida;
      const url = coletor();
      if (!url) { fim(); return; } // sem coletor configurado, não há ranking
      const tela = document.createElement('div');
      tela.className = 'rk-tela' + (fixo ? ' rk-fixa' : '');
      tela.setAttribute('role', 'dialog');
      tela.setAttribute('aria-label', 'Ranking');
      tela.innerHTML = '<div class="rk-confete" aria-hidden="true">' + Array.from({ length: 24 }, (_, i) => `<i style="left:${(i * 37) % 100}%;animation-delay:${(i % 8) * 0.25}s;background:${['#ffd54f', '#ff80ab', '#80deea', '#b388ff', '#a5d6a7', '#ffab91'][i % 6]}"></i>`).join('') + '</div><div class="rk-conteudo"></div>';
      (dentro || document.body).appendChild(tela);
      const conteudo = tela.querySelector('.rk-conteudo');
      const info = { pontos, novoRecorde };
      let dados = null, aba = 'semana';
      const fechar = () => { tela.remove(); fim(); };
      tela.addEventListener('pointerdown', (e) => e.stopPropagation());
      tela.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target.closest('.rk-continuar')) { fechar(); return; }
        if (e.target.closest('.rk-tentar')) { carregar(); return; }
        const a = e.target.closest('[data-aba]');
        if (a && dados) { aba = a.dataset.aba; desenhar(conteudo, dados, info, aba); return; }
        if (e.target.closest('.rk-trocar')) {
          pedirNome(conteudo).then(j => enviar(url, jogo, pontos, nivel, j)).then(d => { dados = d; desenhar(conteudo, dados, info, aba); }).catch(() => mostrarSemInternet(conteudo, info));
        }
      });
      let guardouPendente = false;
      function carregar() {
      const jogador = lerJogador();
      (jogador || pontos == null ? Promise.resolve(jogador) : pedirNome(conteudo))
        .then((j) => {
          conteudo.innerHTML = '<div class="rk-cartao rk-carregando"><div class="rk-bicho-grande">🏆</div><p>Buscando o ranking…</p></div>';
          return (j ? enviarPendentes(url, j) : Promise.resolve()).then(() => enviar(url, jogo, pontos, nivel, j));
        })
        .then((d) => {
          if (!d || d.erro) throw new Error('ranking');
          dados = d;
          // se o placar da semana estiver vazio, abre no de todos os tempos
          if (!(d.semana && d.semana.top && d.semana.top.length)) aba = 'geral';
          desenhar(conteudo, dados, info, aba);
          if (d[aba] && d[aba].eu && d[aba].eu.pos <= 3) M.miar('feliz');
        })
        .catch(() => {
          if (pontos != null && !guardouPendente) { guardouPendente = true; const p = lerPendentes(); p.push({ jogo, pontos, nivel }); M.guardar('miguel-ranking-pendente', JSON.stringify(p.slice(-10))); }
          mostrarSemInternet(conteudo, info);
        });
      }
      carregar();
    });
  }

  M.ranking = { mostrar };
})();
