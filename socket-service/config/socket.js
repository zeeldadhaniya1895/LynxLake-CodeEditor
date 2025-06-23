const { Server } = require("socket.io");
const config = require("./index");

const initIO = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [config.FRONTEND_URL, "http://localhost:3000"],
            methods: ['GET', 'POST'],
            allowedHeaders: ["Content-Type", "Authorization", "Auth-Token", "X-Username"],
            credentials: true,
            transports: ['websocket', 'polling']
        }
    });
    return io;
}

module.exports = initIO; 