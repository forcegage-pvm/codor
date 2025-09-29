# CODOR Phase 1 Quick Setup Guide

## 🚀 One-Line Installation

Install CODOR constitutional compliance in any existing project:

### Windows (PowerShell)
```powershell
# Install in current directory
.\install-codor.ps1

# Install in specific project
.\install-codor.ps1 "C:\path\to\your\project"

# Quick test on sample project  
.\test-codor.ps1
```

### Linux/macOS (Bash)
```bash
# Install in current directory
./install-codor.sh

# Install in specific project
./install-codor.sh "/path/to/your/project"

# Make executable first
chmod +x install-codor.sh validate-codor.sh
```

## 🔍 Validation

Verify CODOR installation:

```powershell
.\validate-codor.ps1 "path\to\project"
```

## 🏛️ Activation

Activate constitutional compliance in your project:

### Windows
```powershell
cd your-project
.\.codor\activate-codor.ps1
```

### Linux/macOS  
```bash
cd your-project
source .codor/activate-codor.sh
```

## 📁 What Gets Installed

```
your-project/
└── .codor/
    ├── core/
    │   └── constitution.md              # CODOR constitutional framework v3.4
    ├── overlay/
    │   ├── activate.js                  # GitHub Spec Kit integration  
    │   ├── config/
    │   │   └── constitution-config.json # Auto-generated configuration
    │   └── interceptors/
    │       ├── command-interceptor.js   # Constitutional command validation
    │       └── task-enhancer.js         # Compliance enhancement tools
    ├── evidence/                        # Generated compliance documentation
    ├── project-config.json              # Project-specific settings
    ├── activate-codor.ps1/.sh          # Session activation
    └── README.md                        # Integration guide
```

## ⚡ Quick Test Workflow

1. **Install CODOR:**
   ```powershell
   .\install-codor.ps1 .\my-existing-project
   ```

2. **Validate Installation:**
   ```powershell
   .\validate-codor.ps1 .\my-existing-project
   ```

3. **Activate Compliance:**
   ```powershell
   cd my-existing-project
   .\.codor\activate-codor.ps1
   ```

4. **Start Development:**
   ```powershell
   # Your normal workflow - CODOR monitors in background
   git status
   code .
   npm start  # or your usual commands
   ```

5. **Check Evidence:**
   ```powershell
   Get-ChildItem .codor\evidence\
   ```

## 🎯 Supported Project Types

CODOR auto-detects and configures for:

- **Node.js** (package.json detected)
- **Python** (requirements.txt, pyproject.toml detected)  
- **.NET** (*.csproj detected)
- **Java** (pom.xml, build.gradle detected)
- **Generic** (any other project type)

## 🔧 Environment Variables (After Activation)

- `CODOR_ACTIVE=true` - Constitutional compliance enabled
- `CODOR_PATH=path/to/.codor` - CODOR installation directory
- `CODOR_CONSTITUTION=path/to/constitution.md` - Active constitution
- `CODOR_PROJECT_TYPE=nodejs|python|dotnet|java|generic` - Detected project type

## 📋 Phase 1 Testing Checklist

- [ ] Install CODOR in existing project
- [ ] Validate all components present
- [ ] Activate constitutional compliance session
- [ ] Run normal development workflow  
- [ ] Verify environment variables set
- [ ] Check evidence generation (if any)
- [ ] Test deactivation (`Remove-Item Env:CODOR_*`)

## 🚨 Troubleshooting

**Installation fails downloading from GitHub:**
- Check internet connection
- Installer creates minimal constitution as fallback
- Manually download missing files from: https://github.com/forcegage-pvm/codor

**Validation shows missing files:**
- Re-run installer: `.\install-codor.ps1 project-path`
- Check file permissions

**Activation script not working:**
- Ensure PowerShell execution policy allows scripts
- Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## 🎉 Success Indicators

✅ **Installation Complete:**
- `.codor/` directory created with all components
- Project type auto-detected correctly
- All validation tests pass

✅ **Activation Successful:**  
- Environment variables set (`echo $env:CODOR_ACTIVE`)
- Constitutional compliance message displayed
- Normal development commands work unchanged

✅ **Ready for Phase 2:**
- Basic constitutional framework operational
- Evidence generation framework in place
- GitHub integration overlay system ready
- Project-specific configuration complete

---

**CODOR Constitutional Framework v3.4** | *AI-Safe Development for Everyone*