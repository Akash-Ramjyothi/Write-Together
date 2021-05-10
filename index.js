var express=require('express')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var chatHistory =[];
var chunk =5;

app.get('/', function(req, res){
  res.sendFile( path.join(__dirname,'/public','/index.html') );
});

app.use( express.static('public') );

io.on('connection', function(socket){
  console.log('a user connected');
  if(chatHistory.length > chunk){
  	var slicedArray = chatHistory.slice(chatHistory.length-chunk, chatHistory.length);
  	for(var i=0;i<slicedArray.length;i++){
  		socket.emit( "chat message from server", slicedArray[i] );
  	}
  }else{
	for(var i=0;i<chatHistory.length;i++){
  		socket.emit( "chat message from server", chatHistory[i] );
  	}
  }
  socket.on('chat message from client', function(data){
    console.log('message: ' + JSON.stringify( data ) );
    chatHistory.push(data);
    socket.broadcast.emit( "chat message from server", data );
  });

  socket.on("canvas data from client-mousedown",function(data){
    socket.broadcast.emit("canvas data from server-mousedown",data);
  });

    socket.on("canvas data from client-mousemove",function(data){
    socket.broadcast.emit("canvas data from server-mousemove",data);
  });

  socket.on("canvas data from client-mouseup",function(data){
    socket.broadcast.emit("canvas data from server-mouseup",{});
  });

});

http.listen(3000, function(){
  console.log('listening on localhost:3000');
});



