const mongoose = require('./init');
// const mongoose = require('mongoose');

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
const getAllPlayLists = function() {
  return Playlist.find({});
};

// getSinglePlaylist retrieves a single playlist associated with the given name
const getSinglePlayList = function(name) {
  return Playlist.find({name: name});
};

// insertSong inserts a song(s) into the db
const insertSong = function(song) {
  return Playlist.create(song);
};

module.exports = mongoose;
exports.getAllPlayLists = getAllPlayLists;
exports.getSinglePlayList = getSinglePlayList;
exports.insertSong = insertSong;
