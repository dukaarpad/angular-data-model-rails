(function(){
  "use strict";

  angular.module('ngDataModel').directive('ngdmDatepick', function() {
    return {
      restrict: 'E',
      template: '<div class="input-group date"><input ng-model="trans_value" class="form-control input-sm"/><label class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></label></div>',
      scope: {
        model: '=',
        key: '=',
        noLimit: '=',
        startDateAttr: '=',
        endDateAttr: '=',
        fromNow: '=',
        allowClear: '=',
      },
      link: function(scope, el, attr) {
        scope.$watch('model[\'' + scope.key + '\']', function(nv){
          scope.trans_value = c.getDate(nv);
        });

        var input = $('input', el);
        input.attr('id', el.attr('id'));
        input.datepicker({
          format: 'yyyy-mm-dd',
          autoclose: true,
          language: 'hu',
          weekStart: 1,
        });

        if(!scope.noLimit) {
          if(scope.fromNow)
            input.datepicker('setStartDate', new Date());
          else
            input.datepicker('setEndDate', new Date());
        }

        el.on('click', function(e) {
          if (e.currentTarget.nodeName != 'INPUT') input.focus();
        });

        if (!input.val())
          input.one('focus', function(val) {
            if (val) input.datepicker('update', val);
          });

        if(scope.startDateAttr || scope.startEndAttr) {
          scope.$watchCollection('[model[\'' + scope.startDateAttr + '\'], model[\'' + scope.endDateAttr + '\']];', function(val) {
            if (val[0])
              input.datepicker('setStartDate', new Date(val[0]))
            else if (val[1])
              input.datepicker('setEndDate', new Date(val[1]));
            el.data('nofocus', 2);
          }, true);
        }

        input.on('hide', function(e) {
          if (input.val() === '' && scope.allowClear == 'false' )
            input.datepicker('update', c.getDate(scope.trans_value));
          else if(c.getDate(scope.trans_value) != c.getDate(scope.model[scope.key])) {
            scope.trans_value = c.getDate(scope.trans_value);
            scope.model[scope.key] = scope.trans_value;
          }
          scope.$apply();
        });
      }
    }
  });

})(window.angular);