angular.module('tribal')
.controller('SearchController', function(tribalServer) {
  this.searchButtonHandler = (query) => {
    tribalServer.spotifySearch( query )
      .then( (results) => {
        this.searchResultsHandler( results );
      });
  };
})
.directive('search', function() {
  return {
    scope: {
      searchResultsHandler: '<',
    },
    restrict: 'E',
    controller: 'SearchController',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/search.html'
  };
});

