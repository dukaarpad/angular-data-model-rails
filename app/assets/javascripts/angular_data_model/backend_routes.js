(function(angular){
  "use strict";

  angular.module('ngDataModel').provider('router', routerProvider);

  function routerProvider(){
    var actions = {};
    this.add = function(name, options) {
      actions[name] = $.extend({method: 'GET', isArray: false}, options);
      actions[name].params = {};
      $.each(actions[name].url.replace('.json', '').split('/'), function(i,e){
        if(e.indexOf(':') == 0)
          actions[name].params[e.replace(':', '')] = e.replace(':', '@');
      });
      return this;
    }
    this.$get = function() {
      return { actions: actions };
    }
  }

  angular.module('ngDataModel').factory('routes', ['$resource', 'router', function($resource, router) {
    var routes = $resource('', {}, router.actions);
    return routes;
  }]);

})(window.angular);