# CODOR Validation Script - Test Installation
# Usage: .\validate-codor.ps1 [project-directory]

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectDir = "."
)

Write-Host "🔍 CODOR Installation Validator" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

$ProjectPath = Resolve-Path $ProjectDir
$CodorPath = Join-Path $ProjectPath ".codor"

Write-Host "Validating CODOR installation in: $ProjectPath" -ForegroundColor Green
Write-Host ""

# Test results tracking
$TestResults = @()

function Test-Component {
    param($Name, $Path, $Required = $true)
    
    $exists = Test-Path $Path
    $status = if ($exists) { "✓ PASS" } else { if ($Required) { "✗ FAIL" } else { "⚠ SKIP" } }
    $color = if ($exists) { "Green" } else { if ($Required) { "Red" } else { "Yellow" } }
    
    Write-Host "$status $Name" -ForegroundColor $color
    if ($exists -and (Get-Item $Path).PSIsContainer) {
        Write-Host "     Directory: $Path" -ForegroundColor Gray
    } elseif ($exists) {
        $size = (Get-Item $Path).Length
        Write-Host "     File: $Path ($size bytes)" -ForegroundColor Gray
    } else {
        Write-Host "     Missing: $Path" -ForegroundColor Gray
    }
    
    $script:TestResults += @{
        Name = $Name
        Path = $Path
        Exists = $exists
        Required = $Required
        Status = $status
    }
    
    return $exists
}

Write-Host "📁 Directory Structure Tests:" -ForegroundColor Yellow
Test-Component "CODOR Root Directory" $CodorPath
Test-Component "Core Directory" (Join-Path $CodorPath "core")
Test-Component "Overlay Directory" (Join-Path $CodorPath "overlay")
Test-Component "Config Directory" (Join-Path $CodorPath "overlay\config")
Test-Component "Interceptors Directory" (Join-Path $CodorPath "overlay\interceptors")

Write-Host ""
Write-Host "📄 Core Files Tests:" -ForegroundColor Yellow
Test-Component "Constitution" (Join-Path $CodorPath "core\constitution.md")
Test-Component "Project Config" (Join-Path $CodorPath "project-config.json")
Test-Component "Activation Script" (Join-Path $CodorPath "activate-codor.ps1")
Test-Component "README" (Join-Path $CodorPath "README.md")

Write-Host ""
Write-Host "⚙️ Overlay System Tests:" -ForegroundColor Yellow
Test-Component "Overlay Activator" (Join-Path $CodorPath "overlay\activate.js")
Test-Component "Command Interceptor" (Join-Path $CodorPath "overlay\interceptors\command-interceptor.js")
Test-Component "Task Enhancer" (Join-Path $CodorPath "overlay\interceptors\task-enhancer.js")
Test-Component "Constitution Config" (Join-Path $CodorPath "overlay\config\constitution-config.json")

Write-Host ""
Write-Host "📋 Configuration Tests:" -ForegroundColor Yellow

# Test project configuration
$projectConfigPath = Join-Path $CodorPath "project-config.json"
if (Test-Path $projectConfigPath) {
    try {
        $projectConfig = Get-Content $projectConfigPath | ConvertFrom-Json
        Write-Host "✓ PASS Project Config Valid JSON" -ForegroundColor Green
        Write-Host "     Project Type: $($projectConfig.projectType)" -ForegroundColor Gray
        Write-Host "     Constitution Version: $($projectConfig.constitutionVersion)" -ForegroundColor Gray
        Write-Host "     Installed: $($projectConfig.installedDate)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ FAIL Project Config Invalid JSON: $_" -ForegroundColor Red
    }
} else {
    Write-Host "✗ FAIL Project Config Missing" -ForegroundColor Red
}

# Test constitution content
$constitutionPath = Join-Path $CodorPath "core\constitution.md"
if (Test-Path $constitutionPath) {
    $constitutionContent = Get-Content $constitutionPath -Raw
    $mandateCount = ([regex]::Matches($constitutionContent, "MANDATE \d+")).Count
    if ($mandateCount -ge 3) {
        Write-Host "✓ PASS Constitution Contains Mandates ($mandateCount found)" -ForegroundColor Green
    } else {
        Write-Host "⚠ WARN Constitution Has Few Mandates ($mandateCount found)" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ FAIL Constitution Missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Integration Tests:" -ForegroundColor Yellow

# Test environment activation
$activationScript = Join-Path $CodorPath "activate-codor.ps1"
if (Test-Path $activationScript) {
    Write-Host "✓ PASS Activation Script Available" -ForegroundColor Green
    Write-Host "     Run: .\.codor\activate-codor.ps1" -ForegroundColor Gray
} else {
    Write-Host "✗ FAIL Activation Script Missing" -ForegroundColor Red
}

# Test GitHub Spec Kit compatibility
if (Test-Path (Join-Path $ProjectPath ".github")) {
    Write-Host "✓ INFO GitHub Directory Detected" -ForegroundColor Cyan
    Write-Host "     CODOR overlay system ready for GitHub integration" -ForegroundColor Gray
} else {
    Write-Host "ℹ INFO No GitHub Directory" -ForegroundColor White
    Write-Host "     CODOR can still provide constitutional compliance" -ForegroundColor Gray
}

# Summary
Write-Host ""
Write-Host "📊 Validation Summary:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

$totalTests = $TestResults.Count
$passedTests = ($TestResults | Where-Object { $_.Exists -eq $true }).Count
$failedRequired = ($TestResults | Where-Object { $_.Required -eq $true -and $_.Exists -eq $false }).Count

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed Required: $failedRequired" -ForegroundColor Red

if ($failedRequired -eq 0) {
    Write-Host ""
    Write-Host "🎉 CODOR Installation VALIDATED!" -ForegroundColor Green
    Write-Host "Ready for constitutional compliance testing!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Quick Start:" -ForegroundColor Yellow
    Write-Host "1. .\.codor\activate-codor.ps1" -ForegroundColor White
    Write-Host "2. Start your development workflow" -ForegroundColor White
    Write-Host "3. CODOR will monitor for compliance" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ CODOR Installation INCOMPLETE" -ForegroundColor Red
    Write-Host "Please re-run the installer to fix missing components" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Re-install with:" -ForegroundColor Yellow
    Write-Host ".\install-codor.ps1 '$ProjectDir'" -ForegroundColor White
}

Write-Host ""