(function(){

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
            helpers.parse_object_attribute(scope, attributes['dateField'])
          }
        }
      },
    }
  }]);

})();