require("dotenv").config();

const config = {
    PORT: Number(process.env.EXECUTION_PORT) || 5002,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    API_SERVICE_URL: process.env.API_SERVICE_URL || "http://localhost:5000",
};

module.exports = config; 