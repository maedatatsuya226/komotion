@echo off
cd /d "%~dp0"
start "reach-training-server" cmd /c "npx -y serve -l 3789 ."
timeout /t 4 /nobreak >nul
start http://localhost:3789
