# CoEdit - 3-Service Architecture

## Overview

CoEdit is now built with a microservices architecture consisting of 3 separate services:

1. **API Service** (Port 5000) - Database operations, User Management, Authentication
2. **Socket Service** (Port 5001) - Real-time collaboration, Live cursors, Chat
3. **Execution Service** (Port 5002) - Code compilation and sandbox (Coming Soon)

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Frontend      │    │   Frontend      │
│   (Port 5173)   │    │   (Port 5173)   │    │   (Port 5173)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Service   │    │  Socket Service │    │ Execution Service│
│   (Port 5000)   │    │   (Port 5001)   │    │   (Port 5002)   │
│   .env file     │    │   .env file     │    │   .env file     │
│   queries/      │    │   socket/       │    │   (placeholder) │
│   controllers/  │    │   db.js         │    │                 │
│   routes/       │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      PostgreSQL DB        │
                    │      (Shared)             │
                    └───────────────────────────┘
```

## Quick Start

### 1. Environment Setup

**Option A: Automatic Setup (Recommended)**
```bash
# For development
npm run setup:dev

# For staging
npm run setup:staging

# For production
npm run setup:prod
```

**Option B: Manual Setup**
```bash
# Copy example files for each service
cp nfrontend/env.example nfrontend/.env
cp api-service/env.example api-service/.env
cp socket-service/env.example socket-service/.env
cp execution-service/env.example execution-service/.env

# Edit each .env file with your configuration
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Start All Services

```bash
# Start all services at once
npm run dev

# Or start individually
npm run start:api      # API Service
npm run start:socket   # Socket Service  
npm run start:execution # Execution Service
npm run start:frontend # Frontend
```

### 4. Check Deployment

```bash
# Check if everything is working
npm run deploy:check

# Check service health
npm run health:check
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **API Service**: http://localhost:5000/health
- **Socket Service**: http://localhost:5001/health
- **Execution Service**: http://localhost:5002/health

## Service Details

### API Service (Port 5000)

**Responsibilities:**
- User authentication and authorization
- Project management (CRUD operations)
- File management (CRUD operations)
- Database operations
- Email services
- Google OAuth integration

**Key Files:**
- `queries/` - Database queries for all operations
- `controllers/` - Business logic handlers
- `routes/` - API endpoint definitions
- `middlewares/` - Authentication and validation
- `utils/` - Helper functions
- `db.js` - Database connection
- `check-database.js` - Database health check

**Key Endpoints:**
- `/api/auth/*` - Authentication routes
- `/api/project/*` - Project management
- `/api/user/*` - User management
- `/api/editor/*` - File editor operations

### Socket Service (Port 5001)

**Responsibilities:**
- Real-time code synchronization
- Live cursor tracking
- User presence management
- Chat functionality
- File tree updates
- Collaborative editing events

**Key Files:**
- `socket/socketHandlers.js` - Socket event handlers
- `db.js` - Database connection for live users

**Key Events:**
- `editor:join-project` - Join project room
- `code-editor:send-change` - Code changes
- `code-editor:send-cursor` - Cursor position
- `chat:send-message` - Chat messages

### Execution Service (Port 5002)

**Responsibilities:**
- Code compilation
- Code execution in sandbox
- Input/output handling
- Security isolation
- Multiple language support

**Status:** Coming Soon - Currently placeholder service

## Environment Configuration

### Service-Specific Environment Files

Each service has its own `.env` file for better isolation and security:

#### Frontend Environment (`nfrontend/.env`)
```env
# Service URLs (Local Development)
VITE_API_SERVICE_URL=http://localhost:5000
VITE_SOCKET_SERVICE_URL=http://localhost:5001
VITE_EXECUTION_SERVICE_URL=http://localhost:5002

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Environment
NODE_ENV=development
```

#### API Service Environment (`api-service/.env`)
```env
# Service Configuration
API_PORT=5000
NODE_ENV=development

# Database Configuration
POSTGRES_URL=postgresql://username:password@localhost:5432/coedit_db

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_TIMEOUT=24h
SALT_ROUNDS=10

# Email Configuration
USER_EMAIL=your_email@gmail.com
USER_PASS=your_email_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# API Keys
ABSTRACT_API_KEY=your_abstract_api_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Other Service URLs
SOCKET_SERVICE_URL=http://localhost:5001
EXECUTION_SERVICE_URL=http://localhost:5002
```

#### Socket Service Environment (`socket-service/.env`)
```env
# Service Configuration
SOCKET_PORT=5001
NODE_ENV=development

# Database Configuration
POSTGRES_URL=postgresql://username:password@localhost:5432/coedit_db

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Other Service URLs
API_SERVICE_URL=http://localhost:5000
EXECUTION_SERVICE_URL=http://localhost:5002

# Socket Configuration
SOCKET_CORS_ORIGIN=http://localhost:5173
SOCKET_TRANSPORTS=websocket,polling
```

#### Execution Service Environment (`execution-service/.env`)
```env
# Service Configuration
EXECUTION_PORT=5002
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Other Service URLs
API_SERVICE_URL=http://localhost:5000
SOCKET_SERVICE_URL=http://localhost:5001

# Execution Configuration
EXECUTION_TIMEOUT=30000
MAX_CODE_SIZE=1000000
ALLOWED_LANGUAGES=javascript,python,java,c,cpp,go,rust

# Security Configuration
SANDBOX_ENABLED=true
SANDBOX_TIMEOUT=10000
MAX_EXECUTION_TIME=5000
```

## Development

### Adding New Features

1. **API Changes**: Add to `api-service/`
   - Database queries: `api-service/queries/`
   - Business logic: `api-service/controllers/`
   - Routes: `api-service/routes/`
2. **Real-time Features**: Add to `socket-service/`
   - Socket handlers: `socket-service/socket/socketHandlers.js`
3. **Code Execution**: Add to `execution-service/`
4. **Frontend Changes**: Add to `nfrontend/`

### Environment Variables Priority

The system uses a priority-based approach for environment variables:

1. **Runtime Environment Variables** (highest priority)
2. **Build-time Constants** (from Vite define)
3. **Default Fallbacks** (lowest priority)

### Vite Configuration

The Vite config automatically:
- Loads environment variables
- Sets up proxy configuration
- Provides build-time constants
- Handles different environments

## Deployment

### Production Environment Variables

Each service needs its own production `.env` file:

```env
# Production URLs (update for each service)
FRONTEND_URL=https://your-frontend-domain.com
API_SERVICE_URL=https://your-api-domain.com
SOCKET_SERVICE_URL=https://your-socket-domain.com
EXECUTION_SERVICE_URL=https://your-execution-domain.com

# Frontend (.env)
VITE_API_SERVICE_URL=https://your-api-domain.com
VITE_SOCKET_SERVICE_URL=https://your-socket-domain.com
VITE_EXECUTION_SERVICE_URL=https://your-execution-domain.com
```

### Deployment Commands

```bash
# Setup production environment
npm run setup:prod

# Build frontend for production
npm run build

# Check deployment status
npm run deploy:check
```

### Docker Deployment (Coming Soon)

Each service can be containerized and deployed independently.

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :5000
   # Kill the process
   kill -9 <PID>
   ```

2. **Environment Configuration Issues**
   ```bash
   # Check environment setup
   npm run deploy:check
   
   # Re-setup environment
   npm run setup:dev
   ```

3. **Missing Files Error**
   ```bash
   # If queries folder is missing
   cp -r backend/queries api-service/
   
   # If other files are missing
   cp -r backend/controllers api-service/
   cp -r backend/routes api-service/
   cp -r backend/middlewares api-service/
   cp -r backend/utils api-service/
   cp backend/db.js api-service/
   ```

4. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check `POSTGRES_URL` in each service's `.env`
   - Ensure database exists

5. **Socket Connection Issues**
   - Check if Socket Service is running on port 5001
   - Verify CORS settings in `socket-service/.env`
   - Check browser console for errors

### Health Checks

```bash
# Check all services
npm run health:check

# Individual service checks
curl http://localhost:5000/health  # API Service
curl http://localhost:5001/health  # Socket Service
curl http://localhost:5002/health  # Execution Service
```

### Debug Information

The system provides extensive debug information:

- **Vite Config**: Logs service URLs on startup
- **Frontend Config**: Debug function available
- **Socket Context**: Connection status tracking
- **Deployment Check**: Comprehensive health checks

## Security Benefits

### Per-Service Environment Files

- **Isolation**: Each service has its own environment configuration
- **Security**: Sensitive data is isolated per service
- **Flexibility**: Different services can have different configurations
- **Maintenance**: Easier to manage and update individual services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes in the appropriate service
4. Test all services work together
5. Submit a pull request

## License

ISC License 