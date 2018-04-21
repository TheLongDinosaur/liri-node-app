
// set variables to reference neccessary packages/external resources
var fs = require('fs');
var dotenv = require('dotenv').config();
var request = require('request');
var keys = require('./keys.js')
var Spotify = require('node-spotify-api');
// kept producing error, so inactivated until I can fix: var Twitter = require("twitter");

// takes command from terminal
var command = process.argv[2];
var searchValue = "";

// configures search value as single string
for (var i = 3; i < process.argv.length; i++) {
    searchValue += process.argv[i] + " ";
};

// error function
function errorFunction(respError) {
    if (respError) {
        return console.log("Error occured: ", respError);
     }
};

// bonus: logs to log.txt
function errorFunctionStart (respError) {
    errorFunction();
    console.log("\nxxx Log Started xxx");
};

function errorFunctionEnd (respError) {
    errorFunction();
    console.log("xxx Log Ended xxx");
};

// retrieves tweets
function getTweets() {

    // accesses Twitter Keys
    var client = new Twitter(keys.twitter); 
    var params = {
        screen_name: 'LongDino',
        count: 20
        };

    client.get('statuses/user_timeline', params, function(respError, tweets, response) {

        errorFunction();

        fs.appendFile("log.txt", "+++ Tweets Log Entry Start +++\n \nProcessed at: \n" + Date() + "\n\n" + "terminal commands: \n" + process.argv + "\n\n" + "Data Output: \n\n", errorFunctionStart());

        console.log("\n+++++++++ Latest Tweets from LongDino +++++++++\n");

        for (i = 0; i < tweets.length; i++) {
            console.log(i + 1 + ". Tweet: ", tweets[i].text);

            // for alignment once number of tweets exceeds 10
            if (i + 1 > 9) {
                console.log("    Tweeted on: ", tweets[i].created_at + "\n");
            } else {
                console.log("   Tweeted on: ", tweets[i].created_at + "\n");
            }  
            
            fs.appendFile("log.txt", (i + 1) + ". Tweet: " + tweets[i].text + "\nTweeted on: " + tweets[i].created_at + "\n\n", errorFunction());
        };

        console.log("+++++++++++++++++++++++++++++++++++++++++++++\n");

        fs.appendFile("log.txt", "+++++++++ Tweets Log Entry End +++++++++\n\n", errorFunctionEnd());
    });
};

// searches for song
function searchSong(searchValue) {

    // default search value if no song title is entered
    if (searchValue == "") {
        searchValue = "The Sign Ace of Base";
    }

    // access Spotify keys  
    var spotify = new Spotify(keys.spotify);

    var searchLimit = "";

    // allows input of desired number of returned Spotify results, if no value is entered only one song will be returned
    if (isNaN(parseInt(process.argv[3])) == false) {
        searchLimit = process.argv[3];

        console.log("\nYou requested to return: " + searchLimit + " songs");
        
        // resets searchValue to account for searchLimit
        searchValue = "";
        for (var i = 4; i < process.argv.length; i++) {        
            searchValue += process.argv[i] + " ";
        };

    } else {
        console.log("\nSorry. No song title was entered. If you wish to return more than one result, add the number of results you would like to be returned after spotify-this-song.\n \nExample: To return three results, enter:\nnode.js spotify-this-song 5 Time of My Life")
        searchLimit = 1;
    }
   
    // search Spotify for the title entered
    spotify.search({ type: 'track', query: searchValue, limit: searchLimit }, function(respError, response) {

        fs.appendFile("log.txt", "+++++++++ Spotify Log Entry Start +++++++++\nProcessed on: \n" + Date() + "\n\n" + "terminal commands: \n" + process.argv + "\n\n" + "Data Output: \n", errorFunctionStart());

        errorFunction();

        var songResp = response.tracks.items;

        for (var i = 0; i < songResp.length; i++) {
            console.log("\n+++++++++ Spotify Search Result "+ (i+1) +" +++++++++\n");
            console.log(("Artist: " + songResp[i].artists[0].name));
            console.log(("Song title: " + songResp[i].name));
            console.log(("Album name: " + songResp[i].album.name));
            console.log(("URL Preview: " + songResp[i].preview_url));
            console.log("\n+++++++++++++++++++++++++++++++++++++++++++++\n");

            fs.appendFile("log.txt", "\n+++++++++ Result "+ (i+1) +" +++++++++\nArtist: " + songResp[i].artists[0].name + "\nSong title: " + songResp[i].name + "\nAlbum name: " + songResp[i].album.name + "\nURL Preview: " + songResp[i].preview_url + "\n+++++++++++++++++++++++++++\n", errorFunction());
        }

        fs.appendFile("log.txt","+++++++++ Spotify Log Entry End +++++++++\n\n", errorFunctionEnd());
    })
};

// search OMDB
function searchMovie(searchValue) {

    // default value if no movie title is entered
    if (searchValue == "") {
        searchValue = "Mr. Nobody";
    }

    var queryUrl = "http://www.omdbapi.com/?t=" + searchValue.trim() + "&y=&plot=short&apikey=trilogy";

    request(queryUrl, function(respError, response, body) {

        fs.appendFile("log.txt", "+++++++++ OMDB Log Entry Start +++++++++\n \nProcessed on: \n" + Date() + "\n\n" + "terminal commands: \n" + process.argv + "\n\n" + "Data Output: \n\n", errorFunctionStart());

        errorFunction();

        if (JSON.parse(body).Error == 'Movie not found!' ) {

            console.log("\nSorry. I could not find any movies matching the title you entered, " + searchValue + ". Please check your spelling and try again.\n")

            fs.appendFile("log.txt", "Sorry. I could not find any movies matching the title you entered, " + searchValue + ". Please check your spelling and try again.\n\n+++++++++ OMDB Log Entry End +++++++++\n\n", errorFunctionEnd());
        
        } else {

            movieBody = JSON.parse(body);

            console.log("\n+++++++++ OMDB Search Results +++++++++\n");
            console.log("Movie Title: " + movieBody.Title);
            console.log("Year: " + movieBody.Year);
            console.log("IMDB rating: " + movieBody.imdbRating);

            // if a Rotten Tomatoes Rating is not available
            if (movieBody.Ratings.length < 2) {

                console.log("This movie is not currently rated on Rotten Tomatoes.")

                fs.appendFile("log.txt", "Movie Title: " + movieBody.Title + "\nYear: " + movieBody.Year + "\nIMDB rating: " + movieBody.imdbRating + "\nRotten Tomatoes Rating: There is no Rotten Tomatoes Rating for this movie \nCountry: " + movieBody.Country + "\nLanguage: " + movieBody.Language + "\nPlot: " + movieBody.Plot + "\nActors: " + movieBody.Actors + "\n\n+++++++++ OMDB Log Entry End +++++++++\n\n", errorFunction());
                
            } else {

                console.log("Rotten Tomatoes Rating: " + movieBody.Ratings[[1]].Value);

                fs.appendFile("log.txt", "Movie Title: " + movieBody.Title + "\nYear: " + movieBody.Year + "\nIMDB rating: " + movieBody.imdbRating + "\nRotten Tomatoes Rating: " + movieBody.Ratings[[1]].Value + "\nCountry: " + movieBody.Country + "\nLanguage: " + movieBody.Language + "\nPlot: " + movieBody.Plot + "\nActors: " + movieBody.Actors + "\n\n+++++++++ OMDB Log Entry End +++++++++\n\n", errorFunction());
            }
            
            console.log("Country: " + movieBody.Country);
            console.log("Language: " + movieBody.Language);
            console.log("Plot: " + movieBody.Plot);
            console.log("Actors: " + movieBody.Actors);
            console.log("\n+++++++++++++++++++++++++++++++++++++++++++++\n");
            console.log("xxx Log Ended xxx");
        };      
    });
};

// do-what-it-says function
function randomSearch() {

    fs.readFile("random.txt", "utf8", function(respError, data) {

        var randomArray = data.split(", ");

        errorFunction();

        if (randomArray[0] == "spotify-this-song") {
            searchSong(randomArray[1]);
        } else if (randomArray[0] == "movie-this") {
            searchMovie(randomArray[1]);
        } else {
            getTweets();
        }
    });
};

// runs function based on command
switch (command) {
    case "my-tweets":
        getTweets();
        break;
    case "spotify-this-song":
        searchSong(searchValue);
        break;
    case "movie-this":
        searchMovie(searchValue);
        break;
    case "do-what-it-says":
        randomSearch();
        break;
    default:
        console.log("\nSorry. I do not understand that command. Please try entering one of the following commands instead:\n \n1. To see LongDino's 20 latest Twitter tweets: node liri.js my-tweets \n2. To search Spotify for a song: node liri.js spotify-this-song <quantity of desired results (optional)> <song title> \nExample: node liri.js spotify-this-song 15 Candle in the Wind \n3. To search for a movie title: node liri.js movie-this <movie title> \n4. To conduct a random search: node liri.js do-what-it-says\n");
};
