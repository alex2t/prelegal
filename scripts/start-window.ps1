Set-Location (Join-Path $PSScriptRoot "..")

docker build -t prelegal .
docker rm -f prelegal 2>$null | Out-Null
docker run -d --name prelegal -p 8000:8000 prelegal

Write-Output "prelegal running at http://localhost:8000"
