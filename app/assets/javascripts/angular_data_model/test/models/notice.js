(function(angular){
  "use strict";

  angular.module('ngDataModel').factory('test.Notice', ['extend', 'BaseModel', function(extend, BaseModel){
    extend(Notice, BaseModel);

    function Notice(){}
    Notice.primary_key = 'id';

    Notice.enabled_attributes = [
      '_destroy', 'id',
      'title', 'message',
      'noticable_type', 'noticable_id',
    ];

    Notice
      .belongs_to_polymorphic('noticable', [ 'Book', 'Person' ])
      .validate('title')

    return Notice;
  }])
})(window.angular)