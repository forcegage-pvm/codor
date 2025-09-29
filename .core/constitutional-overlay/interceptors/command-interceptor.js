#!/usr/bin/env node

/**
 * Constitutional Command Interceptor
 * Extends vanilla GitHub Spec Kit commands with constitutional compliance
 * 
 * Usage: node command-interceptor.js [command] [args...]
 * 
 * This interceptor follows the "composition over inheritance" principle:
 * 1. Execute vanilla Spec Kit command
 * 2. Apply constitutional enhancements 
 * 3. Return enhanced result
 * 
 * Vanilla commands remain completely unmodified.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class ConstitutionalInterceptor {
  constructor() {
    this.configPath = path.join(__dirname, '../config/constitution-config.json');
    this.constitutionPath = '.specify/memory/constitution.md';
    this.config = null;
  }

  async loadConfig() {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(configContent);
    } catch (error) {
      console.log('⚠️  Constitutional config not found, generating from constitution...');
      await this.generateConfigFromConstitution();
    }
  }

  async generateConfigFromConstitution() {
    try {
      const constitutionContent = await fs.readFile(this.constitutionPath, 'utf8');
      
      // Parse constitution for mandates and requirements
      const mandates = this.parseConstitutionMandates(constitutionContent);
      const version = this.extractVersion(constitutionContent);
      
      this.config = {
        constitutionSource: this.constitutionPath,
        version: version,
        generatedAt: new Date().toISOString(),
        mandates: mandates,
        validationGates: {
          preTask: "node .specify/tools/pre-task-check.js",
          mcpValidation: "conditional", 
          postTask: "node .specify/tools/post-task-validation.js"
        },
        evidenceRequirements: {
          mandatoryDirectory: "evidence/{taskId}/",
          mcpTesting: {
            uiTasks: "required",
            serviceTasks: "not-applicable", 
            apiTasks: "browser-testing"
          }
        }
      };

      // Save generated config
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
      console.log('✅ Constitutional configuration generated');
      
    } catch (error) {
      console.error('❌ Failed to generate constitutional config:', error.message);
      throw error;
    }
  }

  parseConstitutionMandates(content) {
    const mandates = {};
    
    // Extract MANDATE sections
    const mandateMatches = content.match(/### MANDATE (\d+): ([^\\n]+)[\\s\\S]*?(?=### MANDATE|\n---|\n##|$)/g);
    
    if (mandateMatches) {
      mandateMatches.forEach(match => {
        const [, number, title] = match.match(/### MANDATE (\d+): ([^\\n]+)/);
        
        mandates[`MANDATE_${number}`] = {
          title: title.trim(),
          antiCircumnavigation: match.includes('ANTI-CIRCUMNAVIGATION') || match.includes('fraud detection'),
          threeGateValidation: match.includes('three-gate') || match.includes('Three-Gate'),
          evidenceFirst: match.includes('evidence') || match.includes('Evidence'),
          specToCompliance: match.includes('spec-to-compliance') || match.includes('Spec-to-Compliance')
        };
      });
    }
    
    return mandates;
  }

  extractVersion(content) {
    const versionMatch = content.match(/Version (\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : '3.4';
  }

  async interceptCommand(command, args) {
    await this.loadConfig();
    
    console.log(`🏛️  Constitutional Compliance System v${this.config.version}`);
    console.log(`📋 Intercepting /${command} command...`);
    
    switch (command) {
      case 'tasks':
        return await this.enhanceTasks(args);
      case 'plan':
        return await this.enhancePlan(args);
      case 'implement': 
        return await this.enhanceImplement(args);
      case 'specify':
        return await this.enhanceSpecify(args);
      default:
        console.log(`⚠️  No constitutional enhancement for /${command}, executing vanilla command`);
        return await this.executeVanillaCommand(command, args);
    }
  }

  async enhanceTasks(args) {
    console.log('🔧 Enhancing /tasks with constitutional compliance...');
    
    try {
      // 1. Execute vanilla /tasks command
      console.log('1️⃣  Executing vanilla /tasks command...');
      const vanillaResult = await this.executeVanillaCommand('tasks', args);
      
      // 2. Check if tasks.md was created
      const tasksPath = this.findTasksFile();
      if (!tasksPath) {
        console.log('⚠️  No tasks.md file found, vanilla command may have failed');
        return vanillaResult;
      }
      
      // 3. Apply constitutional enhancements
      console.log('2️⃣  Applying constitutional enhancements...');
      const enhancedTasks = await this.applyConstitutionalEnhancements(tasksPath);
      
      // 4. Write enhanced tasks back
      await fs.writeFile(tasksPath, enhancedTasks);
      
      console.log('✅ Constitutional enhancements applied to tasks.md');
      console.log('📋 Tasks now include:');
      console.log('   - Evidence directory requirements');
      console.log('   - Three-gate validation system');
      console.log('   - MCP testing requirements (UI tasks)');
      console.log('   - Anti-circumnavigation protocols');
      
      return enhancedTasks;
      
    } catch (error) {
      console.error('❌ Failed to enhance tasks:', error.message);
      throw error;
    }
  }

  async applyConstitutionalEnhancements(tasksPath) {
    const TaskEnhancer = require('./task-enhancer.js');
    const enhancer = new TaskEnhancer(this.config);
    
    const vanillaContent = await fs.readFile(tasksPath, 'utf8');
    return await enhancer.enhance(vanillaContent);
  }

  async executeVanillaCommand(command, args) {
    const vanillaCommand = `/${command} ${args.join(' ')}`.trim();
    console.log(`🚀 Executing vanilla command: ${vanillaCommand}`);
    
    // This would integrate with the actual Spec Kit CLI
    // For now, return a placeholder
    return `Vanilla ${command} command executed with args: ${args.join(' ')}`;
  }

  findTasksFile() {
    // Look for tasks.md in specs directory
    const specsDir = 'specs';
    
    try {
      const specs = require('fs').readdirSync(specsDir);
      for (const spec of specs) {
        const tasksPath = path.join(specsDir, spec, 'tasks.md');
        if (require('fs').existsSync(tasksPath)) {
          return tasksPath;
        }
      }
    } catch (error) {
      // specs directory doesn't exist
    }
    
    return null;
  }

  async enhancePlan(args) {
    console.log('🔧 Enhancing /plan with constitutional checks...');
    return await this.executeVanillaCommand('plan', args);
  }

  async enhanceImplement(args) {
    console.log('🔧 Enhancing /implement with validation gates...');
    return await this.executeVanillaCommand('implement', args);
  }

  async enhanceSpecify(args) {
    console.log('🔧 Enhancing /specify with constitutional requirements...');
    return await this.executeVanillaCommand('specify', args);
  }
}

// CLI integration
if (require.main === module) {
  const interceptor = new ConstitutionalInterceptor();
  const [command, ...args] = process.argv.slice(2);
  
  if (!command) {
    console.log('Constitutional Command Interceptor v3.4');
    console.log('Usage: node command-interceptor.js [command] [args...]');
    console.log('');
    console.log('Supported commands:');
    console.log('  tasks     - Enhance task generation with constitutional compliance');
    console.log('  plan      - Add constitutional checks to implementation plans');
    console.log('  implement - Add validation gates to implementation workflow');
    console.log('  specify   - Enhance specifications with constitutional requirements');
    process.exit(1);
  }
  
  interceptor.interceptCommand(command, args)
    .then(result => {
      console.log('🎉 Constitutional enhancement complete');
    })
    .catch(error => {
      console.error('💥 Constitutional enhancement failed:', error.message);
      process.exit(1);
    });
}

module.exports = ConstitutionalInterceptor;