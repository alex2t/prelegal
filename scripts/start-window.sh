#!/usr/bin/env bash
# Run from Git Bash on Windows.
#
# If your network intercepts HTTPS (corporate proxy, antivirus SSL scanning)
# and the build fails on certificate errors, export your own CA as PEM into
# certificates/custom-ca.crt (gitignored) - the Dockerfile trusts anything
# placed there. Nothing is generated automatically.
set -euo pipefail
cd "$(dirname "$0")/.."

docker build -t prelegal .
docker rm -f prelegal >/dev/null 2>&1 || true

ENV_FILE_ARGS=()
if [ -f .env ]; then
  ENV_FILE_ARGS=(--env-file .env)
else
  echo "Warning: .env not found (see .env.example) - AI chat needs OPENROUTER_API_KEY there." >&2
fi
docker run -d --name prelegal -p 8000:8000 "${ENV_FILE_ARGS[@]}" prelegal

echo "prelegal running at http://localhost:8000"
