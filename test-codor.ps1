# CODOR Quick Test Demo
# This script creates a sample project and tests CODOR installation

Write-Host "🧪 CODOR Quick Test Demo" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Create test project
$TestDir = ".\codor-test-project"
Write-Host "Creating test project: $TestDir" -ForegroundColor Yellow

if (Test-Path $TestDir) {
    Write-Host "Cleaning existing test directory..." -ForegroundColor Gray
    Remove-Item $TestDir -Recurse -Force
}

New-Item -ItemType Directory -Path $TestDir | Out-Null
Set-Location $TestDir

# Create a simple Node.js project for testing
@"
{
  "name": "codor-test-project",
  "version": "1.0.0",
  "description": "Test project for CODOR constitutional compliance",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo 'No tests yet'"
  },
  "keywords": ["codor", "constitutional", "compliance"],
  "author": "CODOR Framework",
  "license": "MIT"
}
"@ | Out-File -FilePath "package.json" -Encoding UTF8

@"
// CODOR Test Project
// This is a simple Node.js application for testing constitutional compliance

console.log('🏛️ CODOR Test Project');
console.log('Constitutional compliance framework active!');

// Sample function that would benefit from CODOR validation
function processUserData(userData) {
    // This function should be validated for:
    // - Data privacy compliance
    // - Security best practices  
    // - Constitutional mandates adherence
    
    if (!userData) {
        throw new Error('User data is required');
    }
    
    return {
        processed: true,
        timestamp: new Date().toISOString(),
        compliant: true
    };
}

module.exports = { processUserData };
"@ | Out-File -FilePath "index.js" -Encoding UTF8

Write-Host "✓ Test project created" -ForegroundColor Green

# Install CODOR
Write-Host "Installing CODOR constitutional framework..." -ForegroundColor Yellow
$InstallScript = Resolve-Path "..\install-codor.ps1"
& $InstallScript "."

Write-Host ""
Write-Host "Running validation..." -ForegroundColor Yellow
$ValidateScript = Resolve-Path "..\validate-codor.ps1"
& $ValidateScript "."

Write-Host ""
Write-Host "🎯 Demo Complete!" -ForegroundColor Green
Write-Host "Test project location: $((Get-Location).Path)" -ForegroundColor White
Write-Host ""
Write-Host "Try it out:" -ForegroundColor Yellow
Write-Host "1. .\.codor\activate-codor.ps1" -ForegroundColor White
Write-Host "2. npm start" -ForegroundColor White
Write-Host "3. Check .codor/ for compliance files" -ForegroundColor White

# Return to original directory
Set-Location ".."