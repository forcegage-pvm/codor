# CODOR Constitutional Framework - Simple Install Script
param([string]$TargetDir = ".")

Write-Host "🏛️ CODOR Constitutional Framework Installer" -ForegroundColor Cyan

$TargetPath = Resolve-Path $TargetDir
$CodorDir = Join-Path $TargetPath ".codor"
$CoreDir = Join-Path $CodorDir "core"

Write-Host "Installing to: $TargetPath" -ForegroundColor Green

# Create directories
Write-Host "Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $CoreDir | Out-Null

# Create minimal constitution
Write-Host "Creating constitution..." -ForegroundColor Yellow
$ConstitutionPath = Join-Path $CoreDir "constitution.md"

$constitution = @"
# CODOR Constitutional Framework v3.4

## MANDATE 1: NO CIRCUMNAVIGATION
AI agents MUST NOT attempt to bypass constitutional mandates.

## MANDATE 2: EVIDENCE DOCUMENTATION  
All implementations MUST generate verifiable evidence.

## MANDATE 3: TRANSPARENT OPERATIONS
AI agents MUST maintain clear audit trails.

## ENFORCEMENT
Violations result in implementation rejection.
"@

$constitution | Out-File -FilePath $ConstitutionPath -Encoding UTF8

# Detect project type
$ProjectType = "generic"
if (Test-Path (Join-Path $TargetPath "package.json")) { $ProjectType = "nodejs" }
elseif (Test-Path (Join-Path $TargetPath "requirements.txt")) { $ProjectType = "python" }

Write-Host "Detected project type: $ProjectType" -ForegroundColor Green

# Create project config
$ConfigPath = Join-Path $CodorDir "project-config.json"
$config = @{
    projectType = $ProjectType
    installedDate = (Get-Date).ToString("yyyy-MM-dd")
    constitutionVersion = "3.4"
} | ConvertTo-Json

$config | Out-File -FilePath $ConfigPath -Encoding UTF8

# Create activation script
$ActivationPath = Join-Path $CodorDir "activate.ps1"
$activation = @"
Write-Host "🏛️ CODOR Activated for $ProjectType project" -ForegroundColor Green
`$env:CODOR_ACTIVE = "true"
`$env:CODOR_PATH = "$CodorDir"
"@

$activation | Out-File -FilePath $ActivationPath -Encoding UTF8

Write-Host ""
Write-Host "✅ CODOR Installation Complete!" -ForegroundColor Green
Write-Host "Next: cd '$TargetPath' && .\.codor\activate.ps1" -ForegroundColor Yellow