# Script to setup frontend as separate repo using Git subtree
# This allows pushing frontend to a separate GitHub repo while keeping full code locally

Write-Host "Setting up frontend repository..." -ForegroundColor Green

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "Error: Not in a git repository!" -ForegroundColor Red
    exit 1
}

# Add remote for frontend repo
Write-Host "`nAdding frontend remote..." -ForegroundColor Yellow
git remote add frontend https://github.com/MLuc24/lms-frontend-app.git 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend remote added successfully" -ForegroundColor Green
} else {
    Write-Host "Frontend remote already exists or error occurred" -ForegroundColor Yellow
}

# Commit any pending changes first
Write-Host "`nChecking for uncommitted changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "You have uncommitted changes. Please commit them first." -ForegroundColor Red
    Write-Host "Run: git add . && git commit -m 'Your commit message'" -ForegroundColor Yellow
    exit 1
}

# Push frontend subtree to the frontend repo
Write-Host "`nPushing frontend to separate repo..." -ForegroundColor Yellow
Write-Host "This will push apps/mobile-app to the root of lms-frontend-app repo" -ForegroundColor Cyan

git subtree push --prefix=apps/mobile-app frontend main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccess! Frontend pushed to https://github.com/MLuc24/lms-frontend-app" -ForegroundColor Green
    Write-Host "`nLocal structure remains unchanged - you still have full code" -ForegroundColor Green
    Write-Host "`nTo update frontend repo in the future, run:" -ForegroundColor Yellow
    Write-Host "  git subtree push --prefix=apps/mobile-app frontend main" -ForegroundColor Cyan
} else {
    Write-Host "`nError pushing to frontend repo. Make sure:" -ForegroundColor Red
    Write-Host "  1. The repo exists: https://github.com/MLuc24/lms-frontend-app" -ForegroundColor Yellow
    Write-Host "  2. You have push access" -ForegroundColor Yellow
    Write-Host "  3. All changes are committed" -ForegroundColor Yellow
}
