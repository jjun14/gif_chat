// create the controller and we're telling it that we are going to use $scope and we are going to use a FriendFactory and that it belongs to the fullMeanDemo app
gifChat.controller('UsersController', function($scope, $location, UserFactory) {
  $scope.current_user = {};

  $scope.createUser = function(user){
    UserFactory.createUser(user, function(response){
      $scope.current_user = response;
      socket.emit('logged_in', response);
      $location.path('/rooms');
    });
  }

  $scope.login = function(user){
    UserFactory.login(user, function(response){
      $location.path('/rooms');
    })
  }
})