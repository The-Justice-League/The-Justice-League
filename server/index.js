var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8742;
var request = require('request');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  // socket.on('chat message', function(msg){
  //   io.emit('chat message', msg);
  // });

  // add a song to the playlist
  socket.on('add song', function(uri) { // listen for when a client emits an 'add song' event
    io.emit('add song', uri);

    /*
    query the db to check the current playlist the user is in
    push the new uri into the songs array
    save the playlist
    */
    Playlist.find({}, function(err, playlists) {
      playlists[0].songs.push({uri: uri});   // assuming there is only one playlist
      playlists[0].save();
    });
  });
});



app.get('/songs', function (req, res) { // test it out on postman
  var artistName = req.query.artistName;

  Artist.findOne({ artistName: artistName }, (err, artist) => {
    if (err) {
      console.log('There was an error: ', err);
    } else if (artist === null) {

      request(`https://api.spotify.com/v1/search?q=${artistName}&type=artist`, function(error, response, body) {
        var parsedbody = JSON.parse(body);

        if (parsedbody.artists.items.length <= 0) {
          res.send({artistName: artistName, songs: []});
          return;
        }

        var artistId = parsedbody.artists.items[0].id;

        request(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=us`, function(error, response, body) {
          var parsedbody = JSON.parse(body);

          var songs = parsedbody.tracks.map(function(track) {
            return {songName: track.name, uri: track.uri};
          });

          res.send({artistName, songs});

          var artists = [{ artistName: artistName, songs: songs }];

          Artist.insertMany(artists);
        });
      });
    } else {
      res.send(artist.songs);
    }
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});