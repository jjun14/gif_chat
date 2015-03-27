// make an immediate function that gives back an object that has methods that handle our requests
// require mongoose so that we can access the model
var mongoose = require('mongoose');
// this allows us access the model/collection in the DB
var User = mongoose.model('User');
module.exports = (function(){
  // return because we want to put an object into the variable for whatever requires this
  return {
    show: function(req, res){
      console.log('in the model show method');
      User.find({}, function(err, results){
        if(err){
          console.log(err);
        }
        else{
          // console.log('here');
          // console.log(res);
          res.send(JSON.stringify(results));      
        }
      })
    },
    create: function(req, res){
      var user = new User(req.body);
      user.save(function(err, results){
        if(err){
          console.log(err);
          console.log('error adding user');
        }
        else{
          // console.log(result);
          console.log('added user');
          console.log(results);
          res.send(JSON.stringify(results));
        }
      })
    },
    login: function(req, res){
      // console.log(req.body);
      User.find({email: req.body.email, password: req.body.password}, function(err, results){
        if(err){
          console.log('err finding user');
        } else {
          if(results.length === 1){
            console.log('logged in user');
            res.send(JSON.stringify(results));
          }
          else {
            console.log('could not find user!');
          }
        }
      })
    }
  }
})();