const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketio = require("socket.io");

const publicPathDiretory = path.join(__dirname, "../public");
app.use(express.static(publicPathDiretory));

const server = http.createServer(app);
const io = socketio(server);

let count = 1;
const messages = "Chao moi nguoi";

//lang nghe su kien tu client
io.on("connection", (socket) =>{
    socket.on("send message from client to server", (messageText) =>{
        io.emit("send message from server to client", messageText);
    });


    //ngat ket noi
    socket.on("disconnect", () =>{
        console.log("Client left server");
})

});

const port = 5678;
server.listen(port, () =>{
    console.log(`App run on http://localhost:${port}`);
})