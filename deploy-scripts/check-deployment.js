const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const services = [
  { name: 'API Service', port: 5000, path: '/health', envFile: 'api-service/.env' },
  { name: 'Socket Service', port: 5001, path: '/health', envFile: 'socket-service/.env' },
  { name: 'Execution Service', port: 5002, path: '/health', envFile: 'execution-service/.env' }
];

// Helper function to make HTTP request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Check environment files
function checkEnvironmentFiles() {
  console.log('🔍 Checking environment files...\n');
  
  const files = [
    { path: 'nfrontend/.env', name: 'Frontend Environment' },
    { path: 'api-service/.env', name: 'API Service Environment' },
    { path: 'socket-service/.env', name: 'Socket Service Environment' },
    { path: 'execution-service/.env', name: 'Execution Service Environment' }
  ];
  
  let allGood = true;
  
  files.forEach(file => {
    const fullPath = path.join(__dirname, '..', file.path);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${file.name}: Found`);
      
      // Check for required variables based on service
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      const requiredVars = {
        'nfrontend/.env': ['VITE_API_SERVICE_URL', 'VITE_SOCKET_SERVICE_URL'],
        'api-service/.env': ['POSTGRES_URL', 'JWT_SECRET_KEY', 'API_PORT'],
        'socket-service/.env': ['POSTGRES_URL', 'SOCKET_PORT', 'FRONTEND_URL'],
        'execution-service/.env': ['EXECUTION_PORT', 'FRONTEND_URL']
      };
      
      const required = requiredVars[file.path] || [];
      required.forEach(varName => {
        if (content.includes(varName + '=')) {
          console.log(`   ✅ ${varName}: Set`);
        } else {
          console.log(`   ❌ ${varName}: Missing`);
          allGood = false;
        }
      });
    } else {
      console.log(`❌ ${file.name}: Not found`);
      allGood = false;
    }
  });
  
  return allGood;
}

// Check service health
async function checkServiceHealth() {
  console.log('\n🏥 Checking service health...\n');
  
  const results = [];
  
  for (const service of services) {
    try {
      const url = `http://localhost:${service.port}${service.path}`;
      console.log(`🔍 Checking ${service.name} (${url})...`);
      
      const response = await makeRequest(url);
      
      if (response.status === 200) {
        console.log(`✅ ${service.name}: Running (Status: ${response.status})`);
        if (response.data.status) {
          console.log(`   📊 Status: ${response.data.status}`);
        }
        results.push({ service: service.name, status: 'healthy', response });
      } else {
        console.log(`⚠️  ${service.name}: Unexpected status ${response.status}`);
        results.push({ service: service.name, status: 'unexpected', response });
      }
    } catch (error) {
      console.log(`❌ ${service.name}: Error - ${error.message}`);
      results.push({ service: service.name, status: 'error', error: error.message });
    }
  }
  
  return results;
}

// Check package.json files
function checkPackageFiles() {
  console.log('\n📦 Checking package.json files...\n');
  
  const packages = [
    'package.json',
    'api-service/package.json',
    'socket-service/package.json',
    'execution-service/package.json',
    'nfrontend/package.json'
  ];
  
  let allGood = true;
  
  packages.forEach(pkgPath => {
    const fullPath = path.join(__dirname, '..', pkgPath);
    if (fs.existsSync(fullPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        console.log(`✅ ${pkgPath}: Valid (${pkg.name || 'unnamed'})`);
      } catch (e) {
        console.log(`❌ ${pkgPath}: Invalid JSON`);
        allGood = false;
      }
    } else {
      console.log(`❌ ${pkgPath}: Not found`);
      allGood = false;
    }
  });
  
  return allGood;
}

// Check service-specific configurations and files
function checkServiceConfigurations() {
  console.log('\n⚙️  Checking service configurations and files...\n');
  
  const configs = [
    { path: 'api-service/config/index.js', name: 'API Service Config' },
    { path: 'socket-service/config/index.js', name: 'Socket Service Config' },
    { path: 'socket-service/config/socket.js', name: 'Socket Config' },
    { path: 'execution-service/config/index.js', name: 'Execution Service Config' },
    { path: 'nfrontend/vite.config.js', name: 'Vite Config' }
  ];
  
  let allGood = true;
  
  configs.forEach(config => {
    const fullPath = path.join(__dirname, '..', config.path);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${config.name}: Found`);
    } else {
      console.log(`❌ ${config.name}: Not found`);
      allGood = false;
    }
  });
  
  return allGood;
}

// Check API service specific files
function checkAPIServiceFiles() {
  console.log('\n🗄️  Checking API Service files...\n');
  
  const apiFiles = [
    { path: 'api-service/queries', name: 'Queries Directory', isDir: true },
    { path: 'api-service/queries/auth', name: 'Auth Queries', isDir: true },
    { path: 'api-service/queries/project.js', name: 'Project Queries' },
    { path: 'api-service/queries/user.js', name: 'User Queries' },
    { path: 'api-service/queries/auth/login.js', name: 'Login Query' },
    { path: 'api-service/queries/auth/register.js', name: 'Register Query' },
    { path: 'api-service/queries/auth/google.js', name: 'Google Auth Query' },
    { path: 'api-service/controllers', name: 'Controllers Directory', isDir: true },
    { path: 'api-service/routes', name: 'Routes Directory', isDir: true },
    { path: 'api-service/middlewares', name: 'Middlewares Directory', isDir: true },
    { path: 'api-service/utils', name: 'Utils Directory', isDir: true },
    { path: 'api-service/db.js', name: 'Database Connection' },
    { path: 'api-service/check-database.js', name: 'Database Check Script' },
    { path: 'api-service/vercel.json', name: 'Vercel Config' }
  ];
  
  let allGood = true;
  
  apiFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file.path);
    if (fs.existsSync(fullPath)) {
      if (file.isDir) {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          console.log(`✅ ${file.name}: Found (Directory)`);
        } else {
          console.log(`❌ ${file.name}: Not a directory`);
          allGood = false;
        }
      } else {
        console.log(`✅ ${file.name}: Found`);
      }
    } else {
      console.log(`❌ ${file.name}: Not found`);
      allGood = false;
    }
  });
  
  return allGood;
}

// Check Socket service specific files
function checkSocketServiceFiles() {
  console.log('\n🔌 Checking Socket Service files...\n');
  
  const socketFiles = [
    { path: 'socket-service/socket', name: 'Socket Directory', isDir: true },
    { path: 'socket-service/socket/socketHandlers.js', name: 'Socket Handlers' },
    { path: 'socket-service/db.js', name: 'Database Connection' }
  ];
  
  let allGood = true;
  
  socketFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file.path);
    if (fs.existsSync(fullPath)) {
      if (file.isDir) {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          console.log(`✅ ${file.name}: Found (Directory)`);
        } else {
          console.log(`❌ ${file.name}: Not a directory`);
          allGood = false;
        }
      } else {
        console.log(`✅ ${file.name}: Found`);
      }
    } else {
      console.log(`❌ ${file.name}: Not found`);
      allGood = false;
    }
  });
  
  return allGood;
}

// Main function
async function checkDeployment() {
  console.log('🚀 LynxLake Deployment Check\n');
  console.log('=' .repeat(50));
  
  // Check environment files
  const envOk = checkEnvironmentFiles();
  
  // Check package files
  const packagesOk = checkPackageFiles();
  
  // Check service configurations
  const configsOk = checkServiceConfigurations();
  
  // Check API service files
  const apiFilesOk = checkAPIServiceFiles();
  
  // Check Socket service files
  const socketFilesOk = checkSocketServiceFiles();
  
  // Check service health
  const healthResults = await checkServiceHealth();
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 DEPLOYMENT SUMMARY');
  console.log('=' .repeat(50));
  
  const healthyServices = healthResults.filter(r => r.status === 'healthy').length;
  const totalServices = services.length;
  
  console.log(`Environment Files: ${envOk ? '✅ OK' : '❌ Issues Found'}`);
  console.log(`Package Files: ${packagesOk ? '✅ OK' : '❌ Issues Found'}`);
  console.log(`Service Configs: ${configsOk ? '✅ OK' : '❌ Issues Found'}`);
  console.log(`API Service Files: ${apiFilesOk ? '✅ OK' : '❌ Issues Found'}`);
  console.log(`Socket Service Files: ${socketFilesOk ? '✅ OK' : '❌ Issues Found'}`);
  console.log(`Services Running: ${healthyServices}/${totalServices}`);
  
  if (healthyServices === totalServices && envOk && packagesOk && configsOk && apiFilesOk && socketFilesOk) {
    console.log('\n🎉 All checks passed! Your deployment is ready.');
  } else {
    console.log('\n⚠️  Some issues found. Please review the details above.');
    
    if (!envOk) {
      console.log('\n💡 To fix environment issues:');
      console.log('   npm run setup:dev    # For development');
      console.log('   npm run setup:prod   # For production');
    }
    
    if (!configsOk || !apiFilesOk || !socketFilesOk) {
      console.log('\n💡 To fix configuration issues:');
      console.log('   Check if all service directories exist');
      console.log('   Verify all files are properly copied');
      console.log('   Run: cp -r backend/queries api-service/');
    }
    
    if (healthyServices < totalServices) {
      console.log('\n💡 To start services:');
      console.log('   npm run dev          # Start all services');
      console.log('   npm run start:api    # Start API service only');
    }
  }
}

// Run the check
checkDeployment().catch(console.error); 