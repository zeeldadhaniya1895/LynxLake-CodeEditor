const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting CoEdit Services...\n');

// Function to start a service
function startService(serviceName, servicePath, port) {
    console.log(`📡 Starting ${serviceName} on port ${port}...`);
    
    const child = spawn('npm', ['run', 'dev'], {
        cwd: path.join(__dirname, servicePath),
        stdio: 'pipe',
        shell: true
    });

    child.stdout.on('data', (data) => {
        console.log(`[${serviceName}] ${data.toString().trim()}`);
    });

    child.stderr.on('data', (data) => {
        console.error(`[${serviceName} ERROR] ${data.toString().trim()}`);
    });

    child.on('close', (code) => {
        console.log(`[${serviceName}] Process exited with code ${code}`);
    });

    return child;
}

// Start all services
const services = [
    { name: 'API Service', path: 'api-service', port: 5000 },
    { name: 'Socket Service', path: 'socket-service', port: 5001 },
    { name: 'Execution Service', path: 'execution-service', port: 5002 }
];

const processes = services.map(service => 
    startService(service.name, service.path, service.port)
);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down all services...');
    processes.forEach(process => process.kill('SIGINT'));
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down all services...');
    processes.forEach(process => process.kill('SIGTERM'));
    process.exit(0);
});

console.log('\n✅ All services started! Press Ctrl+C to stop all services.\n'); 