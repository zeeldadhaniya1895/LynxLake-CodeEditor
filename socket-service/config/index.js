require("dotenv").config();

const config = {
    PORT: Number(process.env.SOCKET_PORT) || 5001,
    POSTGRES_URL: process.env.POSTGRES_URL,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    API_SERVICE_URL: process.env.API_SERVICE_URL || "http://localhost:5000",
};

module.exports = config; 