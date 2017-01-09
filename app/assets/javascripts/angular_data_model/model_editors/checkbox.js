(function(){

/*
 * Usage example:
 * <div ng-init="ob = { field: 'a'}"></div>
 * <div checkbox-field="ob.field"></div>
 */

  angular.module('ngDataModel').directive('checkboxField', ['Models.FieldHelpers', function(helpers) {
    return {
      restrict: 'A',
      templateUrl: 'angular_data_model/model_editors/templates/checkbox.html',
      scope: {},
      link: function(scope, element, attributes) {
        helpers.parse_object_attribute(scope, attributes['checkboxField'])
      }
    }
  }]);

})();