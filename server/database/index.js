module.exports.mongoose = require( './init' );

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
  return Playlist.find({}, callback);
}

// getSinglePlaylist retrieves a single playlist associated with the given name
function getSinglePlayList(name) {
  return Playlist.find({name: name});
}

// insertSong inserts a song(s) into the db
function insertSong(song) {
  return Playlist.create(song);
}

exports.getAllPlayLists = getAllPlayLists;
exports.getSinglePlayList = getSinglePlayList;
exports.insertSong = insertSong;
