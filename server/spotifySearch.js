const request = require('request');

var searchTracks = function(songName) {
  request(`https://api.spotify.com/v1/search?q=${songName}&type=track`, (error, response, body) => {
    var parsedBody = JSON.parse(body);

    if (parsedBody.tracks.items.length <= 0) {
      return null;
    }

    var tracks = parsedBody.tracks.items.map(track => {
      return {uri: track.uri};
    });
  });

  return tracks;
};

module.exports.searchForTrack = searchForTrack;
