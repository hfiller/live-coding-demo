var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path'); 
var fs = require('fs');
var activeUsers = 0;
var ejs = require('ejs');
var port = 6113;

var codeId = 1;
var codeIterations = {};
app.get('/',function(req,res){
	res.sendFile(__dirname + '/public/index.html');
});
app.get('/:var',function(req,res){
	res.sendFile(__dirname + '/public/'+req.param('var'));
});
app.get('/view',function(req,res){
  res.sendFile(__dirname + '/public/view.html');
});
app.get('/view/',function(req,res){
	res.render(__dirname + '/public/view/index.ejs',{message:''});
});
app.get('/view/:var',function(req,res){
  if( typeof codeIterations[req.param('var')] == 'undefined'){
    res.render(__dirname + '/public/view/index.ejs',{message:''});
  } else {
    codeIterations[req.param('var')];
    res.render(__dirname + '/public/view/index.ejs', {message: text.join(' ') } );
  }
});
app.get('/js/:var',function(req,res){
  res.sendFile(__dirname + '/public/js/'+req.param('var'));
})
app.get('/js/:var/:var2',function(req,res){
  res.sendFile(__dirname + '/public/js/'+req.param('var')+'/'+req.param('var2'));
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

    socket.on('focus',function(id){
      io.emit('focus',id);
    });
    socket.on('compile',function(){
      codeIterations[codeId] = text.join(' ');
      io.emit('run',codeId);
      codeId++;
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