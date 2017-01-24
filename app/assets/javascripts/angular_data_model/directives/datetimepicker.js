(function(){
  "use strict";

  angular.module('ngDataModel').directive('ngdmDateTimepick', function() {
    return {
      restrict: 'E',
      template: '<div class="input-group date"><input ng-model="trans_value" class="form-control input-sm"/><label class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></label></div>',
      scope: {
        model: '='
      },
      link: function(scope, el) {
        scope.trans_value = c.getDateTime(scope.model);

        scope.$watch('model', function(nv){
          if(c.getDateTime(scope.trans_value) != c.getDateTime(scope.model))
            scope.trans_value = c.getDateTime(scope.model);
        })

        var input = $('input', el),
            allowClear = el.attr('allow-clear');

        input.attr('id', el.attr('id'));
        var past_date = el.attr('past');
        input.datetimepicker({
          format: 'yyyy-mm-dd hh:ii',
          weekStart: 1,
          language: 'hu',
          autoclose: true,
          todayBtn: true
        });
        if(past_date)
          input.datetimepicker('setEndDate', new Date());
        el.on('click', function(e) {
          if (e.currentTarget.nodeName != 'INPUT') input.focus();
        });

        if (!input.val())
          input.one('focus', function(val) {
            if (val) input.datetimepicker('update', val);
          });

        input.on('hide', function(e) {
          if (input.val() === '' && allowClear == 'false' )
            input.datetimepicker('update', c.getDateTime(scope.trans_value));
          else if(c.getDateTime(scope.trans_value) != c.getDateTime(scope.model)) {
            scope.trans_value = c.getDateTime(scope.trans_value);
            scope.model = scope.trans_value;
          }
          scope.$apply();
        });
      }
    }
  });

})(window.angular);