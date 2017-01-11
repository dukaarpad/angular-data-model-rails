(function(angular){
  "use strict";

  angular.module('ngDataModel').factory('test.Category', ['extend', 'BaseModel', function(extend, BaseModel){
    extend(Category, BaseModel);

    function Category(){}
    Category.primary_key = 'id';

    Category.enabled_attributes = [
      '_destroy', 'id',
      'name',
    ];

    Category
      .has_many('books')
      .validate('name')

    return Category;
  }])
})(window.angular)