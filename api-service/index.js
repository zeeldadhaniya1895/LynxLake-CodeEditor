const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config/index");
const corsConfig = require("./config/cors");

const PORT = config.PORT || 5000;
const app = express();

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
  console.log(`[API Service] ${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check
app.get("/health", (_, res) => res.json({ status: "API Service is running", port: PORT }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/project", staticRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/user", userRoutes);
app.use("/api/editor", editorRoutes);

// Start Server
app.listen(PORT, () => console.log(`API Service listening on port ${PORT}`)); 