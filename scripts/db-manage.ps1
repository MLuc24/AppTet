# Database Management Script for LMS (Windows PowerShell)

param(
    [Parameter(Position=0)]
    [string]$Command = "",
    [Parameter(Position=1)]
    [string]$Service = ""
)

$ComposeFile = "docker-compose.yml"
$ProjectName = "lms"

# Colors
$ErrorColor = "Red"
$SuccessColor = "Green"
$WarningColor = "Yellow"

function Print-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $SuccessColor
}

function Print-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor $WarningColor
}

function Print-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $ErrorColor
}

function Check-Docker {
    try {
        docker info | Out-Null
        Print-Info "Docker is running ✓"
        return $true
    }
    catch {
        Print-Error "Docker is not running. Please start Docker Desktop first."
        return $false
    }
}

function Start-Databases {
    Print-Info "Starting database containers..."
    docker-compose -f $ComposeFile -p $ProjectName up -d postgres redis mongodb
    
    Print-Info "Waiting for databases to be ready..."
    
    # Wait for PostgreSQL
    Print-Info "Waiting for PostgreSQL..."
    $retries = 0
    while ($retries -lt 30) {
        try {
            docker exec lms_postgres pg_isready -U lms_user 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) { break }
        }
        catch {}
        Start-Sleep -Seconds 1
        $retries++
    }
    Print-Info "PostgreSQL is ready ✓"
    
    # Wait for Redis
    Print-Info "Waiting for Redis..."
    $retries = 0
    while ($retries -lt 30) {
        try {
            docker exec lms_redis redis-cli ping 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) { break }
        }
        catch {}
        Start-Sleep -Seconds 1
        $retries++
    }
    Print-Info "Redis is ready ✓"
    
    # Wait for MongoDB
    Print-Info "Waiting for MongoDB..."
    $retries = 0
    while ($retries -lt 30) {
        try {
            docker exec lms_mongodb mongosh --eval "db.adminCommand('ping')" 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) { break }
        }
        catch {}
        Start-Sleep -Seconds 1
        $retries++
    }
    Print-Info "MongoDB is ready ✓"
    
    Write-Host ""
    Print-Info "All databases are running!"
    Print-Info "PostgreSQL: localhost:5432"
    Print-Info "Redis: localhost:6379"
    Print-Info "MongoDB: localhost:27017"
    Write-Host ""
    Print-Info "Connection strings:"
    Write-Host "  PostgreSQL: postgresql://lms_user:lms_pass@localhost:5432/lms" -ForegroundColor Cyan
    Write-Host "  Redis: redis://localhost:6379" -ForegroundColor Cyan
    Write-Host "  MongoDB: mongodb://lms_user:lms_pass@localhost:27017/lms_ai?authSource=admin" -ForegroundColor Cyan
}

function Stop-Databases {
    Print-Info "Stopping database containers..."
    docker-compose -f $ComposeFile -p $ProjectName stop postgres redis mongodb
    Print-Info "Databases stopped ✓"
}

function Restart-Databases {
    Print-Info "Restarting database containers..."
    Stop-Databases
    Start-Sleep -Seconds 2
    Start-Databases
}

function Show-Status {
    Print-Info "Database container status:"
    docker-compose -f $ComposeFile -p $ProjectName ps postgres redis mongodb
}

function Show-Logs {
    param([string]$ServiceName = "")
    
    if ($ServiceName -eq "") {
        docker-compose -f $ComposeFile -p $ProjectName logs -f postgres redis mongodb
    }
    else {
        docker-compose -f $ComposeFile -p $ProjectName logs -f $ServiceName
    }
}

function Remove-Databases {
    Print-Warn "This will remove all database containers and volumes!"
    $confirmation = Read-Host "Are you sure? (yes/no)"
    
    if ($confirmation -eq "yes") {
        Print-Info "Removing database containers and volumes..."
        docker-compose -f $ComposeFile -p $ProjectName down -v
        Print-Info "Databases removed ✓"
    }
    else {
        Print-Info "Operation cancelled"
    }
}

function Connect-Shell {
    param([string]$DB = "postgres")
    
    switch ($DB.ToLower()) {
        { $_ -in "postgres", "pg" } {
            Print-Info "Connecting to PostgreSQL..."
            docker exec -it lms_postgres psql -U lms_user -d lms
        }
        "redis" {
            Print-Info "Connecting to Redis..."
            docker exec -it lms_redis redis-cli
        }
        { $_ -in "mongo", "mongodb" } {
            Print-Info "Connecting to MongoDB..."
            docker exec -it lms_mongodb mongosh -u lms_user -p lms_pass --authenticationDatabase admin lms_ai
        }
        default {
            Print-Error "Unknown database: $DB"
            Print-Info "Available options: postgres, redis, mongodb"
            exit 1
        }
    }
}

function Backup-Databases {
    $BackupDir = ".\backups\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    
    Print-Info "Creating backups in $BackupDir..."
    
    # Backup PostgreSQL
    Print-Info "Backing up PostgreSQL..."
    docker exec lms_postgres pg_dump -U lms_user lms > "$BackupDir\postgres_lms.sql"
    
    # Backup MongoDB
    Print-Info "Backing up MongoDB..."
    docker exec lms_mongodb mongodump --uri="mongodb://lms_user:lms_pass@localhost:27017/lms_ai?authSource=admin" --out=/tmp/mongo_backup
    docker cp lms_mongodb:/tmp/mongo_backup "$BackupDir\mongodb"
    
    Print-Info "Backups created successfully in $BackupDir ✓"
}

function Show-Help {
    Write-Host "LMS Database Management" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\db-manage.ps1 {command} [options]"
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  start, up         Start database containers"
    Write-Host "  stop, down        Stop database containers"
    Write-Host "  restart           Restart database containers"
    Write-Host "  status, ps        Show database status"
    Write-Host "  logs [service]    Show logs (postgres|redis|mongodb)"
    Write-Host "  shell [db]        Access database shell (postgres|redis|mongodb)"
    Write-Host "  backup            Backup all databases"
    Write-Host "  remove, clean     Remove containers and volumes (with confirmation)"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\db-manage.ps1 start"
    Write-Host "  .\db-manage.ps1 logs postgres"
    Write-Host "  .\db-manage.ps1 shell redis"
    Write-Host "  .\db-manage.ps1 backup"
    Write-Host ""
}

# Main script execution
switch ($Command.ToLower()) {
    { $_ -in "start", "up" } {
        if (Check-Docker) {
            Start-Databases
        }
    }
    { $_ -in "stop", "down" } {
        Stop-Databases
    }
    "restart" {
        if (Check-Docker) {
            Restart-Databases
        }
    }
    { $_ -in "status", "ps" } {
        Show-Status
    }
    "logs" {
        Show-Logs -ServiceName $Service
    }
    { $_ -in "remove", "clean" } {
        Remove-Databases
    }
    "shell" {
        Connect-Shell -DB $Service
    }
    "backup" {
        Backup-Databases
    }
    default {
        Show-Help
        exit 0
    }
}
