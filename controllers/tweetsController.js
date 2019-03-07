var tweetModel = require('../models/tweetModel');
var dbpedia = require('../models/dbpediaModel');

var Twit = require('twit');

var client = new Twit({
  consumer_key: '4iq6bB6tZqZmY874MStrh2KDj',
  consumer_secret: 'WgN4vpN3QPCzNLv3CAeSZGbiYjpetGV41DNI6mZLRzrg7TEsOr',
  access_token: '266045339-yPAZeq5TIQkdCPZKL42x00sMPphf2ECFeOx4RKvW',
  access_token_secret: 'sMRWC0tcpMKmjvg9td7A7XUqnhxQnf8qzZRQLVDsfpRp9'
});

module.exports = function(app, io){

    /**
     * handle GET reguest to '/home'
     */
    app.get('/home',function(req,res){
		console.log("== GET "+req.url+"   :: tweetsController");
	  res.render('tweets');
	  console.log("----------------");
	});

    /**
     * Handle POST request to '/tweets'
     */
    app.post('/tweets', function(req,res){

		var tweets = [];
        var flash_msg = "";
        var search_type = "";
        var player_info = {};
	
		console.log("== POST "+req.url+"   :: tweetsController");

		//all the keywords for filtering tweets to find tweets about football transfers
		keywords = ['move', 'leave', 'stay', 'transfer', 'join', 'moving', 'leaving', 'staying', 'transfering', 'joining', 'contract', 'offer', 'sign'];
			
		var transfer_tweet_found;

		//creates a date using current date to be used in twitter query
		//if no date is returned from the database
		var today = new Date();
		var week_ago = new Date(today.getTime() - (28*24*60*60*1000));
		var since_date = week_ago.getFullYear()+'-'+0+(week_ago.getMonth()+1)+'-'+week_ago.getDate();

		//gets information from the posted form
        var players = req.body["players"];
        var teams = req.body["teams"];
        var authors = req.body["authors"];
        var operator_type = req.body["operator"];
        console.log(operator_type);

        search_type = req.body["search_type"];

        final_query = [];
        track_list = [];

        //if at least one player term was input
        if (players != null){
            var modified_players = [];

            //modifies each player term by adding quatation marks
            //adds them to the modified players list
            for (var player in players){
                modified_players.push('"'+players[player]+'"');
              track_list.push(players[player]);
            }

            //all modified players are joined with 'OR' and added to the final query
            final_query.push(modified_players.join(" OR "));

            //dbpedia is queried here by passing players list
            dbpedia.getInfo(players, function(error, result){
                if (error){
                    console.log('could not retrieve information from dbpedia');
                }
                else{
                    player_info = result;
                        console.log(result);
                }
          });
        }

        //if at least one team term was input
        if (teams != null){
            var modified_teams = [];

            //modifies each team term by adding quatation marks
            //adds them to the modified teams list
            for (var team in teams){
                modified_teams.push('"'+teams[team]+'"');
              track_list.push(teams[team]);
            }

            //all modified teams are joined with 'OR' and added to the final query
            final_query.push(modified_teams.join(" OR "));
        }

        //if at least one team term was input
        if (authors != null){
            var modified_authors = [];

            //modifies each author term by adding quatation marks
            //adds them to the modified author list
            for (var author in authors){
                modified_authors.push('from:'+authors[author]);
              track_list.push(authors[author]);
            }

            //all modified authors are joined with 'OR' and added to the final query
            final_query.push(modified_authors.join(" OR "));
        }

        //player list, team list, and author list are joined
        //by logic operator chosen by the user
        if (operator_type === 'AND'){
            final_query = final_query.join(' AND ');
        }
        else{
            final_query = final_query.join(' OR ');
        }

        //variables to indicate whether certain keywords have been found in a tweet
        var player_found;
        var team_found;
        var correct_author;

            //connects to the socket.io
        io.sockets.on('connection', function(socket){
              var stream = client.stream('statuses/filter', {track: track_list});

              //streaming api
              stream.on('tweet', function(tweet){

                transfer_tweet_found = false;
                player_found = false;
                team_found =  false;
                correct_author = false;

                //checks if any of the football transfer keywords are present in the tweet
                //sets transfer_tweet variable to true if found
                for (var k_index in keywords){
                  if (tweet.text.indexOf(keywords[k_index]) >= 0){
                    transfer_tweet_found = true;
                    break;
                  }
                }

            //if transfer tweet was found...
            if (transfer_tweet_found){

                //checks if any of the author terms is an author of the tweet
                //sets correct_author variable to true if found, false otherwise
                    if (authors != null){
                        for (a_index in authors){
                            if(tweet.user.screen_name === authors[a_index].replace('@', '')){
                                correct_author = true;
                            }
                        }
                    }
                    //if authors list is null set correct_author to true
                    //as to make it easier later
                    else{
                        correct_author = true;
                    }

                    //checks if any of the player terms is present in the tweet
                //sets player_found variable to true if found, false otherwise
                    if (players != null){
                        for (p_index in players){
                            if (tweet.text.indexOf(players[p_index]) >= 0){
                                player_found = true;
                            }
                        }
                    }
                    //if players list is null set player_found to true
                    //as to make it easier later
                    else{
                        player_found = true;
                    }

                    //checks if any of the teams terms is present in the tweet
                //sets team_found variable to true if found, false otherwise
                    if (teams != null){
                        for (t_index in teams){
                            if (tweet.text.indexOf(teams[t_index]) >= 0){
                                team_found = true;
                            }
                        }
                    }
                    //if teams list is null set team_found to true
                    //as to make it easier later
                    else{
                        team_found = true;
                    }

                    //if chosen logic operator is 'AND' all three variables have to be true
                if (operator_type === 'AND'){

                    //if all three categories are found emit the tweet's relevant information
                    if (player_found && team_found && correct_author){
                        console.log('transfer tweet found(STREAMING API) (AND)');

                        //converts the date to match the format of tweets coming from the database
                        var datetime = new Date(Date.parse(tweet.created_at.replace(/( \+)/, ' UTC$1')));
                    var date_string = datetime.toISOString().substring(0, 19).replace('T', ' ');

                    //stores needed informationa bit tweet in a JSON object and emits it
                        var tweet = {text: tweet.text, author_name: tweet.user.name, author_handle: tweet.user.screen_name, date: date_string, tweet_id: tweet.id_str};
                        io.sockets.emit('stream',tweet);
                    }

                    //if all three categories are not found the tweet cannot be emmited
                    else{
                        console.log('transfer tweet found(STREAMING API) (AND) but without all query words');
                    }
                }
                else{
                        console.log('transfer tweet found(STREAMING API) (OR)');
                        var datetime = new Date(Date.parse(tweet.created_at.replace(/( \+)/, ' UTC$1')));
                        var date_string = datetime.toISOString().substring(0, 19).replace('T', ' ');

                        //stores needed informationa bit tweet in a JSON object and emits it
                        var tweet = {text: tweet.text, author_name: tweet.user.name, author_handle: tweet.user.screen_name, date: date_string, tweet_id: tweet.id_str, query: final_query};
                        io.sockets.emit('stream',tweet);
                }
              }
          });
        });

        /**
         * seachDatabase function looks for tweets asociated with specific query in the database.
         * @param query
         */
        function searchDatabase(query){
            var db_results_count = 0;
            //perform a search in the database by Query and handle the results
            tweetModel.searchByQuery(query,function(err,results){
                if (err){
                    console.log("ERROR: Search in databse failed!");
                }else{
                    db_results_count = results.length;
                    //console.log("results: ",results);
                    if (results.length > 0){

                        //by default reads time from databse off by one hour. need these two lines to fix it.
                        d = new Date(results[0].tweet_datetime);
                        d.setTime( d.getTime() - new Date().getTimezoneOffset()*60*1000 );

                        //get the date of latest tweet associated with specified query
                        latest_date =d.toISOString().substring(0, 19).replace('T', ' ').split(" ")[0];

                        //console.log("latest date in database: ",latest_date);
                        since_date = latest_date; //updating search date
                        for (var i = 0; i < results.length;i++){
                            //console.log("inserting tweet ",i);
                            d = new Date(results[i].tweet_datetime) ;
                                d.setTime( d.getTime() - new Date().getTimezoneOffset()*60*1000 );
                                date_string = d.toISOString().substring(0, 19).replace('T', ' ');
                            tweets.push({tweet: results[i].tweet_text, author_name:results[i].tweet_author, author_handle: results[i].tweet_author, date: date_string, tweet_id: results[i].id_str, query: final_query});
                            //console.log("finished inserting tweet ",i);
                        }
                        //console.log("Database results pushed to data list.");
                    }
                    else{
                        //"Database search returned no results." Might want to do something about it here.
                    }

                    if (search_type === "db"){
                        //Twitter search was turned off in GUI, finish request handling and sent the results.
                        flash_msg = "Search completed. Database results: "+db_results_count;
                        endPOST();
                    }
                    else if (search_type === "t_db"){
                        //Twitter search was on in GUI, perform twitter search now.
                        searchTwitter(query,since_date,db_results_count)
                    }
                }
            });
        }

        /**
         * searchTwitter function queries Twitter and searches for tweets about tranfers in results. IF any are found, theyre shipped to the client.
         * @param query
         * @param date_in
         * @param db_results_count
         */
         function searchTwitter(query,date_in,db_results_count){

            if (date_in){
                console.log("date_in: ",date_in);
            }
            else{
                console.log("'since' date not provided!");
            }

            client.get('search/tweets', { q: (query+' since:'+since_date), count: 100}, function(err, data, response) {
                console.log("twitter query: ",(query+' since:'+since_date));

                if (err){
                    console.log('Error received. Twitter search failed');
                }
                else if (response.statusCode === 200) {

                var twitter_results_count = 0;
                //iterate over twitter results and see if any tweets are about transfers. If so, prepare them for shipping to the client.
                for (var index in data.statuses) {
                  var tweet= data.statuses[index];
                  //console.log(tweet.text);
                  for (var k_index in keywords){
                    if (tweet.text.indexOf(keywords[k_index]) >= 0){

                        //tweet is detected to be about transfers add for the client.
                        console.log('transfer tweet found (REST API)  id_str:',tweet.id_str,'  author: ',tweet.user.screen_name);
                        var already_in = false;

                        //check if tweet is not already added.
                        for (i = 0; i < tweets.length;i++){
                            if (tweets[i].tweet_id === tweet.id_str){
                                already_in = true;
                            }
                        }

                        //only add tweet for sending to client if it is not already added.
                        if (already_in === false){
                            console.log("tweet is not prepared for shipping. preparing.");
                            twitter_results_count += 1;
                            var datetime = new Date(Date.parse(tweet.created_at.replace(/( \+)/, ' UTC$1')));
                            var date_string = datetime.toISOString().substring(0, 19).replace('T', ' ');
                            console.log("found tweet: ",tweet.text);
                            tweets.push({tweet: tweet.text, author_name:tweet.user.name, author_handle: tweet.user.screen_name, date: date_string, tweet_id: tweet.id_str, query: final_query});
                        }

                      //try to create new tweet in the MySQl database
                      tweetModel.create(tweet,query,function(err,result,tweet){
                        if (err){
                            console.log("ERROR! inserting tweet to database failed!");
                        }
                        else{
                            //tweet inserted successfully. Do Nothing. Might want to do something here with the result.
                        }
                      });
                      break;
                    }
                  }
                }
                    //add a message for the client.
                    flash_msg = "Search completed. Database results: "+db_results_count+" Twitter results: "+twitter_results_count;

                    //finish the request handling and send resutls to client.
                    endPOST();
                }
                else {
                    console.log("Something went wrong. Twitter http status code received: ", response.statusCode);
                }
            });
		}

        /**
         * endPOST is called when request handling is finished and results are ready to be shipped back to client.
         */
		function endPOST(){
			var endtime = new Date();
			console.log("ending POST request at:",endtime.getTime());

			//construct a json object to send for sending back to client.
			var returnObj = {
			  tweets: tweets,
			  flash_msg: flash_msg,
			  search: search_type,
			  player_info: player_info
			};

            //as a response send a json object containing tweets and other information
			res.json(returnObj);
		}

        //start the hunt for tweets
		searchDatabase(final_query);
	});
};