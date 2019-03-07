console.log("Initalizing database connector");

var mysql = require('mysql');

var pool = null;


//done - callback when connecting finished
exports.connect = function(done){
	console.log("initializing mySQL connection pool");
	pool = mysql.createPool({
		  host     : 'stusql.dcs.shef.ac.uk',
  		  user     : 'team086',
          password : '1ebdea93',
          database : 'team086'
	});
	done();
};

exports.get = function(){
	return pool;
};
