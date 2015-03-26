// make an immediate function that gives back an object that has methods that handle our requests
// require mongoose so that we can access the model
var mongoose = require('mongoose');
// this allows us access the model/collection in the DB
var Model = mongoose.model('Model');
module.exports = (function(){
  // return because we want to put an object into the variable for whatever requires this
  return {
    show: function(req, res){
      console.log('in the model show method');
      Model.find({}, function(err, results){
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
      // console.log(req.body);
      var model = new Model(req.body);
      model.save(function(err, result){
        if(err){
          console.log(err);
        }
        else{
          // console.log(result);
          console.log('added model');
        }
      })
    },
    delete: function(req, res){
      console.log('in the delete method');
      // console.log(req.body._id);
      Model.remove({_id: req.body._id}, function(err, results){
        if(err){
          console.log(err);
        }
        else {
          console.log('deleted model');
        }
      })
    }
  }
})();