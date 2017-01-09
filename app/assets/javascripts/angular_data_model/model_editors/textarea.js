(function(){

/*
 * Usage example:
 * <div ng-init="ob = { field: 'a'}"></div>
 * <div textarea-field="ob.field"></div>
 */

  angular.module('ngDataModel').directive('textareaField', ['Models.FieldHelpers', '$sce', function(helpers, $sce) {
    return {
      restrict: 'A',
      templateUrl: 'angular_data_model/model_editors/templates/textarea.html',
      scope: {},
      link: function(scope, element, attributes) {
        scope.t = function(data){ return $sce.trustAsHtml((data || '').replace(/\n/g, "<br/>")) };
        helpers.parse_object_attribute(scope, attributes['textareaField'], attributes);

        scope.edit_textarea = function() {
          element.find('div.view').dblclick();
        }
      }
    }
  }]);

})();