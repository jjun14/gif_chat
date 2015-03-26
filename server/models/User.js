// we want to create a file that has the schema for our customers

var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var fnameValidator = [
  validate({
    validator: 'isLength',
    arguments: [2, 50],
    message: 'First name should be between 2 and 50 characters'
  }),
  validate({
    validator: 'isAlpha',
    passIfEmpty: true,
    message: 'First name should contain alpha-numeric characters only'
  })
];
var lnameValidator = [
  validate({
    validator: 'isLength',
    arguments: [2, 50],
    message: 'Last name should be between 2 and 50 characters'
  }),
  validate({
    validator: 'isAlpha',
    passIfEmpty: true,
    message: 'Last name should contain alpha-numeric characters only'
  })
];
var emailValidator = [
  validate({
    validator: 'isEmail',
    message: 'Email is not valid'
  })
];
var passwordValidator = [
  validate({
    validator: 'isLength',
    arguments: [6, 20],
    message: 'Password should be at least 6 characters'
  })
];

// create a schema for our customers
var UserSchema = new mongoose.Schema({
  first_name: {type: String, required: true, validate: fnameValidator},
  last_name: {type: String, required: true, validate: lnameValidator},
  email: {type: String, required: true, unique: true, validate: emailValidator},
  password: {type: String, required: true, validate: passwordValidator},
  created_at: {type: Date, default: new Date}
})

// create the model using that schema
// console.log("just created the model")
mongoose.model('User', UserSchema)