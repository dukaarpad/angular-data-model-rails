(function(angular){

  angular.module('ngDataModel').factory('ValidationErrorHandler', function(){

    var i = 0;

    function ValidationErrorHandler(id) {
      this.id = id || i++;
      this.errors = {};
      this.change_events = [];
    }

    ValidationErrorHandler.prototype.triggerChangeEvents = function() {
      this.change_events.each(function(fn){ if(typeof(fn) == 'function'){ fn(); }})
    }

    return ValidationErrorHandler;

  });

})(angular);