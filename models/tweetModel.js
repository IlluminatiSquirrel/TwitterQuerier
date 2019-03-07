var db = require('../db');

/**
 * create function adds tweet to mySQl database. It uses some strategy to avoid duplicate entries.
 * First it looks up database for a tweet to be isnerted. If the tweet is not already in a databse, adds it using insertTweet function.
 * If tweet is already in a database, returns -1 to caller.
 * @param tweet tweet to add
 * @param query query using which the tweet was retrieved from twitter
 * @param done callback function is called when process of ading tweet to database finishes
 */
exports.create = function(tweet,query,done){

	searchByIdStr(tweet.id_str,function(err,result){
	   if (err){
	      console.log("ERROR! searching for tweet by id_str failed!");
	   }
	   else{
	   //console.log("result: "+result);
	    db_results_count = result.length;
	    if (db_results_count > 0){
	        console.log("tweet with this id_str already exists: ",tweet.id_str);
	        done(null,-1,tweet);
	    }
	    if (db_results_count === 0){
	        insertTweet(tweet,query,done);
	    }
	   }
	});

};

/**
 * searchbyQuery function finds tweets in database that where retrieved from twitter using specified query
 * @param query query to look for in database
 * @param done callback function. called when looking up database finishes
 */
exports.searchByQuery = function(query,done){

	console.log("Searching for query",query," in tweets_table");

	var conn = db.get();

	query_string ="SELECT * FROM tweets_table WHERE search_query = ? ORDER BY tweet_datetime DESC;";
	conn.query(query_string,[query],function (err, results) {
		if (err){
    		done(err,null);
 		}
 		else{
 			done(null, results);	
 		}
	});
};

/**
 * searchByIdStr function looks for a tweet in the databse using its id_str field.
 * @param id_in  tweet's id_str to look for
 * @param done callback function. called when looking for tweet finishes
 */
searchByIdStr = function(id_in,done){
    console.log("searching for tweet with id_str: ",id_in);

    var conn = db.get();
    query_string ="SELECT * FROM tweets_table WHERE id_str = ? ORDER BY tweet_datetime DESC;";
    conn.query(query_string,[id_in],function (err, results) {
		if (err){
    		done(err,null);
 		}
 		else{
 			done(null, results);
 		}
	});

};

/**
 * insertTweet function inserts given tweet to database.
 * @param tweet tweet to insert to database
 * @param query query using which the tweet was retrieved from twitter
 * @param done callback function. called when inserting tweet completes.
 */
insertTweet = function(tweet,query,done){
var datetime = new Date(Date.parse(tweet.created_at.replace(/( \+)/, ' UTC$1')));
	var mysqlDate  = datetime.toISOString().substring(0, 19).replace('T', ' ');

	values = [tweet.id_str,mysqlDate,tweet.user.screen_name,tweet.text,query];

	//console.log("VALUES PREPEARED FOR INSERTION: ",values);
	query_string ='INSERT INTO tweets_table (id_str,tweet_datetime,tweet_author,tweet_text,search_query,created_at,updated_at) VALUES(?,?,?,?,?,null,null)';
	db.get().query(query_string, values, function(err, result) {

    if (err){
    	console.log(err);
    	done(err,null,tweet);
    }
    else{
        done(null, result.insertId,tweet);
	}
  });
};



