const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const formatTime = require("date-format");
const { createMessages } = require("./utils/create-messages");
const { getUserList, addUser, removeUser, getUser } = require('./utils/users');
const publicPathDiretory = path.join(__dirname, "../public");

app.use(express.static(publicPathDiretory));
const server = http.createServer(app);
const io = socketio(server);

//lang nghe su kien tu client
io.on("connection", (socket) =>{
    socket.on("join room from client to server" , ({ room, username }) => {
        socket.join(room);

    //welcome
    //gui cho client vua ket noi vao
    if (username) {
        // Chào mừng client vừa kết nối
        socket.emit(
            "send message from server to client", 
            createMessages(`Chao Mung Ban Den Voi Phong ${room}`, username)
        );

        // Gửi tin nhắn chào mừng tới các client khác trong phòng
        socket.broadcast.to(room).emit(
            "send message from server to client", 
            createMessages(`Client ${username} Moi Tham Gia Vao Phong ${room}`, username)
        );
    } else {
        // Xử lý khi không tìm thấy username
        console.error("Username is missing");
    }


    //messages chat
    socket.on("send message from client to server", (messageText, callback) =>{
        const filter = new Filter();
        if (filter.isProfane(messageText)){
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
            // Xử lý khi không tìm thấy user hoặc không có thuộc tính username
            console.error("User not found or missing username");
        }
        callback();
    });

    // xu ly chia se vi tri
    socket.on(
        "share location from client to server",
        ( {latitude, longitude}) =>{
            const linkLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const id = socket.id;
            const user = getUser(id);
            io.to(room).emit(
                "share location from server to client", 
                createMessages(linkLocation, user.username)
                );
        }
    );

    // xu ly userlist
    const newUser = {
        id : socket.id,
        username,
        room,
    };
    addUser(newUser);
    io.to(room).emit("send user list from server to client", getUserList(room));

    //ngat ket noi
    socket.on("disconnect", () =>{
        removeUser(socket.id);
        io.to(room).emit(
            "send user list from server to client", 
            getUserList(room)
        );
        console.log("Client left server");
        });
    });
});

const port = 4567;
server.listen(port, () =>{
    console.log(`App run on http://localhost:${port}`);
})