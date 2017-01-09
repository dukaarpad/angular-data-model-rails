(function(){
  angular.module('ngDataModel').config(['BaseModelProvider', function(BaseModelProvider) {

    var BaseModel = BaseModelProvider.BaseModel;

    // CLASS methods

    function add_view_rule(attribute, edit, show) {
      if(typeof(attribute) == 'object') {
        var self = this;
        attribute.each(function(attr) {
          self.add_view_rule(attr, edit, show);
        })
        return this;
      }
      var rule = typeof(edit) == 'object' ? edit : { edit: edit, show: show };
      prepare_rule(rule);

      this.$view_rules = this.$view_rules ? jQuery.extend(true, {}, this.$view_rules) : {};
      this.$view_rules[attribute] = rule;

      return this;
    }
    BaseModel.add_view_rule = add_view_rule;
    BaseModel.prototype.add_view_rule = add_view_rule;

    // INSTANCE methods

    BaseModel.prototype.$get_view_rule = function(attribute, params) {
      var self = this;

      var levels = [ this, this.constructor ];
      for(var i = 0; i < 2; i++) {
        var level = levels[i];
        if(level.$view_rules && level.$view_rules[attribute]) {
          var ret_phase = 'hide';
          ['edit', 'show'].each(function(phase){
            if(level.$view_rules[attribute][phase] && level.$view_rules[attribute][phase].call(self, params)) {
              ret_phase = phase;
              return false;
            };
          });
          return ret_phase;
        }
      }

      return 'edit';
    }

    // helper functions
    function prepare_rule(rule) {
      ['edit', 'show'].each(function(phase){
        if(typeof(rule[phase]) == 'undefined') rule[phase] = true;
        switch(typeof(rule[phase])) {
          case 'boolean':
            var value = rule[phase];
            rule[phase] = function() { return value; }
            break;

          case 'string':
            var attr = rule[phase];
            rule[phase] = function() {
              var fn = attr.replace('!', '');
              var value = typeof(this[fn]) == 'function' ? this[fn]() : this[fn];
              return attr.startsWith('!') ? !value : value;
            }
            break;
        }
      })
    }
  }]);
})();
