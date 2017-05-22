const express = require('express');
const db = require('./database');
const Promise = require('bluebird');
const request = require('request');
const mongoose = require('mongoose');
const passport = require('passport');
//const User = require('./database/userschema');
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const SERVER_PORT = process.env.PORT || 4242;

const DATABASE_CONNECTED_MESSAGE_PREFIX = 'Database connection status: ';
const DATABASE_CONNECTED_MESSAGE = 'Connected';
const DATABASE_NOT_CONNECTED_MESSAGE = 'NOT connected';

/////////////////////// FB //////////////////////

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


var email = '';

passport.use(new FacebookStrategy({
  clientID: '1199458670180745',
  clientSecret: 'b88aebdf7f7a9bbc58046048d66f4944',
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name', 'displayName']
},
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {

      console.log('accessToken', accessToken);
      console.log('refreshToken', refreshToken);
      console.log('profile', profile);
      
      email = profile.emails[0].value;

      db.User.find({'facebookID': profile.id}, function(err, data) {
        if (err) {
          return done(err);
        }
        if (data.length === 0) {
          user = new db.User({
            facebookID: profile.id, 
            name: profile.displayName, 
            email: profile.emails[0].value
          });
          
          // email is global variable for later use
          email = profile.emails[0].value;

          user.save(function(err, user) {
            if (err) console.log(err);
            return done(err, user);
          });
        } else {
          return done(err, data);
        }
      });
    });
  }
));


app.use(passport.initialize());
//app.use(passport.session());

app.get('/auth/facebook',  passport.authenticate('facebook', {session: false, scope: 'email' }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/'}), function(req, res) {
    // success redirect
    res.redirect('/')
  }
);

app.get('/profile', function (req, res) {
  console.log('we got to the profile page');
  res.send('AUTHENTICATION OK!');
});


app.get('/logout', function(req, res) {
  req.logout(); 
  res.redirect('/');
});
/////////////////////// FB //////////////////////

var useragent = '';
// test endpoint for reporting status of database connection
app.get('/test', (req, res) => {
  useragent = JSON.stringify(req.headers['user-agent']);
  const message = DATABASE_CONNECTED_MESSAGE_PREFIX +
    ((db.mongoose.connection.readyState === 1) ? DATABASE_CONNECTED_MESSAGE : DATABASE_NOT_CONNECTED_MESSAGE);
  res.status(200).send(message);
});

app.get('/clients', (req, res) => {
  let message = '';
  let clients = io.sockets.connected;
  for ( client in clients ) {
    message += `Rooms for ${client}: ${JSON.stringify(clients[client].rooms)}\n`;
  }
  res.status(200).send(message);
});

// serve up client files
app.use(express.static(`${__dirname}/../client`));
app.use(express.static(`${__dirname}/../node_modules`));

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
    res.status(200).send(tracks);
    return;
  });
});


// socket.io framework
io.on( 'connection', function(client) {

  client.on('add song', (uri) => {
    console.log( 'Client adding song', uri );
    // the playlistId is the name of a room that this socket is in
    let playlistId;
    for ( room in client.rooms ) {
      // each socket is also in a room matching its own ID, so let's filter that out
      if ( room !== client.id ) {
        playlistId = room;
      }
    }
    console.log( '  for playlist', playlistId );
    db.insertSong(playlistId, {uri: uri});

    // add unique playlist to user 
    db.User.findOne({email: email}, function (err, user) {      
      if (err) {
        throw err;
        return;
      } else {

        if(user !== null) {
          if (user.playlists.indexOf(playlistId) === -1){
            user.playlists.push(playlistId);
          }
          user.save(function (err) {
            if(err) {
              console.error('ERROR!');
            }
          });
        }
      }
    });

    // transmit the confirmation to ALL clients working with this playlist
    io.in(playlistId).emit('song added', uri);
  });

  client.on('remove song', (uri) => {
    console.log( 'Client removed song', uri );
    // the playlistId is the name of a room that this socket is in
    let playlistId;
    for ( room in client.rooms ) {
      // each socket is also in a room matching its own ID, so let's filter that out
      if ( room !== client.id ) {
        playlistId = room;
      }
    }
    console.log( 'for playlist', playlistId );
    db.removeSong(playlistId, uri);
    // transmit the confirmation to ALL clients working with this playlist
    io.in(playlistId).emit('song removed', uri);
  });

//################ Like Count ################### event listener
  client.on('like', function(uri) {
    let playlistId;
    for ( room in client.rooms ) {
      // each socket is also in a room matching its own ID, so let's filter that out
      if ( room !== client.id ) {
        playlistId = room;
      }
      console.log('uri', uri);  // id is not being passed through from core.js
    }
    db.insertCount(playlistId, uri, useragent);  // relates to db index.js line 41 
    io.in(playlistId).emit('like added' , uri, useragent);
  });
  
  client.on('remove', function(song) {
    let playlistId;
    for ( room in client.rooms ) {
      // each socket is also in a room matching its own ID, so let's filter that out
      if ( room !== client.id ) {
        playlistId = room;
      }
      console.log('id', playlistId)  // id is not being passed through from core.js

    }
    db.removeSong(playlistId, song);  // relates to db index.js line 41 
  })

  // (new or existing) playlist requests
  client.on( 'playlist', function(playlistId, callback) {
    let playlist;
    let p;

    if ( playlistId ) {
      console.log( `Client requesting playlist ${playlistId}` );

      p = db.getSinglePlayList( playlistId )
        .then( (doc) => {
          if ( !doc ) {
            throw new Error( 'playListNotFound' );
          }
          return doc;
        })
        .catch(
          (err) => (err.message === 'playListNotFound' ),
          () => {
            return db.createPlayList();
          });

    } else {

      console.log( 'Client requesting new playlist' );
      p = db.createPlayList();
    }

    p.then( (doc) => {
      // put this client in a socket.io room corresponding to this playlist
      client.join( doc._id.toString() );
      callback({ _id: doc._id.toString(), songs: doc.songs });
    })
    .catch( (err) => {
      console.log( err );
    });
  });

  client.on('disconnect', function() {
    // POST-MVP: clean up empty playlists here
  });
});


// start the webserver
http.listen = Promise.promisify(http.listen);
app.start = function() {
  return http.listen(SERVER_PORT)
    .then(() => {
      console.log(`Tribal server is listening on port ${SERVER_PORT}.`);
    });
};

module.exports = app;
module.exports.SERVER_PORT = SERVER_PORT;
module.exports.DATABASE_CONNECTED_MESSAGE_PREFIX = DATABASE_CONNECTED_MESSAGE_PREFIX;
module.exports.DATABASE_CONNECTED_MESSAGE = DATABASE_CONNECTED_MESSAGE;
