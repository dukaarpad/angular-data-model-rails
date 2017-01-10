(function(){
  "use strict";
/*
 * Usage example:
 * <div ng-init="ob = { field: 'a'}"></div>
 * <div datetime-field="ob.field"></div>
 */

  angular.module('ngDataModel').directive('datetimeField', ['Models.FieldHelpers', function(helpers) {
    return {
      restrict: 'A',
      templateUrl: 'angular_data_model/model_editors/templates/datetime.html',
      scope: {},
      link: function(scope, element, attributes) {
        helpers.parse_object_attribute(scope, attributes['datetimeField'], attributes);
      }
    }
  }]);

})();