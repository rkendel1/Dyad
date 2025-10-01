#!/usr/bin/env node

/**
 * Simple verification script to check NODE_OPTIONS configuration
 * This script can be run to verify the memory limit is set correctly
 */

console.log('NODE_OPTIONS Configuration Check');
console.log('=================================');
console.log();

const nodeOptions = process.env.NODE_OPTIONS;

if (!nodeOptions) {
  console.log('❌ NODE_OPTIONS is not set');
  console.log('   This should be set by main.ts at runtime');
  process.exit(0);
}

console.log('✅ NODE_OPTIONS is set:');
console.log('   ' + nodeOptions);
console.log();

if (nodeOptions.includes('--max-old-space-size')) {
  console.log('✅ Memory limit flag is present');
  
  const match = nodeOptions.match(/--max-old-space-size[=\s]+(\d+)/);
  if (match) {
    const memoryLimitMB = parseInt(match[1], 10);
    const memoryLimitGB = (memoryLimitMB / 1024).toFixed(2);
    console.log(`   Memory limit: ${memoryLimitMB}MB (${memoryLimitGB}GB)`);
    
    if (memoryLimitMB >= 4096) {
      console.log('✅ Memory limit is set to recommended 4GB or higher');
    } else {
      console.log('⚠️  Memory limit is below recommended 4GB');
    }
  }
} else {
  console.log('❌ Memory limit flag is not present in NODE_OPTIONS');
  console.log('   Expected: --max-old-space-size=4096');
}

console.log();
console.log('Note: This script only checks the environment variable.');
console.log('      The actual runtime configuration is set in src/main.ts');
