# CODOR Constitutional Framework - Quick Install Script
# Usage: .\install-codor.ps1 [target-directory]

param(
    [Parameter(Mandatory = $false)]
    [string]$TargetDir = "."
)

Write-Host "🏛️  CODOR Constitutional Framework Installer" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

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
    
    # Fallback: create minimal constitution
    $constitutionContent = @'
# CODOR Constitutional Framework v3.4

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
Violations result in immediate implementation rejection and compliance remediation requirement.
'@
    $constitutionContent | Out-File -FilePath $ConstitutionPath -Encoding UTF8
}

# Download overlay system files
Write-Host "Downloading constitutional overlay system..." -ForegroundColor Yellow

$OverlayFiles = @{
    "https://raw.githubusercontent.com/forcegage-pvm/codor/master/.core/constitutional-overlay/activate.js"                         = Join-Path $OverlayDir "activate.js"
    "https://raw.githubusercontent.com/forcegage-pvm/codor/master/.core/constitutional-overlay/interceptors/command-interceptor.js" = Join-Path $InterceptorDir "command-interceptor.js"
    "https://raw.githubusercontent.com/forcegage-pvm/codor/master/.core/constitutional-overlay/interceptors/task-enhancer.js"       = Join-Path $InterceptorDir "task-enhancer.js"
    "https://raw.githubusercontent.com/forcegage-pvm/codor/master/.core/constitutional-overlay/config/constitution-config.json"     = Join-Path $ConfigDir "constitution-config.json"
}

foreach ($url in $OverlayFiles.Keys) {
    $localPath = $OverlayFiles[$url]
    try {
        Invoke-WebRequest -Uri $url -OutFile $localPath -ErrorAction Stop
        Write-Host "✓ Downloaded $(Split-Path $localPath -Leaf)" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Failed to download $(Split-Path $localPath -Leaf): $_" -ForegroundColor Red
    }
}

# Detect project type and create configuration
Write-Host "Detecting project type..." -ForegroundColor Yellow

$ProjectType = "generic"
$ProjectConfig = @{}

if (Test-Path (Join-Path $TargetPath "package.json")) {
    $ProjectType = "nodejs"
    Write-Host "✓ Detected Node.js project" -ForegroundColor Green
}
elseif (Test-Path (Join-Path $TargetPath "requirements.txt") -or (Test-Path (Join-Path $TargetPath "pyproject.toml"))) {
    $ProjectType = "python"
    Write-Host "✓ Detected Python project" -ForegroundColor Green
}
elseif (Test-Path (Join-Path $TargetPath "*.csproj")) {
    $ProjectType = "dotnet"
    Write-Host "✓ Detected .NET project" -ForegroundColor Green
}
elseif (Test-Path (Join-Path $TargetPath "pom.xml") -or (Test-Path (Join-Path $TargetPath "build.gradle"))) {
    $ProjectType = "java"
    Write-Host "✓ Detected Java project" -ForegroundColor Green
}

# Create project-specific configuration
$ProjectConfigPath = Join-Path $CodorDir "project-config.json"
$ProjectConfig = @{
    projectType         = $ProjectType
    installedDate       = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    constitutionVersion = "3.4"
    overlayEnabled      = $true
    validationLevel     = "standard"
    evidenceGeneration  = $true
} | ConvertTo-Json -Depth 3

$ProjectConfig | Out-File -FilePath $ProjectConfigPath -Encoding UTF8

# Create activation script
$ActivationScript = Join-Path $CodorDir "activate-codor.ps1"
@"
# CODOR Activation Script for $(Split-Path $TargetPath -Leaf)
# Run this script to activate constitutional compliance in your development session

Write-Host "🏛️  Activating CODOR Constitutional Framework" -ForegroundColor Cyan
Write-Host "Project: $(Split-Path $TargetPath -Leaf)" -ForegroundColor Green  
Write-Host "Type: $ProjectType" -ForegroundColor Green
Write-Host "Constitution: v3.4" -ForegroundColor Green

# Set environment variables
`$env:CODOR_ACTIVE = "true"
`$env:CODOR_PATH = "$CodorDir"
`$env:CODOR_CONSTITUTION = "$ConstitutionPath"
`$env:CODOR_PROJECT_TYPE = "$ProjectType"

Write-Host ""
Write-Host "✓ CODOR activated for this session" -ForegroundColor Green
Write-Host "✓ Constitutional compliance enabled" -ForegroundColor Green  
Write-Host "✓ Evidence generation active" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run your normal development commands" -ForegroundColor White
Write-Host "2. CODOR will automatically validate constitutional compliance" -ForegroundColor White
Write-Host "3. Check .codor/evidence/ for compliance documentation" -ForegroundColor White
Write-Host ""
Write-Host "Deactivate with: Remove-Item Env:CODOR_*" -ForegroundColor Gray
"@ | Out-File -FilePath $ActivationScript -Encoding UTF8

# Create README
$ReadmePath = Join-Path $CodorDir "README.md"
@"
# CODOR Constitutional Framework

This project now includes CODOR constitutional compliance framework for AI-safe development.

## Quick Start

1. **Activate CODOR for this session:**
   ``````powershell
   .\.codor\activate-codor.ps1
   ``````

2. **Verify installation:**
   ``````powershell
   Get-ChildItem .codor -Recurse
   ``````

3. **Start developing with constitutional compliance!**

## What CODOR Does

- **Constitutional Validation**: Ensures AI agents follow ethical guidelines
- **Evidence Generation**: Creates audit trails for all AI-assisted development  
- **Spec-to-Implementation**: Validates feature specifications for compliance
- **Anti-Circumnavigation**: Prevents AI agents from bypassing safety measures

## Directory Structure

``````
.codor/
├── core/
│   └── constitution.md          # Core constitutional framework
├── overlay/
│   ├── activate.js             # GitHub Spec Kit integration
│   ├── config/
│   │   └── constitution-config.json
│   └── interceptors/
│       ├── command-interceptor.js
│       └── task-enhancer.js
├── evidence/                   # Generated compliance documentation
├── project-config.json         # Project-specific settings
├── activate-codor.ps1          # Session activation script
└── README.md                   # This file
``````

## Project Integration

CODOR is now configured for your **$ProjectType** project and will:

- Monitor AI agent behavior for constitutional compliance
- Generate evidence documentation automatically
- Validate specifications before implementation
- Provide audit trails for all AI-assisted development

## Support

- Repository: https://github.com/forcegage-pvm/codor
- Issues: https://github.com/forcegage-pvm/codor/issues
- Constitution Version: 3.4

**Constitutional compliance is now active for this project.**
"@ | Out-File -FilePath $ReadmePath -Encoding UTF8

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