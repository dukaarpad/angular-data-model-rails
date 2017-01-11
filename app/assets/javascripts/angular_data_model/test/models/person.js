(function(angular){
  "use strict";

  angular.module('ngDataModel').factory('test.Person', ['extend', 'BaseModel', function(extend, BaseModel){
    extend(Person, BaseModel);

    function Person(){}
    Person.primary_key = 'id';

    Person.enabled_attributes = [
      '_destroy', 'id',
      'name', 'type', 'personable_type', 'personable_id',
    ];

    Person
      .has_many('books')
      .validate('name')

    return Person;
  }])
})(window.angular)