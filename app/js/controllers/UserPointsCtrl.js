angular.module('mainApp.controllers')
    .controller('UserPointsCtrl',['$scope','$http','$routeParams','AuthService', function($scope,$http,$routeParams,authService){
        //Get user points history
        $scope.loadPointsHistory=function(){
            $http({method: 'GET', url: 'api/user/pointshistory' })
                .success(function(data,status,headers,config){
                    $scope.pointsHistory=data;
                }).error(function(data,status,headers,config){
                });
        };

        //Invoke function to get points history
        $scope.loadPointsHistory();
    }]);
