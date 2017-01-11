(function(angular){
  "use strict";

  // HAS_MANY -----------------------------------------------------------------------

  angular.module('ngDataModel').config(['BaseModelProvider', function(BaseModelProvider) {

    var BaseModel = BaseModelProvider.BaseModel;

    function check_rel_model(instance) {
      if(!instance.constructor.storage[this.model]) {
        devel_log('no ' + this.model + ' model defined/loaded in actula storage, try to load it for', instance, this);
        instance.constructor.storage.registerModel(this.model);
      }
    }

    function parse_relation(args, multi) {
      if(typeof(args[0]) == 'object') return args[0];
      var relation;
      if(args[1]) {
        relation = (typeof(args[1]) == 'object' && args[1].model || args[1].conditions) ? args[1] : {};
        relation.name = relation.name || args[0];
        relation.model = relation.model || (typeof(args[1]) == 'string' ? args[1] : (multi ? relation.name.singularize() : relation.name).camelize());
        if(typeof(args[1]) == 'object' && !args[1].model && !args[1].conditions && !args[2]) relation.conditions = args[1];
        if(typeof(args[2]) == 'object') relation.conditions = args[2];
      }
      else relation = { name: args[0], model: (multi ? args[0].singularize() : args[0]).camelize() };
      relation.check = function(instance) { return check_rel_model.call(this, instance) };
      return relation;
    }

    // common instance methods
    BaseModel.prototype.$parse_conditions = function(conditions) {
      conditions = jQuery.extend({}, conditions);
      for(var key in conditions) {
        if(typeof(conditions[key]) == 'string' && conditions[key].startsWith('this.')) {
          var value = this;
          conditions[key].split('.').each(function(attr) {
            if(attr == 'this') return;
            if(value) value = value[attr]
          })
          conditions[key] = value;
        } else if(typeof(conditions[key]) == 'function') {
          conditions[key] = conditions[key].call(this);
        }
      }
      return conditions;
    }
    BaseModel.prototype.$build_related_object = function(attrs, validation_error_handler, relation) {
      attrs = attrs || {};
      validation_error_handler = validation_error_handler || this.$validation_error_handlers;
      relation.check(this);

      if(this.constructor.storage[attrs.constructor.name]) {
        if(relation.conditions) jQuery.each(this.$parse_conditions(relation.conditions), function(attr, value) {
          attrs[attr] = value;
        });
        if(validation_error_handler) attrs.add_validation_error_handler(validation_error_handler);
        return attrs;
      }

      return this.constructor.storage[relation.model].build(
        relation.conditions
          ? jQuery.extend(true, {}, attrs, this.$parse_conditions(relation.conditions))
          : attrs,
        validation_error_handler);
    }

    // CLASS methods
    BaseModel.has_many = function() {
      var rel = parse_relation(arguments, true);
      this.has_many_definitions = this.has_many_definitions ? this.has_many_definitions.clone() : [];
      this.has_many_definitions.push(rel);

      var ids = rel.name.singularize() + '_ids';
      this.real_attributes = this.real_attributes ? this.real_attributes.clone() : [];
      this.real_attributes.push(ids);

      this.prototype['get_' + rel.name] = function() {
        var self = this;
        rel.check(this);
        return rel.conditions
          ? this.constructor.storage[rel.model].where(this.$parse_conditions(rel.conditions))
          : (this[ids] || []).map(function(id) { return self.constructor.storage[rel.model].find(id); });
      }
      this.prototype['add_' + rel.name.singularize()] = function(attrs, validation_error_handler) {
        var ob = this.$build_related_object(attrs, validation_error_handler, rel);
        this[ids] = this[ids] || [];
        if(this[ids].indexOf(ob[this.constructor.storage[rel.model].primary_key]) == -1)
          this[ids].push(ob[this.constructor.storage[rel.model].primary_key]);
        if(this.$triggerChangeEvents) this.$triggerChangeEvents();
        return ob;
      }

      Object.defineProperty(this.prototype, rel.name, {
        get: function() {
          return this['get_' + rel.name]();
        },
        enumerable: true
      });

      return this;
    }

    // INSTANCE methods
    BaseModel.prototype.build_has_many = function(attrs, validation_error_handler) {
      var self = this;
      this.constructor.has_many_definitions.each(function(relation) {
        if(attrs[relation.name]) {
          relation.check(self);
          var rel_ob = self['get_' + relation.name]();
          if(rel_ob && rel_ob.$remove_unpersisted_from_storage) rel_ob.$remove_unpersisted_from_storage();
          attrs[relation.name].each(function(ch) {
            self['add_' + relation.name.singularize()](ch, validation_error_handler);
          });
        }
      });
    }

    // HAS_ONE ------------------------------------------------------------------------

    // CLASS methods
    BaseModel.has_one = function() {
      var rel = parse_relation(arguments);
      this.has_one_definitions = this.has_one_definitions ? this.has_one_definitions.clone() : [];
      this.has_one_definitions.push(rel);

      var id = rel.name + '_id';
      this.real_attributes = this.real_attributes ? this.real_attributes.clone() : [];
      this.real_attributes.push(id);

      this.prototype['get_' + rel.name] = function() {
        rel.check(this);
        return rel.conditions
          ? this.constructor.storage[rel.model].find_by(this.$parse_conditions(rel.conditions))
          : this.constructor.storage[rel.model].find(this[id])
      }
      this.prototype['create_' + rel.name] = function(attrs, validation_error_handler) {
        var rel_ob = this['get_' + rel.name]();
        if (rel_ob && !rel_ob.persisted){
          delete(rel_ob.constructor.storage.objects[rel_ob.constructor.db_name || rel_ob.constructor.name][rel_ob[rel_ob.constructor.primary_key]]);
        }
        var ob = this.$build_related_object(attrs, validation_error_handler, rel);
        this[id] = ob[this.constructor.storage[rel.model].primary_key];
        if(this.$triggerChangeEvents) this.$triggerChangeEvents();
        return ob;
      }

      Object.defineProperty(this.prototype, rel.name, {
        get: function() {
          return this['get_' + rel.name]();
        },
        enumerable: true
      });

      return this;
    }

    // INSTANCE methods
    BaseModel.prototype.build_has_one = function(attrs, validation_error_handler) {
      var self = this;
      this.constructor.has_one_definitions.each(function(relation) {
        if(attrs[relation.name]) {
          relation.check(self);
          var rel_ob = self['get_' + relation.name]();
          if(rel_ob && rel_ob.$remove_unpersisted_from_storage) rel_ob.$remove_unpersisted_from_storage();
          self['create_' + relation.name](attrs[relation.name], validation_error_handler);
        }
      });
    }

    // BELONGS_TO ---------------------------------------------------------------------

    // CLASS methods
    BaseModel.belongs_to = function() {
      var rel = parse_relation(arguments);
      this.belongs_to_definitions = this.belongs_to_definitions ? this.belongs_to_definitions.clone() : [];
      this.belongs_to_definitions.push(rel);

      var id = rel.name + '_id';
      this.real_attributes = this.real_attributes ? this.real_attributes.clone() : [];
      this.real_attributes.push(id);

      this.prototype['get_' + rel.name] = function() {
        rel.check(this);
        return rel.conditions
          ? this.constructor.storage[rel.model].find_by(this.$parse_conditions(rel.conditions))
          : this.constructor.storage[rel.model].find(this[id])
      }
      this.prototype['set_' + rel.name] = function(attrs) {
        var ob = this.constructor.storage[rel.model].build(attrs);
        this[id] = ob[this.constructor.storage[rel.model].primary_key];
        if(this.$triggerChangeEvents) this.$triggerChangeEvents();
        return ob;
      }

      Object.defineProperty(this.prototype, rel.name, {
        get: function() {
          return this['get_' + rel.name]();
        },
        enumerable: true
      });

      return this;
    }

    // INSTANCE methods
    BaseModel.prototype.build_belongs_to = function(attrs) {
      var self = this;
      this.constructor.belongs_to_definitions.each(function(relation) {
        if(attrs[relation.name]) {
          relation.check(self);
          var rel_ob = self['get_' + relation.name]();
          if(rel_ob && rel_ob.$remove_unpersisted_from_storage) rel_ob.$remove_unpersisted_from_storage();
          self['set_' + relation.name](attrs[relation.name]);
        }
      });
    }

    // BELONGS_TO polymorphic

    // CLASS methods
    BaseModel.belongs_to_polymorphic = function(attribute, models, attribute_type, attribute_key) {
      attribute_type = attribute_type || attribute + '_type';
      attribute_key  = attribute_key  || attribute + '_' + this.primary_key;
      this.belongs_to_polymorphic_definitions = this.belongs_to_polymorphic_definitions ? this.belongs_to_polymorphic_definitions.clone() : [];
      this.belongs_to_polymorphic_definitions.push({attribute: attribute, models: models, attribute_type: attribute_type, attribute_key: attribute_key});

      for(var i = 0; i < models.length; i++) {
        var model = models[i];
        var conditions = {};
        conditions[this.primary_key] = 'this.' + attribute_key;
        console.log('buidl has_one', model.underscore(), conditions)
        this.belongs_to(model.underscore(), conditions);
      }

      Object.defineProperty(this.prototype, attribute, {
        get: function() {
          for(var i = 0; i < models.length; i++) {
            var model = models[i];
            if(this[attribute_type] == model)
              return this[model.underscore()];
          }
          return null;
        },
        enumerable: true
      })

      return this;
    }

    // INSTANCE methods
    BaseModel.prototype.build_belongs_to_polymorphic = function(attrs) {
      var self = this;
      this.constructor.belongs_to_polymorphic_definitions.each(function(relation) {
        if(attrs[relation.attribute]) {
          for(var i = 0; i < relation.models.length; i++) {
            var model = relation.models[i];
            if(attrs[relation.attribute_type] == model) {
              var rel_ob = self['get_' + model.underscore()]();
              if(rel_ob && rel_ob.$remove_unpersisted_from_storage) rel_ob.$remove_unpersisted_from_storage();
              self['set_' + model.underscore()](attrs[relation.attribute]);
            }
          }
        }
      });
    }

    BaseModel.finder = function() {
      var rel = parse_relation(arguments);

      this.prototype['get_' + rel.name] = function() {
        rel.check(this);
        return this.constructor.storage[rel.model].where(this.$parse_conditions(rel.conditions))
      }

      Object.defineProperty(this.prototype, rel.name, {
        get: function() {
          return this['get_' + rel.name]();
        },
        enumerable: true
      });

      return this;
    }

    BaseModel.prototype.$remove = function() {
      var self = this;
      self._destroy = 1;
      if(self.constructor.has_many_definitions) self.constructor.has_many_definitions.each(function(rel) {
        self['get_' + rel.name]().each(function(ch) { if(ch.$remove) ch.$remove(); })
      })
      if(self.constructor.has_one_definitions) self.constructor.has_one_definitions.each(function(rel) {
        var ho = self['get_' + rel.name]();
        if(ho && ho.$remove) ho.$remove();
      });
      this.$remove_from_storage();
    }

    BaseModel.prototype.$remove_from_storage = function() {
      devel_log('remove', this);
      delete(this.constructor.storage.objects[this.constructor.db_name || this.constructor.name][this[this.constructor.primary_key]]);
    }

    BaseModel.prototype.$remove_unpersisted_from_storage = function() {
      if(!this.persisted)
        this.$remove_from_storage();
    }

  }]);


})(angular);

