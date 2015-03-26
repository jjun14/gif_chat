document.addEventListener("DOMContentLoaded", function() { 
  'use strict';

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  var constraints = {audio: true, video: true};
  var video = document.querySelector('localVideo');

  function successCallback(stream) {
    window.stream = stream; // stream available to console
    if (window.URL) {
      video.src = window.URL.createObjectURL(stream);
    } else {
      video.src = stream;
    }
  }

  function errorCallback(error){
    console.log('navigator.getUserMedia error: ', error);
  }

  navigator.getUserMedia(constraints, successCallback, errorCallback);

});