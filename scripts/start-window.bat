@echo off
cd /d "%~dp0.."

docker build -t prelegal .
docker rm -f prelegal >nul 2>&1

set "ENV_FILE_ARG="
if exist .env (
  set "ENV_FILE_ARG=--env-file .env"
) else (
  echo Warning: .env not found ^(see .env.example^) - AI chat needs OPENROUTER_API_KEY there.
)
docker run -d --name prelegal -p 8000:8000 %ENV_FILE_ARG% prelegal

echo prelegal running at http://localhost:8000
