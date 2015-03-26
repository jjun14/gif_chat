// we are requiring a controller file that will do stuff when a route is triggered
var users = require('./../server/controllers/users.js');
module.exports = function(app) {
  // these routes are all going to return json 
  // don't want to render/redirect at all we just want to respond with data
  app.post('/users/create', function(req, res){
    users.create(req, res);
  })
  app.post('/users/login', function(req, res){
    users.login(req, res);
  })
}