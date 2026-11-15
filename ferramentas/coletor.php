<?php
// Coletor do Miguel para hospedagem com PHP e MySQL (ex.: Hostinger).
// Recebe os registros dos aparelhos (POST), guarda o ranking e a troca de progresso
// e entrega o resumo ao painel admin (GET com a chave).
// Como instalar:
//  1. Crie um banco MySQL no hPanel (Bancos de dados) e anote o nome, o usuário e a senha.
//  2. Na pasta public_html/miguel-coletor, envie este arquivo (coletor.php) e crie o config.php:
//       <?php return ['banco' => 'u123_miguel', 'usuario' => 'u123_miguel', 'senha' => '...', 'chave' => 'sua-chave'];
//  3. O endereço fica assim: https://SEU-DOMINIO/miguel-coletor/coletor.php
//     Cole no painel admin, em "Endereço do coletor", e a mesma chave em "Chave de leitura".
// As senhas ficam só no config.php do servidor (nunca no GitHub). O .htaccess criado aqui bloqueia o acesso a ele.

const MAX_REGISTROS = 50000;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$pasta = __DIR__;
$protecao = "<FilesMatch \"^(config\\.php|.*\\.(sqlite|db|migrado))$\">\n  <IfModule mod_authz_core.c>\n    Require all denied\n  </IfModule>\n  <IfModule !mod_authz_core.c>\n    Order allow,deny\n    Deny from all\n  </IfModule>\n</FilesMatch>\nOptions -Indexes\n";
if (!file_exists("$pasta/.htaccess") || strpos(file_get_contents("$pasta/.htaccess"), 'config') === false) file_put_contents("$pasta/.htaccess", $protecao);

$cfg = file_exists("$pasta/config.php") ? include "$pasta/config.php" : null;
if (!is_array($cfg)) { http_response_code(500); exit('falta o config.php'); }
define('CHAVE', (string)($cfg['chave'] ?? ''));
$db = new PDO('mysql:host=' . ($cfg['host'] ?? 'localhost') . ';dbname=' . $cfg['banco'] . ';charset=utf8mb4', $cfg['usuario'], $cfg['senha'], [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::MYSQL_ATTR_FOUND_ROWS => true,
]);
// as tabelas são criadas na primeira vez
$db->exec("CREATE TABLE IF NOT EXISTS registros (id BIGINT AUTO_INCREMENT PRIMARY KEY, quando BIGINT, aparelho VARCHAR(6), apelido VARCHAR(30), tipo VARCHAR(20), dados TEXT,
  KEY registros_tipo (tipo, id), KEY registros_aparelho (aparelho, id)) DEFAULT CHARSET=utf8mb4");
$db->exec("CREATE TABLE IF NOT EXISTS aparelhos (aparelho VARCHAR(6) PRIMARY KEY, apelido VARCHAR(30) DEFAULT '', primeiro BIGINT NULL, ultimo BIGINT NULL,
  versao VARCHAR(40) DEFAULT '', instalado VARCHAR(5) DEFAULT '', tela VARCHAR(20) DEFAULT '', modelo VARCHAR(160) DEFAULT '', minutos DOUBLE DEFAULT 0,
  aberturas INT DEFAULT 0, erros INT DEFAULT 0, jogos TEXT, visto BIGINT NULL, agora VARCHAR(60) NULL) DEFAULT CHARSET=utf8mb4");

function json_saida($obj) {
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($obj, JSON_UNESCAPED_UNICODE);
  exit;
}

// ---------- ranking dos jogos (o melhor resultado de cada aparelho, no geral e na semana) ----------
$db->exec("CREATE TABLE IF NOT EXISTS ranking (aparelho VARCHAR(6), jogo VARCHAR(20), periodo VARCHAR(20), nome VARCHAR(30), avatar VARCHAR(16), pontos INT, nivel INT, quando BIGINT,
  PRIMARY KEY (aparelho, jogo, periodo), KEY ranking_lista (jogo, periodo, pontos)) DEFAULT CHARSET=utf8mb4");
function semana() { return 'semana-' . gmdate('o-W'); }
function nome_limpo($t) {
  $t = preg_replace('/[^\p{L}\p{N} ]/u', '', (string)$t);
  $t = trim(preg_replace('/\s+/', ' ', $t));
  $t = mb_substr($t, 0, 14);
  // palavras feias viram um nome neutro
  $feias = ['merda', 'bosta', 'porra', 'caralho', 'puta', 'viado', 'buceta', 'cu ', 'fdp', 'pqp', 'idiota', 'burro', 'otario', 'otário', 'cacete'];
  $baixo = ' ' . mb_strtolower($t) . ' ';
  foreach ($feias as $f) if (mb_strpos($baixo, $f) !== false) return 'Corredor';
  return $t !== '' ? $t : 'Corredor';
}
function ranking_de($db, $jogo, $codigo) {
  $saida = [];
  foreach (['geral' => 'geral', 'semana' => semana()] as $chave => $periodo) {
    $sel = $db->prepare('SELECT aparelho, nome, avatar, pontos, nivel FROM ranking WHERE jogo = ? AND periodo = ? ORDER BY pontos DESC, quando ASC LIMIT 10');
    $sel->execute([$jogo, $periodo]);
    $lista = [];
    $pos = 0;
    foreach ($sel as $r) { $pos++; $lista[] = ['pos' => $pos, 'nome' => $r['nome'], 'avatar' => $r['avatar'], 'pontos' => (int)$r['pontos'], 'nivel' => (int)$r['nivel'], 'eu' => $r['aparelho'] === $codigo]; }
    $eu = null;
    if ($codigo) {
      $m = $db->prepare('SELECT nome, avatar, pontos, nivel, quando FROM ranking WHERE aparelho = ? AND jogo = ? AND periodo = ?');
      $m->execute([$codigo, $jogo, $periodo]);
      if ($r = $m->fetch()) {
        $acima = $db->prepare('SELECT COUNT(*) FROM ranking WHERE jogo = ? AND periodo = ? AND (pontos > ? OR (pontos = ? AND quando < ?))');
        $acima->execute([$jogo, $periodo, $r['pontos'], $r['pontos'], $r['quando']]);
        $p = (int)$acima->fetchColumn() + 1;
        // quem está logo acima (para a criança saber quem pode passar)
        $alvo = null;
        if ($p > 1) {
          $a = $db->prepare('SELECT nome, avatar, pontos FROM ranking WHERE jogo = ? AND periodo = ? AND (pontos > ? OR (pontos = ? AND quando < ?)) ORDER BY pontos ASC, quando DESC LIMIT 1');
          $a->execute([$jogo, $periodo, $r['pontos'], $r['pontos'], $r['quando']]);
          if ($x = $a->fetch()) $alvo = ['nome' => $x['nome'], 'avatar' => $x['avatar'], 'faltam' => (int)$x['pontos'] - (int)$r['pontos'] + 1];
        }
        $eu = ['pos' => $p, 'nome' => $r['nome'], 'avatar' => $r['avatar'], 'pontos' => (int)$r['pontos'], 'nivel' => (int)$r['nivel'], 'alvo' => $alvo];
      }
    }
    $t = $db->prepare('SELECT COUNT(*) FROM ranking WHERE jogo = ? AND periodo = ?');
    $t->execute([$jogo, $periodo]);
    $saida[$chave] = ['top' => $lista, 'eu' => $eu, 'jogadores' => (int)$t->fetchColumn()];
  }
  return $saida;
}

// ---------- levar o progresso para outro aparelho (código de 6 letras, vale 24 horas, usa uma vez) ----------
$db->exec("CREATE TABLE IF NOT EXISTS transferencias (codigo CHAR(6) PRIMARY KEY, dados MEDIUMTEXT, criado INT) DEFAULT CHARSET=utf8mb4");
$db->exec('DELETE FROM transferencias WHERE criado < ' . (time() - 86400));
if (!empty($_GET['receber'])) {
  $cod = substr(preg_replace('/[^A-Z0-9]/', '', strtoupper((string)$_GET['receber'])), 0, 6);
  $sel = $db->prepare('SELECT dados FROM transferencias WHERE codigo = ?');
  $sel->execute([$cod]);
  $dados = $sel->fetchColumn();
  if ($dados === false) json_saida(['erro' => 'código não encontrado ou vencido']);
  $db->prepare('DELETE FROM transferencias WHERE codigo = ?')->execute([$cod]);
  json_saida(['dados' => json_decode($dados, true)]);
}

// ---------- os aparelhos mandam os registros ----------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $bruto = file_get_contents('php://input', false, null, 0, 400000);
  $corpo = json_decode($bruto, true);
  if (is_array($corpo['transferir'] ?? null)) {
    $letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    do {
      $cod = '';
      for ($i = 0; $i < 6; $i++) $cod .= $letras[random_int(0, strlen($letras) - 1)];
      $existe = $db->prepare('SELECT 1 FROM transferencias WHERE codigo = ?');
      $existe->execute([$cod]);
    } while ($existe->fetchColumn());
    $db->prepare('INSERT INTO transferencias VALUES (?, ?, ?)')->execute([$cod, json_encode($corpo['transferir'], JSON_UNESCAPED_UNICODE), time()]);
    json_saida(['codigo' => $cod]);
  }
  $codigo = substr(preg_replace('/[^A-Z0-9]/', '', strtoupper($corpo['aparelho'] ?? '')), 0, 6);
  // resultado de uma partida para o ranking: guarda se for o melhor do aparelho e devolve o ranking
  if ($codigo && is_array($corpo['ranking'] ?? null)) {
    $r = $corpo['ranking'];
    $jogo = substr(preg_replace('/[^a-z0-9]/', '', (string)($r['jogo'] ?? '')), 0, 20);
    $pontos = max(0, min(500000, (int)($r['pontos'] ?? 0)));
    $nivel = max(1, min(999, (int)($r['nivel'] ?? 1)));
    $nome = nome_limpo($r['nome'] ?? '');
    $avatar = mb_substr((string)($r['avatar'] ?? '🐱'), 0, 4);
    if (!$jogo) json_saida(['erro' => 'jogo']);
    $agora = (int)(microtime(true) * 1000);
    $db->beginTransaction();
    foreach (['geral', semana()] as $periodo) {
      $m = $db->prepare('SELECT pontos FROM ranking WHERE aparelho = ? AND jogo = ? AND periodo = ?');
      $m->execute([$codigo, $jogo, $periodo]);
      $antes = $m->fetchColumn();
      if ($antes === false) $db->prepare('INSERT INTO ranking VALUES (?, ?, ?, ?, ?, ?, ?, ?)')->execute([$codigo, $jogo, $periodo, $nome, $avatar, $pontos, $nivel, $agora]);
      elseif ($pontos > (int)$antes) $db->prepare('UPDATE ranking SET nome = ?, avatar = ?, pontos = ?, nivel = ?, quando = ? WHERE aparelho = ? AND jogo = ? AND periodo = ?')->execute([$nome, $avatar, $pontos, $nivel, $agora, $codigo, $jogo, $periodo]);
      else $db->prepare('UPDATE ranking SET nome = ?, avatar = ? WHERE aparelho = ? AND jogo = ? AND periodo = ?')->execute([$nome, $avatar, $codigo, $jogo, $periodo]);
    }
    $db->commit();
    json_saida(ranking_de($db, $jogo, $codigo));
  }
  // "estou aqui": o aparelho está com o jogo aberto agora
  if ($codigo && is_array($corpo['ping'] ?? null)) {
    $agora = (int)(microtime(true) * 1000);
    $onde = mb_substr((string)($corpo['ping']['onde'] ?? ''), 0, 60);
    $apelido = mb_substr((string)($corpo['apelido'] ?? ''), 0, 30);
    $up = $db->prepare("UPDATE aparelhos SET visto = ?, agora = ?, ultimo = GREATEST(COALESCE(ultimo, 0), ?), apelido = CASE WHEN ? <> '' THEN ? ELSE apelido END WHERE aparelho = ?");
    $up->execute([$agora, $onde, $agora, $apelido, $apelido, $codigo]);
    if (!$up->rowCount()) $db->prepare('INSERT INTO aparelhos (aparelho, apelido, primeiro, ultimo, visto, agora) VALUES (?, ?, ?, ?, ?, ?)')->execute([$codigo, $apelido, $agora, $agora, $agora, $onde]);
    echo 'ok';
    exit;
  }
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
  $db->prepare('REPLACE INTO aparelhos (aparelho, apelido, primeiro, ultimo, versao, instalado, tela, modelo, minutos, aberturas, erros, jogos, visto, agora)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')->execute([$a['aparelho'], $a['apelido'], $a['primeiro'], $a['ultimo'], $a['versao'],
    $a['instalado'], $a['tela'], $a['modelo'], $a['minutos'], $a['aberturas'], $a['erros'], $a['jogos'], $a['visto'] ?? null, $a['agora'] ?? null]);
  $maior = (int)$db->query('SELECT MAX(id) FROM registros')->fetchColumn();
  if ($maior > MAX_REGISTROS) $db->exec('DELETE FROM registros WHERE id <= ' . ($maior - MAX_REGISTROS));
  $db->commit();
  echo 'ok';
  exit;
}

// ---------- ranking (aberto: só nomes de jogador, avatares e pontos) ----------
if (!empty($_GET['ranking'])) {
  $jogo = substr(preg_replace('/[^a-z0-9]/', '', (string)$_GET['ranking']), 0, 20);
  $codigo = substr(preg_replace('/[^A-Z0-9]/', '', strtoupper((string)($_GET['aparelho'] ?? ''))), 0, 6);
  json_saida(ranking_de($db, $jogo, $codigo));
}

// ---------- o painel admin lê (precisa da chave) ----------
if (strlen(CHAVE) < 12 || !hash_equals(CHAVE, (string)($_GET['chave'] ?? ''))) json_saida(['erro' => 'chave errada']);
$iso = function ($ms) { return $ms ? gmdate('Y-m-d\TH:i:s\Z', (int)($ms / 1000)) : null; };
// tirar um aparelho do ranking (nome feio, trapaça...)
if (!empty($_GET['tirar_ranking'])) {
  $db->prepare('DELETE FROM ranking WHERE aparelho = ?')->execute([substr(strtoupper((string)$_GET['tirar_ranking']), 0, 6)]);
  json_saida(['ok' => true]);
}
// o ranking com os códigos dos aparelhos (só para o painel)
if (!empty($_GET['ranking_admin'])) {
  $sel = $db->prepare('SELECT aparelho, nome, avatar, pontos, nivel, quando FROM ranking WHERE jogo = ? AND periodo = ? ORDER BY pontos DESC LIMIT 50');
  $sel->execute([substr((string)$_GET['ranking_admin'], 0, 20), 'geral']);
  json_saida(['ranking' => $sel->fetchAll()]);
}
// o que um aparelho fez (os últimos 150 registros)
if (!empty($_GET['aparelho'])) {
  $sel = $db->prepare('SELECT quando, tipo, dados FROM registros WHERE aparelho = ? ORDER BY id DESC LIMIT 150');
  $sel->execute([substr(strtoupper((string)$_GET['aparelho']), 0, 6)]);
  $lista = [];
  foreach ($sel as $r) $lista[] = ['quando' => $iso($r['quando']), 'tipo' => $r['tipo'], 'dados' => json_decode($r['dados'], true)];
  json_saida(['atividades' => $lista, 'agora' => $iso((int)(microtime(true) * 1000))]);
}
$aparelhos = [];
foreach ($db->query('SELECT * FROM aparelhos ORDER BY ultimo DESC') as $a) {
  $a['primeiro'] = $iso($a['primeiro']);
  $a['visto'] = $iso($a['visto'] ?? null);
  $a['ultimo'] = $iso($a['ultimo']);
  $a['jogos'] = json_decode($a['jogos'] ?: '{}', true) ?: new stdClass();
  $a['minutos'] = (float)$a['minutos']; $a['aberturas'] = (int)$a['aberturas']; $a['erros'] = (int)$a['erros'];
  $aparelhos[] = $a;
}
$erros = [];
foreach ($db->query("SELECT quando, aparelho, apelido, dados FROM registros WHERE tipo = 'erro' ORDER BY id DESC LIMIT 100") as $r) {
  $erros[] = ['quando' => $iso($r['quando']), 'aparelho' => $r['aparelho'], 'apelido' => $r['apelido'], 'detalhes' => $r['dados']];
}
json_saida(['aparelhos' => $aparelhos, 'erros' => $erros, 'agora' => $iso((int)(microtime(true) * 1000))]);
