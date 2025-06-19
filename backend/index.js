const express = require("express");
const cors = require("cors");
const http = require("http");
const cookieParser = require("cookie-parser");
const config = require("./config/index");
const initIO = require("./config/socket");
const corsConfig = require("./config/cors");
const socketHandlers = require("./socket/socketHandlers");


const PORT = config.PORT || 8000;
const app = express();
const server = http.createServer(app);

const io = initIO(server);
socketHandlers(io);

// Import Routes
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/project");
const userRoutes = require("./routes/user");
const editorRoutes = require("./routes/editor");
const staticRoutes = require("./routes/static");

// Middleware
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.get("/", (_, res) => res.send("Hello, World!"));

// Test endpoint
app.get("/test", (_, res) => {
  console.log("Test endpoint hit!");
  res.json({ message: "Backend is working!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/project", staticRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/user", userRoutes);
app.use("/api/editor", editorRoutes);

// Start Server
server.listen(PORT, () => console.log(`App listening on port ${PORT}`));
