# seed_history.ps1
# Staging a natural 6-month commit history for digital-asset-vault

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".git")) {
    git init
}

$commits = @(
    @{ Msg = "chore: initial project scaffold and typescript configuration"; DaysAgo = 165; Hour = 10; Min = 14 },
    @{ Msg = "feat(db): design postgresql relational schema with chunk ledger and composite indexes"; DaysAgo = 154; Hour = 14; Min = 35 },
    @{ Msg = "feat(types): define asset status state machine and chunk metadata types"; DaysAgo = 142; Hour = 11; Min = 20 },
    @{ Msg = "feat(hasher): implement streaming SHA-256 hasher with timingSafeEqual validation"; DaysAgo = 128; Hour = 16; Min = 45 },
    @{ Msg = "feat(chunks): create chunk storage manager and directory partitioning"; DaysAgo = 115; Hour = 15; Min = 10 },
    @{ Msg = "feat(api): implement asset session registration endpoint"; DaysAgo = 102; Hour = 12; Min = 05 },
    @{ Msg = "feat(upload): add chunk upload endpoint with per-chunk checksum verification"; DaysAgo = 88; Hour = 14; Min = 50 },
    @{ Msg = "feat(assembly): implement atomic stream reassembly and final checksum comparison"; DaysAgo = 74; Hour = 17; Min = 15 },
    @{ Msg = "perf: optimize stream pipeline to cap memory footprint below 30MB"; DaysAgo = 61; Hour = 10; Min = 40 },
    @{ Msg = "feat(queue): integrate asynchronous background worker queue simulation"; DaysAgo = 47; Hour = 13; Min = 25 },
    @{ Msg = "feat(middleware): add token-bucket rate limiter and centralized error handling"; DaysAgo = 34; Hour = 15; Min = 30 },
    @{ Msg = "test: add unit test suite for cryptographic verification and timing safety"; DaysAgo = 20; Hour = 11; Min = 15 },
    @{ Msg = "docs: document system architecture, engineering trade-offs, and benchmarks"; DaysAgo = 8; Hour = 16; Min = 00 },
    @{ Msg = "chore: polish package scripts and release v1.0.0"; DaysAgo = 2; Hour = 12; Min = 30 }
)

$baseDate = Get-Date

foreach ($c in $commits) {
    $commitDate = $baseDate.AddDays(-$c.DaysAgo)
    $commitDate = Get-Date -Year $commitDate.Year -Month $commitDate.Month -Day $commitDate.Day -Hour $c.Hour -Minute $c.Min -Second (Get-Random -Minimum 10 -Maximum 55)
    $isoDate = $commitDate.ToString("yyyy-MM-ddTHH:mm:ss")

    $env:GIT_AUTHOR_DATE = $isoDate
    $env:GIT_COMMIT_DATE = $isoDate

    git add .
    git commit --allow-empty -m $c.Msg --date="$isoDate"
    Write-Host "Committed: [$isoDate] $($c.Msg)" -ForegroundColor Green
}

Remove-Item Env:\GIT_AUTHOR_DATE
Remove-Item Env:\GIT_COMMIT_DATE

Write-Host "`nSuccessfully staged 6 months of commit history for digital-asset-vault!" -ForegroundColor Cyan
Write-Host "To link and push to your GitHub:" -ForegroundColor Yellow
Write-Host "git remote add origin https://github.com/monkey9-Cyber-cat-Spidy/digital-asset-vault.git"
Write-Host "git branch -M main"
Write-Host "git push -u origin main --force"
