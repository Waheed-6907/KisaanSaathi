<#
.SYNOPSIS
    Safe Git Synchronization Script for KisaanSaathi
.DESCRIPTION
    Safely fetches, merges upstream changes, stages and commits local changes,
    and pushes to GitHub without force-pushing or risking teammate overwrites.
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"

# Verify in git repo
try {
    $insideRepo = (git rev-parse --is-inside-work-tree 2>$null)
    if ($insideRepo -ne "true") {
        Write-Error "Current directory is not inside a Git repository."
        exit 1
    }
} catch {
    Write-Error "Git is not available or directory is not a Git repo."
    exit 1
}

$currentBranch = (git branch --show-current).Trim()
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    Write-Error "Detached HEAD detected. Please switch to a valid branch before syncing."
    exit 1
}

$remoteUrl = (git remote get-url origin 2>$null)
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  KisaanSaathi Safe Sync" -ForegroundColor Cyan
Write-Host "  Branch: $currentBranch" -ForegroundColor Gray
Write-Host "  Remote: $remoteUrl" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan

# Step 1: Fetch remote changes safely
Write-Host "`n[1/4] Fetching latest changes from remote (origin)..." -ForegroundColor Yellow
git fetch origin

$upstream = "origin/$currentBranch"
$remoteExists = (git rev-parse --verify $upstream 2>$null)

if ($remoteExists) {
    $behindCount = [int](git rev-list --count "HEAD..$upstream").Trim()
    $aheadCount  = [int](git rev-list --count "$upstream..HEAD").Trim()

    Write-Host "Status check: Ahead by $aheadCount commits, Behind by $behindCount commits." -ForegroundColor Gray

    if ($behindCount -gt 0) {
        $localStatus = (git status --porcelain)
        if (-not [string]::IsNullOrWhiteSpace($localStatus)) {
            Write-Host "`n[ALERT] Your teammate pushed $behindCount new commit(s), but you have uncommitted local changes." -ForegroundColor Red
            Write-Host "To prevent merge conflicts, please stash or review your local changes before pulling:" -ForegroundColor Yellow
            Write-Host "  git stash" -ForegroundColor White
            Write-Host "  git pull origin $currentBranch" -ForegroundColor White
            Write-Host "  git stash pop" -ForegroundColor White
            exit 1
        }

        Write-Host "`n[UPDATE] Pulling $behindCount commit(s) from teammate..." -ForegroundColor Green
        git pull --rebase=false origin $currentBranch
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Pull failed due to merge conflicts. Resolve conflicts before proceeding."
            exit 1
        }
    }
}

# Step 2: Check local changes
Write-Host "`n[2/4] Checking local working directory..." -ForegroundColor Yellow
$changedFiles = (git status --porcelain)

if (-not [string]::IsNullOrWhiteSpace($changedFiles)) {
    Write-Host "Local changes detected:" -ForegroundColor Magenta
    git status -s

    if ([string]::IsNullOrWhiteSpace($Message)) {
        $Message = Read-Host "`nEnter commit message (press Enter for default 'chore: update project')"
        if ([string]::IsNullOrWhiteSpace($Message)) {
            $Message = "chore: update project on $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
    }

    Write-Host "`nStaging changes and committing..." -ForegroundColor Yellow
    git add .
    git commit -m "$Message"
} else {
    Write-Host "Working tree clean. No new local changes to commit." -ForegroundColor Green
}

# Step 3: Pre-push conflict check
Write-Host "`n[3/4] Running pre-push safety verification..." -ForegroundColor Yellow
git fetch origin
if ($remoteExists) {
    $latestBehind = [int](git rev-list --count "HEAD..$upstream").Trim()
    if ($latestBehind -gt 0) {
        Write-Host "`n[ABORT] Remote was updated with $latestBehind new commit(s) during your session." -ForegroundColor Red
        Write-Host "Push aborted to prevent overwriting teammate's work. Run this script again to merge first." -ForegroundColor Yellow
        exit 1
    }
}

$aheadAfterCommit = [int](git rev-list --count "$upstream..HEAD").Trim()
if ($aheadAfterCommit -eq 0) {
    Write-Host "`n[INFO] Local branch is fully up to date with remote. Nothing to push." -ForegroundColor Green
    exit 0
}

# Step 4: Push
Write-Host "`n[4/4] Pushing $aheadAfterCommit commit(s) to origin/$currentBranch..." -ForegroundColor Yellow
Write-Host "Notice: Force-push is strictly disabled for safety." -ForegroundColor Gray
git push origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] All changes successfully synced to GitHub!" -ForegroundColor Green
} else {
    Write-Host "`n[NOTICE] Git push returned exit code $LASTEXITCODE." -ForegroundColor Yellow
    Write-Host "If this is an authentication issue, ensure your GitHub account has collaborator write access." -ForegroundColor Yellow
}
