var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var db = require('./db');
var cors = require('cors');

var tweetsController = require('./controllers/tweetsController.js');

var app = express();

var server = http.createServer(app);

var io = require('socket.io').listen(server);

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

//set-up template engine
app.set('view engine','pug');

// serving static files
app.use(express.static('./public'));

//using cors to allow access from different domains. Required so that requests from mobile app could be handled.
app.use(cors());

//adding controllers
tweetsController(app, io);

//root route
app.get('/',function(req,res){
	res.redirect('/home');
});


//Connecting to MySQL database
db.connect(function(err){
	if (err){
		console.log("!! Unable to connect to database !!");
		process.exit(1);
	} else{
		console.log("connected to database successfully! Starting app!");
		server.listen(3000,function(){
		console.log('App running on port 3000');
	});
	//listen to port 3000
	}
}
);


//start listening for requests



