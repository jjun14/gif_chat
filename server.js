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

function htmlEscape(text) {
   return text.replace(/&/g, '&amp;').
     replace(/</g, '&lt;').  // it's not neccessary to escape >
     replace(/"/g, '&quot;').
     replace(/'/g, '&#039;');
}

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
    console.log('here');
    var new_room = {};
    console.log('received new room');
    console.log(data);
    var date = new Date();
    var room_key = socket.id.toString() + data.created_at.toString();
    console.log('ROOM KEY', room_key);
    rooms[room_key] = data;
    rooms[room_key].messages = [{message_type: 'notice', content: "<p class='notice'>"+data.host.first_name+" "+data.host.last_name+" created "+data.name+"</p>"}];
    rooms[room_key].users.push(data.host);
    new_room[room_key] = data
    // console.log("ROOMS\n\n", rooms);
    // console.log("STARTING ROOM");
    socket.join(room_key);
    socket.emit('startRoom', new_room);
    // io.emit('updateRoomList', new_room);
    io.emit('refreshRoomList', rooms);
    console.log(rooms[room_key]);
    console.log("CREATE ROOMS", socket.rooms);
  })

  // list for 'joinRoom...when a user joins a room'
  socket.on('joinRoom', function(data){
    console.log("JOIN ROOM DATA:", data);
    console.log('user wants to enter room:' + data.room_key);
    for(room in rooms){
      if(room == data.room_key){
        var enter_room = {};
        rooms[room].users.push(data.user);
        console.log("Entering room");
        // console.log(rooms[room]);
        enter_room[data.room_key] = rooms[room];
        enter_room.user = data.user.first_name + " " + data.user.last_name;
        // users.push({id: socket.id, name: data.user.first_name + " " + data.user.last_name});
        socket.join(data.room_key);
        // socket.broadcast.to(data.room_key).emit('join_room', enter_room);
        rooms[data.room_key].messages.push({message_type: 'notice', content: "<p class='notice'>"+data.user.first_name+" "+data.user.last_name+" joined the chat</p>"});
        socket.broadcast.to(data.room_key).emit('update_messages', {message_type: 'notice', content: "<p class='notice'>"+data.user.first_name+" "+data.user.last_name+" joined the chat</p>"});
        socket.emit('enter_room', enter_room);
      }
    }
    io.emit('refreshRoomList', rooms);
  })

  socket.on('leave_room', function(data){
    console.log('LEAVING ROOM');
    for(var i=0; i < rooms[data.room_key].users.length; i++){
      if(rooms[data.room_key].users[i].id == data.user.id){
        rooms[data.room_key].users[i] = rooms[data.room_key].users[rooms[data.room_key].users.length - 1];
        rooms[data.room_key].users.pop();
      }
    }
    if(rooms[data.room_key].users.length < 1){
      delete rooms[data.room_key]
    } else {
      rooms[data.room_key].messages.push({message_type:'notice', content:"<p class='notice'>"+data.user.first_name+" "+data.user.last_name+" left the chat</p>"});
      console.log('UPDATED ROOM', rooms[data.room_key]);
      socket.broadcast.to(data.room_key).emit('update_messages', {message_type:'notice', content:"<p class='notice'>"+data.user.first_name+" "+data.user.last_name+" left the chat</p>"})
    }
    io.emit('refreshRoomList', rooms);
    socket.leave(data.room_key);
  })

  socket.on('logout', function(data){
    console.log('LOGGING OUT');
    console.log(data.user);
    for(var i=0; i < rooms[data.room_key].users.length; i++){
      if(rooms[data.room_key].users[i].id == data.user.id){
        rooms[data.room_key].users[i] = rooms[data.room_key].users[rooms[data.room_key].users.length - 1];
        rooms[data.room_key].users.pop();
      }
    }
    if(rooms[data.room_key].users.length < 1){
      delete rooms[data.room_key]
    } else {
      rooms[data.room_key].messages.push({message_type:'notice', content:"<p class='notice'>"+data.user.first_name+" "+data.user.last_name+" left the chat</p>"});
      console.log('UPDATED ROOM', rooms[data.room_key]);
      socket.broadcast.to(data.room_key).emit('update_messages', {message_type:'notice', content:"<p class='notice'>"+data.user.first_name+" "+data.user.last_name+" left the chat</p>"})
    }
    socket.leave(data.room_key);
    io.emit('refreshRoomList', rooms);
  })

  socket.on('get_messages', function(data){
    socket.emit('show_messages', {messages: rooms[data.room_key].messages});
  })

  // listen for new_photo event
  socket.on('new_message', function(data){
    var message_info = {message_type: 'text', user: data.user, content: htmlEscape(data.content)};
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

  socket.on('disconnect', function(data){
    console.log('disconnecting!');
    for(room in rooms){
      if( rooms[room].users.length < 1){
        delete rooms[room];
      } else {
        for(var i = 0; i < rooms[room].users.length; i++){
          if(rooms[room].users[i].id == socket.id){

            rooms[room].messages.push({message_type:'notice', content:"<p class='notice'>"+rooms[room].users[i].first_name+" "+rooms[room].users[i].last_name+" left the chat</p>"});
            console.log('UPDATED ROOM', rooms[data.room_key]);
            socket.broadcast.to(room).emit('update_messages', {message_type:'notice', content:"<p class='notice'>"+rooms[room].users[i].first_name+" "+rooms[room].users[i].last_name+" left the chat</p>"})
            rooms[room].users[i] = rooms[room].users[rooms[room].users.length - 1];
            rooms[room].users.pop();
            console.log(rooms[room]);
          }
        }
      }
    }
    socket.leave(data.room_key);  
    io.emit('refreshRoomList', rooms);
  })
})