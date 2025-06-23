const config = require("./index");

const corsConfig = {
    origin: [config.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Auth-Token", "X-Username", "X-Image"],
};

module.exports = corsConfig; 