(function(){
  "use strict";
/*
 * Usage example:
 * <div ng-init="ob = { field: 'a'}"></div>
 * <div date-field="ob.field"></div>
 */

  angular.module('ngDataModel').directive('dateField', ['Models.FieldHelpers', function(helpers) {
    return {
      restrict: 'A',
      templateUrl: 'angular_data_model/model_editors/templates/date.html',
      scope: {},
      compile: function() {
        return {
          pre: function preLink(scope, element, attributes) {
            helpers.parse_object_attribute(scope, attributes['dateField'], attributes);
            if(scope.object && scope.object.constructor && scope.object.constructor.$behaviors && scope.object.constructor.$behaviors[scope.attribute]) {
              var settings = scope.object.constructor.$behaviors[scope.attribute];
              scope.no_limit = true;
              [ 'start_date_attr', 'end_date_attr', 'no_limit', 'from_now', 'allow_clear' ].each(function(set_attr) {
                if(Object.keys(settings).indexOf(set_attr) != -1) {
                  scope[set_attr] = settings[set_attr];
                }
              })
            }
          }
        }
      },
    }
  }]);

})();