#!/bin/bash
# CODOR Constitutional Framework v4.0 - Complete Installer with VS Code Integration
# Usage: ./install-codor.sh [target-directory]
# Installs constitutional framework + VS Code slash commands for professional AI agent integration

TARGET_DIR=${1:-.}
CODOR_REPO="https://raw.githubusercontent.com/forcegage-pvm/codor/master"

echo "CODOR Constitutional Framework v4.0 - Complete Installation"
echo "============================================================"

TARGET_PATH=$(realpath "$TARGET_DIR")
echo "Installing CODOR to: $TARGET_PATH"

# Create .codor directory structure
CODOR_DIR="$TARGET_PATH/.codor"
CORE_DIR="$CODOR_DIR/core"
OVERLAY_DIR="$CODOR_DIR/overlay"
CONFIG_DIR="$OVERLAY_DIR/config"
INTERCEPTOR_DIR="$OVERLAY_DIR/interceptors"

echo "Creating directory structure..."
mkdir -p "$CORE_DIR" "$CONFIG_DIR" "$INTERCEPTOR_DIR"

# Download core constitution
echo "Downloading CODOR constitution..."
CONSTITUTION_URL="$CODOR_REPO/.core/core-constitution.md"
CONSTITUTION_PATH="$CORE_DIR/constitution.md"

if curl -fsSL "$CONSTITUTION_URL" -o "$CONSTITUTION_PATH"; then
    echo "✓ Constitution downloaded successfully"
else
    echo "✗ Failed to download constitution, creating minimal version..."
    cat > "$CONSTITUTION_PATH" << 'EOF'
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
EOF
fi

# Download overlay system files
echo "Downloading constitutional overlay system..."

declare -A OVERLAY_FILES=(
    ["$CODOR_REPO/.core/constitutional-overlay/activate.js"]="$OVERLAY_DIR/activate.js"
    ["$CODOR_REPO/.core/constitutional-overlay/interceptors/command-interceptor.js"]="$INTERCEPTOR_DIR/command-interceptor.js"
    ["$CODOR_REPO/.core/constitutional-overlay/interceptors/task-enhancer.js"]="$INTERCEPTOR_DIR/task-enhancer.js"
    ["$CODOR_REPO/.core/constitutional-overlay/config/constitution-config.json"]="$CONFIG_DIR/constitution-config.json"
)

for url in "${!OVERLAY_FILES[@]}"; do
    local_path="${OVERLAY_FILES[$url]}"
    filename=$(basename "$local_path")
    if curl -fsSL "$url" -o "$local_path"; then
        echo "✓ Downloaded $filename"
    else
        echo "✗ Failed to download $filename"
    fi
done

# Install VS Code integration
echo "Installing constitutional slash commands..."

# Create .github/prompts directory for VS Code integration
GITHUB_DIR="$TARGET_PATH/.github"
PROMPTS_DIR="$GITHUB_DIR/prompts"
mkdir -p "$PROMPTS_DIR"

# Download VS Code prompt files
PROMPTS=(
    "codor-onboarding.prompt.md"
    "codor-validate.prompt.md" 
    "codor-evidence.prompt.md"
    "codor-status.prompt.md"
)

for prompt in "${PROMPTS[@]}"; do
    prompt_url="$CODOR_REPO/.github/prompts/$prompt"
    prompt_path="$PROMPTS_DIR/$prompt"
    
    if curl -fsSL "$prompt_url" -o "$prompt_path"; then
        echo "✓ /${prompt%.prompt.md} command installed"
    else
        echo "✗ Failed to download $prompt"
    fi
done

# Create VS Code workspace settings to enable prompt files
VSCODE_DIR="$TARGET_PATH/.vscode"
mkdir -p "$VSCODE_DIR"

VSCODE_SETTINGS="$VSCODE_DIR/settings.json"
if [ -f "$VSCODE_SETTINGS" ]; then
    # Merge with existing settings (simple append if valid JSON)
    if ! grep -q "chat.promptFiles" "$VSCODE_SETTINGS" 2>/dev/null; then
        # Add setting if it doesn't exist
        sed -i '$s/}$/,\n    "chat.promptFiles": true\n}/' "$VSCODE_SETTINGS" 2>/dev/null || \
        echo '{"chat.promptFiles": true}' > "$VSCODE_SETTINGS"
        echo "✓ VS Code settings updated to enable prompt files"
    fi
else
    # Create new settings file
    echo '{"chat.promptFiles": true}' > "$VSCODE_SETTINGS"
    echo "✓ VS Code settings created to enable prompt files"
fi

# Install GitHub Spec Kit Constitutional Overlay System
echo "Installing GitHub Spec Kit constitutional overlay..."
SPECIFY_DIR="$TARGET_PATH/.specify"
if [ -d "$SPECIFY_DIR" ]; then
    echo "✓ GitHub Spec Kit detected - deploying constitutional overlay"
    
    # Create constitutional overlay directories
    CONSTITUTIONAL_DIR="$SPECIFY_DIR/constitutional"
    INTERCEPTORS_DIR="$CONSTITUTIONAL_DIR/interceptors"
    CONFIG_DIR="$CONSTITUTIONAL_DIR/config"
    SPECIFY_TOOLS_DIR="$SPECIFY_DIR/tools"
    
    mkdir -p "$CONSTITUTIONAL_DIR" "$INTERCEPTORS_DIR" "$CONFIG_DIR" "$SPECIFY_TOOLS_DIR"
    
    # Download constitutional overlay files
    declare -A OVERLAY_FILES=(
        ["constitutional/activate.js"]="$CONSTITUTIONAL_DIR"
        ["constitutional/config/constitution-config.json"]="$CONFIG_DIR"
        ["constitutional/interceptors/task-interceptor.js"]="$INTERCEPTORS_DIR"
        ["constitutional/interceptors/specify-interceptor.js"]="$INTERCEPTORS_DIR"
        ["constitutional/interceptors/plan-interceptor.js"]="$INTERCEPTORS_DIR"
        ["tools/constitutional-validator.js"]="$SPECIFY_TOOLS_DIR"
    )
    
    for file_path in "${!OVERLAY_FILES[@]}"; do
        file_url="$CODOR_REPO/.specify/$file_path"
        file_name=$(basename "$file_path")
        dest_path="${OVERLAY_FILES[$file_path]}/$file_name"
        
        if curl -fsSL "$file_url" -o "$dest_path"; then
            echo "  ✓ $file_path installed"
        else
            echo "  ✗ Warning: Could not download $file_path"
        fi
    done
    
    # Update Spec Kit constitution with CODOR framework
    SPECIFY_MEMORY_DIR="$SPECIFY_DIR/memory"
    CONSTITUTION_PATH="$SPECIFY_MEMORY_DIR/constitution.md"
    
    if [ -f "$CONSTITUTION_PATH" ]; then
        echo "  ✓ Updating Spec Kit constitution with CODOR framework"
        cat > "$CONSTITUTION_PATH" << 'EOF'
# CODOR Constitutional Framework v4.0

## Core Principles

### I. NO CIRCUMNAVIGATION (NON-NEGOTIABLE)
AI agents MUST NOT attempt to bypass constitutional mandates through:
- Semantic manipulation or creative interpretation
- Technical exploits or indirect methods  
- Emergency exceptions or special circumstances
- Bypassing validation gates or evidence collection

### II. THREE-GATE VALIDATION SYSTEM (MANDATORY)
All implementations MUST complete mandatory validation gates:
- **Gate 1 - Pre-Implementation**: Constitutional compliance review, resource validation, success criteria establishment
- **Gate 2 - MCP Testing**: Mandatory MCP integration testing with constitutional validation during execution  
- **Gate 3 - Post-Implementation**: Final constitutional compliance verification, complete evidence package validation

### III. EVIDENCE DOCUMENTATION (NON-NEGOTIABLE)
All implementations MUST generate verifiable evidence including:
- **Test Results**: Comprehensive testing with documented results in /evidence/test-results/
- **Screenshots**: Visual evidence of functionality in /evidence/screenshots/
- **Logs**: Complete execution logs and error handling validation in /evidence/logs/
- **Compliance Reports**: Constitutional adherence certificates in /evidence/compliance/

### IV. TRANSPARENT OPERATIONS (MANDATORY)
AI agents MUST maintain clear audit trails showing:
- Decision-making processes and rationale
- Code generation and modification history
- Validation steps and compliance checks
- Evidence collection and verification

### V. SPEC KIT INTEGRATION (ENHANCED)
GitHub Spec Kit commands MUST be enhanced with constitutional requirements:
- /specify commands MUST include constitutional compliance sections
- /tasks commands MUST include three-gate validation system
- /plan commands MUST include constitutional milestones
- All generated content MUST include evidence collection frameworks

## Anti-Circumnavigation Enforcement

Constitutional compliance system MUST actively detect and prevent:
- Attempts to bypass validation gates
- Evidence collection avoidance
- Constitutional requirement omission
- Audit trail manipulation

## Development Workflow

All development activities must follow constitutional compliance:
- Every task must complete three validation gates
- Evidence collection is mandatory at each gate
- Constitutional requirements cannot be bypassed
- Audit trails must be maintained throughout

## Governance

- Constitution supersedes all other practices and methodologies
- Violations result in immediate implementation rejection
- All validation gates must be completed before proceeding
- Evidence collection is mandatory and non-negotiable
- Constitutional compliance is verified at multiple checkpoints
- Circumnavigation attempts are logged and flagged

**Version**: 4.0 | **Ratified**: 2025-09-29 | **Last Amended**: 2025-09-29
EOF
        echo "  ✓ CODOR constitutional framework integrated into Spec Kit"
    fi
    
    echo "  ✓ GitHub Spec Kit constitutional overlay deployment complete"
    echo "  ✓ Use /codor-onboarding to activate constitutional enhancement"
else
    echo "  ⚠ GitHub Spec Kit not detected - overlay available for future deployment"
fi

# Detect project type
echo "Detecting project type..."

PROJECT_TYPE="generic"

if [ -f "$TARGET_PATH/package.json" ]; then
    PROJECT_TYPE="nodejs"
    echo "✓ Detected Node.js project"
elif [ -f "$TARGET_PATH/requirements.txt" ] || [ -f "$TARGET_PATH/pyproject.toml" ]; then
    PROJECT_TYPE="python"
    echo "✓ Detected Python project"
elif [ -f "$TARGET_PATH"/*.csproj 2>/dev/null ]; then
    PROJECT_TYPE="dotnet"
    echo "✓ Detected .NET project"
elif [ -f "$TARGET_PATH/pom.xml" ] || [ -f "$TARGET_PATH/build.gradle" ]; then
    PROJECT_TYPE="java"
    echo "✓ Detected Java project"
fi

# Create project-specific configuration
PROJECT_CONFIG_PATH="$CODOR_DIR/project-config.json"
cat > "$PROJECT_CONFIG_PATH" << EOF
{
    "projectType": "$PROJECT_TYPE",
    "installedDate": "$(date '+%Y-%m-%d %H:%M:%S')",
    "constitutionVersion": "3.4",
    "overlayEnabled": true,
    "validationLevel": "standard",
    "evidenceGeneration": true
}
EOF

# Create activation script
ACTIVATION_SCRIPT="$CODOR_DIR/activate-codor.sh"
cat > "$ACTIVATION_SCRIPT" << EOF
#!/bin/bash
# CODOR Activation Script for $(basename "$TARGET_PATH")
# Run this script to activate constitutional compliance in your development session

echo "🏛️  Activating CODOR Constitutional Framework"
echo "Project: $(basename "$TARGET_PATH")"
echo "Type: $PROJECT_TYPE"
echo "Constitution: v3.4"

# Set environment variables
export CODOR_ACTIVE="true"
export CODOR_PATH="$CODOR_DIR"
export CODOR_CONSTITUTION="$CONSTITUTION_PATH"
export CODOR_PROJECT_TYPE="$PROJECT_TYPE"

echo ""
echo "✓ CODOR activated for this session"
echo "✓ Constitutional compliance enabled"
echo "✓ Evidence generation active"
echo ""
echo "Next steps:"
echo "1. Run your normal development commands"
echo "2. CODOR will automatically validate constitutional compliance"
echo "3. Check .codor/evidence/ for compliance documentation"
echo ""
echo "Deactivate with: unset CODOR_ACTIVE CODOR_PATH CODOR_CONSTITUTION CODOR_PROJECT_TYPE"
EOF

chmod +x "$ACTIVATION_SCRIPT"

# Create README
README_PATH="$CODOR_DIR/README.md"
cat > "$README_PATH" << EOF
# CODOR Constitutional Framework

This project now includes CODOR constitutional compliance framework for AI-safe development.

## Quick Start

1. **Activate CODOR for this session:**
   \`\`\`bash
   source .codor/activate-codor.sh
   \`\`\`

2. **Verify installation:**
   \`\`\`bash
   find .codor -type f
   \`\`\`

3. **Start developing with constitutional compliance!**

## What CODOR Does

- **Constitutional Validation**: Ensures AI agents follow ethical guidelines
- **Evidence Generation**: Creates audit trails for all AI-assisted development  
- **Spec-to-Implementation**: Validates feature specifications for compliance
- **Anti-Circumnavigation**: Prevents AI agents from bypassing safety measures

## Directory Structure

\`\`\`
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
├── activate-codor.sh           # Session activation script
└── README.md                   # This file
\`\`\`

## Project Integration

CODOR is now configured for your **$PROJECT_TYPE** project and will:

- Monitor AI agent behavior for constitutional compliance
- Generate evidence documentation automatically
- Validate specifications before implementation
- Provide audit trails for all AI-assisted development

## Support

- Repository: https://github.com/forcegage-pvm/codor
- Issues: https://github.com/forcegage-pvm/codor/issues
- Constitution Version: 3.4

**Constitutional compliance is now active for this project.**
EOF

echo ""
echo "========================================="
echo "CODOR v4.0 INSTALLATION COMPLETE!"
echo "========================================="
echo ""
echo "Installed Components:"
echo "  * Constitutional framework (v4.0)"
echo "  * VS Code slash command prompts"
echo "  * GitHub Spec Kit constitutional overlay"
echo "  * Evidence collection system"
echo "  * Constitutional validator"
echo "  * Three-gate validation system"
echo "  * AI integration instructions"
echo ""
echo "CONSTITUTIONAL ACTIVATION REQUIRED"
echo "================================="
echo ""
echo "To activate constitutional compliance, run this command in VS Code:"
echo ""
echo "  /codor-onboarding"
echo ""
echo "This will:"
echo "  + Discover and load constitutional framework"
echo "  + Internalize constitutional mandates"
echo "  + Initialize evidence generation system"
echo "  + Establish audit trail for transparency"
echo ""
echo "Additional Commands Available:"
echo "  /codor-status     - Check constitutional compliance status"
echo "  /codor-validate   - Validate constitutional enforcement"
echo "  /codor-evidence   - Generate constitutional evidence"
echo ""
echo "Constitutional framework installed - ready for activation!"