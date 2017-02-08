(function(angular){

  angular.module('ngDataModel').config(['BaseModelProvider', function(BaseModelProvider) {

    var BaseModel = BaseModelProvider.BaseModel;

    // CLASS methods

    // automatized conversions:
    // .validate('attr') -> .validate({ attribute: 'attr', rule: 'presence' })
    // .validate('attr', 'array_not_empty') -> .validate({ attribute: 'attr', rule: 'array_not_empty' })
    // .validate('attr', { rule: 'email' }) -> .validate({ attribute: 'attr', rule: 'email' })
    BaseModel.validate = function() {
      var rule = prepare_rule.apply(this, arguments);
      switch(rule.rule) {
        case 'function':
          this.scope_validators = this.scope_validators ? this.scope_validators.clone() : [];
          this.scope_validators.push(rule);
          break;
        case 'global':
        case 'array_not_empty':
          this.global_validators = this.global_validators ? this.global_validators.clone() : [];
          this.global_validators.push(rule);
          this.prototype.$after_init = this.prototype.$after_init ? this.prototype.$after_init.clone() : [];
          if(this.prototype.$after_init.indexOf(register_global_validators) == -1) this.prototype.$after_init.push(register_global_validators);
          break;
        default:
          if(this.track_modifications) {
            var self = this, checker = function() {
              this.$check_rule(rule);
            };
            checker.rule = rule;
            this.prototype.$watchers = this.prototype.$watchers ? jQuery.extend(true, {}, this.prototype.$watchers) : {};
            rule.attributes.union(['_destroy']).unique().each(function(attr) {
              self.prototype.$watchers[attr] = self.prototype.$watchers[attr] ? self.prototype.$watchers[attr].clone() : [];
              self.prototype.$watchers[attr].push(checker);
            })
          } else {
            this.scope_validators = this.scope_validators ? this.scope_validators.clone() : [];
            this.scope_validators.push(rule);
          }
      }

      return this;
    }

    BaseModel.prototype.$validated_as = function(attribute, rule) {
      return this.$watchers && this.$watchers[attribute] && !!this.$watchers[attribute].find(function(item){ return item.rule && item.rule.rule == rule; });
    }

    // INSTANCE methods
    BaseModel.prototype.add_validation_error_handler = function(handler) {
      var self = this;
      this.$validation_error_handlers = this.$validation_error_handlers || [];

      var handlers = (Object.prototype.toString.call(handler) === '[object Object]') ? [ handler ] : handler;
      handlers.each(function(handler) {
        if(!self.$validation_error_handlers.find(function(e){ return e.id == handler.id;}))
          self.$validation_error_handlers.push(handler);
      });
    }

    BaseModel.prototype.$mark_validity = function(valid, attribute, msg, reference) {
      var key = this.$attr_id(attribute);
      reference = reference || key;
      this.$errors = this.$errors || {};
      this.$errors[attribute] = this.$errors[attribute] || [];
      if(valid || this._destroy || this.$get_view_rule(attribute) != 'edit') {
        this.$errors[attribute].remove(function(e){ return e.msg == msg; });
        if(this.$validation_error_handlers) this.$validation_error_handlers.each(function(handler){
          handler.errors[key] = handler.errors[key] || [];
          handler.errors[key].remove(function(e){ return e.msg == msg; });
          if(handler.errors[key].length == 0) delete(handler.errors[key]);
        });
      } else {
        if(!this.$errors[attribute].find(function(e){ return e.msg == msg})) {
          this.$errors[attribute].push({ msg: msg, reference: reference });
        }
        if(this.$validation_error_handlers) this.$validation_error_handlers.each(function(handler){
          handler.errors[key] = handler.errors[key] || [];
          if(!handler.errors[key].find(function(e){ return e.msg == msg})) {
            handler.errors[key].push({ msg: msg, reference: reference });
          }
        });
      }
    }

    BaseModel.prototype.$check_rule = function(rule) {
      var self = this, result = rule.checker.call(this);
      rule.attributes.each(function(attribute) {
        self.$mark_validity(result, attribute, rule.msg);
      })
    }

    BaseModel.prototype.$register_validators = function(scope, obj_name) {
      devel_log('$register_validators is deprecated', this);
      if(!this.constructor.scope_validators && !this.constructor.global_validators) return;
      var self = this;
      self.$errors = self.$errors || {};
      obj_name = obj_name || self.constructor.name.underscore();
      if(this.constructor.scope_validators) this.constructor.scope_validators.each(function(rule){
        if(rule.rule == 'function') {
          rule.checker.call(self, scope);
        } else {
          scope.$watchCollection('[' + rule.attributes.union(['_destroy']).unique().map(function(a){ return obj_name + '.' + a; }).join(', ') + ']', function() {
            self.$check_rule(rule);
          });
        }
      });
      if(this.constructor.global_validators) this.constructor.global_validators.each(function(rule){
        scope.$watch(function() { return rule.checker.call(self); }, function(nv, ov) {
          rule.mark.call(self, nv, ov);
        })
      })
    }

    BaseModel.prototype.$is_validated = function(attribute) {
      return this.$errors && !!this.$errors[attribute];
    }
    BaseModel.prototype.$has_error = function(attribute) {
      return this.$errors && this.$errors[attribute] && this.$errors[attribute].length > 0;
    }
    BaseModel.prototype.$get_errors = function(attribute) {
      return this.$errors ? (this.$errors[attribute] || []).map(function(e){ return e.msg; }).join(', ') : '';
    }
    BaseModel.prototype.$invalid = function() {
      var result = false;

      if(this.$errors) Object.values(this.$errors).each(function(errors){
        if(errors.length != 0) {
          result = true;
          return false;
        }
      });
      if(result) return true;

      if(this.$validation_error_handlers) this.$validation_error_handlers.each(function(handler) {
        if(Object.keys(handler.errors).length > 0) {
          result = true;
          return false;
        }
      })
      return result;
    }

    // private logics
    function prepare_rule() {
      var rule = typeof(arguments[0]) == 'object' ? arguments[0] : { attribute: arguments[0] };
      if(typeof(arguments[1]) == 'object') jQuery.extend(rule, arguments[1]);
      else if(typeof(arguments[1]) == 'string') rule.rule = arguments[1];
      if(!rule.rule) rule.rule = 'presence';

      rule.attributes = rule.attributes || [ rule.attribute ];
      prepare_rule_msg(this, rule);
      prepare_rule_checker(this, rule);
      return rule;
    }

    function prepare_rule_msg(model, rule) {
      switch(rule.rule) {
        case 'array_not_empty':
        case 'presence':
          rule.msg = rule.msg || model.$t(rule.attribute) + ' megadása kötelező';
          break;
        case 'email':
        case 'phone':
        case 'nyufig':
        case 'tax_number':
        case 'bank_account':
          rule.msg = rule.msg || model.$t(rule.attribute) + ' hibás formátumú';
          break;
        case 'inclusion':
          if( Object.prototype.toString.call( rule.values ) === '[object Array]' ) {
            var values = rule.values;
            rule.values = {};
            values.each(function(v){ rule.values[v] = v; });
          }

          rule.msg = rule.msg || model.$t(rule.attribute) + ' értéke nem megfelelő, lehetséges értékek: ' + Object.values(rule.values).join(', ') + '.';
          break;
      }
    }

    function prepare_rule_checker(model, rule) {
      switch(rule.rule) {
        case 'presence':
          rule.checker = rule.checker || function() {
            return ((typeof(this[rule.attribute]) == 'string') && this[rule.attribute].length > 0) || ((typeof(this[rule.attribute]) == 'number') && this[rule.attribute] >= 0);
          }
          break;
        case 'amount':
          rule.checker = rule.checker || function() {
            return ((typeof(this[rule.attribute]) == 'string') && this[rule.attribute].length > 0) || ((typeof(this[rule.attribute]) == 'number') && this[rule.attribute] > 0);
          }
          break;
        case 'email':
          rule.checker = rule.checker || function() {
            return (typeof(this[rule.attribute]) != 'string') || (this[rule.attribute].length == 0) || validateEmail(this[rule.attribute]);
          }
          break;
        case 'phone':
          rule.checker = rule.checker || function() {
            return (typeof(this[rule.attribute]) != 'string') || (this[rule.attribute].length == 0) || validatePhone(this[rule.attribute]);
          }
          break;
        case 'bank_account':
          rule.checker = rule.checker || function() {
            return (typeof(this[rule.attribute]) != 'string') || (this[rule.attribute].length == 0) || validateBankAccount(this[rule.attribute]);
          }
          break;
        case 'nyufig':
          rule.checker = rule.checker || function() {
            return (typeof(this[rule.attribute]) != 'string') || (this[rule.attribute].length == 0) || validateNyufig(this[rule.attribute]);
          }
          break;
        case 'tax_number':
          rule.checker = rule.checker || function() {
            return (typeof(this[rule.attribute]) != 'string') || (this[rule.attribute].length == 0) || validateTaxNumber(this[rule.attribute]);
          }
          break;
        case 'inclusion':
          rule.checker = rule.checker || function() {
            return Object.keys(rule.values).indexOf(this[rule.attribute]) != -1;
          }
          break;
        case 'array_not_empty':
          rule.checker = rule.checker || function() { return this['get_' + rule.attribute]().filter(function(e){ return !e._destroy; }).length > 0; }
          rule.mark = rule.mark || function(valid) { this.$mark_validity(valid, rule.attribute, rule.msg); }
          break;
      }
    }

    function register_global_validators() {
      var self = this;
      if(this.$validation_error_handlers) this.$validation_error_handlers.each(function(handler) {
        if(self.constructor.global_validators) self.constructor.global_validators.each(function(rule){
          handler.change_events = handler.change_events || [];
          handler.change_events.push(function() {
            var new_value = rule.checker.call(self);
            if(new_value !== rule.cached_value) {
              rule.mark.call(self, new_value, rule.cached_value);
              rule.cached_value = new_value;
            };
          })
        })
      })
    }

    // helper functions

    function validateEmail(str) {
      var re = /^[a-zA-Z0-9!\#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!\#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+(?:[a-zA-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)$/;
      return re.test(str);
    }

    function validatePhone(str) {
      var re = /^[0-9 \(\)\+\-\,\;\/]*$/;
      return re.test(str);
    }

		function validateBankAccount(str) {
			var re = /^[0-9]{8}([ -]?[0-9]{8}){2}$/;
			return re.test(str);
    }

		function validateNyufig(str) {
      var re = /^[0-9]{3}[ -]?[0-9]{5}[ -]?\d$/;
			return re.test(str);
    }

    function validateTaxNumber(str) {
      var re = /\d{8}-\d-\d{2}/;
			return re.test(str);
		}

  }]);

})(angular);
