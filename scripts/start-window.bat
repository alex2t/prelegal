@echo off
cd /d "%~dp0.."

docker build -t prelegal .
docker rm -f prelegal >nul 2>&1
docker run -d --name prelegal -p 8000:8000 prelegal

echo prelegal running at http://localhost:8000
