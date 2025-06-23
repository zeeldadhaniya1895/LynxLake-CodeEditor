const express = require("express");
const cors = require("cors");
const config = require("./config/index");

const PORT = config.PORT || 5002;
const app = express();

// CORS middleware
app.use(cors({
    origin: [config.FRONTEND_URL, "http://localhost:3000"],
    credentials: true
}));

// Debug middleware
app.use((req, res, next) => {
    console.log(`[Execution Service] ${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Health check
app.get("/health", (_, res) => res.json({ 
    status: "Execution Service is running", 
    port: PORT,
    message: "Code compilation features coming soon!"
}));

// Placeholder endpoints
app.post("/execute", (req, res) => {
    res.json({ 
        success: false, 
        message: "Code execution service is not implemented yet" 
    });
});

app.post("/compile", (req, res) => {
    res.json({ 
        success: false, 
        message: "Code compilation service is not implemented yet" 
    });
});

// Start Server
app.listen(PORT, () => console.log(`Execution Service listening on port ${PORT}`)); 