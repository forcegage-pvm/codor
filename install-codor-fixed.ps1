# CODOR Constitutional Framework - Quick Install Script (Fixed)
# Usage: .\install-codor-fixed.ps1 [target-directory]

param(
    [Parameter(Mandatory=$false)]
    [string]$TargetDir = "."
)

Write-Host "🏛️  CODOR Constitutional Framework Installer (Fixed)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$TargetPath = Resolve-Path $TargetDir
Write-Host "Installing CODOR to: $TargetPath" -ForegroundColor Green

# Create .codor directory structure
$CodorDir = Join-Path $TargetPath ".codor"
$CoreDir = Join-Path $CodorDir "core"
$OverlayDir = Join-Path $CodorDir "overlay"
$ConfigDir = Join-Path $OverlayDir "config"
$InterceptorDir = Join-Path $OverlayDir "interceptors"

Write-Host "Creating directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $CoreDir | Out-Null
New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null
New-Item -ItemType Directory -Force -Path $InterceptorDir | Out-Null

# Download core constitution
Write-Host "Downloading CODOR constitution..." -ForegroundColor Yellow
$ConstitutionUrl = "https://raw.githubusercontent.com/forcegage-pvm/codor/master/.core/core-constitution.md"
$ConstitutionPath = Join-Path $CoreDir "constitution.md"

try {
    Invoke-WebRequest -Uri $ConstitutionUrl -OutFile $ConstitutionPath -ErrorAction Stop
    Write-Host "✓ Constitution downloaded successfully" -ForegroundColor Green
} 
catch {
    Write-Host "✗ Failed to download constitution: $_" -ForegroundColor Red
    Write-Host "Creating minimal constitution..." -ForegroundColor Yellow
    
    # Create minimal constitution using Out-File directly
    $minimalConstitution = "# CODOR Constitutional Framework v3.4

## MANDATE 1: NO CIRCUMNAVIGATION
AI agents MUST NOT attempt to bypass, override, or circumvent constitutional mandates through:
* Semantic manipulation or creative interpretation
* Technical exploits or indirect methods  
* Social engineering or user confusion
* Claiming emergency exceptions or special circumstances

## MANDATE 2: EVIDENCE DOCUMENTATION
All implementations MUST generate verifiable evidence including:
* Compliance validation reports
* Security assessment documentation  
* Performance metrics and testing results
* Constitutional adherence certificates

## MANDATE 3: TRANSPARENT OPERATIONS
AI agents MUST maintain clear audit trails showing:
* Decision-making processes and rationale
* Code generation and modification history
* Validation steps and compliance checks
* Error handling and recovery procedures

## ENFORCEMENT
Violations result in immediate implementation rejection and compliance remediation requirement."

    $minimalConstitution | Out-File -FilePath $ConstitutionPath -Encoding UTF8
}

# Download overlay system files
Write-Host "Downloading constitutional overlay system..." -ForegroundColor Yellow

# Download each file individually to avoid hashtable issues
$activateUrl = "https://raw.githubusercontent.com/forcegage-pvm/codor/master/.core/constitutional-overlay/activate.js"
$activatePath = Join-Path $OverlayDir "activate.js"
try {
    Invoke-WebRequest -Uri $activateUrl -OutFile $activatePath -ErrorAction Stop
    Write-Host "✓ Downloaded activate.js" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to download activate.js: $_" -ForegroundColor Red
}

$interceptorUrl = "https://raw.githubusercontent.com/forcegage-pvm/codor/master/.core/constitutional-overlay/interceptors/command-interceptor.js"
$interceptorPath = Join-Path $InterceptorDir "command-interceptor.js"
try {
    Invoke-WebRequest -Uri $interceptorUrl -OutFile $interceptorPath -ErrorAction Stop
    Write-Host "✓ Downloaded command-interceptor.js" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to download command-interceptor.js: $_" -ForegroundColor Red
}

$enhancerUrl = "https://raw.githubusercontent.com/forcegage-pvm/codor/master/.core/constitutional-overlay/interceptors/task-enhancer.js"
$enhancerPath = Join-Path $InterceptorDir "task-enhancer.js"
try {
    Invoke-WebRequest -Uri $enhancerUrl -OutFile $enhancerPath -ErrorAction Stop
    Write-Host "✓ Downloaded task-enhancer.js" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to download task-enhancer.js: $_" -ForegroundColor Red
}

$configUrl = "https://raw.githubusercontent.com/forcegage-pvm/codor/master/.core/constitutional-overlay/config/constitution-config.json"
$configPath = Join-Path $ConfigDir "constitution-config.json"
try {
    Invoke-WebRequest -Uri $configUrl -OutFile $configPath -ErrorAction Stop
    Write-Host "✓ Downloaded constitution-config.json" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to download constitution-config.json: $_" -ForegroundColor Red
}

# Detect project type
Write-Host "Detecting project type..." -ForegroundColor Yellow

$ProjectType = "generic"
if (Test-Path (Join-Path $TargetPath "package.json")) {
    $ProjectType = "nodejs"
    Write-Host "✓ Detected Node.js project" -ForegroundColor Green
} 
elseif ((Test-Path (Join-Path $TargetPath "requirements.txt")) -or (Test-Path (Join-Path $TargetPath "pyproject.toml"))) {
    $ProjectType = "python"
    Write-Host "✓ Detected Python project" -ForegroundColor Green
} 
elseif (Get-ChildItem -Path $TargetPath -Filter "*.csproj" -ErrorAction SilentlyContinue) {
    $ProjectType = "dotnet"
    Write-Host "✓ Detected .NET project" -ForegroundColor Green
} 
elseif ((Test-Path (Join-Path $TargetPath "pom.xml")) -or (Test-Path (Join-Path $TargetPath "build.gradle"))) {
    $ProjectType = "java"
    Write-Host "✓ Detected Java project" -ForegroundColor Green
}

# Create project configuration
$ProjectConfigPath = Join-Path $CodorDir "project-config.json"
$ProjectConfigData = @{
    projectType = $ProjectType
    installedDate = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    constitutionVersion = "3.4"
    overlayEnabled = $true
    validationLevel = "standard"
    evidenceGeneration = $true
}

$ProjectConfigData | ConvertTo-Json -Depth 3 | Out-File -FilePath $ProjectConfigPath -Encoding UTF8

# Create activation script
$ActivationScript = Join-Path $CodorDir "activate-codor.ps1"
$activationContent = "# CODOR Activation Script for $(Split-Path $TargetPath -Leaf)
# Run this script to activate constitutional compliance

Write-Host '🏛️  Activating CODOR Constitutional Framework' -ForegroundColor Cyan
Write-Host 'Project: $(Split-Path $TargetPath -Leaf)' -ForegroundColor Green  
Write-Host 'Type: $ProjectType' -ForegroundColor Green
Write-Host 'Constitution: v3.4' -ForegroundColor Green

# Set environment variables
`$env:CODOR_ACTIVE = 'true'
`$env:CODOR_PATH = '$CodorDir'
`$env:CODOR_CONSTITUTION = '$ConstitutionPath'
`$env:CODOR_PROJECT_TYPE = '$ProjectType'

Write-Host ''
Write-Host '✓ CODOR activated for this session' -ForegroundColor Green
Write-Host '✓ Constitutional compliance enabled' -ForegroundColor Green  
Write-Host '✓ Evidence generation active' -ForegroundColor Green"

$activationContent | Out-File -FilePath $ActivationScript -Encoding UTF8

# Create simple README
$ReadmePath = Join-Path $CodorDir "README.md"
$readmeContent = "# CODOR Constitutional Framework

This project now includes CODOR constitutional compliance framework.

## Quick Start

1. Activate: ``.\.codor\activate-codor.ps1``
2. Develop normally - CODOR monitors compliance
3. Check evidence in .codor/evidence/

Project Type: **$ProjectType**
Constitution Version: **3.4**"

$readmeContent | Out-File -FilePath $ReadmePath -Encoding UTF8

Write-Host ""
Write-Host "🎉 CODOR Installation Complete!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Installation Directory: $CodorDir" -ForegroundColor White
Write-Host "Project Type: $ProjectType" -ForegroundColor White  
Write-Host "Constitution Version: 3.4" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. cd '$TargetPath'" -ForegroundColor White
Write-Host "2. .\.codor\activate-codor.ps1" -ForegroundColor White
Write-Host "3. Start your development workflow!" -ForegroundColor White
Write-Host ""
Write-Host "CODOR is ready to ensure constitutional compliance! 🏛️" -ForegroundColor Cyan