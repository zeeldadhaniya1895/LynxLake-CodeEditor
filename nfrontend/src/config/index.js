// Helper function to get environment variable with fallback
const getEnvVar = (key, fallback) => {
  const value = import.meta.env[key];
  if (value !== undefined && value !== '') {
    return value;
  }
  return fallback;
};

// Helper function to detect environment
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

const config = {
  // Service URLs with environment-based fallbacks
  API_SERVICE_URL: getEnvVar('VITE_API_SERVICE_URL', 
    isDevelopment ? 'http://localhost:5000' : 'https://api.coedit.com'),
  
  SOCKET_SERVICE_URL: getEnvVar('VITE_SOCKET_SERVICE_URL', 
    isDevelopment ? 'http://localhost:5001' : 'https://socket.coedit.com'),
  
  EXECUTION_SERVICE_URL: getEnvVar('VITE_EXECUTION_SERVICE_URL', 
    isDevelopment ? 'http://localhost:5002' : 'https://execution.coedit.com'),
  
  // Legacy support (for backward compatibility)
  BACKEND_API: getEnvVar('VITE_API_SERVICE_URL', 
    isDevelopment ? 'http://localhost:5000' : 'https://api.coedit.com'),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: getEnvVar('VITE_GOOGLE_CLIENT_ID', ''),
  
  // Environment detection
  NODE_ENV: import.meta.env.MODE,
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: isProduction,
  
  // Build-time constants (from Vite define)
  BUILD_API_URL: typeof __API_SERVICE_URL__ !== 'undefined' ? __API_SERVICE_URL__ : null,
  BUILD_SOCKET_URL: typeof __SOCKET_SERVICE_URL__ !== 'undefined' ? __SOCKET_SERVICE_URL__ : null,
  BUILD_EXECUTION_URL: typeof __EXECUTION_SERVICE_URL__ !== 'undefined' ? __EXECUTION_SERVICE_URL__ : null,
  
  // Utility functions
  getApiUrl: () => {
    // Priority: Runtime env > Build-time constant > Fallback
    return config.API_SERVICE_URL || config.BUILD_API_URL || 
           (isDevelopment ? 'http://localhost:5000' : 'https://api.coedit.com');
  },
  
  getSocketUrl: () => {
    return config.SOCKET_SERVICE_URL || config.BUILD_SOCKET_URL || 
           (isDevelopment ? 'http://localhost:5001' : 'https://socket.coedit.com');
  },
  
  getExecutionUrl: () => {
    return config.EXECUTION_SERVICE_URL || config.BUILD_EXECUTION_URL || 
           (isDevelopment ? 'http://localhost:5002' : 'https://execution.coedit.com');
  },
  
  // Debug info
  debug: () => {
    console.log('🔧 Frontend Config:');
    console.log('  Environment:', config.NODE_ENV);
    console.log('  Is Development:', config.IS_DEVELOPMENT);
    console.log('  Is Production:', config.IS_PRODUCTION);
    console.log('  API URL:', config.getApiUrl());
    console.log('  Socket URL:', config.getSocketUrl());
    console.log('  Execution URL:', config.getExecutionUrl());
  }
};

// Log config in development
if (isDevelopment) {
  config.debug();
}

export default config;
