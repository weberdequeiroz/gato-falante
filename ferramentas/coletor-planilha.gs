// Coletor do Miguel: recebe os registros dos aparelhos e guarda numa Planilha Google.
// Como instalar (uma vez só):
//  1. Crie uma planilha nova no Google Drive (ex.: "Registros do Miguel").
//  2. Menu Extensões › Apps Script. Apague o que estiver lá e cole este arquivo inteiro.
//  3. Troque a CHAVE abaixo por uma senha só sua (a mesma vai no painel admin).
//  4. Implantar › Nova implantação › tipo "App da Web":
//       Executar como: Eu  ·  Quem pode acessar: Qualquer pessoa  → Implantar e autorizar.
//  5. Copie o endereço que termina em /exec e cole no painel admin, em "Endereço do coletor".

const CHAVE = 'TROQUE-ESTA-CHAVE';
const MAX_REGISTROS = 20000; // linhas guardadas na aba Registros (as mais antigas saem)

function abas_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let reg = ss.getSheetByName('Registros');
  if (!reg) { reg = ss.insertSheet('Registros'); reg.appendRow(['Quando', 'Aparelho', 'Apelido', 'Tipo', 'Detalhes']); reg.setFrozenRows(1); }
  let apa = ss.getSheetByName('Aparelhos');
  if (!apa) {
    apa = ss.insertSheet('Aparelhos');
    apa.appendRow(['Aparelho', 'Apelido', 'Primeiro uso', 'Último uso', 'Versão', 'Instalado', 'Tela', 'Modelo', 'Minutos', 'Aberturas', 'Erros', 'Jogos']);
    apa.setFrozenRows(1);
  }
  return { reg, apa };
}

// os aparelhos mandam os registros aqui (texto JSON)
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const corpo = JSON.parse(e.postData.contents);
    const codigo = String(corpo.aparelho || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const eventos = Array.isArray(corpo.eventos) ? corpo.eventos.slice(-300) : [];
    if (!codigo || !eventos.length) return ContentService.createTextOutput('vazio');
    const apelido = String(corpo.apelido || '').slice(0, 30);
    const { reg, apa } = abas_();

    reg.getRange(reg.getLastRow() + 1, 1, eventos.length, 5).setValues(eventos.map(ev => [
      new Date(Number(ev.t) || Date.now()), codigo, apelido, String(ev.tipo || '').slice(0, 20), JSON.stringify(ev.dados || {}).slice(0, 1000),
    ]));
    const sobra = reg.getLastRow() - 1 - MAX_REGISTROS;
    if (sobra > 0) reg.deleteRows(2, sobra);

    // resumo por aparelho
    const dados = apa.getDataRange().getValues();
    let linha = dados.findIndex((r, i) => i > 0 && r[0] === codigo);
    let r = linha > 0 ? dados[linha] : [codigo, '', '', '', '', '', '', '', 0, 0, 0, '{}'];
    let jogos = {};
    try { jogos = JSON.parse(r[11] || '{}'); } catch (err) {}
    for (const ev of eventos) {
      const quando = new Date(Number(ev.t) || Date.now()), d = ev.dados || {};
      if (!r[2] || quando < new Date(r[2])) r[2] = quando;
      if (!r[3] || quando > new Date(r[3])) r[3] = quando;
      if (ev.tipo === 'abriu') { r[4] = d.versao || r[4]; r[5] = d.instalado ? 'sim' : 'não'; r[6] = d.tela || r[6]; r[7] = String(d.aparelho || r[7]).slice(0, 160); r[9] = Number(r[9]) + 1; }
      if (ev.tipo === 'uso') r[8] = Math.round((Number(r[8]) + (Number(d.segundos) || 0) / 60) * 10) / 10;
      if (ev.tipo === 'erro') r[10] = Number(r[10]) + 1;
      if (ev.tipo === 'jogo' && d.id) jogos[d.id] = (jogos[d.id] || 0) + 1;
    }
    r[1] = apelido || r[1];
    r[11] = JSON.stringify(jogos);
    if (linha > 0) apa.getRange(linha + 1, 1, 1, 12).setValues([r]);
    else apa.appendRow(r);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

// o painel admin lê daqui (precisa da chave)
function doGet(e) {
  const saida = (obj) => ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  if (!e.parameter || e.parameter.chave !== CHAVE) return saida({ erro: 'chave errada' });
  const { reg, apa } = abas_();
  const cab = ['aparelho', 'apelido', 'primeiro', 'ultimo', 'versao', 'instalado', 'tela', 'modelo', 'minutos', 'aberturas', 'erros', 'jogos'];
  const aparelhos = apa.getDataRange().getValues().slice(1).map(r => {
    const o = {}; cab.forEach((c, i) => { o[c] = r[i] instanceof Date ? r[i].toISOString() : r[i]; });
    try { o.jogos = JSON.parse(o.jogos || '{}'); } catch (err) { o.jogos = {}; }
    return o;
  });
  // últimos 100 erros
  const n = reg.getLastRow() - 1, ini = Math.max(2, reg.getLastRow() - 3000 + 1);
  const ultimos = n > 0 ? reg.getRange(ini, 1, reg.getLastRow() - ini + 1, 5).getValues() : [];
  const erros = ultimos.filter(r => r[3] === 'erro').slice(-100).reverse().map(r => ({ quando: r[0] instanceof Date ? r[0].toISOString() : r[0], aparelho: r[1], apelido: r[2], detalhes: r[4] }));
  return saida({ aparelhos, erros });
}
