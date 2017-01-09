(function(){

/*
 * Usage example:
 * <div ng-init="ob = { field: 'a'}"></div>
 * error: <input ng-model="error"> field: <input ng-model="ob.field">
 * <div class="field-frame" label="Field:" error="{{error}}">
 *   <div class="view">{{ob.field}}</div>
 *   <div class="edit"><input ng-model="ob.field" class="form-control input-sm"></div>
 * </div>
 */

  angular.module('ngDataModel').directive('fieldFrame', function() {

    function edit(elem) {
      elem.find('div.edit').removeClass('op0').css('position', 'inherit');
      elem.find('div.view').addClass('op0').css('position', 'absolute');
    }

    function hide(elem) {
      elem.find('div.edit').addClass('op0').css('position', 'absolute');
      elem.find('div.view').removeClass('op0').css('position', 'inherit');
    }

    return {
      restrict: 'C',
      scope: {
        label: '@',
        error: '@',
      },
      transclude: true,
      templateUrl: 'angular_data_model/model_editors/templates/frame.html',
      link: function(scope, elem) {
        scope.$watch('error', function(nv) {
          if(nv) elem.addClass('has-error');
          else elem.removeClass('has-error');
        })

        if(elem.find('div.edit')[0] && elem.find('div.view')[0]) {
          hide(elem);

          elem.find('div.view').click(function(){
            elem.find('div.edit').find('input, select').focus();
          });

          elem.find('div.view').dblclick(function(){
            elem.find('div.edit').find('textarea').focus();
          });

          elem.find('div.edit').find('input, select').focus(function(){
            edit(elem);
          }).blur(function(){
            hide(elem);
          })
          elem.find('div.edit').find('textarea').focus(function(){
            edit(elem);
            elem.find('div.view').hide();
          }).blur(function(){
            hide(elem);
            elem.find('div.view').show();
          })
        };
      }
    }
  });

})();