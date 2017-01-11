(function(angular){
  "use strict";

  angular.module('ngDataModel').factory('ngDataModel.testStorage1', Storage);
  Storage.$inject = [
    'StorageHandler',

    'test.Category',
    'test.Book',
    'test.Person',
    'test.Notice',
  ];

  function Storage(StorageHandler) {

    return new StorageHandler(arguments);

  }

})(window.angular);
