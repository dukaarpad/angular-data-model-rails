(function(){
  "use strict";
/*
 * Usage example:
 * <div select-field="ob.field"></div>
 */

  angular.module('ngDataModel').directive('selectField', ['Models.FieldHelpers', function(helpers) {
    return {
      restrict: 'A',
      templateUrl: 'angular_data_model/model_editors/templates/select.html',
      scope: {},
      link: function(scope, element, attributes) {
        helpers.parse_object_attribute(scope, attributes['selectField'], attributes);
      }
    }
  }]);

})();