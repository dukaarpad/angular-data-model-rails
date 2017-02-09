(function(){

  angular.module('ngDataModel').provider('BaseModel.behavior.checkbox', function() {

    this.prepare_behavior = function(attribute, settings) {

      var Model = this, true_value, false_value;

      [ true_value, false_value ] = settings ? [ settings.true, settings.false ] : [ I18n.t('true_value'), I18n.t('false_value') ];

      Model['get_formatted_' + attribute] = function(value) {
        return value ? true_value : false_value;
      }

      Object.defineProperty(Model.prototype, 'formatted_' + attribute, {
        enumerable: true,
        get: function() { return this['get_formatted_' + attribute]() }
      });

    }

    this.$get = function() {}; // fake provider
  });

})();
