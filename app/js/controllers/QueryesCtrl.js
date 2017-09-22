angular.module('mainApp.controllers')
.controller('QueryesCtrl', ['$scope','$http','AuthService', function($scope,$http,authService){
     $scope.typeValue='my';
    //Load user Queryes
    $scope.loadUserQueryes=function(){
        $scope.typeValue='my';
        $http({method: 'GET', url: 'api/users/'+authService.currentUser()._id+'/queryes' })
            .success(function(data,status,headers,config){
                $scope.userQueryes=data;
            }).error(function(data,status,headers,config){
                alert(data.message);
            });
    };
	
	//Load deleted user Queryes
    $scope.loadDeletedQueryes=function(){
        $scope.typeValue='trash';
        $http({method: 'GET', url: 'api/users/'+authService.currentUser()._id+'/queryes_del' })
            .success(function(data,status,headers,config){
                $scope.userQueryes=data;
            }).error(function(data,status,headers,config){
                alert(data.message);
            });
    };

    //Load Favorties Queryes
    $scope.loadFavoritesQueryes=function(){
        $scope.typeValue='fav';
        $http({method: 'GET', url: 'api/users/'+authService.currentUser()._id+'/favorites' })
            .success(function(data,status,headers,config){
                $scope.userQueryes=data;
            }).error(function(data,status,headers,config){
                alert(data.message);
            });
    };

    //Delete Querye
    $scope.deleteQuerye=function(id,index){
        $http({method: 'DELETE', url: 'api/users/'+authService.currentUser()._id+'/queryes/'+id })
            .success(function(data,status,headers,config){
                //Delete from DOM
                $scope.userQueryes.splice(index,1);
            }).error(function(data,status,headers,config){
            });
    };

    $scope.loadUserQueryes();

}]);
