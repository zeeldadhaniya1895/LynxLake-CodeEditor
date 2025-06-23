const express = require("express");
const cors = require("cors");
const http = require("http");
const config = require("./config/index");
const initIO = require("./config/socket");
const { socketHandlers } = require("./socket/socketHandlers");

const PORT = config.PORT || 5001;
const app = express();
const server = http.createServer(app);

// CORS middleware
app.use(cors({
    origin: [config.FRONTEND_URL, "http://localhost:3000"],
    credentials: true
}));

// Debug middleware
app.use((req, res, next) => {
    console.log(`[Socket Service] ${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Health check
app.get("/health", (_, res) => res.json({ status: "Socket Service is running", port: PORT }));

// Initialize Socket.IO
const io = initIO(server);
socketHandlers(io);

// Start Server
server.listen(PORT, () => console.log(`Socket Service listening on port ${PORT}`)); 