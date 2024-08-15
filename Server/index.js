// Node Server to handle socket i/o connections

const io = require('socket.io')(9090, {cors: {origin: "*"}});

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