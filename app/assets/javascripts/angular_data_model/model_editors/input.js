(function(){
  "use strict";
/*
 * Usage example:
 * <div ng-init="ob = { field: 'a'}"></div>
 * <div input-field="ob.field"></div>
 */

  angular.module('ngDataModel').directive('inputField', ['Models.FieldHelpers', function(helpers) {
    return {
      restrict: 'A',
      templateUrl: 'angular_data_model/model_editors/templates/input.html',
      scope: {},
      link: function(scope, element, attributes) {
        helpers.parse_object_attribute(scope, attributes['inputField'], attributes);
      }
    }
  }]);

})();