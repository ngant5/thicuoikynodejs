const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketio = require("socket.io");
const Filter = require("bad-words");
const formatTime = require('date-format');
const {createMessages} = require("./utils/create-messages");
const { getUserList, addUser, removeUser } = require('./utils/users');

const publicPathDiretory = path.join(__dirname, "../public");
app.use(express.static(publicPathDiretory));

const server = http.createServer(app);
const io = socketio(server);

let count = 1;
const messages = "Chao moi nguoi";

//lang nghe su kien tu client
io.on("connection", (socket) =>{
    socket.on("join room from client to server" , ({room, username}) =>{
        socket.join(room);

    //welcome
    //gui cho client vua ket noi vao
    socket.emit(
        "send message from server to client", 
        createMessages(`Chao Mung Ban Den Voi Phong ${room}`)
    );
    //gui cho cac client con lai
    socket.broadcast
        .to(room)
        .emit(
            "send message from server to client", 
            createMessages(`Client ${username} Moi Tham Gia Vao Phong ${room}`)
    );

    //messages chat
    socket.on("send message from client to server", (messageText, callback) =>{
        const filter = new Filter();
        if (filter.isProfane(messageText)){
            return callback("messageText khong hop le vi co bad-words");
        }

        io.to(room).emit("send message from server to client", createMessages(messageText));
        callback();
    });

    // xu ly chia se vi tri
    socket.on(
        "share location from client to server",
        ( {latitude, longitude}) =>{
            const linkLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;
            io.to(room).emit("share location from server to client", linkLocation);
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
        io.to(room).emit("send user list from server to client", getUserList(room));
        console.log("Client left server");
        });
    });
});

const port = 5678;
server.listen(port, () =>{
    console.log(`App run on http://localhost:${port}`);
})