/*
Handles post requests, sends the information back to the server and receives it
*/

var table = $('#tweetsTable').DataTable();

$(document).ready(function(){

  $('form').on('submit', function(){

    $('#searchButton').button('loading');

    var json_data = {"players":players, "teams":teams, "authors":authors};

    var $selected_search = $('input[name="searchType"]:checked', '#tweetsForm');
    console.log("search_type: ",$selected_search.val());

    var $selected_operator = $('input[name="operator"]:checked', '#tweetsForm');
    console.log("operator: ",$selected_operator.val());

    json_data.search_type = $selected_search.val();
    json_data.operator = $selected_operator.val();

    $.ajax({
      type: 'POST',
      url: '/tweets',
      data: json_data,
        success: function(dataR){
          $('#searchButton').button('reset');
          $('#player_list, #team_list, #author_list').empty();
          players = [];
          teams = [];
          authors = [];

          //alert('success')
          var date = new Date();
          console.log("POST success recorded at: ",date.getTime());
          console.log("Server replied with success, reloading in 0.05s");
          //setTimeout(function(){location.reload()},50);
          console.log("data returned by the server: ",dataR);
          processData(dataR);
         
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
        $('#searchButton').button('reset');
          //$('#searchBtn').button('reset');
          console.log("Status: " + textStatus); console.log("Error: " + errorThrown);
          $('#alertsRow').append(
            '<div class="alert alert-danger alert-dismissable fade in">' +
                '<a class="close" href="#" data-dismiss="alert" aria-label="close">&times;</a>' +
                '<strong>Server Error! </strong>' + errorThrown +'. try again.'+
             '</div>');
        },
        timeout: 5000 // sets timeout to 3 seconds
      });
      return false;

  });

});

/*
  SERVER RESPONDS TO AJAX REQUEST AND RETURNS SOME DATA. DO WHATEVER THE FUCK IS NEEDED WITH IT HERE.
 */

function processData(data_in){

  if (!data_in){
    console.log("ERROR. null passed to processData::querySender.js");
    return;
  }
  /*
     STEP1 Update alert message at the top of the page.
   */
   var flash_msg = data_in.flash_msg;
   $('#alertsRow').html("").append(
        '<div class="alert alert-info alert-dismissable fade in">' +
            '<a class="close" href="#" data-dismiss="alert" aria-label="close">&times;</a>' +
            '<strong>Results! </strong>' + flash_msg +
         '</div>');

  /*
    STEP2 insert tweets to dataTable
   */
  var tweets = data_in.tweets;

  //clear table of previous search data
  console.log("clearing tweets dataTable");
  table.clear();

  if (tweets.length > 0){

    //show chart and tweets panels if there is any data to display
    $('#tweetsPanel').show();
    $('#chartPanel').show();

    //insert new data
    for (i = 0; i < tweets.length;i++){
      var val = tweets[i];
      var user_name = val.author_name;
      var user_handle = '@'+val.author_handle;
      var user_link = "<a href='https://twitter.com/"+val.author_handle+"'>(link)</a>";
      var author = user_name+'<br/>'+user_handle+'<br/>'+user_link;
      var tweet_text = val.tweet;
      var tweet_link = "<a href='https://twitter.com/"+val.author_handle+"/status/"+val.tweet_id+"'>(link)</a>";
      var tweet = tweet_text+'<br/>'+tweet_link;

      table.row.add([author,tweet,val.date]);
    }
    table.draw();

    /*
    STEP3, update frequency chart (plotTweets will take care of old data by itself)
    */
    plotTweets(data_in.tweets);
  }
  else {
    //hide chart and tweets panels if there is no data to display
    $('#tweetsPanel').hide();
    $('#chartPanel').hide();
  }

  //-didn't figure out how to stop socket.io listening 
  //-so instead displaying stream tweets only when the search type is both database and twitter
  if (data_in.search === 't_db'){

      var socket = io.connect('http://localhost:3000');
      socket.on('stream', function(tweet_object){
        $('#tweetsPanel').show();
        console.log(tweet_object);
        var user_name = tweet_object.author_name;
        var user_handle = '@'+tweet_object.author_handle;
        var user_link =  "<a href='https://twitter.com/"+tweet_object.author_handle+"'>(link)</a>";
        var author = user_name+'<br/>'+user_handle+'<br/>'+user_link;
        var tweet_text = tweet_object.text;
        var tweet_link = "<a href='https://twitter.com/"+tweet_object.author_handle+"/status/"+tweet_object.tweet_id+"'>(link)</a>";
        var tweet = tweet_text+'<br/>'+tweet_link;

        table.row.add([author,tweet,tweet_object.date]);
        table.draw();
      });
  }

  /*
    STEP4, add player info
   */

   //first, remove any existing data from previous searches:
  $('#playerInfoTable').find('tbody').html("");


  //second, add new info
  var players_info = data_in.player_info;
  console.log("players_info:",players_info);

  if (Object.keys(players_info).length > 0){
    $('#playerSummary').show();
    for (var name in players_info) {
      if (players_info.hasOwnProperty(name)) {
        // do stuff
        console.log("p_info: ",name," dob:",players_info[name].dob," position: ",players_info[name].position," team: ",players_info[name].team);
        $('#playerInfoTable').find('tbody').append('<tr>'+
                                                    '<td>'+name+'</td>'+
                                                    '<td>'+players_info[name].dob+'</td>'+
                                                    '<td>'+players_info[name].position+'</td>'+
                                                    '<td>'+players_info[name].team+'</td>'+
                                                    '</tr>');

      }
    }
  }
  else{
    $('#playerSummary').hide();
  }
}


