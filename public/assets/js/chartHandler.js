console.log("loading chartHandler.js");


//Some variables in global scope
var tweetsChart;
var chartNotice = $('#chartNotice');
chartNotice.html("no data.");


/**
 * plotTweets function plots a frequency chart over last week, given a set of tweets.
 * @param tweets a set of tweets (usually retrieved from a server).
 */
function plotTweets(tweets){

    //first lets check if data passed is correct
    if (!tweets || tweets.length === 0){
        console.log("hidding the chart, ",$("#tweetsChart"));
        $("#tweetsChart").addClass("hidden");
        chartNotice.html("to plot a chart some data would be nice.");

       return;
    }

    //then, lets produce some labels for a week . yay
    var labels = [];

    var temp_date = new Date();
    //lets fix the datetime offset
    temp_date.setTime( temp_date.getTime() - new Date().getTimezoneOffset()*60*1000 );

    //add labels for a week to labels array
    labels.unshift(getDateString(temp_date));
    for (i = 1; i < 7;i++)
    {
        temp_date = new Date(temp_date.getTime()-(24*60*60*1000));
        //console.log("today -",i," : ",getDateString(temp_date));
        labels.unshift(getDateString(temp_date));
    }


    //now, lets calculate frequencies of tweets.
    var frequencies = [0,0,0,0,0,0,0];

    for (i = 0; i < tweets.length;i++){
        for (j = 0; j<labels.length;j++){
            var short_date = getShortDateString(tweets[i].date);
            //console.log("comparing: '",short_date,"' with '",labels[j],"'",(short_date === labels[j]));
            if (short_date === labels[j]){
                frequencies[j] += 1;
                break;
            }
        }
    }

    chartNotice.html("");
    drawChart(labels,frequencies);
}

/**
 * drawChart function renders a lien chart using given labels and dataset.
 * @param labels_in labels to use in chart.
 * @param data_in dataset to plot.
 */
function drawChart(labels_in,data_in) {

    var can_draw = true;
    var text_p;
    if (!labels_in.length > 0){
        text_p = document.getElementById("chartText");
        text_p.innerHTML = "";
        text_p.innerHTML = "ERROR: Chart cannot be displayed: NO LABELS!";
        text_p.innerHTML += "<br/>";
        can_draw = false;
    }
    if (!data_in.length > 0){
        text_p = document.getElementById("chartText");
        text_p.innerHTML += "ERROR: Chart cannot be displayed: NO DATA!";
        text_p.innerHTML += "<br/>";
        can_draw = false;
    }

    if (can_draw) {

        if (tweetsChart){
          console.log("destroying old chart object!");
          tweetsChart.destroy();
        }

        var ctx = $("#tweetsChart");
            $("#tweetsChart").removeClass("hidden");
            console.log(tweetsChart);
            tweetsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels_in,
                    datasets: [{
                        label: '# of Tweets',
                        fill: true,
                        data: data_in,
                        backgroundColor: 'rgba(75,192,192,0.5)',
                        borderColor: 'rgba(75,192,192,1)',
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        borderWidth: 1,
                        pointBorderColor: 'rgba(75,192,192,1)',
                        pointBackgroundColor: '#fff',
                        pointBorderWidth: 1,
                        pointHoverRadius: 10,
                        pointRadius: 5,
                        pointHitRadius: 10
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
    }
}

/*HELPER FUNCTION - JSUT GET YEAR-MONTH-DAY FROM DATE OBJECT*/
function getDateString(date){
    return date.toISOString().substring(0, 10).replace('T', ' ');
}

/*HELPER TRIM STRING DATE*/

function getShortDateString(date){
    return date.substring(0,10);
}




