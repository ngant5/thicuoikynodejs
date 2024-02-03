
import express from "express";
import * as http from "http";
import * as path from "path";
import { Server as SocketIOServer } from "socket.io";
import * as format from "dateformat";

import Filter from "bad-words";
import { createMessages } from "./create-messages";
import { getUserList, addUser, removeUser, getUser } from './users';

const app = express();
const server = http.createServer(app);

// Đường dẫn tới thư mục public và dist
const publicPathDirectory = path.join(__dirname, "../public");
const distPath = path.join(__dirname, "../dist");

// Sử dụng express.static với distPath
app.use('/dist', express.static(path.join(__dirname, 'app', 'dist')));

app.use(express.static(distPath));

app.use(express.static(publicPathDirectory));
app.get("/", (req, res) => {
    res.sendFile(path.join(publicPathDirectory, "index.html"));
});



const io = new SocketIOServer(server);

// Lắng nghe sự kiện từ client
io.on("connection", (socket) => {
    socket.on("join room from client to server", ({ room, username }) => {
        socket.join(room);

        // Chào mừng
        if (username) {
            socket.emit(
                "send message from server to client",
                createMessages(`Chao Mung Ban Den Voi Phong ${room}`, username)
            );

            socket.broadcast.to(room).emit(
                "send message from server to client",
                createMessages(`Client ${username} Moi Tham Gia Vao Phong ${room}`, username)
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