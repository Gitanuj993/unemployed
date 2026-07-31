<#
.SYNOPSIS
  Sets up whatever is missing, then starts the app. Safe to run every time.

.DESCRIPTION
  One script for both first run and every run after, because a student on a
  borrowed laptop should not have to know which one they are doing. Every step
  checks before it acts, so the second run skips straight to starting the app.

  Usage (from the repo root):
      powershell -ExecutionPolicy Bypass -File .\run.ps1

  The -ExecutionPolicy flag is in the documented command on purpose: unsigned
  scripts are blocked by default on Windows, and that failure looks like the
  project is broken rather than like a machine setting.
#>

# Deliberately NOT "Stop". In Windows PowerShell, ErrorActionPreference=Stop
# turns *any* stderr line from a native command into a terminating error - so a
# harmless "docker: WARNING: No blkio throttle..." kills the script before it
# does anything. Every native call below is checked by $LASTEXITCODE instead,
# which is the only thing that actually reports whether the command failed.
$ErrorActionPreference = "Continue"
$Root = $PSScriptRoot
$Backend = Join-Path $Root "backend"
$Web = Join-Path $Root "web"
$Venv = Join-Path $Backend ".venv\Scripts\python.exe"
$Model = "llama3.2:3b"

function Say($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Ok($msg) { Write-Host "    $msg" -ForegroundColor DarkGray }

function Need($cmd, $name, $how) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "`n$name is not installed." -ForegroundColor Red
        Write-Host "  $how"
        Write-Host "  Then open a NEW terminal and run this script again."
        exit 1
    }
}

# --- 1. Prerequisites -------------------------------------------------------
Say "Checking prerequisites"
Need "git" "Git" "winget install Git.Git -e"
Need "node" "Node.js" "winget install OpenJS.NodeJS.LTS -e"
Need "docker" "Docker Desktop" "winget install Docker.DockerDesktop -e   (then reboot)"
Need "ollama" "Ollama" "winget install Ollama.Ollama -e"

# Find a usable Python. Bare `python` on Windows is frequently the Microsoft
# Store stub, which prints nothing and opens the Store instead of running - so
# prove an interpreter works rather than trusting that the name resolves. The
# `py` launcher is tried first because it is the one that survives that.
$Python = $null
foreach ($candidate in @("py", "python", "python3")) {
    if (-not (Get-Command $candidate -ErrorAction SilentlyContinue)) { continue }
    $probe = & $candidate -c "import sys; print(sys.version_info >= (3, 10))" 2>$null
    if ($probe -and $probe.Trim() -eq "True") { $Python = $candidate; break }
}
if (-not $Python) {
    Write-Host "`nNo working Python 3.10 or newer was found." -ForegroundColor Red
    Write-Host "  winget install Python.Python.3.12 -e"
    Write-Host "  Then open a NEW terminal and run this script again."
    exit 1
}
Ok "git, node, docker, ollama and $Python all present"

# --- 2. Docker daemon -------------------------------------------------------
Say "Checking Docker"
docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Ok "Docker isn't running - starting Docker Desktop..."
    Start-Process "Docker Desktop" -ErrorAction SilentlyContinue
    $waited = 0
    while ($true) {
        Start-Sleep -Seconds 5
        $waited += 5
        docker info *> $null
        if ($LASTEXITCODE -eq 0) { break }
        if ($waited -ge 180) {
            Write-Host "`nDocker did not start within 3 minutes." -ForegroundColor Red
            Write-Host "  Open Docker Desktop manually, wait for the whale icon to settle,"
            Write-Host "  then run this script again. A fresh install needs a reboot first."
            exit 1
        }
    }
}
Ok "Docker is ready"

# --- 3. Postgres ------------------------------------------------------------
Say "Starting Postgres"
Push-Location $Root
try {
    docker compose up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nCould not start Postgres." -ForegroundColor Red
        Write-Host "  The usual cause is port 5432 already in use by another Postgres."
        exit 1
    }
} finally { Pop-Location }

# Migrations fail with a confusing connection error if we race the container.
$waited = 0
while ($true) {
    $state = docker inspect -f "{{.State.Health.Status}}" jobsearch-postgres 2>$null
    if ($state -eq "healthy") { break }
    Start-Sleep -Seconds 3
    $waited += 3
    if ($waited -ge 120) {
        Write-Host "`nPostgres started but never became healthy." -ForegroundColor Red
        Write-Host "  Check: docker logs jobsearch-postgres"
        exit 1
    }
}
Ok "Postgres healthy on 5432"

# --- 4. Model ---------------------------------------------------------------
Say "Checking the language model"
# Ollama normally runs as a background service, but it can be stopped or not
# yet started after a fresh install - in which case every ollama command fails
# with a connection error rather than saying so.
try { Invoke-WebRequest "http://localhost:11434/api/version" -UseBasicParsing -TimeoutSec 3 | Out-Null }
catch {
    Ok "Starting the Ollama server..."
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden -ErrorAction SilentlyContinue
    $waited = 0
    while ($true) {
        Start-Sleep -Seconds 2
        $waited += 2
        try { Invoke-WebRequest "http://localhost:11434/api/version" -UseBasicParsing -TimeoutSec 3 | Out-Null; break } catch { }
        if ($waited -ge 60) {
            Write-Host "`nOllama would not start. Open the Ollama app manually, then re-run." -ForegroundColor Red
            exit 1
        }
    }
}

$models = ollama list 2>$null | Out-String
if ($models -notmatch [regex]::Escape($Model)) {
    Ok "Downloading $Model (about 2 GB, one time)..."
    ollama pull $Model
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nModel download failed. Check your connection and re-run." -ForegroundColor Red
        exit 1
    }
}
Ok "$Model ready"

# --- 5. Backend dependencies ------------------------------------------------
Say "Preparing the backend"
if (-not (Test-Path $Venv)) {
    Ok "Creating the virtual environment..."
    Push-Location $Backend
    try { & $Python -m venv .venv } finally { Pop-Location }
    if (-not (Test-Path $Venv)) {
        Write-Host "`nCould not create the virtual environment in backend\.venv." -ForegroundColor Red
        exit 1
    }
}

# Cheapest honest check that the install finished: can we import the app?
& $Venv -c "import fastapi, sentence_transformers, alembic" *> $null
if ($LASTEXITCODE -ne 0) {
    Ok "Installing Python packages (a few minutes - PyTorch is large)..."
    & $Venv -m pip install --disable-pip-version-check -q --upgrade pip
    & $Venv -m pip install --disable-pip-version-check -r (Join-Path $Backend "requirements.txt")
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nInstalling Python packages failed." -ForegroundColor Red
        exit 1
    }
}

Ok "Applying database migrations..."
Push-Location $Backend
try {
    & $Venv -m alembic upgrade head
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nMigrations failed." -ForegroundColor Red
        exit 1
    }
} finally { Pop-Location }
Ok "Backend ready"

# --- 6. Frontend dependencies ----------------------------------------------
Say "Preparing the frontend"
if (-not (Test-Path (Join-Path $Web "node_modules"))) {
    Ok "Installing npm packages..."
    Push-Location $Web
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "`nnpm install failed." -ForegroundColor Red
            exit 1
        }
    } finally { Pop-Location }
}
Ok "Frontend ready"

# --- 7. Start ---------------------------------------------------------------
# Separate windows, not background jobs: when something goes wrong later the
# student needs to be able to see the log and Ctrl+C it.
Say "Starting the app"
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$Backend'; & '$Venv' -m uvicorn app.main:app --reload --port 8000"
)
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$Web'; npm run dev"
)

$waited = 0
while ($true) {
    Start-Sleep -Seconds 2
    $waited += 2
    try {
        $r = Invoke-WebRequest "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 3
        if ($r.StatusCode -eq 200) { break }
    } catch { }
    if ($waited -ge 120) {
        Write-Host "`nThe backend did not come up. Check the backend window for the error." -ForegroundColor Yellow
        exit 1
    }
}

Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "  The app is running at http://localhost:3000" -ForegroundColor Green
Write-Host "  Two new windows opened - closing them stops the app."
Write-Host "  Next time, just run this script again."
Write-Host ""
