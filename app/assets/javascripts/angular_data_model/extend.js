(function(angular){

  angular.module('ngDataModel').constant('extend', function(subclass, superclass){

    // CLASS METHODS
    var F = {};
    F.__proto__ = superclass;
    subclass.__proto__ = F;

    // INSTANCE METHODS
    var G = function() {};
    G.prototype = superclass.prototype;
    subclass.prototype = new G();
    subclass.prototype.constructor = subclass;
  });

})(angular);