(function(angular){

  angular.module('ngDataModel').controller('test1_controller', ['$scope', 'ngDataModel.testStorage1', function($scope, storage) {
    $scope.JSON = JSON;

    devel_log(storage);
    $scope.categories = storage.Category.build_all([
      {
        id: 1,
        name: 'C1',
        books: [
          {
            id: 1,
            title: 'B1',
            price: 10,
            edition: 2010,
            antique: true,
            authors: [
              {
                id: 1,
                name: 'P1'
              },
              {
                id: 2,
                name: 'P2'
              },
            ],
            lectors: [
              {
                id: 3,
                name: 'P3'
              },
              {
                id: 4,
                name: 'P4'
              },
            ]
          },
        ]
      },
    ]);

    $scope.notices = storage.Notice.build_all([
      {
        id: 1,
        title: 'N1',
        message: 'M1',
        noticable_type: 'Book',
        noticable_id: 10,
        noticable: {
          id: 10,
          title: 'B10',
          price: 20,
          edition: 2000,
          antique: false,
          authors: [
            {
              id: 5,
              name: 'P5'
            }
          ]
        }
      },
      {
        id: 2,
        title: 'N2',
        message: 'M2',
        noticable_type: 'Person',
        noticable_id: 11,
        noticable: {
          id: 11,
          name: 'P11'
        }
      },
    ])
  }]);

})(window.angular);