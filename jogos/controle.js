// Controle dos aparelhos: código anônimo, apelido opcional, registros de uso e de erros,
// bloqueio e recados combinados no arquivo controle.json (editado pelo painel admin.html).
// Carregado no início da página (sem defer) para pegar até os erros que travam o jogo.
(function () {
  var ler = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var guardar = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };

  // código aleatório do aparelho (não tem nada pessoal); 6 letras e números fáceis de ler
  var codigo = ler('miguel-aparelho');
  if (!codigo) {
    var letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    codigo = '';
    for (var i = 0; i < 6; i++) codigo += letras[Math.floor(Math.random() * letras.length)];
    guardar('miguel-aparelho', codigo);
  }

  // registros: ficam guardados no aparelho (no máximo 300) até serem enviados ao coletor, se houver um
  var MAX = 300;
  var lerRegistros = function () { try { return JSON.parse(ler('miguel-registros') || '[]'); } catch (e) { return []; } };
  function anotar(tipo, dados) {
    var lista = lerRegistros();
    lista.push({ t: Date.now(), tipo: tipo, dados: dados || {} });
    if (lista.length > MAX) lista = lista.slice(lista.length - MAX);
    guardar('miguel-registros', JSON.stringify(lista));
  }

  window.addEventListener('error', function (e) {
    anotar('erro', { msg: String(e.message || 'erro'), arquivo: String(e.filename || '').split('/').pop(), linha: e.lineno || 0 });
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    anotar('erro', { msg: String((r && r.message) || r || 'promessa recusada').slice(0, 200) });
  });

  // tempo de uso: conta enquanto a tela está visível
  var inicio = Date.now();
  function fecharSessao() {
    var seg = Math.round((Date.now() - inicio) / 1000);
    if (seg >= 5) anotar('uso', { segundos: seg });
    inicio = Date.now();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { fecharSessao(); enviar(); } else inicio = Date.now();
  });

  var controle = null;
  try { controle = JSON.parse(ler('miguel-controle') || 'null'); } catch (e) {}

  // envia os registros ao coletor (se o painel tiver um configurado); sem coletor, ficam no aparelho
  function enviar() {
    if (!controle || !controle.coletor) return;
    var lista = lerRegistros();
    if (!lista.length) return;
    var corpo = JSON.stringify({ aparelho: codigo, apelido: ler('miguel-apelido') || '', eventos: lista });
    try {
      var ok = navigator.sendBeacon && navigator.sendBeacon(controle.coletor, new Blob([corpo], { type: 'text/plain' }));
      if (ok) guardar('miguel-registros', '[]');
    } catch (e) {}
  }

  var tela = null;
  function mostrarTela(html) {
    if (!tela) {
      tela = document.createElement('div');
      tela.id = 'controle-tela';
      tela.setAttribute('role', 'dialog');
      tela.style.cssText = 'position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(31,45,61,.6);font-family:inherit';
      document.body.appendChild(tela);
    }
    tela.innerHTML = '<div style="width:100%;max-width:440px;background:#fff;border-radius:24px;padding:22px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.25)">' + html + '</div>';
    tela.style.display = 'flex';
  }
  var escapar = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function aplicar() {
    if (!controle) return;
    var bloqueados = controle.bloqueados || {};
    if (bloqueados[codigo]) {
      mostrarTela('<div style="font-size:64px">🔒</div><h2 style="margin:6px 0">Este aparelho está bloqueado</h2>' +
        '<p style="font-size:16px;font-weight:600;color:#5b6b7c">Peça para o responsável liberar o jogo.</p>' +
        '<p style="font-size:13px;color:#8796a5">Código do aparelho: <b>' + codigo + '</b></p>');
      return;
    }
    // recados: cada um aparece uma vez só, para todos ou para este aparelho
    var vistos = [];
    try { vistos = JSON.parse(ler('miguel-recados-vistos') || '[]'); } catch (e) {}
    var agora = Date.now();
    var recado = (controle.recados || []).filter(function (r) {
      return r && r.id && r.texto && vistos.indexOf(r.id) < 0 && (r.para === 'todos' || r.para === codigo) && (!r.ate || new Date(r.ate).getTime() > agora);
    })[0];
    if (!recado) return;
    mostrarTela('<div style="font-size:56px">💌</div><h2 style="margin:6px 0">Recado</h2>' +
      '<p style="font-size:19px;font-weight:700;line-height:1.4;white-space:pre-line">' + escapar(recado.texto) + '</p>' +
      '<button id="controle-ok" style="width:100%;min-height:54px;margin-top:10px;border:0;border-radius:18px;background:#ef7d1a;color:#fff;font:inherit;font-size:20px;font-weight:900">OK</button>');
    document.getElementById('controle-ok').addEventListener('click', function () {
      vistos.push(recado.id);
      guardar('miguel-recados-vistos', JSON.stringify(vistos.slice(-100)));
      tela.style.display = 'none';
      aplicar();
    });
  }

  function buscarControle() {
    fetch('controle.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (c) {
        if (!c) return;
        controle = c;
        guardar('miguel-controle', JSON.stringify(c));
        aplicar();
        enviar();
      })
      .catch(function () {});
  }

  function iniciar() {
    anotar('abriu', {
      versao: (document.querySelector('script[src*="nucleo.js"]') || { src: '' }).src.split('v=')[1] || '',
      aparelho: navigator.userAgent.slice(0, 160),
      instalado: !!(window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true,
      tela: screen.width + 'x' + screen.height,
    });
    aplicar(); // com o último controle guardado (funciona sem internet)
    buscarControle();
    setInterval(buscarControle, 15 * 60 * 1000);
    // ajustes: mostra o código e guarda o apelido
    var campoCodigo = document.getElementById('aj-codigo');
    if (campoCodigo) campoCodigo.textContent = codigo;
    var apelido = document.getElementById('aj-apelido');
    if (apelido) {
      apelido.value = ler('miguel-apelido') || '';
      apelido.addEventListener('change', function () { guardar('miguel-apelido', apelido.value.trim().slice(0, 30)); });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();

  window.MiguelControle = { codigo: codigo, anotar: anotar, registros: lerRegistros };
})();
