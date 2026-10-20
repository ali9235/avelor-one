$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$avelorNode = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $avelorNode) { $avelorNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
if (-not (Test-Path $avelorNode)) { throw 'Install Node.js 22.12 or later, then run pnpm install.' }
if (-not (Test-Path 'node_modules/vite/bin/vite.js')) { throw 'Dependencies are missing. Run pnpm install in this folder first.' }
Write-Host 'AVELOR ONE: http://127.0.0.1:5190 (Ctrl+C to stop)'
& $avelorNode 'node_modules/vite/bin/vite.js' '--host' '127.0.0.1' '--port' '5190' '--strictPort'
