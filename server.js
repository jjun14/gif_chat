var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './client')));

var mongoose = require('./config/mongoose.js');
var routes = require('./config/routes.js')(app);

// start listening
var server = app.listen(8000, function(){
  console.log("Listening on 8000");
});

var rooms = {};
var users = [];

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
  console.log('Sockets are open for business');
  console.log(socket.id);
  // socket code goes here
  socket.on('logged_in', function(data){
    console.log('SOCKET ID: ', socket.id);
    // console.log(data);
    users[socket.id] = data;
    socket.emit('showRoomList', rooms);
  })

  socket.on('createRoom', function(data){
    var new_room = {};
    // console.log('received new room');
    rooms[socket.id] = data;
    rooms[socket.id].messages = [];
    // console.log(rooms);
    new_room[socket.id] = data
    // console.log("ROOMS\n\n", rooms);
    // console.log("STARTING ROOM");
    socket.join(socket.id);
    io.emit('updateRoomList', new_room);
    socket.emit('startRoom', new_room);
  })

  // list for 'joinRoom...when a user joins a room'
  socket.on('joinRoom', function(data){
    console.log('user wants to enter room:' + data.room_key);
    for(room in rooms){
      if(room == data.room_key){
        var enter_room = {};
        rooms[room].users.push(data.user);
        console.log("Entering room");
        console.log(rooms[room]);
        enter_room[data.room_key] = rooms[room];
        enter_room.user = data.user.first_name + " " + data.user.last_name;
        // users.push({id: socket.id, name: data.user.first_name + " " + data.user.last_name})
        socket.join(data.room_key);
        socket.broadcast.to(data.room_key).emit('join_room', enter_room);
        socket.emit('enter_room', enter_room);
        socket.emit('show_messages', {messages: rooms[data.room_key].messages})
      }
    }
    socket.broadcast.emit('refreshRoomList', rooms);
  })

  socket.on('inRoom', function(data){
    socket.to(data.room_key).broadcast.emit('newUser', data);
  })

  // listen for new_photo event
  socket.on('new_message', function(data){
    var message_info = {message_type: 'text', user: data.user, content: data.content};
    rooms[data.room_key].messages.push(message_info);
    socket.broadcast.to(data.room_key).emit('update_messages', message_info);
  })

  //listen for new_photo event
  socket.on('new_photo', function(data){
    var photo_info = {message_type: 'photo', user: data.user, content: data.content};
    rooms[data.room_key].messages.push(photo_info);
    socket.broadcast.to(data.room_key).emit('update_messages', photo_info);
  })

  socket.on('new_gif', function(data){
    // console.log('GOT NEW GIF!');
    // console.log('DATAAAAAA', data);
    var gif_info = {message_type:'gif', user: data.user, content: data.content};
    rooms[data.room_key].messages.push(gif_info);
    socket.broadcast.to(data.room_key).emit('update_messages', gif_info);
  })
})