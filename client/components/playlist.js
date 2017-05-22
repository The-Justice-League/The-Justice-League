const PlaylistController = function( tribalServer, $location, $scope ) {

  this.songAddedHandler = (uri) => {
    this.playlist.push({ uri: uri });
    $scope.$apply();
  }; 

  //################### remove button ###############
  this.removeSong = (uri) => {
    this.playlist.forEach((playlistSong, index) => {
      if (playlistSong.uri === uri) {
        this.playlist.splice(index, 1);
      }
    });
    $scope.$apply();
  };

  this.removeSongButtonHandler = (song) => {
    tribalServer.removeSong(song.uri); 
  };
  //#############################################
  


  //################### like button ###############
  this.likeSong = (uri, userAgent) => {
    this.playlist.forEach((playlistSong, index) => {
      if (playlistSong.uri === uri) {
        console.log('playlistSong1:',playlistSong.count)
        if ( playlistSong.count.indexOf(userAgent) === -1 ) {
          playlistSong.count.push(userAgent);
          console.log('playlistSong2:',playlistSong.count)
        } else {
          playlistSong.count.splice(playlistSong.count.indexOf(userAgent),1)
        }
      }
    });
    $scope.$apply();
  }

  this.likeButtonHandler = (song) => {
    tribalServer.likeButton(song.uri);
  };

  //#############################################

  
  tribalServer.registerLikeHandler( this.likeSong );
  tribalServer.registerSongRemovedHandler( this.removeSong );
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
      playlist: '<',
      count: '=',
      song: '<'
    },
    restrict: 'E',
    controller: [ 'tribalServer', '$location', '$scope', PlaylistController ],
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/playlist.html'
  };
};

angular.module('tribal').directive('playlist', Playlist);

