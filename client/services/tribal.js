const tribalServer = function( $http ) {
  this.test = function() {
    return $http.get( '/test' );
  };
};

angular.module('tribal').service('tribalServer', ['$http', tribalServer]);
