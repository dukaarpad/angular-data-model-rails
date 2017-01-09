(function(){

/*
 * Usage example:
 * <div edit-field="ob.field"></div>
 */

  angular.module('ngDataModel').directive('editField', ['Models.FieldHelpers', function(helpers) {
    return {
      restrict: 'A',
      template: '<div ng-include="_field_template"></div>',
      scope: {},
      link: function(scope, element, attributes) {
        helpers.parse_object_attribute(scope, attributes['editField']);

        scope._field_template = 'angular_data_model/model_editors/templates/' + (
          scope.object.constructor.$behaviors
            && scope.object.constructor.$behaviors[scope.attribute]
            && ['select', 'checkbox', 'date', 'datetime'].indexOf(scope.object.constructor.$behaviors[scope.attribute].type) > -1
          ? scope.object.constructor.$behaviors[scope.attribute].type + '.html'
          : 'input.html'
        );
      }
    }
  }]);

})();