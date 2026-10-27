#Requires -Version 5.1
<#
.SYNOPSIS
    Инициализация БД проекта: .env -> prisma generate -> db push -> seed -> проверка.

.DESCRIPTION
    Принимает строку подключения (Neon, локальный Postgres, любой Postgres)
    и приводит базу в рабочее состояние. Можно запускать повторно.

.PARAMETER DatabaseUrl
    Строка подключения. Если не указана, берётся из .env или $env:DATABASE_URL.

.EXAMPLE
    .\scripts\init-db.ps1 -DatabaseUrl "postgresql://user:pass@host/db?sslmode=require"
#>
param(
    [string]$DatabaseUrl
)

$ErrorActionPreference = "Stop"
$nl = [Environment]::NewLine

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# 1. Определяем строку подключения
$envPath = Join-Path $root ".env"
$examplePath = Join-Path $root ".env.example"

if (-not $DatabaseUrl -and (Test-Path $envPath)) {
    $line = Select-String -Path $envPath -Pattern '^DATABASE_URL="?([^"\r\n]+)"?' | Select-Object -First 1
    if ($line) { $DatabaseUrl = $line.Matches[0].Groups[1].Value }
}
if (-not $DatabaseUrl) { $DatabaseUrl = $env:DATABASE_URL }

if (-not $DatabaseUrl) {
    throw "Не найдена строка подключения. Запустите: .\scripts\init-db.ps1 -DatabaseUrl 'postgresql://...'"
}
if ($DatabaseUrl -notmatch '^postgres(ql)?://') {
    throw "DATABASE_URL должен начинаться с postgresql:// или postgres://"
}

# 2. Пишем .env (файл в .gitignore, в репозиторий не попадает)
if (-not (Test-Path $envPath)) {
    Copy-Item $examplePath $envPath
    Write-Host "OK  создан .env из .env.example" -ForegroundColor Green
}

$content = Get-Content $envPath -Raw
$newLineValue = 'DATABASE_URL="' + $DatabaseUrl + '"'
if ($content -match '(?m)^DATABASE_URL=') {
    $content = [regex]::Replace($content, '(?m)^DATABASE_URL=.*$', [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $newLineValue })
} else {
    $content = $content.TrimEnd() + $nl + $newLineValue + $nl
}
Set-Content -Path $envPath -Value $content -NoNewline -Encoding UTF8
Write-Host "OK  DATABASE_URL записан в .env" -ForegroundColor Green

# 3. Применяем схему и данные
$env:DATABASE_URL = $DatabaseUrl

Write-Host ""
Write-Host "-> prisma generate" -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) { throw "prisma generate завершился с ошибкой" }

Write-Host ""
Write-Host "-> prisma db push" -ForegroundColor Cyan
npx prisma db push --skip-generate
if ($LASTEXITCODE -ne 0) { throw "prisma db push завершился с ошибкой. Проверьте DATABASE_URL и доступность БД." }

Write-Host ""
Write-Host "-> prisma db seed" -ForegroundColor Cyan
npx prisma db seed
if ($LASTEXITCODE -ne 0) { throw "seed завершился с ошибкой" }

Write-Host ""
Write-Host "-> проверка данных" -ForegroundColor Cyan
npx tsx scripts/check-db.ts

Write-Host ""
Write-Host "Готово. Дальше: npm run dev" -ForegroundColor Green
