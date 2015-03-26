gifChat.factory('UserFactory', function($http){
  var current_user = {};
  var factory = {};

  factory.currentUser = function(callback){
    callback(current_user);
  }

  factory.createUser = function(user, callback){
    $http.post('/users/create', user).success(function(response){
      console.log('back in the factory, created user');
      console.log(response);
      current_user =  current_user = {
                      _id: response._id,
                      first_name: response.first_name,
                      last_name: response.last_name,
                      email: response.email};
      callback(current_user);
    })
  }

  factory.login = function(user, callback){
    $http.post('/users/login', user).success(function(response){
      console.log(response);
      current_user = {
                      _id: response[0]._id,
                      first_name: response[0].first_name,
                      last_name: response[0].last_name,
                      email: response[0].email};
      callback(current_user);
    })
  }

  factory.logout = function(callback){
    current_user = {};
    callback();
  }

  return factory;
})