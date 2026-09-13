Set-Location (Join-Path $PSScriptRoot "..")

docker build -t prelegal .
docker rm -f prelegal 2>$null | Out-Null

$envFileArgs = @()
if (Test-Path .env) {
  $envFileArgs = @("--env-file", ".env")
} else {
  Write-Warning ".env not found (see .env.example) - AI chat needs OPENROUTER_API_KEY there."
}
docker run -d --name prelegal -p 8000:8000 @envFileArgs prelegal

Write-Output "prelegal running at http://localhost:8000"
