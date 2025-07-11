"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const registerRoomEvents_1 = require("./events/registerRoomEvents");
const registerGameEvents_1 = require("./events/registerGameEvents");
const analyticsDashboard_1 = require("./utils/analyticsDashboard");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
const rooms = {};
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    (0, registerRoomEvents_1.registerRoomEvents)(io, socket, rooms);
    (0, registerGameEvents_1.registerGameEvents)(io, socket, rooms);
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Analytics system initialized with MongoDB persistence");
    // Start periodic analytics reports
    (0, analyticsDashboard_1.startPeriodicReports)();
});
