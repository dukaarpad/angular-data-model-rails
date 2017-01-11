(function(angular){
  "use strict";

  angular.module('ngDataModel').factory('test.Book', ['extend', 'BaseModel', function(extend, BaseModel){
    extend(Book, BaseModel);

    function Book(){}
    Book.primary_key = 'id';

    Book.enabled_attributes = [
      '_destroy', 'id',
      'title', 'price', 'edition', 'antique',
      'category_id',
    ];

    Book
      .belongs_to('category')
      .has_many('authors', 'Person', { personable_id: 'this.id', type: 'author', personable_type: 'Book' })
      .has_many('lectors', 'Person', { personable_id: 'this.id', type: 'lector', personable_type: 'Book' })
      ._checkbox(['antique'])
      ._date('edition')

      .validate('edition')
      .validate('title')
      .validate('price')

    return Book;
  }])
})(window.angular)