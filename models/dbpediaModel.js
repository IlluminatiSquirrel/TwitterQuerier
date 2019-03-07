/*
Handles all DBpedia querying operations
*/

var SparqlClient = require('sparql-client');

/*player_list stores all players and their Twitter handles
that are from Manchester United FC and Chelsea FC*/
var player_list = {
  "@andrinhopereira" : "Andreas Hugo Hoelgebaum Pereira",
  "@fellaini" : "Marouane Fellaini-Bakkioui",
  "@jesselingard" : "Jesse Ellis Lingard",
  "@anderherrera" : "Ander Herrera Agüera",
  "@blinddaley" : "Daley Blind",
  "@f_andersoon" : "Felipe Anderson Pereira Gomes",
  "@PhilJones4" : "Philip Anthony Jones",
  "@tfosumensah" : "Evans Timothy Fosu Fosu-Mensah",
  "@memphis": "Memphis Depay",
  "@adnanjanuzaj" : "Adnan Januzaj",
  "@carras16" : "Michael Carrick",
  "@SchneiderlinMo4" : "Morgan Schneiderlin",
  "@bschweinsteiger" : "Bastian Schweinsteiger",
  "@anto_v25" : "Luis Antonio Valencia Mosquera",
  "@juanmata8" : "Juan Manuel Mata García",
  "@youngy18" : "Ashley Simon Young",
  "@elgatopereira1" : "Joel Dinis Castro Pereira",
  "@samjohnstone50" : "Samuel Luke Johnstone",
  "@D_DeGea" : "David de Gea Quintana",
  "@frans_hoek" : "Frans Hoek",
  "@LukeShaw23" : "Luke Paul Hoare Shaw",
  "@padmcnair" : "Patrick James Coleman McNair",
  "@sadiqelfitour" : "Sadiq El Fitouri",
  "@ChrisSmalling" : "Christopher Lloyd Smalling",
  "@marcosrojo5" : "Faustino Marcos Alberto Rojo",
  "@darmianofficial" : "Matteo Darmian",
  "@reganpoole" : "Regan Leslie Poole",
  "@guille_varela4" : "Guillermo Varela Olivera",
  "@AnthonyMartial" : "Anthony Joran Martial",
  "@marcusrashford" : "Marcus Rashford",
  "@waynerooney" : "Wayne Mark Rooney",
  "@_pedro17_" : "Pedro Eliezer Rodríguez Ledesma",
  "@willianborges88" : "Willian Borges da Silva",
  "@matic" : "Nemanja Matic",
  "@cesc4official" : "Francesc Fàbregas Soler",
  "@rubey_lcheek" : "Ruben Ira Loftus-Cheek",
  "@lremy18" : "Loïc Rémy",
  "@oscar8" : "Oscar dos Santos",
  "@houghton_j" : "Jordan Alexander Houghton",
  "@hazardeden10" : "Eden Michael Hazard",
  "@asmir1" : "Asmir Begovic",
  "@thibautcourtois" : "Thibaut Nicolas Marc Courtois",
  "@big_blacks" : "Jamal Clint-Ross Blackman",
  "@ameliagoalie" : "Marco Amelia",
  "@mitch_beeney1" : "Mitchell Ryan Beeney",
  "@kurtzouma" : "Kurt Happy Zouma",
  "@mattmiazga3" : "Matthew Miazga",
  "@cesarazpi" : "César Azpilicueta Tanco",
  "@garyjcahill" : "Gary James Cahill",
  "@falcao" : "Radamel Falcao García Zárate"
};

/*
queryDBpedia function queries DBpedia with 2 different queries
It returns all found information in the form of JSON object
*/
function queryDBpedia(callback){

	var endpoint = 'http://dbpedia.org/sparql';

	var client = new SparqlClient(endpoint);

	var query1, query2;
	var data;
	var all_players = {};

	//query1 represents all soccer players from Manchester United
	query1 = "SELECT * FROM <http://dbpedia.org> WHERE { \
		?player a <http://dbpedia.org/ontology/SoccerPlayer> . \
		?player <http://dbpedia.org/property/fullname> ?name . \
		?player <http://dbpedia.org/ontology/birthDate> ?birthDate . \
		?player <http://dbpedia.org/property/currentclub> <http://dbpedia.org/resource/Manchester_United_F.C.> . \
		?player <http://dbpedia.org/ontology/position> ?position .  \
		?position rdfs:label ?position_name . \
		FILTER (lang(?position_name)='en') \
		FILTER (lang(?name)='en')} \
		LIMIT 100";

	//query2 represents all soccer players from Chelsea	
	query2 = "SELECT * FROM <http://dbpedia.org> WHERE {?player a <http://dbpedia.org/ontology/SoccerPlayer> . \
		?player <http://dbpedia.org/property/fullname> ?name . \
		?player <http://dbpedia.org/ontology/birthDate> ?birthDate . \
		?player <http://dbpedia.org/property/currentclub> <http://dbpedia.org/resource/Chelsea_F.C.> . \
		?player <http://dbpedia.org/ontology/position> ?position . \
		?position rdfs:label ?position_name . \
		FILTER (lang(?position_name)='en') \
		FILTER (lang(?name)='en')} \
		LIMIT 100";

	/*
	This section is responsible for actually querying the DBpedia
	Because of 'callback hell' all functions are executed inside each other
	The final result is returned in a form of a callback
	*/

	//at first query1 is executed
	client.query(query1).execute(function (error, results) {        
		if (error){
			console.log('error querying the dbpedia (query1)');
			callback(error, null);  //if error happens returns the error and null results
		}
		else{
			//if no error is received retrieved results are passed to createPlayerObjects
			createPlayerObjects(results, 'Manchester United F.C.', all_players); 
			//then the query2 is executed 
			client.query(query2).execute(function (error, results) {
				if (error){
					console.log('error querying the dbpedia (query2)');
					callback(error, null);
				}
				else{
					//results retrieved by executing query2 are passed to createPlayerObjects as well
					createPlayerObjects(results, 'Chelsea F.C.' , all_players);
					//finaly, the functions returns a callback with null error and an array with all players
					callback(null, all_players);
				}
			});
		}	
	});
}

/*
createPlayerObjects creates an object for each player and stores them all in an array
*/
function createPlayerObjects(results, team_name, all_players){
	for (var index in results.results.bindings){
		player_object = {};
		var name = results.results.bindings[index].name.value;
		player_object['dob'] = results.results.bindings[index].birthDate.value;
		player_object['position'] = results.results.bindings[index].position_name.value;
		player_object['team'] = team_name;
		all_players[name] = player_object;
	}
}

/*
getInfo function given a list of Twitter handles returns respective player objects
this function is an export function as it is only used in tweetsController
*/
exports.getInfo = function(screen_names, callback){

	var player_names = [];
	for (var index in screen_names){
		var name = player_list[screen_names[index]];
		if (name != null){
			player_names.push(name);
		}
	}
	
	var info = {};
	if (player_names != null){
		queryDBpedia(function(error, result){
			if (error){
				callback(error, null);
			}
			else{
				for (var index in player_names){
					//checking if player object is not undefined
					if(result[player_names[index]] != null){
						info[player_names[index]] = result[player_names[index]];
					}
				}
				callback(null, info);
			}
		});
	}
};


