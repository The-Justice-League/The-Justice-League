const express = require('express');
const db = require('./database');
const Promise = require('bluebird');
const request = require('request');

const serverPort = process.env.PORT || 4242;

const app = express();

app.use(express.static(`${__dirname}/../client`));
app.use(express.static(`${__dirname}/../node_modules`));

app.use('/test', (req, res) => {
  const message = `Server ${(db.connection.readyState === 1) ? 'is' : 'is NOT'} connected to the database.`;
  res.status(200).send(message);
});

// Query Spotify's Search API for a track name, and return an array of all matching tracks. Each track in the response will
// be an object with properties uri and artist name.
app.get('/tracks', (req, res) => {
  const query = req.query.trackName; // name me trackName in the client

  let tracks;

  request(`https://api.spotify.com/v1/search?q=${query}&type=track`, (error, response, body) => {
    const parsedBody = JSON.parse(body);

    if (parsedBody.tracks.items.length <= 0) {
      res.send([]);
      return;
    }

    tracks = parsedBody.tracks.items.map(track => {
      return {uri: track.uri, artist: track.artists[0].name};
    });
    console.log(tracks);
    res.send(tracks);
    return;
  });
});


app.listen = Promise.promisify(app.listen);
app.start = function() {
  app.listen(serverPort)
    .then(() => {
      console.log(`Tribal server is listening on port ${serverPort}.`);
    });
};

module.exports = app;
