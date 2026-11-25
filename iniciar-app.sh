#!/bin/sh
# DV PRO — iniciador (Mac/Linux): serve a pasta e abre o navegador
cd "$(dirname "$0")" || exit 1
echo "DV PRO — abrindo em http://localhost:3000 (deixe esta janela aberta)"
( sleep 2; (xdg-open http://localhost:3000/ 2>/dev/null || open http://localhost:3000/ 2>/dev/null) & ) &
if command -v node >/dev/null 2>&1; then
  node server.js 3000
elif command -v python3 >/dev/null 2>&1; then
  python3 -m http.server 3000
else
  echo "Não encontrei Node nem Python. Instale grátis em https://nodejs.org"
  read -r _
fi
