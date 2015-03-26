// use the config method to set up routing:
gifChat.config(function($routeProvider){
  $routeProvider
    .when('/', {
      templateUrl: './angular/partials/login.html',
      css: '/angular/css/login_register.css'
    })  
    .when('/register', {
      templateUrl: './angular/partials/register.html',
      css: '/angular/css/login_register.css'
    })    
    .when('/rooms', {
      templateUrl: './angular/partials/rooms.html',
      css: '/angular/css/rooms.css'
    })
    .when('/chat' ,{
      templateUrl: './angular/partials/chat.html',
      css: '/angular/css/chat.css'
    })
    .otherwise({
      redirectTo: '/'
    });
});