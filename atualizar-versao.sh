#!/bin/sh
# Rode antes de cada publicação: muda o número da versão para o app instalado se atualizar sozinho.
set -e
cd "$(dirname "$0")"
v=$(date -u +%Y%m%d%H%M)
# SILENCIOSA=1 ./atualizar-versao.sh  → atualiza sem mostrar o aviso de novidades
if [ -n "$SILENCIOSA" ]; then printf '{"versao": "%s", "silenciosa": true}\n' "$v" > versao.json
else printf '{"versao": "%s"}\n' "$v" > versao.json; fi
sed -i "s/const VERSAO = '[0-9]*';/const VERSAO = '$v';/" index.html
# os arquivos do jogo levam o número da versão, para o celular nunca misturar arquivo novo com antigo
sed -i -E "s#(jogos/[a-z0-9]+\.(js|css))(\?v=[0-9]+)?\"#\1?v=$v\"#g" index.html
echo "versão $v"
