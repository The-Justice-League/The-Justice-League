const PlaylistController = function( tribalServer, $location, $scope ) {
  
  //Like button counter
  let table = {};
  this.likeButtonHandler = (song) => {
    if (table[song._id] === undefined) {
      table[song._id] = 1;
    } else {
      table[song._id]++;
    }
    tribalServer.likeButton(table[song._id], song._id)
    console.log(song._id, 'has been liked:', table[song._id],'times')
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

