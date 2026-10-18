#!/bin/sh
# Rode antes de cada publicação: muda o número da versão para o app instalado se atualizar sozinho.
set -e
cd "$(dirname "$0")"
v=$(date -u +%Y%m%d%H%M)
printf '{"versao": "%s"}\n' "$v" > versao.json
sed -i "s/const VERSAO = '[0-9]*';/const VERSAO = '$v';/" index.html
echo "versão $v"
