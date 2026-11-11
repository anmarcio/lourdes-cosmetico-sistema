
@echo off
setlocal

title Inicializador - Lourdes Cosmetico e Utilidades

set "ROOT=C:\Users\amvieira\Downloads\Univesp\Pin 2° Semestre\Projeto 2\lourdes-cosmetico-sistema-inicial\lourdes-cosmetico-sistema"

echo ================================================
echo   Lourdes Cosmetico e Utilidades
echo   Inicializando o sistema
echo ================================================
echo.

if not exist "%ROOT%\docker-compose.yml" (
    echo ERRO: docker-compose.yml nao encontrado.
    echo Caminho esperado:
    echo %ROOT%
    pause
    exit /b 1
)

if not exist "%ROOT%\backend\package.json" (
    echo ERRO: pasta backend ou package.json nao encontrado.
    pause
    exit /b 1
)

if not exist "%ROOT%\frontend\package.json" (
    echo ERRO: pasta frontend ou package.json nao encontrado.
    pause
    exit /b 1
)

echo Iniciando Docker Desktop...

start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo Aguardando Docker ficar pronto...

:WAITDOCKER
docker info >nul 2>&1
if errorlevel 1 (
    timeout /t 3 /nobreak >nul
    goto WAITDOCKER
)

echo Docker pronto.
echo.

cd /d "%ROOT%"

echo Iniciando banco de dados...
docker compose up -d

if errorlevel 1 (
    echo ERRO ao iniciar o Docker Compose.
    pause
    exit /b 1
)

echo.
echo Iniciando backend...
start "Lourdes - Backend" cmd /k "cd /d ""%ROOT%\backend"" && npm run dev"

timeout /t 3 /nobreak >nul

echo Iniciando frontend na porta 5174...
start "Lourdes - Frontend" cmd /k "cd /d ""%ROOT%\frontend"" && npm run dev -- --port 5174"

echo.
echo Aguardando inicializacao do frontend...
timeout /t 5 /nobreak >nul

start "" "http://localhost:5174/"

echo.
echo Inicializacao solicitada.
echo Mantenha os terminais abertos enquanto utilizar o sistema.
pause
