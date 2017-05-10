module.exports.mongoose = require( './init' );
const mongoose = require('mongoose');

const PlayListSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  songRefs: [{
    uri: String
  }]
});

const PlayList = mongoose.model('PlayList', PlayListSchema);

// getAllPlayLists retrieves all playlists
function getAllPlayLists(callback) {
  Playlist.find({}, callback);
}

// getSinglePlaylist retrieves a single playlist associated with the given name
function getSinglePlayList(name, callback) {
  Playlist.find({name: name}, callback);
}

// insertSong inserts a song(s) into the db
function insertSong(song, callback) {
  Playlist.create(song, callback);
}

exports.getAllPlayLists = getAllPlayLists;
exports.getSinglePlayList = getSinglePlayList;
exports.insertSong = insertSong;
