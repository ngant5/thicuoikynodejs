const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketio = require("socket.io");

const publicPathDiretory = path.join(__dirname, "../public");
app.use(express.static(publicPathDiretory));

const server = http.createServer(app);
const io = socketio(server);

//lang nghe su kien tu client
io.on("connection", () =>{
    console.log("New client connect");
});

const port = 5678;
server.listen(port, () =>{
    console.log(`App run on http://localhost:${port}`);
})