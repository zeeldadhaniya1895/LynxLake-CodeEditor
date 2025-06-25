const fs = require('fs');
const path = require('path');

// Define required dependencies for each service
const requiredDependencies = {
  'api-service': [
    'express', 'cors', 'dotenv', 'pg', 'bcrypt', 'jsonwebtoken', 
    'nodemailer', 'googleapis', 'uuid', 'archiver', 'cookie-parser', 'nodemon'
  ],
  'socket-service': [
    'express', 'cors', 'dotenv', 'pg', 'socket.io', 'uuid', 'nodemon'
  ],
  'execution-service': [
    'express', 'cors', 'dotenv', 'nodemon'
  ],
  'nfrontend': [
    'react', 'react-dom', 'vite', '@vitejs/plugin-react'
  ]
};

// Check if a package is installed in a service
function checkPackageInstalled(servicePath, packageName) {
  const packageJsonPath = path.join(servicePath, 'package.json');
  const nodeModulesPath = path.join(servicePath, 'node_modules', packageName);
  
  if (!fs.existsSync(packageJsonPath)) {
    return { installed: false, reason: 'package.json not found' };
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (dependencies[packageName]) {
    return { installed: true, version: dependencies[packageName] };
  }
  
  if (fs.existsSync(nodeModulesPath)) {
    return { installed: true, reason: 'found in node_modules but not in package.json' };
  }
  
  return { installed: false, reason: 'not found in package.json or node_modules' };
}

// Check all dependencies for a service
function checkServiceDependencies(serviceName) {
  console.log(`\n🔍 Checking ${serviceName} dependencies...`);
  
  const servicePath = path.join(__dirname, '..', serviceName);
  const required = requiredDependencies[serviceName] || [];
  
  if (!fs.existsSync(servicePath)) {
    console.log(`❌ ${serviceName}: Directory not found`);
    return false;
  }
  
  let allGood = true;
  const missingPackages = [];
  
  required.forEach(packageName => {
    const result = checkPackageInstalled(servicePath, packageName);
    
    if (result.installed) {
      console.log(`✅ ${packageName}: ${result.version || 'Installed'}`);
    } else {
      console.log(`❌ ${packageName}: ${result.reason}`);
      missingPackages.push(packageName);
      allGood = false;
    }
  });
  
  if (missingPackages.length > 0) {
    console.log(`\n📦 Missing packages in ${serviceName}:`);
    missingPackages.forEach(pkg => console.log(`   - ${pkg}`));
  }
  
  return allGood;
}

// Check root dependencies
function checkRootDependencies() {
  console.log('\n🔍 Checking root dependencies...');
  
  const rootPath = path.join(__dirname, '..');
  const requiredRoot = ['concurrently'];
  
  let allGood = true;
  
  requiredRoot.forEach(packageName => {
    const result = checkPackageInstalled(rootPath, packageName);
    
    if (result.installed) {
      console.log(`✅ ${packageName}: ${result.version || 'Installed'}`);
    } else {
      console.log(`❌ ${packageName}: ${result.reason}`);
      allGood = false;
    }
  });
  
  return allGood;
}

// Main function
function checkAllDependencies() {
  console.log('🚀 LynxLake Dependency Checker');
  console.log('============================');
  
  const services = ['api-service', 'socket-service', 'execution-service', 'nfrontend'];
  let allServicesGood = true;
  
  // Check root dependencies
  const rootGood = checkRootDependencies();
  if (!rootGood) {
    allServicesGood = false;
  }
  
  // Check each service
  services.forEach(serviceName => {
    const serviceGood = checkServiceDependencies(serviceName);
    if (!serviceGood) {
      allServicesGood = false;
    }
  });
  
  // Summary
  console.log('\n📊 Summary:');
  console.log('==========');
  
  if (allServicesGood) {
    console.log('✅ All dependencies are properly installed!');
    console.log('🎉 You can now run: npm run dev');
  } else {
    console.log('❌ Some dependencies are missing.');
    console.log('💡 Run: npm run install:all');
  }
  
  return allServicesGood;
}

// Run the check
if (require.main === module) {
  checkAllDependencies();
}

module.exports = { checkAllDependencies, checkServiceDependencies }; 