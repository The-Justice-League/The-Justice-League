module.exports.mongoose = require( './init' );

var PlayListSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  songRefs: [{
    uri: String
  }]
});

var PlayList = mongoose.model('PlayList', PlayListSchema);

// find all playlists
function getAllPlayLists(callback) {
  Playlist.find({}, callback);
}

// find a particular playlist
function getSinglePlayList(name, callback) {
  Playlist.find({name: name}, callback);
}

// insert and save songs into a playlist
function insertSong(song, callback) {
  Playlist.create(song, callback);
}

exports.getAllPlayLists = getAllPlayLists;
exports.getSinglePlayList = getSinglePlayList;
exports.insertSong = insertSong;
