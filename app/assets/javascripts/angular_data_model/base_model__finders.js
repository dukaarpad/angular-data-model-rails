(function(angular){
  "use strict";

  angular.module('ngDataModel').config(['BaseModelProvider', function(BaseModelProvider) {

    var BaseModel = BaseModelProvider.BaseModel;

    // CLASS methods
    BaseModel.all = function() {
      return Object.values(this.storage.objects[this.db_name  || this.name]);
    }

    BaseModel.find = function(id) {
      return this.storage.objects[this.db_name || this.name] && this.storage.objects[this.db_name || this.name][id] || null; // do not use .all() here, because it returns array instead of hash
    }

    // ({a: 'A', b: 'B'}) -> ({a: 'A', b: 'B'})
    // ('a', 'A') -> ({a: 'A'})
    function condition_parser(attribute, value) {
      if(typeof(attribute) != 'object') {
        var tmp_attribute = attribute;
        attribute = {}; attribute[tmp_attribute] = value;
      }
      return attribute;
    }

    BaseModel.prototype.$match = function(conditions) {
      for(var key in conditions) {
        if(this[key] != conditions[key]) return false;
      }
      return true;
    }

    BaseModel.where = function(attribute, value) {
      var conditions = condition_parser(attribute, value);
      return this.all().findAll(function(object) {
        return object.$match(conditions);
      });
    }

    BaseModel.find_by = function(attribute, value) {
      var conditions = condition_parser(attribute, value);
      return this.all().find(function(object) {
        return object.$match(conditions);
      }) || null;
    }

  }]);

})(angular);
