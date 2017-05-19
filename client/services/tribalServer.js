const tribalServer = function( $http ) {

  let socket = io();

  this.test = function() {
    return $http.get( '/test' );
  };

  // get (new or existing) playlist from server
  this.getPlaylist = function( playlistId, callback ) {
    socket.emit( 'playlist', playlistId, callback );
  };

  this.likeButton = function(count, song) {
    socket.emit( 'like', count, song )
    console.log('Like Button Clicked', count)
  }

  this.removeButton = function(song) {
    socket.emit( 'remove', song )
    console.log('remove Button Clicked', song)
  }

  // request that the server add a song to the playlist
  this.addSong = function( uri ) {
    socket.emit( 'add song', uri );
  };

  this.registerSongAddedHandler = function( callback ) {
    socket.on( 'song added', callback );
  };

  this.spotifySearch = function(trackName) {
    return $http.get( '/tracks', {
      params: {
        trackName: trackName,
      }
    });
  };

  this.facebookAuth = function () {
    return $http.get( '/auth/facebook' );
  };
};

angular.module('tribal').service('tribalServer', ['$http', tribalServer]);
