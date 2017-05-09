const MainController = function( tribalServer ) {

  tribalServer.test()
    .then( (res) => {
      this.messageFromServer = res.data;
    });
};

const Main = function() {
  return {
    scope: {},
    restrict: 'E',
    controller: [ 'tribalServer', MainController ],
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/main.html',
  };
};

angular.module('tribal').directive('main', Main);
