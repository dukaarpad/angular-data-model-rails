(function(){

/*
 *
 * Usage example:
 * <div view-field="ob.field"></div>
 */

  angular.module('ngDataModel').directive('viewField', ['Models.FieldHelpers', function(helpers) {
    return {
      restrict: 'A',
      template:
'<div class="field-frame" label="{{label || object.$t(attribute)}}" ng-class="{ hide: object.$get_view_rule(attribute, this.$parent) == \'hide\', show: object.$get_view_rule(attribute, this.$parent) != \'hide\' }">' +
'  <div class="view">{{object[read_attribute]}}&nbsp;</div>'+
'</div>',
      scope: {},
      link: function(scope, element, attributes) {
        helpers.parse_object_attribute(scope, attributes['viewField'], attributes);
      }
    }
  }]);

})();