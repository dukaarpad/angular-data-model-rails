(function(){

  angular.module('ngDataModel').provider('BaseModel.behavior.select', function() {

    this.prepare_behavior = function(attribute, settings) {
      var rule = {};
      switch(Object.prototype.toString.call(settings)) {
        case '[object Array]':
          rule.values = settings;
          break;
        case '[object Object]':
          var is_settings_object = false;
          ['values', 'identifier', 'name', 'filter', 'hash'].each(function(prop) {
            if(settings.hasOwnProperty(prop)) {
              is_settings_object = true;
              return false;
            }
          });
          if(is_settings_object)
            rule = settings;
          else {
            rule = { values: [], identifier: 'key', name: 'value' };
            jQuery.each(settings, function(key, value) {
              rule.values.push({key: key, value: value});
            })
          }
          break;
      }

      if(rule.hash && !rule.values) {
        Object.defineProperty(rule, 'values', {
          get: function() { return Object.values(this.hash) }
        });
      }

      if(!rule.identifier) {
        if(!rule.values[0]) {
          jbk_log_error('frontend select: hiányos értékkészlet (identifier): ' + attribute + ' settings: ' + JSON.stringify(settings) + ' rule: ' + JSON.stringify(rule));
          rule.identifier = 'id';
        } else {
          ['id', 'uuid', 'key'].each(function(prop) {
            if(rule.values[0].hasOwnProperty(prop)) {
              rule.identifier = prop;
              return false;
            }
          })
        }
      }
      if(!rule.name) {
        if(!rule.values[0]) {
          jbk_log_error('frontend select: hiányos értékkészlet (name): ' + attribute + ' settings: ' + JSON.stringify(settings) + ' rule: ' + JSON.stringify(rule));
          rule.name = 'name';
        } else {
          ['value', 'name'].each(function(prop) {
            if(rule.values[0].hasOwnProperty(prop)) {
              rule.name = prop;
              return false;
            }
          })
        }
      }

      if(!rule.disabled) {
        rule.disabled = function() { return false; }
      } else if(typeof(rule.disabled) == 'string') {
        rule.disabled_attr = rule.disabled;
        rule.disabled = function() {
          return this[rule.disabled_attr];
        }
      }

      rule.is_disabled = function(item, object) {
        return rule.disabled.call(item, object);
      }

      rule.filtered_values = function(object) {
        var rule = this;
        return typeof(rule.filter) == 'function'
          ? rule.values.findAll(function(item) {
            return rule.filter.call(item, object);
          })
          : rule.values;
      }

      if(typeof(rule.name) == 'string') rule.name_attr = rule.name;

      rule.name = typeof(rule.name) == 'function'
        ? rule.name
        : function() {
          return this[rule.name_attr];
        };

      rule.get_name = function(item, object) {
        return rule.name.call(item, object);
      }


      var Model = this;

      Model['get_formatted_' + attribute] = function(id, object) {
        var self = this;
        var option = this.$behaviors[attribute].values.find(function(item) {
          return item[self.$behaviors[attribute].identifier] === id;
        });

        return option ? this.$behaviors[attribute].name.call(option, object) : '';
      }

      Object.defineProperty(Model.prototype, 'formatted_' + attribute, {
        enumerable: true,
        get: function() { return this['get_formatted_' + attribute]() }
      });

      Object.defineProperty(Model.prototype, 'options_for_' + attribute, {
        enumerable: true,
        get: function() { return this.constructor.$behaviors[attribute].filtered_values(this); }
      });


      return rule;
    }

    this.$get = function() {}; // fake provider
  });

})();
