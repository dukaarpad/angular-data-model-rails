(function(){

  angular.module('ngDataModel').provider('BaseModel.behavior.checkbox', function() {

    this.prepare_behavior = function(attribute) {

      var Model = this;

      Model['get_formatted_' + attribute] = function(value) {
        return value ? 'igen' : 'nem';
      }

      Object.defineProperty(Model.prototype, 'formatted_' + attribute, {
        enumerable: true,
        get: function() { return this['get_formatted_' + attribute]() }
      });

    }

    this.$get = function() {}; // fake provider
  });

})();
