const mongoose = require( './init' );

const FacebookUserSchema = new mongoose.Schema({
  facebookID: {type: String, unique: true},
  name: String,
  email: String, 
  playlists: {type: Array, default:[]}
});

const User = mongoose.model('User', FacebookUserSchema);

// insertUserPlaylist inserts playlists into db
const insertUserPlaylist = function( onePlaylist, email ) {
  return getSingleUser( email )
    .then(user => {
      user.playlists.push(onePlaylist);
      return user.save();
    });
};

const getSingleUser = function( email ) {
  console.log("get single user", email)
  return User.find({ email: email });
}


const PlayListSchema = mongoose.Schema({
  name: {
    type: String,
  },
  songs: [{
    uri: String,
    count: {type: Array, default: []}
  }]
});

const PlayList = mongoose.model('PlayList', PlayListSchema);

// getAllPlayLists retrieves all playlists
const getAllPlayLists = function() {
  return PlayList.find({});
};

// getSinglePlayList retrieves a single PlayList associated with the given id or name
// returns promise, resolves with playlist document
const getSinglePlayList = function( idOrName ) {
  if ( /^[0-9a-f]{24}$/.test(idOrName) ) {
    return PlayList.findById( idOrName );
  } else {
    return PlayList.findOne({ name: idOrName });
  }
};

// insertSong inserts a song(s) into the db
const insertSong = function(id, song) {
  return getSinglePlayList( id )
    .then(playList => {
      playList.songs.push(song);
      return playList.save();
    });
};

const removeSong = function(playlistId, uri) {
  return getSinglePlayList( playlistId )
    .then( playList => {
      var dbSongs = playList.songs;
      for (var songIndex = 0; songIndex < dbSongs.length; songIndex++) {
        var songId = dbSongs[songIndex].uri.toString();
        if (uri === songId) {
          dbSongs.splice(songIndex, 1);
          return playList.save();
        }
      }
    });
};

// find clicked song in db, increase count, save count to db. 
const insertCount = function(id, clickedSong, userAgent) {
  return getSinglePlayList( id )
    .then( playList => {
      var dbSongs = playList.songs;
      for (var songIndex = 0; songIndex < dbSongs.length; songIndex++) {
        var songId = dbSongs[songIndex].uri.toString();
        if (songId === clickedSong) {
          var indexOfUserAgent = dbSongs[songIndex].count.indexOf(userAgent);
          dbSongs[songIndex].count.push(userAgent);
        }
      }
      return playList.save();
    });
};

// create a new playlist, 'name', populated with no songs
// return promise, resolves with new document
const createPlayList = function( name ) {
  return PlayList.create({ name: name });
};

module.exports.mongoose = mongoose;
module.exports.getAllPlayLists = getAllPlayLists;
module.exports.getSinglePlayList = getSinglePlayList;
module.exports.insertSong = insertSong;
module.exports.removeSong = removeSong;
module.exports.insertCount = insertCount;
module.exports.createPlayList = createPlayList;
module.exports.insertUserPlaylist = insertUserPlaylist;
module.exports.getSingleUser = getSingleUser;
module.exports.User = User;
