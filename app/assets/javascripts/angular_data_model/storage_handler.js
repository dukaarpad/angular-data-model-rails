(function(angular){

  angular.module('ngDataModel').factory('StorageHandler', ['extend', '$injector', function(extend, $injector){

    function StorageHandler(models){
      this.objects = {};

      if(models && models.length > 1) {
        for(var i = 0; i < models.length; i++)
          if(models[i] != this.constructor) this.registerModel(models[i]);
      }
      this.clean = function() {
        this.objects = {};
      }
    }

    StorageHandler.prototype.registerModel = function(model, name) {
      if(typeof(model) == 'string') {
        if(model.indexOf('.') == -1) model = 'common.' + model;
        var model_factory = null;
        try {
          model_factory = $injector.get(model);
        }
        catch(err) {
          devel_log(model, ' model autoload failed');
          return;
        }
        devel_log(model, ' autoload succeed, load it manually in your storage_config');
        model = model_factory;
      }
      name = name || model.name;

      var n = eval('function ' + name + '(attrs) { model.call(this, attrs); }; (function(){return ' + name + ';})();');
      extend(n, model);

      n.storage = this;

      this[name] = n;
      if(model.name != name) this[model.name] = n;

      return this;
    }

    return StorageHandler;

  }]);

})(angular);