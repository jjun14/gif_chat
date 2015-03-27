gifChat.controller('ChatsController', function($scope, $location, UserFactory, RoomFactory){
  getCurrentUser();
  getCurrentRoom();
  getMessages();

  // (function(){
  //   if(JSON.stringify($scope.current_user) == '{}'){
  //     $location.path('/');
  //   }
  // }())

  $scope.templates = {
                      text: 'text_form.html',
                      gif: 'gif_form.html',
                      picture: 'picture_form.html'
                     }
  $scope.template = './angular/partials/' + $scope.templates.text

  function getCurrentUser(){
    UserFactory.currentUser(function(response){
      $scope.current_user = response;
    })
  }

  function getCurrentRoom(){
    RoomFactory.getCurrentRoom(function(response){
      $scope.current_room = response;
      $scope.room_key = Object.keys(response)[0];
      // console.log("CURRENT ROOM\n\n", $scope.current_room);
    })
  }

  function getMessages(){
    socket.emit('get_messages', {room_key: $scope.room_key});
  }

  function removeListeners(){
    socket.removeListener('new_user');
    socket.removeListener('show_messages');
    socket.removeListener('update_messages');
  }

  $scope.logout = function(){
    socket.emit('logout', {user: $scope.current_user, room_key: $scope.room_key});
    removeListeners();
    UserFactory.logout(function(){
      $scope.current_user = {}
    });
    $location.path('/index');
  }

  $scope.leave_room = function(){
    socket.emit('leave_room', {user: $scope.current_user, room_key: $scope.room_key});
    removeListeners();
    $location.path('/rooms');
  }

  $scope.changePartial = function(type){
    $scope.template = './angular/partials/' + $scope.templates[type];
  }
  // Creates a gif
  $scope.createGif = function(){
    var gif_preview = document.getElementById('gif_preview');
    var stop_recording = document.getElementById('stop_recording');
    var send_gif = document.getElementById('send_gif');
    var gif_blob = null;
    var gif_url = null;

    navigator.getUserMedia = (navigator.getUserMedia || 
                            navigator.webkitGetUserMedia || 
                            navigator.mozGetUserMedia || 
                            navigator.msGetUserMedia);
    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        {
            video:true,
            audio:false
        },        
          function(stream) { 
            var options = {
              type: 'video',
              video: { width: 150, height: 150 },
              canvas: { width: 150, height: 150 },
              frameRate: 200,
              quality: 10
            };
            var recordRTC = RecordRTC(stream, options);
            recordRTC.startRecording();

            stop_recording.onclick = function(){
              var blob = recordRTC.getBlob();
              recordRTC.stopRecording(function(gifURL) {
                // console.log(gifURL);
                gif_url = gifURL
                var xhr = new XMLHttpRequest();
                xhr.open('GET', gifURL, true);
                xhr.responseType = 'blob';
                xhr.onload = function(e){
                  if(this.status == 200){
                    gif_blob = this.response;
                  }
                }
                xhr.send();
                gif_preview.src = gifURL;
                gif_preview.autoplay = true;
              });
            }
          },
          function(error) { 
            alert('could not get stream')
          }
      );
    }
    else {
      alert('Sorry, the browser you are using doesn\'t support getUserMedia');
      return;
    }

    $scope.send_gif = function(current_user){
      // console.log('SENDING GIF!');
      // console.log(gif_blob);
      // console.log('converting to base64');
      var reader = new window.FileReader();
      reader.readAsDataURL(gif_blob);
      $('#chats').append("<p><span>"+current_user.first_name+" "+current_user.last_name+":</span> </p>");
      $('#chats').append("<video autoplay loop src="+gif_url+"></video>");
      $('#chats').animate({scrollTop: $('#chats').height()}, 1600, 'easeOutSine');
      reader.onloadend = function(){
        base64data = reader.result;
        // console.log(base64data);
        socket.emit('new_gif', {room_key: $scope.room_key, user: current_user.first_name+" "+current_user.last_name, content: base64data})
      }
    }
  } //create gif

  // Creates a picture
  $scope.startCamera = function(){
    var camera_preview = document.getElementById('camera_preview');
    var canvas = document.getElementById('canvas');
    canvas.height = 150;
    canvas.width = 150;
    var context = canvas.getContext("2d");
    var photo_preview = document.getElementById('photo_preview');
    var create_photo = document.getElementById('create_photo');
    var send_photo = document.getElementById('send_photo');

    navigator.getUserMedia = (navigator.getUserMedia || 
                            navigator.webkitGetUserMedia || 
                            navigator.mozGetUserMedia || 
                            navigator.msGetUserMedia);
    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        {
          video: true,
          audio: false
        },        
          function(stream) { 
            camera_preview.src = URL.createObjectURL(stream);
            camera_preview.autoplay = true;
          },
          function(error) { 
            alert('could not get stream')
          }
      );

      $scope.create_photo = function(){
        // console.log('clicked!')
        context.drawImage(camera_preview, 0, 0, 150, 150);
        var data = canvas.toDataURL('image/png');
        // console.log(data);
        photo_preview.setAttribute('src', data);
      };

      $scope.send_photo = function(current_user){
        // console.log('sending picture!');
        var canvas = document.getElementById('canvas');
        var img_src = canvas.toDataURL();
        $('#chats').append("<p><span>"+current_user.first_name+" "+current_user.last_name+":</span> </p>");
        $('#chats').append("<img src="+img_src+">");
        // $('#chats').animate({scrollTop: $('#chats').height()}, 1600, 'easeOutSine');

        socket.emit('new_photo', {room_key: $scope.room_key, user: current_user.first_name+" "+current_user.last_name, content: img_src})

        // canvas.toBlob(function(blob){
        //   console.log(blob);
        //   console.log(URL.createObjectURL(blob));
        // })
      }
    }
  } //create picture

  //sends picture through socket
  $scope.send_message = function(current_user){
    // console.log('sending message');
    var message = $('#message_form input').val();
    if(message != ""){
      socket.emit('new_message', {room_key: $scope.room_key,user: current_user.first_name+" "+current_user.last_name, content: message});
      $('#chats').append("<p><span>"+current_user.first_name+" "+current_user.last_name+": </span> "+message+"</p>");
      // $('#chats').animate({scrollTop: $('#chats').height()}, 1600, 'easeOutSine');
    }
  }

  //listen for join_room when a new user joins the chat
  socket.on('new_user', function(data){
    $('#chats').append(data.content);
  })


  socket.on('show_messages', function(data){
    if($('#chats').empty()){
      for(var i=0; i < data.messages.length; i++){
        if(data.messages[i].message_type == 'notice'){
          $('#chats').append(data.messages[i].content);
        } else if(data.messages[i].message_type == 'text'){
          $('#chats').append("<p><span>"+data.messages[i].user+": </span>"+data.messages[i].content+"</p>");
        } else if(data.messages[i].message_type == 'photo'){
          $('#chats').append("<p><span>"+data.messages[i].user+":</span> </p>");
          $('#chats').append("<img src="+data.messages[i].content+">");
        } else if(data.messages[i].message_type == 'gif'){
          $('#chats').append("<p><span>"+data.messages[i].user+":</span> </p>");
          $('#chats').append("<video autoplay loop src="+data.messages[i].content+"></video>");
        }
      }
    }
    // $('#chats').animate({scrollTop: $('#chats').height()}, 1600, 'easeOutSine');
  })

  socket.on('update_messages', function(data){
    console.log('UPDATING');
    // console.log(data);
    if(data.message_type == 'notice'){
      $('#chats').append(data.content);
    }
    else if(data.message_type == 'text'){
      $('#chats').append("<p><span>"+data.user+": </span>"+data.content+"</p>");
    } else if(data.message_type == 'photo'){
      $('#chats').append("<p><span>"+data.user+":</span> </p>");
      $('#chats').append("<img src="+data.content+">");
    } else if(data.message_type == 'gif'){
      // console.log('here');
      // console.log(data.content);
      $('#chats').append("<p><span>"+data.user+":</span></p>");
      $('#chats').append("<video autoplay loop src="+data.content+"></video>");
    }
    // $('#chats').animate({scrollTop: $('#chats').height()}, 1600, 'easeOutSine');
  })
})