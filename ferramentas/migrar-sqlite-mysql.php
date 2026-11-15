<?php
// Copia os dados do banco antigo (miguel.sqlite) para o MySQL. Roda uma vez só:
//   1. Abra antes https://SEU-DOMINIO/miguel-coletor/coletor.php (o coletor novo cria as tabelas no MySQL).
//   2. Depois abra https://SEU-DOMINIO/miguel-coletor/migrar.php?chave=SUA-CHAVE
// No fim, renomeia o miguel.sqlite para miguel.sqlite.migrado (fica de backup) e apaga a si mesmo.

header('Content-Type: application/json; charset=utf-8');
$pasta = __DIR__;
$cfg = include "$pasta/config.php";
if (!is_array($cfg) || strlen((string)($cfg['chave'] ?? '')) < 12 || !hash_equals($cfg['chave'], (string)($_GET['chave'] ?? ''))) { echo json_encode(['erro' => 'chave errada']); exit; }
if (!file_exists("$pasta/miguel.sqlite")) { echo json_encode(['erro' => 'não achei o miguel.sqlite (já migrado?)']); exit; }

$velho = new PDO("sqlite:$pasta/miguel.sqlite", null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
$novo = new PDO('mysql:host=' . ($cfg['host'] ?? 'localhost') . ';dbname=' . $cfg['banco'] . ';charset=utf8mb4', $cfg['usuario'], $cfg['senha'],
  [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);

$tabelas = [
  'aparelhos' => ['aparelho', 'apelido', 'primeiro', 'ultimo', 'versao', 'instalado', 'tela', 'modelo', 'minutos', 'aberturas', 'erros', 'jogos', 'visto', 'agora'],
  'registros' => ['quando', 'aparelho', 'apelido', 'tipo', 'dados'],
  'ranking' => ['aparelho', 'jogo', 'periodo', 'nome', 'avatar', 'pontos', 'nivel', 'quando'],
  'transferencias' => ['codigo', 'dados', 'criado'],
];
$feito = [];
$novo->beginTransaction();
foreach ($tabelas as $tabela => $colunas) {
  $existe = $velho->query("SELECT name FROM sqlite_master WHERE type = 'table' AND name = '$tabela'")->fetchColumn();
  if (!$existe) { $feito[$tabela] = 0; continue; }
  // colunas que o banco antigo talvez não tenha (versões mais velhas do coletor)
  $tem = array_column($velho->query("PRAGMA table_info($tabela)")->fetchAll(), 'name');
  $cols = array_values(array_intersect($colunas, $tem));
  $ins = $novo->prepare("REPLACE INTO $tabela (" . implode(', ', $cols) . ') VALUES (' . implode(', ', array_fill(0, count($cols), '?')) . ')');
  $n = 0;
  foreach ($velho->query("SELECT " . implode(', ', $cols) . " FROM $tabela" . ($tabela === 'registros' ? ' ORDER BY id' : '')) as $linha) {
    $ins->execute(array_map(fn ($c) => $linha[$c], $cols));
    $n++;
  }
  $feito[$tabela] = $n;
}
$novo->commit();
$velho = null;
rename("$pasta/miguel.sqlite", "$pasta/miguel.sqlite.migrado");
@unlink(__FILE__);
echo json_encode(['ok' => true, 'copiados' => $feito], JSON_UNESCAPED_UNICODE);
