// inject the ngRoute dependency in the module
var gifChat = angular.module('gifChat', ['ngRoute','door3.css']);
var socket = io.connect();