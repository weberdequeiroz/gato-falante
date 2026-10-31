<?php
// Coletor do Miguel para hospedagem com PHP (ex.: Hostinger).
// Recebe os registros dos aparelhos (POST) e entrega o resumo ao painel admin (GET com a chave).
// Como instalar:
//  1. No Gerenciador de Arquivos da Hostinger, crie a pasta public_html/miguel-coletor.
//  2. Envie este arquivo para lá (com o nome coletor.php) e troque a CHAVE abaixo por uma senha só sua.
//  3. O endereço fica assim: https://SEU-DOMINIO/miguel-coletor/coletor.php
//     Cole no painel admin, em "Endereço do coletor", e a mesma chave em "Chave de leitura".
// Os dados ficam num banco SQLite na mesma pasta (o arquivo .htaccess criado aqui bloqueia o download dele).

const CHAVE = 'TROQUE-ESTA-CHAVE';
const MAX_REGISTROS = 50000;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$pasta = __DIR__;
if (!file_exists("$pasta/.htaccess")) {
  file_put_contents("$pasta/.htaccess", "<FilesMatch \"\\.(sqlite|db)$\">\n  <IfModule mod_authz_core.c>\n    Require all denied\n  </IfModule>\n  <IfModule !mod_authz_core.c>\n    Order allow,deny\n    Deny from all\n  </IfModule>\n</FilesMatch>\nOptions -Indexes\n");
}
$db = new PDO("sqlite:$pasta/miguel.sqlite");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
$db->exec('CREATE TABLE IF NOT EXISTS registros (id INTEGER PRIMARY KEY, quando INTEGER, aparelho TEXT, apelido TEXT, tipo TEXT, dados TEXT)');
$db->exec('CREATE INDEX IF NOT EXISTS registros_tipo ON registros (tipo, id)');
$db->exec('CREATE TABLE IF NOT EXISTS aparelhos (aparelho TEXT PRIMARY KEY, apelido TEXT, primeiro INTEGER, ultimo INTEGER, versao TEXT,
  instalado TEXT, tela TEXT, modelo TEXT, minutos REAL DEFAULT 0, aberturas INTEGER DEFAULT 0, erros INTEGER DEFAULT 0, jogos TEXT DEFAULT \'{}\')');

function json_saida($obj) {
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($obj, JSON_UNESCAPED_UNICODE);
  exit;
}

// ---------- os aparelhos mandam os registros ----------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $bruto = file_get_contents('php://input', false, null, 0, 200000);
  $corpo = json_decode($bruto, true);
  $codigo = substr(preg_replace('/[^A-Z0-9]/', '', strtoupper($corpo['aparelho'] ?? '')), 0, 6);
  $eventos = is_array($corpo['eventos'] ?? null) ? array_slice($corpo['eventos'], -300) : [];
  if (!$codigo || !$eventos) { echo 'vazio'; exit; }
  $apelido = mb_substr((string)($corpo['apelido'] ?? ''), 0, 30);

  $db->beginTransaction();
  $ins = $db->prepare('INSERT INTO registros (quando, aparelho, apelido, tipo, dados) VALUES (?, ?, ?, ?, ?)');
  $sel = $db->prepare('SELECT * FROM aparelhos WHERE aparelho = ?');
  $sel->execute([$codigo]);
  $a = $sel->fetch(PDO::FETCH_ASSOC) ?: ['aparelho' => $codigo, 'apelido' => '', 'primeiro' => null, 'ultimo' => null, 'versao' => '',
    'instalado' => '', 'tela' => '', 'modelo' => '', 'minutos' => 0, 'aberturas' => 0, 'erros' => 0, 'jogos' => '{}'];
  $jogos = json_decode($a['jogos'] ?: '{}', true) ?: [];
  foreach ($eventos as $ev) {
    $t = (int)($ev['t'] ?? 0) ?: (int)(microtime(true) * 1000);
    $tipo = substr((string)($ev['tipo'] ?? ''), 0, 20);
    $d = is_array($ev['dados'] ?? null) ? $ev['dados'] : [];
    $ins->execute([$t, $codigo, $apelido, $tipo, substr(json_encode($d, JSON_UNESCAPED_UNICODE), 0, 1000)]);
    if (!$a['primeiro'] || $t < $a['primeiro']) $a['primeiro'] = $t;
    if (!$a['ultimo'] || $t > $a['ultimo']) $a['ultimo'] = $t;
    if ($tipo === 'abriu') {
      $a['versao'] = (string)($d['versao'] ?? $a['versao']);
      $a['instalado'] = !empty($d['instalado']) ? 'sim' : 'não';
      $a['tela'] = (string)($d['tela'] ?? $a['tela']);
      $a['modelo'] = substr((string)($d['aparelho'] ?? $a['modelo']), 0, 160);
      $a['aberturas']++;
    }
    if ($tipo === 'uso') $a['minutos'] = round($a['minutos'] + ((float)($d['segundos'] ?? 0)) / 60, 1);
    if ($tipo === 'erro') $a['erros']++;
    if ($tipo === 'jogo' && !empty($d['id'])) { $id = substr((string)$d['id'], 0, 30); $jogos[$id] = ($jogos[$id] ?? 0) + 1; }
  }
  if ($apelido !== '') $a['apelido'] = $apelido;
  $a['jogos'] = json_encode($jogos, JSON_UNESCAPED_UNICODE);
  $db->prepare('INSERT OR REPLACE INTO aparelhos (aparelho, apelido, primeiro, ultimo, versao, instalado, tela, modelo, minutos, aberturas, erros, jogos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')->execute([$a['aparelho'], $a['apelido'], $a['primeiro'], $a['ultimo'], $a['versao'],
    $a['instalado'], $a['tela'], $a['modelo'], $a['minutos'], $a['aberturas'], $a['erros'], $a['jogos']]);
  $db->exec('DELETE FROM registros WHERE id <= (SELECT MAX(id) FROM registros) - ' . MAX_REGISTROS);
  $db->commit();
  echo 'ok';
  exit;
}

// ---------- o painel admin lê (precisa da chave) ----------
if (!hash_equals(CHAVE, (string)($_GET['chave'] ?? '')) || CHAVE === 'TROQUE-ESTA-CHAVE') json_saida(['erro' => 'chave errada']);
$iso = function ($ms) { return $ms ? gmdate('Y-m-d\TH:i:s\Z', (int)($ms / 1000)) : null; };
$aparelhos = [];
foreach ($db->query('SELECT * FROM aparelhos ORDER BY ultimo DESC') as $a) {
  $a['primeiro'] = $iso($a['primeiro']);
  $a['ultimo'] = $iso($a['ultimo']);
  $a['jogos'] = json_decode($a['jogos'] ?: '{}', true) ?: new stdClass();
  $a['minutos'] = (float)$a['minutos']; $a['aberturas'] = (int)$a['aberturas']; $a['erros'] = (int)$a['erros'];
  $aparelhos[] = $a;
}
$erros = [];
foreach ($db->query("SELECT quando, aparelho, apelido, dados FROM registros WHERE tipo = 'erro' ORDER BY id DESC LIMIT 100") as $r) {
  $erros[] = ['quando' => $iso($r['quando']), 'aparelho' => $r['aparelho'], 'apelido' => $r['apelido'], 'detalhes' => $r['dados']];
}
json_saida(['aparelhos' => $aparelhos, 'erros' => $erros]);
