
import express from "express";
import http from "http";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import * as mime from 'mime-types';

// @ts-ignore
import * as dateFormat from 'date-format';
import Filter from "bad-words";
import { createMessages } from "./createMessage";
import { getUserList, addUser, removeUser, getUser } from './users';

const app = express();
const server = http.createServer(app);

// Đường dẫn tới thư mục public và dist
const publicPathDirectory = path.join(__dirname, '../public');

// Sử dụng express.static với publicPathDirectory
app.use(express.static(publicPathDirectory, {
    setHeaders: (res, filePath) => {
        const mimeType = mime.lookup(filePath);
        if (mimeType) {
            console.log(`Setting Content-Type header to: ${mimeType} for file: ${filePath}`);
            res.setHeader('Content-Type', mimeType);
        } else {
            console.error(`Unsupported MIME type for file: ${filePath}`);
            res.setHeader('Content-Type', 'text/plain'); 
        }
    },
}));




app.get("/", (req, res) => {
    res.sendFile(path.join(publicPathDirectory, "../public/index.html"));
});

app.get("/chat.html", (req, res) => {
    res.sendFile(path.join(publicPathDirectory, "../public/chat.html"));
});

const io = new SocketIOServer(server);
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
            socket.emit(
                "send message from server to client",
                createMessages(`Chào Mừng ${username} Vào Nhóm ${room}`, username)
            );

            socket.broadcast.to(room).emit(
                "send message from server to client",
                createMessages(`${username} - Mới Tham Gia Vào Nhóm ${room}`, username)
            );
        } else {
            console.error("Username is missing");
        }

        // Tin nhắn chat
        socket.on("send message from client to server", (messageText, callback) => {
            const filter = new Filter();
            if (filter.isProfane(messageText)) {
                return callback("messageText khong hop le vi co bad-words");
            }

            const id = socket.id;
            const user = getUser(id);

            if (user && user.username) {
                io.to(room).emit(
                    "send message from server to client",
                    createMessages(messageText, user.username)
                );
            } else {
                console.error("User not found or missing username");
            }
            callback();
        });

        // Xử lý chia sẻ vị trí
        socket.on("share location from client to server", ({ latitude, longitude }) => {
            const linkLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const id = socket.id;
            const user = getUser(id);

            if (user && user.username) {
                io.to(room).emit(
                    "share location from server to client",
                    createMessages(linkLocation, user.username)
                );
            } else {
                console.error("User not found or missing username");
            }
        });

        // Xử lý userlist
        const newUser = {
            id: socket.id,
            username,
            room,
        };
        addUser(newUser);
        io.to(room).emit("send user list from server to client", getUserList(room));

        // Ngắt kết nối
        socket.on("disconnect", () => {
            removeUser(socket.id);
            io.to(room).emit(
                "send user list from server to client",
                getUserList(room)
            );
            console.log("Client left server");
        });
    });
});

const port = 8888;
server.listen(port, () => {
    console.log(`App run on http://localhost:${port}`);
});

export { server };