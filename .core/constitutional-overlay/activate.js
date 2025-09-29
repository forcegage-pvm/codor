#!/usr/bin/env node

/**
 * Constitutional Activation System
 * Sets up constitutional overlay for vanilla GitHub Spec Kit
 * 
 * This script configures a project to use constitutional enhancements
 * without modifying the original Spec Kit installation.
 * 
 * Usage: node activate.js [--force] [--dry-run]
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class ConstitutionalActivator {
  constructor(options = {}) {
    this.force = options.force || false;
    this.dryRun = options.dryRun || false;
    this.projectRoot = process.cwd();
    this.specifyDir = path.join(this.projectRoot, '.specify');
    this.constitutionalDir = path.join(this.specifyDir, 'constitutional');
  }

  async activate() {
    console.log('🏛️  Constitutional Compliance System Activator v3.4');
    console.log(`📁 Project: ${this.projectRoot}`);
    
    if (this.dryRun) {
      console.log('🧪 DRY RUN MODE - No files will be modified');
    }

    try {
      // 1. Validate environment
      await this.validateEnvironment();
      
      // 2. Check existing installation
      await this.checkExistingInstallation();
      
      // 3. Install constitutional overlay
      await this.installConstitutionalOverlay();
      
      // 4. Generate configuration
      await this.generateConfiguration();
      
      // 5. Set up command wrappers
      await this.setupCommandWrappers();
      
      // 6. Install validation tools
      await this.installValidationTools();
      
      console.log('');
      console.log('✅ Constitutional Compliance System activated successfully!');
      console.log('');
      console.log('📋 Next steps:');
      console.log('   1. Run /tasks to generate constitutionally compliant tasks');
      console.log('   2. Each task will include evidence and validation requirements');
      console.log('   3. Use validation tools before marking tasks complete');
      console.log('');
      console.log('🔧 Available commands:');
      console.log('   node .specify/constitutional/interceptors/command-interceptor.js tasks');
      console.log('   node .specify/tools/constitutional-audit.js');
      
    } catch (error) {
      console.error('❌ Activation failed:', error.message);
      if (error.code === 'VALIDATION_FAILED') {
        console.log('💡 Try running with --force to skip validation checks');
      }
      process.exit(1);
    }
  }

  async validateEnvironment() {
    console.log('1️⃣  Validating environment...');
    
    // Check if we're in a Spec Kit project
    const specifyExists = await this.fileExists('.specify');
    if (!specifyExists && !this.force) {
      const error = new Error('Not a GitHub Spec Kit project (.specify directory not found)');
      error.code = 'VALIDATION_FAILED';
      throw error;
    }

    // Check for constitution file
    const constitutionExists = await this.fileExists('.specify/memory/constitution.md');
    if (!constitutionExists && !this.force) {
      const error = new Error('Constitution not found (.specify/memory/constitution.md)');
      error.code = 'VALIDATION_FAILED'; 
      throw error;
    }

    console.log('   ✅ Environment validation passed');
  }

  async checkExistingInstallation() {
    console.log('2️⃣  Checking for existing constitutional installation...');
    
    const constitutionalExists = await this.fileExists('.specify/constitutional');
    if (constitutionalExists && !this.force) {
      const error = new Error('Constitutional system already installed (use --force to reinstall)');
      error.code = 'ALREADY_INSTALLED';
      throw error;
    }

    if (constitutionalExists) {
      console.log('   ⚠️  Existing installation found, will reinstall...');
    } else {
      console.log('   ✅ No existing installation found');
    }
  }

  async installConstitutionalOverlay() {
    console.log('3️⃣  Installing constitutional overlay...');
    
    if (!this.dryRun) {
      // Create directory structure
      await this.ensureDirectory('.specify/constitutional');
      await this.ensureDirectory('.specify/constitutional/interceptors');
      await this.ensureDirectory('.specify/constitutional/config');
      await this.ensureDirectory('.specify/constitutional/templates');
      await this.ensureDirectory('.specify/tools');

      // Copy interceptor files
      const interceptorSource = path.join(__dirname, 'interceptors');
      const interceptorDest = path.join(this.specifyDir, 'constitutional', 'interceptors');
      await this.copyDirectory(interceptorSource, interceptorDest);
    }

    console.log('   ✅ Constitutional overlay installed');
  }

  async generateConfiguration() {
    console.log('4️⃣  Generating configuration from constitution...');
    
    if (!this.dryRun) {
      // Use the command interceptor to generate config
      const interceptorPath = path.join(this.constitutionalDir, 'interceptors', 'command-interceptor.js');
      const ConstitutionalInterceptor = require(interceptorPath);
      const interceptor = new ConstitutionalInterceptor();
      
      // This will trigger config generation from constitution.md
      await interceptor.loadConfig();
    }
    
    console.log('   ✅ Configuration generated from constitution.md');
  }

  async setupCommandWrappers() {
    console.log('5️⃣  Setting up command wrappers...');
    
    const commands = ['tasks', 'plan', 'implement', 'specify'];
    
    for (const command of commands) {
      if (!this.dryRun) {
        const wrapperPath = path.join(this.specifyDir, 'commands', `${command}-constitutional.js`);
        const wrapperContent = this.generateCommandWrapper(command);
        
        await this.ensureDirectory(path.dirname(wrapperPath));
        await fs.writeFile(wrapperPath, wrapperContent);
      }
      
      console.log(`   ✅ Wrapper created for /${command}`);
    }
  }

  async installValidationTools() {
    console.log('6️⃣  Installing validation tools...');
    
    // Copy validation tools from CODOR framework
    const toolsSource = path.join(__dirname, '..', '..', 'legacy', 'memories', '3.0', 'tools');
    const toolsDest = path.join(this.specifyDir, 'tools');
    
    if (!this.dryRun && await this.directoryExists(toolsSource)) {
      await this.copyDirectory(toolsSource, toolsDest);
      console.log('   ✅ Validation tools installed from CODOR framework');
    } else {
      console.log('   ⚠️  CODOR validation tools not found, creating placeholders...');
      if (!this.dryRun) {
        await this.createValidationToolPlaceholders();
      }
    }
  }

  generateCommandWrapper(command) {
    return `#!/usr/bin/env node

/**
 * Constitutional wrapper for /${command} command
 * Automatically generated by Constitutional Activation System
 */

const path = require('path');
const ConstitutionalInterceptor = require('../constitutional/interceptors/command-interceptor.js');

async function main() {
  const interceptor = new ConstitutionalInterceptor();
  const args = process.argv.slice(2);
  
  try {
    await interceptor.interceptCommand('${command}', args);
  } catch (error) {
    console.error(\`❌ Constitutional enhancement failed: \${error.message}\`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
`;
  }

  async createValidationToolPlaceholders() {
    const tools = [
      'constitutional-checker.js',
      'pre-task-check.js', 
      'post-task-validation.js',
      'constitutional-audit.js'
    ];

    for (const tool of tools) {
      const toolPath = path.join(this.specifyDir, 'tools', tool);
      const placeholder = `#!/usr/bin/env node
/**
 * ${tool} - Constitutional validation tool
 * Placeholder - replace with actual implementation
 */

console.log('🏛️  ${tool} placeholder');
console.log('⚠️  Replace with actual CODOR validation tool');
process.exit(0);
`;
      
      await fs.writeFile(toolPath, placeholder);
    }
  }

  async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  async copyDirectory(source, dest) {
    await this.ensureDirectory(dest);
    
    try {
      const entries = await fs.readdir(source, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(source, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          await this.copyDirectory(srcPath, destPath);
        } else {
          const content = await fs.readFile(srcPath);
          await fs.writeFile(destPath, content);
        }
      }
    } catch (error) {
      // Source directory might not exist
      console.log(`   ⚠️  Source directory ${source} not found`);
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async directoryExists(dirPath) {
    try {
      const stat = await fs.stat(dirPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    force: args.includes('--force'),
    dryRun: args.includes('--dry-run')
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Constitutional Activation System v3.4');
    console.log('');
    console.log('Usage: node activate.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --force    Skip validation checks and overwrite existing installation');
    console.log('  --dry-run  Show what would be done without making changes');
    console.log('  --help     Show this help message');
    console.log('');
    console.log('This tool sets up constitutional compliance for GitHub Spec Kit projects.');
    process.exit(0);
  }

  const activator = new ConstitutionalActivator(options);
  activator.activate();
}

module.exports = ConstitutionalActivator;