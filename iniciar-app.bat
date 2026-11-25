@echo off
chcp 65001 >nul
title DV PRO - Diamond Voice Pro
cd /d "%~dp0"
echo.
echo  DV PRO - Diamond Voice Pro
echo  Lapidando vozes preciosas
echo.
echo  Abrindo o app em http://localhost:3000 ...
echo  (Deixe esta janela aberta enquanto usa o app. Para fechar, feche a janela.)
echo.
start "" /min cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000/"
where node >nul 2>nul
if %errorlevel%==0 (
  node server.js 3000
) else (
  where python >nul 2>nul
  if %errorlevel%==0 (
    python -m http.server 3000
  ) else (
    echo  Nao encontrei Node nem Python neste computador.
    echo  Instale o Node.js gratis em https://nodejs.org e clique de novo neste arquivo.
    pause
  )
)
