require("dotenv").config();

const config = {
    PORT: Number(process.env.API_PORT) || 5000,
    SALT_ROUNDS: Number(process.env.SALT_ROUNDS) || 10,
    JWT_TIMEOUT: process.env.JWT_TIMEOUT || "24h",
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    USER_EMAIL: process.env.USER_EMAIL,
    USER_PASS: process.env.USER_PASS,
    POSTGRES_URL: process.env.POSTGRES_URL,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    ABSTRACT_API_KEY: process.env.ABSTRACT_API_KEY,
    SOCKET_SERVICE_URL: process.env.SOCKET_SERVICE_URL || "http://localhost:5001",
};

module.exports = config; 