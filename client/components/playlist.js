const PlaylistController = function( tribalServer, $location, $scope ) {
  
  //Like button counter
  this.likeButtonHandler = (song) => {
      console.log('song',song)
      song.count++;
    tribalServer.likeButton(song.count, song._id)
  };

  this.removeSongHandler = (song) => {
    console.log('Remove that Ish', song)
    tribalServer.removeButton(song._id)
    console.log(song._id, 'has been click')
  }

  this.songAddedHandler = (uri) => {
    this.playlist.push({ uri: uri });
    $scope.$apply();
  };

  tribalServer.registerSongAddedHandler( this.songAddedHandler );
  tribalServer.getPlaylist( $location.search().playlist, (res) => {
    $location.search( 'playlist', res._id );
    this.playlist = res.songs;
    $scope.$apply();
  });
};


const Playlist = function() {
  return {
    require: '',
    scope: {
      onClick: '=',
      count: '='
    },
    restrict: 'E',
    controller: [ 'tribalServer', '$location', '$scope', PlaylistController ],
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/playlist.html'
  };
};


angular.module('tribal').directive('playlist', Playlist);

