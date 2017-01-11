(function(angular){

  angular.module('ngDataModel').config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/test1', {
        templateUrl: 'angular_data_model/test/test1/test1.html',
        controller: 'test1_controller',
      })
  }]);

})(window.angular);