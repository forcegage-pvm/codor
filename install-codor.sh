#!/bin/bash
# CODOR Constitutional Framework - Quick Install Script (Unix/Linux/macOS)
# Usage: ./install-codor.sh [target-directory]

TARGET_DIR=${1:-.}
CODOR_REPO="https://raw.githubusercontent.com/forcegage-pvm/codor/master"

echo "🏛️  CODOR Constitutional Framework Installer"
echo "======================================="

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
- Semantic manipulation or creative interpretation
- Technical exploits or indirect methods  
- Social engineering or user confusion
- Claiming emergency exceptions or special circumstances

## MANDATE 2: EVIDENCE DOCUMENTATION
All implementations MUST generate verifiable evidence including:
- Compliance validation reports
- Security assessment documentation  
- Performance metrics and testing results
- Constitutional adherence certificates

## MANDATE 3: TRANSPARENT OPERATIONS
AI agents MUST maintain clear audit trails showing:
- Decision-making processes and rationale
- Code generation and modification history
- Validation steps and compliance checks
- Error handling and recovery procedures

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
echo "🎉 CODOR Installation Complete!"
echo "======================================="
echo "Installation Directory: $CODOR_DIR"
echo "Project Type: $PROJECT_TYPE"
echo "Constitution Version: 3.4"
echo ""
echo "Next Steps:"
echo "1. cd '$TARGET_PATH'"
echo "2. source .codor/activate-codor.sh"
echo "3. Start your development workflow!"
echo ""
echo "CODOR is ready to ensure constitutional compliance! 🏛️"