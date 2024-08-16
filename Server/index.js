// Node Server to handle socket i/o connections

const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*" } });
// const io = require('socket.io')(9090, {cors: {origin: "*"}});

app.use(express.static(path.join(__dirname, '..')));

const users = {};

io.on('connection', socket => {
    socket.on('new-user-joined', name => {
        // console.log("New user joined: ", name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', {message : message, name: users[socket.id]});
    });

    //when someone leaves the chatroom
    socket.on('disconnect', name => {
        socket.broadcast.emit('user-leave', users[socket.id]);
        delete users[socket.id];
    })
});

const PORT = process.env.PORT || 9090;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});