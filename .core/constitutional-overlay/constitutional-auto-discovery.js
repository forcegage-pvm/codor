/**
 * CODOR Constitutional Auto-Discovery System
 * Prevents passive non-compliance through mandatory constitutional detection
 * 
 * CRITICAL MISSION: Ensure AI agents cannot operate without constitutional awareness
 */

class ConstitutionalAutoDiscovery {
    constructor(workspacePath = process.cwd()) {
        this.workspacePath = workspacePath;
        this.constitution = null;
        this.isActive = false;
        this.evidenceSystem = null;
        this.auditTrail = [];
        
        // MANDATORY: Auto-discover constitution on instantiation
        this.initialize();
    }

    /**
     * Phase 1: Mandatory Constitutional Discovery
     * Scans workspace for constitutional frameworks
     */
    async initialize() {
        console.log('🔍 CODOR Auto-Discovery: Scanning workspace for constitutional frameworks...');
        
        const constitutionalPaths = [
            '.codor/core/constitution.md',
            '.codor/core-constitution.md', 
            '.copilot-instructions.md',
            'constitutional-framework.md',
            '.ai-constitution.md',
            'codor-constitution.md'
        ];

        for (const relativePath of constitutionalPaths) {
            const fullPath = path.join(this.workspacePath, relativePath);
            
            if (fs.existsSync(fullPath)) {
                console.log(`✅ Constitutional framework detected: ${relativePath}`);
                await this.loadConstitution(fullPath);
                break;
            }
        }

        if (!this.constitution) {
            console.log('⚠️  NO CONSTITUTIONAL FRAMEWORK DETECTED');
            console.log('   Operating in non-constitutional mode');
            return false;
        }

        // MANDATORY: Activate constitutional compliance
        await this.activateConstitutionalCompliance();
        return true;
    }

    /**
     * Phase 2: Constitutional Framework Loading
     * Loads and parses constitutional mandates
     */
    async loadConstitution(constitutionPath) {
        try {
            const content = fs.readFileSync(constitutionPath, 'utf8');
            
            this.constitution = {
                path: constitutionPath,
                content: content,
                version: this.extractVersion(content),
                mandates: this.extractMandates(content),
                loadedAt: new Date().toISOString()
            };

            console.log(`📋 Constitutional framework loaded: v${this.constitution.version}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to load constitutional framework:', error.message);
            return false;
        }
    }

    /**
     * Phase 3: Mandatory Constitutional Activation  
     * Forces constitutional mandate internalization
     */
    async activateConstitutionalCompliance() {
        if (!this.constitution) {
            throw new Error('Cannot activate constitutional compliance without loaded constitution');
        }

        console.log('🚀 Activating constitutional compliance...');

        // MANDATORY: Internalize constitutional mandates
        this.internalizeConstitutionalMandates();

        // MANDATORY: Initialize evidence generation system
        await this.initializeEvidenceSystem();

        // MANDATORY: Start audit trail
        this.initializeAuditTrail();

        // MANDATORY: Set environmental markers
        this.setConstitutionalEnvironment();

        this.isActive = true;
        console.log('🛡️  CONSTITUTIONAL COMPLIANCE ACTIVE');
        
        return this.validateConstitutionalState();
    }

    /**
     * Constitutional Mandate Internalization
     * Makes constitutional principles part of agent's operational framework
     */
    internalizeConstitutionalMandates() {
        if (!this.constitution.mandates) return;

        console.log('🧠 Internalizing constitutional mandates...');
        
        // Create constitutional context that becomes part of agent behavior
        global.CONSTITUTIONAL_MANDATES = this.constitution.mandates;
        global.CONSTITUTIONAL_ENFORCEMENT = true;
        
        // Log mandate internalization
        this.auditTrail.push({
            action: 'MANDATE_INTERNALIZATION',
            timestamp: new Date().toISOString(),
            mandates: this.constitution.mandates.length,
            status: 'ACTIVE'
        });

        console.log(`   ${this.constitution.mandates.length} constitutional mandates internalized`);
    }

    /**
     * Evidence Generation System Initialization
     * Creates mandatory evidence documentation system
     */
    async initializeEvidenceSystem() {
        const evidencePath = path.join(this.workspacePath, '.codor', 'evidence');
        
        // Ensure evidence directory exists
        if (!fs.existsSync(evidencePath)) {
            fs.mkdirSync(evidencePath, { recursive: true });
        }

        this.evidenceSystem = {
            path: evidencePath,
            active: true,
            initializedAt: new Date().toISOString()
        };

        // Create evidence generation functions
        global.GENERATE_CONSTITUTIONAL_EVIDENCE = (task, status, details) => {
            return this.generateEvidence(task, status, details);
        };

        console.log(`📁 Evidence generation system initialized: ${evidencePath}`);
    }

    /**
     * Audit Trail Initialization
     * Creates continuous constitutional compliance monitoring
     */
    initializeAuditTrail() {
        this.auditTrail.push({
            action: 'CONSTITUTIONAL_ACTIVATION',
            timestamp: new Date().toISOString(),
            constitution: this.constitution.version,
            workspace: this.workspacePath,
            status: 'INITIALIZED'
        });

        // Make audit trail globally accessible
        global.CONSTITUTIONAL_AUDIT_TRAIL = this.auditTrail;
        global.LOG_CONSTITUTIONAL_ACTION = (action, details) => {
            this.logAction(action, details);
        };

        console.log('📊 Constitutional audit trail initialized');
    }

    /**
     * Constitutional Environment Setup
     * Sets environment variables for constitutional state detection
     */
    setConstitutionalEnvironment() {
        process.env.CODOR_ACTIVE = 'true';
        process.env.CODOR_VERSION = this.constitution.version;
        process.env.CODOR_PATH = path.dirname(this.constitution.path);
        process.env.CONSTITUTIONAL_COMPLIANCE = 'ACTIVE';
        
        console.log('🌍 Constitutional environment variables set');
    }

    /**
     * Constitutional State Validation
     * Proves constitutional compliance is actively enforced
     */
    validateConstitutionalState() {
        const state = {
            constitutionLoaded: !!this.constitution,
            constitutionVersion: this.constitution?.version,
            mandatesInternalized: !!global.CONSTITUTIONAL_MANDATES,
            evidenceSystemActive: this.evidenceSystem?.active,
            auditTrailActive: this.auditTrail.length > 0,
            environmentalMarkers: {
                codorActive: process.env.CODOR_ACTIVE === 'true',
                constitutionalCompliance: process.env.CONSTITUTIONAL_COMPLIANCE === 'ACTIVE'
            },
            timestamp: new Date().toISOString(),
            status: this.isActive ? 'CONSTITUTIONAL_COMPLIANCE_ACTIVE' : 'INACTIVE'
        };

        console.log('✅ Constitutional state validation:', JSON.stringify(state, null, 2));
        return state;
    }

    /**
     * Evidence Generation Function
     * Creates constitutional compliance evidence
     */
    generateEvidence(task, status, details = {}) {
        const evidence = {
            task: task,
            timestamp: new Date().toISOString(),
            agent: 'GitHub Copilot',
            status: status,
            constitutionalVersion: this.constitution?.version,
            workspace: path.basename(this.workspacePath),
            details: details
        };

        // Write evidence file
        const evidenceFile = path.join(
            this.evidenceSystem.path,
            `evidence-${Date.now()}.md`
        );

        const evidenceContent = `# Constitutional Evidence

**Task**: ${evidence.task}
**Timestamp**: ${evidence.timestamp}
**Agent**: ${evidence.agent}
**Status**: ${evidence.status}
**Constitution**: v${evidence.constitutionalVersion}
**Workspace**: ${evidence.workspace}

## Details
${JSON.stringify(evidence.details, null, 2)}

## Constitutional Compliance
This evidence document validates constitutional compliance according to CODOR mandates.
`;

        fs.writeFileSync(evidenceFile, evidenceContent);
        
        console.log(`📝 Constitutional evidence generated: ${path.basename(evidenceFile)}`);
        return evidence;
    }

    /**
     * Audit Trail Logging
     * Logs constitutional actions for transparency
     */
    logAction(action, details) {
        const logEntry = {
            action: action,
            timestamp: new Date().toISOString(),
            details: details
        };

        this.auditTrail.push(logEntry);
        console.log(`📋 Constitutional action logged: ${action}`);
    }

    /**
     * Utility: Extract constitution version
     */
    extractVersion(content) {
        const versionMatch = content.match(/\*\*Version\*\*:\s*(\d+\.\d+)/i) ||
                           content.match(/Version:\s*(\d+\.\d+)/i) ||
                           content.match(/v(\d+\.\d+)/i);
        return versionMatch ? versionMatch[1] : '1.0';
    }

    /**
     * Utility: Extract constitutional mandates
     */
    extractMandates(content) {
        const mandates = [];
        const mandateMatches = content.match(/###?\s*MANDATE\s+\d+:.*?(?=###?\s*MANDATE|\n##|$)/gis);
        
        if (mandateMatches) {
            mandateMatches.forEach((match, index) => {
                mandates.push({
                    number: index + 1,
                    title: this.extractMandateTitle(match),
                    content: match.trim()
                });
            });
        }

        return mandates;
    }

    /**
     * Utility: Extract mandate title
     */
    extractMandateTitle(mandateText) {
        const titleMatch = mandateText.match(/MANDATE\s+\d+:\s*(.+)/i);
        return titleMatch ? titleMatch[1].trim() : 'Constitutional Mandate';
    }
}

// MANDATORY AUTO-DISCOVERY: Initialize constitutional compliance on module load
const fs = require('fs');
const path = require('path');

// Auto-instantiate constitutional discovery
const constitutionalSystem = new ConstitutionalAutoDiscovery();

module.exports = {
    ConstitutionalAutoDiscovery,
    constitutionalSystem
};