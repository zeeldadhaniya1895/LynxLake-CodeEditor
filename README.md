# LynxLake - Collaborative Code Editor Platform

## Overview
LynxLake ek modern, real-time collaborative code editor platform che, je multi-user code editing, chat, project management, and live code execution support kare che. System microservices architecture par based che:

- **Frontend (nfrontend):** React-based modern UI/UX
- **API Service (api-service):** REST APIs for auth, project, file, user, chat, etc.
- **Socket Service (socket-service):** Real-time collaboration (file tree, code, chat, presence)
- **Execution Service (execution-service):** Secure code execution (multi-language, Docker sandbox)

---

## Architecture Diagram

```
[User Browser]
    |
    |  (HTTP/WebSocket)
    v
[Frontend (React)]
    |         |         |
    |         |         |
    v         v         v
[API Service] [Socket Service] [Execution Service]
```

- **Frontend**: Vite + React, connects to all backend services
- **API Service**: Node.js + Express, REST APIs, DB access
- **Socket Service**: Node.js + Socket.io, real-time events
- **Execution Service**: Node.js, Docker-based code runner

---

## 1. Frontend (nfrontend)
- **Tech:** React, Vite, Material UI
- **Key Folders:**
  - `src/pages/` : Main app pages (Editor, Project, Auth, Home, etc)
  - `src/components/` : UI components (CodeEditor, Chat, FileExplorer, etc)
  - `src/context/` : React context for user, socket, auth
  - `src/hooks/` : Custom hooks (API, file tree, etc)
  - `src/utils/` : Utility functions (API, validation, etc)
  - `src/assets/`, `src/images/` : Static assets
- **Features:**
  - Real-time collaborative code editing
  - Project/file explorer, chat, terminal
  - Live user presence, avatars
  - Code execution (Run button)
  - Auth (register, login, Google, OTP)
  - Responsive, modern UI

---

## 2. API Service (api-service)
- **Tech:** Node.js, Express, PostgreSQL
- **Key Folders:**
  - `controllers/` : Route logic (project, editor, auth, user, chat)
  - `routes/` : Express route definitions
  - `queries/` : SQL queries (project, user, auth)
  - `middlewares/` : Auth, project access, etc
  - `utils/` : Helpers (mail, validation, logger)
  - `config/` : CORS, Google, DB config
- **Major APIs:**
  - `/api/auth/*` : Register, login, Google, OTP, password reset
  - `/api/project/*` : Project CRUD, members, invitations, chat, export
  - `/api/editor/*` : File CRUD, file tree, content, save
  - `/api/user/*` : User profile, search
- **DB:** PostgreSQL (see `Database.sql`)

---

## 3. Socket Service (socket-service)
- **Tech:** Node.js, Socket.io, PostgreSQL
- **Key Files/Folders:**
  - `socket/socketHandlers.js` : Main socket event logic (code, chat, file tree, presence)
  - `socket/fileTreeSocket.js` : File explorer real-time events
  - `socket/fileTreeUtils.js` : File tree DB helpers
  - `config/` : Socket config
- **Events:**
  - `code-editor:send-change`, `receive-change` : Real-time code sync
  - `chat:send-message`, `receive-message` : Real-time chat
  - `file-explorer:*` : File/folder CRUD
  - `editor:join-project`, `user-joined`, `user-left` : Presence

---

## 4. Execution Service (execution-service)
- **Tech:** Node.js, Docker, fs-extra, tmp
- **Key Files/Folders:**
  - `index.js` : Main API for code execution
  - `config/` : Language/docker config
- **API:**
  - `POST /execute` :
    - Body: `{ language, code, input }`
    - Runs code in Docker, returns stdout/stderr/time
- **Supported Languages:** Python, JavaScript, C, C++, Java, etc
- **Security:** Resource/time/network limits, sandboxed

---

## API Endpoints (Summary)

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/verify` - OTP verify

### Project
- `GET /api/project/:projectId` - Project info
- `POST /api/project` - Create project
- `PUT /api/project/:projectId/name` - Rename project
- `GET /api/project/:projectId/members` - List members
- `POST /api/project/:projectId/invitations` - Invite user
- `GET /api/project/:projectId/chat/messages` - Get chat

### Editor
- `GET /api/editor/:projectId/file-tree` - Get file tree
- `POST /api/editor/:projectId/files` - Create file/folder
- `GET /api/editor/:projectId/files/:fileId/content` - Get file content
- `POST /api/editor/:projectId/files/:fileId/save` - Save file

### User
- `GET /api/user` - Get profile
- `GET /api/user/search` - Search users

### Execution
- `POST /execute` - Run code (see above)

---

## How to Run
- See each service's `README.md` for setup, env, and run instructions.
- Start all services (API, Socket, Execution, Frontend) for full functionality.

---

## Contribution
- PRs welcome! See code comments and folder structure for guidance.

---

## License
MIT 