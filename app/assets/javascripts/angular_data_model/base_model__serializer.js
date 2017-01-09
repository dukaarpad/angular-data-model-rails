(function(angular){

  angular.module('ngDataModel').config(['BaseModelProvider', function(BaseModelProvider) {

    var BaseModel = BaseModelProvider.BaseModel;

    // CLASS methods
    BaseModel.attr_tree_for_hash = function(recursive) {
      var tree = {}, self = this;
      tree.only = this.enabled_attributes;
      if(!recursive) return tree;

      if(this.has_many_definitions) {
        tree.includes = tree.includes || {};
        if(this.has_many_definitions) this.has_many_definitions.each(function(rel) {
          if(!rel.skip_json) {
            if(!self.storage[rel.model]) console.log('no rel model for', rel);
            tree.includes[rel.name] = true;
          }
        })
      }

      if(this.has_one_definitions) {
        tree.includes = tree.includes || {};
        if(this.has_one_definitions) this.has_one_definitions.each(function(rel) {
          if(!rel.skip_json) {
            tree.includes[rel.name] = true;
          }
        })
      }
      // do not serialize belongs_to relations
      return tree;
    }

    // INSTANCE methods
    BaseModel.prototype.as_json = function(tree) {
      var self = this, full_recursive = tree === true;
      tree = typeof(tree) == 'object' ? tree : this.constructor.attr_tree_for_hash(tree);

      var result = {};
      if(!/^tmp_.*/.exec(self[self.constructor.primary_key])) {
        result.id = self[self.constructor.primary_key];
        result[self.constructor.primary_key] = self[self.constructor.primary_key];
      }

      tree.only.filter(function(e){ return e != self.constructor.primary_key }).each(function(a){
        if(self[a] !== undefined) result[a] = self[a];
      })

      if(tree.includes) jQuery.each(tree.includes, function(relation, attributes){
        result[relation + '_attributes'] = [];

        var relateds = typeof(self[relation]) == 'function' ? self[relation]() : self[relation];

        if(self.constructor.has_many_definitions &&
           self.constructor.has_many_definitions.find(function(e){ return e.name == relation; }))
          relateds.each(function(i){
            if(i) result[relation + '_attributes'].push(i.as_json(full_recursive || attributes))
            else console.log('no serializable related object', relation, self);
          });
        else if(relateds &&
                self.constructor.has_one_definitions &&
                self.constructor.has_one_definitions.find(function(e){ return e.name == relation; }))
          result[relation + '_attributes'] = relateds.as_json(full_recursive || attributes);
      })
      return result;
    }

    BaseModel.prototype.to_json = function(tree) {
      return JSON.stringify(this.as_json(tree), null, 2);
    }

  }]);

})(angular);

