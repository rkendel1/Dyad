#!/usr/bin/env node

const { execSync } = require('child_process');

// Configuration for local Supabase
const LOCAL_SUPABASE_CONFIG = {
  url: 'http://localhost:8000',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  dashboardUrl: 'http://localhost:3001'
};

function checkDockerInstalled() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    execSync('docker-compose --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isSupabaseRunning() {
  try {
    const result = execSync('docker-compose -f docker-compose.supabase.yml ps --services --filter "status=running"', 
      { encoding: 'utf8', stdio: 'pipe' }
    );
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

function startSupabase() {
  console.log('🚀 Starting local Supabase...');
  
  try {
    // Start the services
    execSync('docker-compose -f docker-compose.supabase.yml up -d', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('✅ Supabase started successfully!');
    console.log(`📊 Dashboard: ${LOCAL_SUPABASE_CONFIG.dashboardUrl}`);
    console.log(`🔗 API URL: ${LOCAL_SUPABASE_CONFIG.url}`);
    console.log(`🔑 Anon Key: ${LOCAL_SUPABASE_CONFIG.anonKey}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to start Supabase:', error.message);
    return false;
  }
}

function stopSupabase() {
  console.log('🛑 Stopping local Supabase...');
  
  try {
    execSync('docker-compose -f docker-compose.supabase.yml down', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('✅ Supabase stopped successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to stop Supabase:', error.message);
    return false;
  }
}

function getStatus() {
  if (!checkDockerInstalled()) {
    console.log('❌ Docker is not installed or not running');
    return false;
  }
  
  if (isSupabaseRunning()) {
    console.log('✅ Supabase is running');
    console.log(`📊 Dashboard: ${LOCAL_SUPABASE_CONFIG.dashboardUrl}`);
    console.log(`🔗 API URL: ${LOCAL_SUPABASE_CONFIG.url}`);
    return true;
  } else {
    console.log('⏹️ Supabase is not running');
    return false;
  }
}

function showHelp() {
  console.log(`
Local Supabase Setup Script

Usage: node setup-local-supabase.js [command]

Commands:
  start     Start the local Supabase environment
  stop      Stop the local Supabase environment
  status    Check if Supabase is running
  config    Show connection configuration
  help      Show this help message

Production Promotion:
  To promote your local development to production, use:
  npm run supabase:promote
  
  This will guide you through:
  - Creating or configuring production project
  - Migrating database schema
  - Updating environment files
  - Deploying functions to production

Examples:
  node scripts/setup-local-supabase.js start
  node scripts/setup-local-supabase.js status
  npm run supabase:promote
  `);
}

function showConfig() {
  console.log('Local Supabase Configuration:');
  console.log(`URL: ${LOCAL_SUPABASE_CONFIG.url}`);
  console.log(`Anon Key: ${LOCAL_SUPABASE_CONFIG.anonKey}`);
  console.log(`Service Role Key: ${LOCAL_SUPABASE_CONFIG.serviceRoleKey}`);
  console.log(`Dashboard: ${LOCAL_SUPABASE_CONFIG.dashboardUrl}`);
}

// Main execution
const command = process.argv[2] || 'help';

switch (command) {
  case 'start':
    if (!checkDockerInstalled()) {
      console.error('❌ Docker is required but not installed. Please install Docker first.');
      console.error('   Visit: https://docs.docker.com/get-docker/');
      process.exit(1);
    }
    startSupabase();
    break;
    
  case 'stop':
    stopSupabase();
    break;
    
  case 'status':
    getStatus();
    break;
    
  case 'config':
    showConfig();
    break;
    
  case 'help':
  default:
    showHelp();
    break;
}