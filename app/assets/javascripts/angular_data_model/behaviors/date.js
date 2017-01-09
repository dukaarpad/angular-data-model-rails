(function(){

  angular.module('ngDataModel').provider('BaseModel.behavior.date', function() {

    function translateDate(value, just_date) {
      if(value != null && value != '' && value != undefined) {
        var date;
        date = new Date(value);
        if(date == 'Invalid Date') date = new Date(value.replace(/\-/g, '/'));
        return date.convertToI18n("hu", just_date);
      }
      return "";
    };

    this.prepare_behavior = function(attribute, just_date) {

      var Model = this;

      Model['get_formatted_' + attribute] = function(value) {
        return translateDate(value, just_date);
      }

      Object.defineProperty(Model.prototype, 'formatted_' + attribute, {
        enumerable: true,
        get: function() { return this['get_formatted_' + attribute]() }
      });

    }

    this.$get = function() {}; // fake provider
  });

})();
