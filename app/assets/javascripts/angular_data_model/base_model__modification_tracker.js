(function(angular){
  "use strict";
  angular.module('ngDataModel').config(['BaseModelProvider', function(BaseModelProvider) {

    var BaseModel = BaseModelProvider.BaseModel;

    // INSTANCE methods

    BaseModel.prototype.$prepare_properties = function() {
      if(!this.constructor.track_modifications) return;
      var self = this;
      this.$original_attributes = {};
      this.$actual_attributes = {};
      this.$changed_attributes = [];
      this.$watchers = this.$watchers || {};

      this.constructor.enabled_attributes.each(function(attribute) {
        self.$actual_attributes[attribute] = undefined;
        Object.defineProperty(self, attribute, {
          enumerable: true,
          get: function()  { return self.$actual_attributes[attribute] },
          set: function(v) {
            self.$actual_attributes[attribute] = v;

            if(self.$original_attributes[attribute] == self.$actual_attributes[attribute])
              self.$changed_attributes.remove(function(e) { return e == attribute; })
            else
              if(self.$changed_attributes.indexOf(attribute) == -1)
                self.$changed_attributes.push(attribute);

            if(self.$skip_watchers) return;

            if(self.$watchers[attribute])
              self.$watchers[attribute].each(function(w) { w.call(self, v); });

            self.$triggerChangeEvents();
          }
        });
      });

      Object.defineProperty(this, '$changed', {
        get: function() {
          if(self._destroy) return false;
          if(self.$changed_attributes.length > 0) return true;

          var changed = false;

          // has_many
          if(self.constructor.has_many_definitions) self.constructor.has_many_definitions.each(function(rel) {
            self['get_' + rel.name]().each(function(object){
              if(object.$changed) {
                changed = true;
                return false; // -> break
              }
            })
            if(changed) return false; // -> break
          });
          if(changed) return true;

          // has_one
          if(self.constructor.has_one_definitions) self.constructor.has_one_definitions.each(function(rel) {
            var ob = self['get_' + rel.name]();
            if(ob && ob.$changed) {
              changed = true;
              return false; // -> break
            }
          });
          if(changed) return true;

          return false;
        }
      });

      this.$get_changed_values = function() {
        if(this._destroy) return [];
        var result = [], self = this;
        this.$change_chache = this.$change_chache || {};
        this.$changed_attributes.each(function(attribute) {
          self.$change_chache[self.$attr_id(attribute)] = self.$change_chache[self.$attr_id(attribute)] || {
            id: self.$attr_id(attribute),
            ob_name: self.$t(),
            name: self.$t(attribute),
            original: self['get_formatted_' + attribute] ? self['get_formatted_' + attribute](self.$original_attributes[attribute]) : self.$original_attributes[attribute],
            revert: function() { self[attribute] = self.$original_attributes[attribute]; }
          }
          self.$change_chache[self.$attr_id(attribute)].actual = self['get_formatted_' + attribute] ? self['get_formatted_' + attribute]() : self[attribute];
          if(!self.$change_chache[self.$attr_id(attribute)].name.startsWith('[missing'))
            result.push(self.$change_chache[self.$attr_id(attribute)]);
          else
            console.log('nem listázott módosítás: ', self.$change_chache[self.$attr_id(attribute)]);
        })

        if(self.constructor.has_many_definitions) self.constructor.has_many_definitions.each(function(rel) {
          self['get_' + rel.name]().each(function(object){
            if(object && object.$get_changed_values) result = result.concat(object.$get_changed_values());
          })
        });
        if(self.constructor.has_one_definitions) self.constructor.has_one_definitions.each(function(rel) {
          var object = self['get_' + rel.name]();
          if(object && object.$get_changed_values) result = result.concat(object.$get_changed_values());
        });
        return result.unique('id');
      }

      this.$triggerChangeEvents = function() {
        if(this.$validation_error_handlers)
          this.$validation_error_handlers.each(function(handler){ handler.triggerChangeEvents(); })
      }

      this.$after_init = this.$after_init ? this.$after_init.clone() : [];
      this.$after_init.push(this.$triggerChangeEvents);

      this.$watch = function(attrs, fn) {
        if(typeof(attrs) == 'string') attrs = [ attrs ];
        attrs.each(function(attr) {
          self.$watchers[attr] = self.$watchers[attr] || [];
          self.$watchers[attr].push(fn);
        })
      }

      this.$trigger_all_watchers = function() {
        angular.forEach(this.$watchers, function(watchers, attr) {
          watchers.each(function(watcher){
            watcher.call(self, self[attr]);
          })
        });
      }
      this.$after_init.push(this.$trigger_all_watchers);
    }

    BaseModel.prototype.$reset_modification_tracker = function() {
      if(!this.constructor.track_modifications) return;
      this.$original_attributes = jQuery.extend(true, {}, this.$actual_attributes);
      this.$changed_attributes = [];
    }

    BaseModel.prototype.set = function(attributes) {
      for(var key in attributes)
        this[key] = attributes[key];
      return this;
    }

    BaseModel.prototype.is_attribute_changed = function(attribute_name) {
      return this.$changed_attributes.indexOf(attribute_name) > -1;
    }

    BaseModel.add_before_init = function(fn) {
      this.prototype.$before_init = this.prototype.$before_init ? this.prototype.$before_init.clone() : [];
      this.prototype.$before_init.push(fn);
    }

    BaseModel.add_after_init = function(fn) {
      this.prototype.$after_init = this.prototype.$after_init ? this.prototype.$after_init.clone() : [];
      this.prototype.$after_init.push(fn);
    }

    BaseModel.add_watcher = function(attribute, fn) {
      this.prototype.$watchers = this.prototype.$watchers ? jQuery.extend({}, this.prototype.$watchers) : {};
      this.prototype.$watchers[attribute] = this.prototype.$watchers[attribute] ? this.prototype.$watchers[attribute].clone() : [];
      this.prototype.$watchers[attribute].push(fn);
    }

  }]);

})(angular);
