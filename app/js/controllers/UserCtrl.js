angular.module('mainApp.controllers')
    .controller('UserCtrl',['$scope','$http','$routeParams','AuthService', function($scope,$http,$routeParams,authService){

        //Get user profile function
        $scope.loadUserData=function(){
            $http({method: 'GET', url: 'api/users/'+$routeParams.id })
                .success(function(data,status,headers,config){
                    $scope.userData=data;
                }).error(function(data,status,headers,config){
                });
        };

        //Invoke function to get user profile
        $scope.loadUserData();


    }]);
