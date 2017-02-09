(function(angular){

  angular.module('ngDataModel').config(behaviorConfig);

  behaviorConfig.$inject = [
    'BaseModelProvider',

    'BaseModel.behavior.selectProvider',
    'BaseModel.behavior.dateProvider',
    'BaseModel.behavior.amountProvider',
    'BaseModel.behavior.checkboxProvider',
  ];

  function behaviorConfig(BaseModelProvider, select, date, amount, checkbox) {

    var BaseModel = BaseModelProvider.BaseModel;
    var behaviors = ['select', 'date', 'datetime', 'amount', 'checkbox'];

    // CLASS methods
    BaseModel.behave = function(attribute, behavior, settings) {
      if(typeof(attribute) == 'object') {
        var self = this;
        attribute.each(function(attr){ self.behave(attr, behavior, settings) })
        return this;
      }
      switch(behavior) {
        case 'select':
          settings = select.prepare_behavior.call(this, attribute, settings);
          break;
        case 'datetime':
          date.prepare_behavior.call(this, attribute);
          break;
        case 'date':
          date.prepare_behavior.call(this, attribute, true);
          break;
        case 'amount':
          settings = typeof(settings) == 'object' ? settings : { precision: settings || 0 };
          amount.prepare_behavior.call(this, attribute, settings.precision);
          break;
        case 'checkbox':
          checkbox.prepare_behavior.call(this, attribute, settings);
          break;
      }

      settings = typeof(settings) == 'object' ? settings : {};
      settings.type = behavior;
      this.$behaviors = this.$behaviors ? jQuery.extend({}, this.$behaviors) : {};
      this.$behaviors[attribute] = settings;

      BaseModel.prototype['get_formatted_' + attribute] = function(value) {
        if(value === undefined) value = this[attribute];
        return this.constructor['get_formatted_' + attribute](value, this);
      }

      return this;
    }

    behaviors.each(function(behavior) {
      BaseModel['behave_as_' + behavior] = function(attribute, settings) {
        this.behave(attribute, behavior, settings);

        return this;
      }
      BaseModel['_' + behavior] = BaseModel['behave_as_' + behavior];
    })

  };

})(angular);

