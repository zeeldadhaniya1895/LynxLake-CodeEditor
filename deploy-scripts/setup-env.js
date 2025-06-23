const fs = require('fs');
const path = require('path');

// Environment templates
const environments = {
  development: {
    name: 'Development',
    frontend: {
      VITE_API_SERVICE_URL: 'http://localhost:5000',
      VITE_SOCKET_SERVICE_URL: 'http://localhost:5001',
      VITE_EXECUTION_SERVICE_URL: 'http://localhost:5002',
      VITE_GOOGLE_CLIENT_ID: 'your_google_client_id_here',
      NODE_ENV: 'development'
    },
    apiService: {
      API_PORT: '5000',
      NODE_ENV: 'development',
      POSTGRES_URL: 'postgresql://username:password@localhost:5432/coedit_db',
      JWT_SECRET_KEY: 'your_jwt_secret_key_here',
      JWT_TIMEOUT: '24h',
      SALT_ROUNDS: '10',
      USER_EMAIL: 'your_email@gmail.com',
      USER_PASS: 'your_email_password',
      GOOGLE_CLIENT_ID: 'your_google_client_id',
      GOOGLE_CLIENT_SECRET: 'your_google_client_secret',
      ABSTRACT_API_KEY: 'your_abstract_api_key',
      FRONTEND_URL: 'http://localhost:5173',
      SOCKET_SERVICE_URL: 'http://localhost:5001',
      EXECUTION_SERVICE_URL: 'http://localhost:5002'
    },
    socketService: {
      SOCKET_PORT: '5001',
      NODE_ENV: 'development',
      POSTGRES_URL: 'postgresql://username:password@localhost:5432/coedit_db',
      FRONTEND_URL: 'http://localhost:5173',
      API_SERVICE_URL: 'http://localhost:5000',
      EXECUTION_SERVICE_URL: 'http://localhost:5002',
      SOCKET_CORS_ORIGIN: 'http://localhost:5173',
      SOCKET_TRANSPORTS: 'websocket,polling'
    },
    executionService: {
      EXECUTION_PORT: '5002',
      NODE_ENV: 'development',
      FRONTEND_URL: 'http://localhost:5173',
      API_SERVICE_URL: 'http://localhost:5000',
      SOCKET_SERVICE_URL: 'http://localhost:5001',
      EXECUTION_TIMEOUT: '30000',
      MAX_CODE_SIZE: '1000000',
      ALLOWED_LANGUAGES: 'javascript,python,java,c,cpp,go,rust',
      SANDBOX_ENABLED: 'true',
      SANDBOX_TIMEOUT: '10000',
      MAX_EXECUTION_TIME: '5000'
    }
  },
  staging: {
    name: 'Staging',
    frontend: {
      VITE_API_SERVICE_URL: 'https://api-staging.coedit.com',
      VITE_SOCKET_SERVICE_URL: 'https://socket-staging.coedit.com',
      VITE_EXECUTION_SERVICE_URL: 'https://execution-staging.coedit.com',
      VITE_GOOGLE_CLIENT_ID: 'your_google_client_id_here',
      NODE_ENV: 'staging'
    },
    apiService: {
      API_PORT: '5000',
      NODE_ENV: 'staging',
      POSTGRES_URL: 'postgresql://username:password@staging-db:5432/coedit_db',
      JWT_SECRET_KEY: 'your_jwt_secret_key_here',
      JWT_TIMEOUT: '24h',
      SALT_ROUNDS: '10',
      USER_EMAIL: 'your_email@gmail.com',
      USER_PASS: 'your_email_password',
      GOOGLE_CLIENT_ID: 'your_google_client_id',
      GOOGLE_CLIENT_SECRET: 'your_google_client_secret',
      ABSTRACT_API_KEY: 'your_abstract_api_key',
      FRONTEND_URL: 'https://staging.coedit.com',
      SOCKET_SERVICE_URL: 'https://socket-staging.coedit.com',
      EXECUTION_SERVICE_URL: 'https://execution-staging.coedit.com'
    },
    socketService: {
      SOCKET_PORT: '5001',
      NODE_ENV: 'staging',
      POSTGRES_URL: 'postgresql://username:password@staging-db:5432/coedit_db',
      FRONTEND_URL: 'https://staging.coedit.com',
      API_SERVICE_URL: 'https://api-staging.coedit.com',
      EXECUTION_SERVICE_URL: 'https://execution-staging.coedit.com',
      SOCKET_CORS_ORIGIN: 'https://staging.coedit.com',
      SOCKET_TRANSPORTS: 'websocket,polling'
    },
    executionService: {
      EXECUTION_PORT: '5002',
      NODE_ENV: 'staging',
      FRONTEND_URL: 'https://staging.coedit.com',
      API_SERVICE_URL: 'https://api-staging.coedit.com',
      SOCKET_SERVICE_URL: 'https://socket-staging.coedit.com',
      EXECUTION_TIMEOUT: '30000',
      MAX_CODE_SIZE: '1000000',
      ALLOWED_LANGUAGES: 'javascript,python,java,c,cpp,go,rust',
      SANDBOX_ENABLED: 'true',
      SANDBOX_TIMEOUT: '10000',
      MAX_EXECUTION_TIME: '5000'
    }
  },
  production: {
    name: 'Production',
    frontend: {
      VITE_API_SERVICE_URL: 'https://api.coedit.com',
      VITE_SOCKET_SERVICE_URL: 'https://socket.coedit.com',
      VITE_EXECUTION_SERVICE_URL: 'https://execution.coedit.com',
      VITE_GOOGLE_CLIENT_ID: 'your_google_client_id_here',
      NODE_ENV: 'production'
    },
    apiService: {
      API_PORT: '5000',
      NODE_ENV: 'production',
      POSTGRES_URL: 'postgresql://username:password@prod-db:5432/coedit_db',
      JWT_SECRET_KEY: 'your_jwt_secret_key_here',
      JWT_TIMEOUT: '24h',
      SALT_ROUNDS: '10',
      USER_EMAIL: 'your_email@gmail.com',
      USER_PASS: 'your_email_password',
      GOOGLE_CLIENT_ID: 'your_google_client_id',
      GOOGLE_CLIENT_SECRET: 'your_google_client_secret',
      ABSTRACT_API_KEY: 'your_abstract_api_key',
      FRONTEND_URL: 'https://coedit.com',
      SOCKET_SERVICE_URL: 'https://socket.coedit.com',
      EXECUTION_SERVICE_URL: 'https://execution.coedit.com'
    },
    socketService: {
      SOCKET_PORT: '5001',
      NODE_ENV: 'production',
      POSTGRES_URL: 'postgresql://username:password@prod-db:5432/coedit_db',
      FRONTEND_URL: 'https://coedit.com',
      API_SERVICE_URL: 'https://api.coedit.com',
      EXECUTION_SERVICE_URL: 'https://execution.coedit.com',
      SOCKET_CORS_ORIGIN: 'https://coedit.com',
      SOCKET_TRANSPORTS: 'websocket,polling'
    },
    executionService: {
      EXECUTION_PORT: '5002',
      NODE_ENV: 'production',
      FRONTEND_URL: 'https://coedit.com',
      API_SERVICE_URL: 'https://api.coedit.com',
      SOCKET_SERVICE_URL: 'https://socket.coedit.com',
      EXECUTION_TIMEOUT: '30000',
      MAX_CODE_SIZE: '1000000',
      ALLOWED_LANGUAGES: 'javascript,python,java,c,cpp,go,rust',
      SANDBOX_ENABLED: 'true',
      SANDBOX_TIMEOUT: '10000',
      MAX_EXECUTION_TIME: '5000'
    }
  }
};

// Helper function to create env file content
function createEnvContent(vars) {
  return Object.entries(vars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

// Helper function to write env file
function writeEnvFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error creating ${filePath}:`, error.message);
  }
}

// Main function
function setupEnvironment(envName) {
  const env = environments[envName];
  if (!env) {
    console.error(`❌ Unknown environment: ${envName}`);
    console.log('Available environments:', Object.keys(environments).join(', '));
    return;
  }

  console.log(`🚀 Setting up ${env.name} environment...\n`);

  // Create frontend .env
  const frontendEnvPath = path.join(__dirname, '..', 'nfrontend', '.env');
  const frontendContent = createEnvContent(env.frontend);
  writeEnvFile(frontendEnvPath, frontendContent);

  // Create API service .env
  const apiEnvPath = path.join(__dirname, '..', 'api-service', '.env');
  const apiContent = createEnvContent(env.apiService);
  writeEnvFile(apiEnvPath, apiContent);

  // Create Socket service .env
  const socketEnvPath = path.join(__dirname, '..', 'socket-service', '.env');
  const socketContent = createEnvContent(env.socketService);
  writeEnvFile(socketEnvPath, socketContent);

  // Create Execution service .env
  const executionEnvPath = path.join(__dirname, '..', 'execution-service', '.env');
  const executionContent = createEnvContent(env.executionService);
  writeEnvFile(executionEnvPath, executionContent);

  console.log(`\n✅ ${env.name} environment setup complete!`);
  console.log('\n📁 Environment files created:');
  console.log('  - nfrontend/.env');
  console.log('  - api-service/.env');
  console.log('  - socket-service/.env');
  console.log('  - execution-service/.env');
  
  console.log('\n📝 Next steps:');
  console.log('1. Update the .env files with your actual values');
  console.log('2. Set up your database connection');
  console.log('3. Configure Google OAuth credentials');
  console.log('4. Start the services with: npm run dev');
}

// CLI handling
const args = process.argv.slice(2);
const envName = args[0] || 'development';

if (args.includes('--help') || args.includes('-h')) {
  console.log('🔧 Environment Setup Script');
  console.log('\nUsage: node setup-env.js [environment]');
  console.log('\nEnvironments:');
  Object.entries(environments).forEach(([key, env]) => {
    console.log(`  ${key} - ${env.name}`);
  });
  console.log('\nExamples:');
  console.log('  node setup-env.js development');
  console.log('  node setup-env.js staging');
  console.log('  node setup-env.js production');
} else {
  setupEnvironment(envName);
} 