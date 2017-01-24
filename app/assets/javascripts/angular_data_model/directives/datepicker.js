(function(){
  "use strict";

  angular.module('ngDataModel').directive('ngdmDatepick', function() {
    return {
      restrict: 'E',
      template: '<div class="input-group date"><input ng-model="trans_value" class="form-control input-sm"/><label class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></label></div>',
      scope: {
        model: '='
      },
      link: function(scope, el, attr) {
        var startDate = el.attr('start-date'),
        endDate = el.attr('end-date'),
        key = attr['key'],
        from_now = el.attr('from-now'),
        no_limit = el.attr('no-limit'),
        allowClear = el.attr('allow-clear');

        scope.$watch('model[\'' + key + '\']', function(nv){
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

        if(!no_limit) {
          if(from_now)
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

        scope.$watchCollection('[model[\'' + startDate + '\'], model[\'' + endDate + '\']];', function(val) {
          if (val[0])
            input.datepicker('setStartDate', new Date(val[0]))
          else if (val[1])
            input.datepicker('setEndDate', new Date(val[1]));
          el.data('nofocus', 2);
        }, true);

        input.on('hide', function(e) {
          if (input.val() === '' && allowClear == 'false' )
            input.datepicker('update', c.getDate(scope.trans_value));
          else if(c.getDate(scope.trans_value) != c.getDate(scope.model[key])) {
            scope.trans_value = c.getDate(scope.trans_value);
            scope.model[key] = scope.trans_value;
          }
          scope.$apply();
        });
      }
    }
  });

})(window.angular);