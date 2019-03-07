/*
Handles all interface functionality (JQUery)
*/

var players = [];
var teams = [];
var authors = [];

$(document).ready(function(){
    console.log("document is ready :: interface.js");

    //hides all panels when the page is first loaded or refreshed
    //in other words when there is no data to display
    $('#playerSummary').hide();
    $('#tweetsPanel').hide();
    $('#chartPanel').hide();

    //disables or enables players input 'add' button 
    //depending whether the player field input is empty
    $('#player').keyup(function(){
        var empty = false;
        if ($(this).val().length == 0){
            empty = true;
        }
        if (empty){
            $('#addName').prop('disabled', true);
        }
        else{
            $('#addName').prop('disabled', false);
        }
    });

    //disables or enables teams input 'add' button 
    //depending whether the teams field input is empty
    $('#team').keyup(function(){
        var empty = false;
        if ($(this).val().length == 0){
            empty = true;
        }
        if (empty){
            $('#addTeam').prop('disabled', true);
        }
        else{
            $('#addTeam').prop('disabled', false);
        }
    });

    //disables or enables authors input 'add' button
    //depending whether the author field input is empty
    $('#author').keyup(function(){
        var empty = false;
        if ($(this).val().length == 0){
            empty = true;
        }
        if (empty){
            $('#addAuthor').prop('disabled', true);
        }
        else{
            $('#addAuthor').prop('disabled', false);
        }
    });

    //adds the value found in player input field to the players list
    //and to the html list when 'add' button is clicked
    $("#addName").on('click', function() {
        var node = document.createElement("li");
        node.className = "liTag";
        var name = document.getElementById("player").name;
        var value = document.getElementById("player").value;
        console.log("inserting player name: ",value);
        players.push(value);
        var textnode=document.createTextNode(value);
        node.appendChild(textnode);
        document.getElementById("player_list").appendChild(node);
        $("#player").val('');
        $('#addName').prop('disabled', true);
    });

    //adds the value found in team input field to the teams list
    //and to the html list when 'add' button is clicked
    $("#addTeam").on('click',function() {
        var node = document.createElement("li");
        node.className = "liTag";
        var name = document.getElementById("team").name
        var value = document.getElementById("team").value;
        console.log("inserting team name: ",value);
        teams.push(value)
        var textnode=document.createTextNode(value);
        node.appendChild(textnode);
        document.getElementById("team_list").appendChild(node);
        $("#team").val('');
        $('#addTeam').prop('disabled', true);
    });

    //adds the value found in author input field to the authors list
    //and to the html list when 'add' button is clicked
    $("#addAuthor").on('click', function() {
        var node = document.createElement("li");
        node.className = "liTag";
        var name = document.getElementById("author").name
        var value = document.getElementById("author").value;
        console.log("inserting author name: ",value);
        authors.push(value)
        var textnode=document.createTextNode(value);
        node.appendChild(textnode);
        document.getElementById("author_list").appendChild(node);
        $("#author").val('');
        $('#addAuthor').prop('disabled', true);
    });

    //disables 'search' button if neither input field is filled
    //and enables it if one of the fields has a value
    $('#addAuthor, #addTeam, #addName, #player_list, #team_list, #author_list').on('click',function(){
        if (players.length == 0 && teams.length == 0 && authors.length == 0){
          $('#searchButton').prop('disabled', true);
        }
        else{
          $('#searchButton').prop('disabled', false);
        }
    });

    //deletes 'clicked' player from players list and html list
    $("#player_list").on('click','.liTag',function(){
        console.log("removing: "+$(this).text());
        $(this).remove();
        var player_index = $.inArray($(this).text(), players);
        if (player_index>=0){
            players.splice(player_index, 1);
            console.log("players list now: "+players);
        }
    });

    //deletes 'clicked' team  from players list and html list
    $("#team_list").on('click','.liTag',function(){
        $(this).remove();
        var team_index = $.inArray($(this).text(), teams);
        if (team_index>=0){
            teams.splice(team_index, 1);
            console.log("teams list now: "+teams);
        }
    });

    //deletes 'clicked' author from players list and html list
    $("#author_list").on('click','.liTag',function(){
        $(this).remove();
        var author_index = $.inArray($(this).text(), authors);
        if (author_index>=0){
            authors.splice(author_index, 1);
            console.log("authors list now: "+authors);
        }
    });

    //adding dataTables
    console.log("adding dataTables functionality.");
    $('#tweetsTable').DataTable();

});