(function(){

  angular.module('ngDataModel').factory('Models.FieldHelpers', function() {

    var fns = {
      parse_object_attribute: function(scope, identifier, attributes) {
        var parts = identifier.split('.');
        var attribute = parts.pop();

        var object = scope.$parent;
        parts.each(function(part) { object = object[part]; })
        if(!object) devel_log('no object found for', parts, 'in scope', scope, 'object: ', object, Object.keys(scope));

        scope.object_name = parts.last();
        scope[scope.object_name] = object;
        scope.object = object;
        scope.attribute = attribute;

        scope.read_attribute = attribute;
        if(object.constructor.$behaviors && object.constructor.$behaviors[attribute]) {
          scope.read_attribute = 'formatted_' + attribute;
          scope.behavior = object.constructor.$behaviors[attribute];
        }

        scope.has_history =
          object.historyable_attributes &&
          object.historyable_attributes.indexOf(scope.attribute) != -1 &&
          object.history_entries_for(scope.attribute).length > 0;

        scope.show_history = scope.$parent.show_history;

        if(attributes && attributes.label) scope.label = attributes.label;
      }
    }

    return fns;
  });

})();