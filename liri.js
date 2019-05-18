require("dotenv").config();

var $ = require('jquery');
var keys = require("./keys.js");
var moment = require('moment');
var Spotify = require('node-spotify-api');
var axios = require("axios");
var fs = require("fs");

var spotify = new Spotify(keys.spotify);

var command = process.argv[2];

function isEmptyObject(obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}

function work(command, arg) {
	if (command === "concert-this") {
		var i = 3;
		var artist = arg;
		if (artist.length === 0) {
			return console.log("Error: Please include your artist name.")
		} else if (artist.length > 1) {
			artist = artist.join("%20");
		} else {
			artist = artist[0];
		}

		var url = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";

		axios
		.get(url)
		.then(
			function (data) {
				if (isEmptyObject(data.data)) {
					console.log("Artist has no event");
				} else {
					data.data.forEach(function(value) {
						console.log("Name of venue: " + value.venue.name);
						console.log("Venue location: " + value.venue.city + ", " + value.venue.region);
						console.log("Date of the event: " + moment(value.datetime, "YYYY-MM-DD HH:mm:ss").format("MM/DD/YYYY"));
						console.log("**************************************");
					});
				}
			})
		.catch(function (error) {
			console.log(error.response.data.errorMessage);
		});

	} else if (command === "spotify-this-song") {
		var input = arg;
		if (input.length === 0){
			var song = "The Sign";
		} else if (input.length > 1) {
			var song = input.join(" ");
		} else {
			var song = input[0];
		}

		spotify
		.search({ type: 'track', query: song })
		.then(function(response) {
			var items = response.tracks.items;
			items.forEach(function(data) {
				var artists = [];
				for (var index in data.artists) {
					artists.push(data.artists[index].name);
				}

				if (artists.length > 1) {
					artists = artists.join(", ");
				} else {
					artists = artists[0];
				}

				if (input.length !== 0) {
					console.log("Name of the artist(s): " + artists);
					console.log("Song's name: " + data.name);
					console.log("Link to the Spotify: " + data.external_urls.spotify);
					console.log("Album to the song: " + data.album.name);
					console.log("**************************************");
				} else {
					if (artists === "Ace of Base" && data.name === "The Sign") {
						console.log("Name of the artist(s): " + artists);
						console.log("Song's name: " + data.name);
						console.log("Link to the Spotify: " + data.external_urls.spotify);
						console.log("Album to the song: " + data.album.name);
						console.log("**************************************");
					}
				}
			});
		})
		.catch(function(err) {
			console.log(err);
		});

	} else if (command === "movie-this") {
		var input = arg;
		if (input.length === 0){
			var movie = "i=tt0485947";
		} else if (input.length > 1) {
			var movie = "t=";
			movie += input.join("+");
		} else {
			var movie = "t=" + input[0];
		}

		var url = "http://www.omdbapi.com/?apikey=trilogy&" + movie;

		axios
		.get(url)
		.then(
			function (data) {
				if (data.data.Response === "False") {
					console.log(data.data.Error);
				} else {
					console.log("Title of the movie: " + data.data.Title);
					console.log("Year of the movie: " + data.data.Year);
					console.log("IMDB rating of the movie: " + data.data.imdbRating);

					data.data.Ratings.forEach(function(response) {
						if (response.Source === "Rotten Tomatoes") {
							console.log("Rotten Tomatoes rating of the movie: " + response.Value);
						}
					});

					console.log("Country where the movie was produced: " + data.data.Country);
					console.log("Language(s) of the movie: " + data.data.Language);
					console.log("Plot of the movie: " + data.data.Plot);
					console.log("Actors of the movie: " + data.data.Actors);
				}
			})
		.catch(function (error) {
			console.log(error.response.data.errorMessage);
		});
	}
} 

var log = "";

for (var i = 2; i < process.argv.length; i++) {
	log = log + process.argv[i] + " ";
}

if (command === "concert-this" || command === "spotify-this-song" || command === "movie-this") {
	work(command, process.argv.splice(3, process.argv.length - 1));
} else if (command === "do-what-it-says") {
	fs.readFile("random.txt", "utf8", function(error, data) {

		if (error) {
			return console.log(error);
		}

		var dataArr = data.split(",");

		// We will then re-display the content as an array for later use.
		work(dataArr[0], dataArr[1].split('"')[1].split(" "));

	});
} else {
	return console.log("Please input correct command (concert-this, spotify-this-song, movie-this, do-what-it-says)");
}


fs.appendFile("log.txt", (log + " \n"), function(err) {

	// If an error was experienced we will log it.
	if (err) {
		console.log(err);
	}

	// If no error is experienced, we'll log the phrase "Content Added" to our node console.
	else {
		console.log("Command logged!");
	}

});