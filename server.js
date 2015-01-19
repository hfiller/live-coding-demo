var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path'); 
var fs = require('fs');
var activeUsers = 0;
var port = 6113;

app.get('/',function(req,res){
	res.sendFile(__dirname + '/public/index.html');
});
app.get('/:var',function(req,res){
	res.sendFile(__dirname + '/public/'+req.param('var'));
});
app.get('/view',function(req,res){
	res.sendFile(__dirname + '/public/view/index.html');
})
app.get('/js/:var',function(req,res){
  res.sendFile(__dirname + '/public/js/'+req.param('var'));
})
var text = [];
io.on('connection',function(socket){
	activeUsers++;
	console.log(activeUsers+' user connected');
	socket.emit('id',"test");
	socket.on('disconnect', function(){
		activeUsers--;
    	console.log('active users:' + activeUsers);
  	});
  	socket.on('update', function(msg){
  		console.log('message:' + "update:" +msg);
  		text[msg.split("_",1)[0]] = msg.slice(msg.indexOf('_') + 1);
  		console.log(text);
  		io.emit('update',msg);
  	});
  	socket.on('removeLine',function(index){
  		console.log('message:' + "removeLine:" +index);
  		if(text[index] != 'undefined' && index != -1) text.splice(index,1);
      io.emit('removeLine',index);
  	});
  	socket.on('addLine',function(index){
		console.log('message:' + "addLine:" +index);
    io.emit('addLine',index);
  		text.splice(index, 0, "");
      
  	})
  	socket.on('refresh',function(){
  		console.log('message:' +"refresh");
  		socket.emit('refresh_data',text);
  	})
});

//start server using config sendFile
fs.exists('config/config.js',function(exists){
	if(exists){
		port = require('./config/config').port;
	} else {
		port = 6113;
	}
	http.listen(port, function(){
		console.log('starting on port:'+port);
	})
});