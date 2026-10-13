<#
.SYNOPSIS
    Automated File-Watching and Debounced Synchronization Script for KisaanSaathi
.DESCRIPTION
    Monitors the repository for file changes. When changes cease for a configurable
    period of inactivity (debounce), it verifies safety and executes sync-repo.ps1.
    Respects .gitignore patterns and aborts on conflict or authentication failure.
#>

[CmdletBinding()]
param(
    [int]$InactivitySeconds = 60,
    [switch]$ForceNonInteractive
)

$repoRoot = (Split-Path -Parent $PSScriptRoot)
Set-Location $repoRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  KisaanSaathi Background Watcher & Auto-Sync" -ForegroundColor Cyan
Write-Host "  Repository Root: $repoRoot" -ForegroundColor Gray
Write-Host "  Debounce Window: $InactivitySeconds seconds of inactivity" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "`n[IMPORTANT - RISKS OF AUTOMATIC PUSHES]" -ForegroundColor Yellow
Write-Host "1. Incomplete code or syntax errors might be pushed if you save mid-refactor." -ForegroundColor Yellow
Write-Host "2. Generates automated commit history unless squashed." -ForegroundColor Yellow
Write-Host "3. Ensure sensitive files (.env) are never removed from .gitignore." -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C at any time in this window to stop the watcher.`n" -ForegroundColor Cyan

# Ignored path patterns (regex)
$ignoredPatterns = @(
    "\\\.git($|\\)",
    "\\node_modules($|\\)",
    "\\\.vercel($|\\)",
    "\\\.env($|\.)",
    "\\\.idea($|\\)",
    "\\\.vscode($|\\)",
    "\\logs?($|\\)",
    "\.log$",
    "\.tmp$",
    "~$"
)

function Test-IsIgnoredPath([string]$path) {
    foreach ($pattern in $ignoredPatterns) {
        if ($path -match $pattern) {
            return $true
        }
    }
    return $false
}

# State tracking
$global:lastChangeTimestamp = [DateTime]::MinValue
$global:pendingChange = $false
$global:changedFilesList = [System.Collections.Generic.HashSet[string]]::new()

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $repoRoot
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, DirectoryName, LastWrite, Size'

$action = {
    param($source, $eventArgs)
    $fullPath = $eventArgs.FullPath
    $changeType = $eventArgs.ChangeType

    if (-not (Test-IsIgnoredPath $fullPath)) {
        $relativePath = $fullPath.Replace($repoRoot, "").TrimStart("\", "/")
        $global:lastChangeTimestamp = [DateTime]::UtcNow
        $global:pendingChange = $true
        [void]$global:changedFilesList.Add($relativePath)
        Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] Detected $changeType in $relativePath (resetting debounce timer)" -ForegroundColor DarkGray
    }
}

$handlers = @()
$handlers += Register-ObjectEvent $watcher "Changed" -Action $action
$handlers += Register-ObjectEvent $watcher "Created" -Action $action
$handlers += Register-ObjectEvent $watcher "Deleted" -Action $action
$handlers += Register-ObjectEvent $watcher "Renamed" -Action $action

Write-Host "Watcher is active and monitoring changes..." -ForegroundColor Green

try {
    while ($true) {
        Start-Sleep -Seconds 2

        if ($global:pendingChange) {
            $elapsedSeconds = ([DateTime]::UtcNow - $global:lastChangeTimestamp).TotalSeconds

            if ($elapsedSeconds -ge $InactivitySeconds) {
                Write-Host "`n----------------------------------------------------------" -ForegroundColor Cyan
                Write-Host "Debounce window reached ($InactivitySeconds seconds of inactivity)." -ForegroundColor Cyan
                Write-Host "Triggering safe sync..." -ForegroundColor Cyan

                $global:pendingChange = $false
                $summaryList = ($global:changedFilesList | Select-Object -First 3) -join ", "
                $global:changedFilesList.Clear()

                # Safety check 1: Check for active git merge conflicts
                $unmerged = (git diff --name-only --diff-filter=U 2>$null)
                if (-not [string]::IsNullOrWhiteSpace($unmerged)) {
                    Write-Host "[SAFETY HALT] Unmerged conflicts detected in: $unmerged. Automatic push halted." -ForegroundColor Red
                    continue
                }

                $commitMsg = "Auto-sync: updated $summaryList on $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
                $syncScript = Join-Path $PSScriptRoot "sync-repo.ps1"

                try {
                    & $syncScript -Message $commitMsg
                } catch {
                    Write-Host "[WARNING] Sync encountered an issue: $_" -ForegroundColor Yellow
                }

                Write-Host "Resuming file watcher monitoring...`n" -ForegroundColor Green
            }
        }
    }
} finally {
    Write-Host "`nStopping watcher and unregistering events..." -ForegroundColor Yellow
    foreach ($h in $handlers) {
        Unregister-Event -SourceIdentifier $h.Name -ErrorAction SilentlyContinue
    }
    $watcher.Dispose()
    Write-Host "Watcher stopped." -ForegroundColor Gray
}
