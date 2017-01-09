(function(angular){

  angular.module('ngDataModel').config(['BaseModelProvider', function(BaseModelProvider) {

    var BaseModel = BaseModelProvider.BaseModel;

    function recursive_attribute_translator(model, attr) {
      if(model.indexOf('/') != -1) {
        var chain = model.split('/'), model_i18n;
        while(true) {
          if(chain.length == 0) return model + '.' + attr;
          if((model_i18n = I18n.t('activerecord.attributes')[chain.join('/')]) && model_i18n[attr])
            return model_i18n[attr];
          chain.pop();
        }
      } else return I18n.t('activerecord.attributes.' + model + '.' + attr)
    }

    // CLASS methods
    BaseModel.$t = function(attr, count) {
      this.translations = this.translations || {};
      var model = (this.model_name || this.name).underscore().replace(/__/g, '/');
      this.translations[model] = this.translations[model] || {};
      if(!attr) {
        attr = model;
        if(count && count > 1) attr = 'more_' + attr;
        if(!this.translations[model][attr]) this.translations[model][attr] = I18n.t('activerecord.models.' + model);
        return this.translations[model][attr];
      } else {
        if(count && count > 1) attr = 'more_' + attr;
        if(!this.translations[model][attr]) this.translations[model][attr] = recursive_attribute_translator(model, attr);
        return this.translations[model][attr];
      }
    }

    BaseModel.human_attribute_value = function(attribute, value){
      //TODO: inherited translations
      var values_scope = 'activerecord.values.' + (this.model_name || this.name).underscore() + '.' + attribute;
      var values       = this[attribute.pluralize().toUpperCase()];
      return I18n.t(values_scope + '.' + values[value]);
    }

    // INSTANCE methods
    BaseModel.prototype.$t = function(attr, count) {
      return this.constructor.$t(attr, count);
    }

  }]);

})(angular);
