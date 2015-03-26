gifChat.factory('RoomFactory', function($http){
  var current_room = {};
  var factory = {};

  factory.setCurrentRoom = function(room){
    current_room = room;
  }

  factory.getCurrentRoom = function(callback){
    callback(current_room);
  }

  return factory;
})