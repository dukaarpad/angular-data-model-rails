(function(){

  angular.module('ngDataModel').provider('BaseModel.behavior.amount', function() {

    function format(str, precision) {
      return !str ? '' : parseFloat(str).toFixed(precision).replace(/(\d)(?=(\d{3})+(\.\d+)?$)/g, '$1 ');
    };

    this.prepare_behavior = function(attribute, precision) {
      precision = precision || 0;

      var Model = this;

      Model['get_formatted_' + attribute] = function(value, object) {
        return format(value, (object || this)[attribute + '_precision'] || precision);
      }

      Object.defineProperty(Model.prototype, 'formatted_' + attribute, {
        enumerable: true,
        get: function() { return this['get_formatted_' + attribute]() }
      });

      if(!Model.prototype.$watchers) Model.prototype.$watchers = {};
      Model.prototype.$watchers[attribute] = Model.prototype.$watchers[attribute] ? Model.prototype.$watchers[attribute].clone() : [];
      Model.prototype.$watchers[attribute].push(function(){
        if(this[attribute] == null) return;
        var fixed = + parseFloat(this[attribute] || 0).toFixed(this[attribute + '_precision'] || precision);
        if(this[attribute] !== fixed) this[attribute] = fixed;
      })
    }

    this.$get = function() {}; // fake provider
  });

})();
