"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const mime = __importStar(require("mime-types"));
const bad_words_1 = __importDefault(require("bad-words"));
const createMessage_1 = require("./createMessage");
const users_1 = require("./users");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
exports.server = server;
// Đường dẫn tới thư mục public và dist
const publicPathDirectory = path_1.default.join(__dirname, '../public');
// Sử dụng express.static với publicPathDirectory
app.use(express_1.default.static(publicPathDirectory, {
    setHeaders: (res, filePath) => {
        const mimeType = mime.lookup(filePath);
        if (mimeType) {
            console.log(`Setting Content-Type header to: ${mimeType} for file: ${filePath}`);
            res.setHeader('Content-Type', mimeType);
        }
        else {
            console.error(`Unsupported MIME type for file: ${filePath}`);
            res.setHeader('Content-Type', 'text/plain');
        }
    },
}));
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(publicPathDirectory, "../public/index.html"));
});
app.get("/chat.html", (req, res) => {
    res.sendFile(path_1.default.join(publicPathDirectory, "../public/chat.html"));
});
const io = new socket_io_1.Server(server);
// Log X-Content-Type-Options header
app.use((req, res, next) => {
    res.on('finish', () => {
        const xContentTypeOptions = res.get('X-Content-Type-Options');
        console.log(`X-Content-Type-Options header set to: ${xContentTypeOptions}`);
    });
    next();
});
// Lắng nghe sự kiện từ client
io.on("connection", (socket) => {
    socket.on("join room from client to server", ({ room, username }) => {
        socket.join(room);
        // Chào mừng
        if (username) {
            socket.emit("send message from server to client", (0, createMessage_1.createMessages)(`Chào Mừng ${username} Vào Nhóm ${room}`, username));
            socket.broadcast.to(room).emit("send message from server to client", (0, createMessage_1.createMessages)(`${username} - Mới Tham Gia Vào Nhóm ${room}`, username));
        }
        else {
            console.error("Username is missing");
        }
        // Tin nhắn chat
        socket.on("send message from client to server", (messageText, callback) => {
            const filter = new bad_words_1.default();
            if (filter.isProfane(messageText)) {
                return callback("messageText khong hop le vi co bad-words");
            }
            const id = socket.id;
            const user = (0, users_1.getUser)(id);
            if (user && user.username) {
                io.to(room).emit("send message from server to client", (0, createMessage_1.createMessages)(messageText, user.username));
            }
            else {
                console.error("User not found or missing username");
            }
            callback();
        });
        // Xử lý chia sẻ vị trí
        socket.on("share location from client to server", ({ latitude, longitude }) => {
            const linkLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const id = socket.id;
            const user = (0, users_1.getUser)(id);
            if (user && user.username) {
                io.to(room).emit("share location from server to client", (0, createMessage_1.createMessages)(linkLocation, user.username));
            }
            else {
                console.error("User not found or missing username");
            }
        });
        // Xử lý userlist
        const newUser = {
            id: socket.id,
            username,
            room,
        };
        (0, users_1.addUser)(newUser);
        io.to(room).emit("send user list from server to client", (0, users_1.getUserList)(room));
        // Ngắt kết nối
        socket.on("disconnect", () => {
            (0, users_1.removeUser)(socket.id);
            io.to(room).emit("send user list from server to client", (0, users_1.getUserList)(room));
            console.log("Client left server");
        });
    });
});
const port = 8888;
server.listen(port, () => {
    console.log(`App run on http://localhost:${port}`);
});
