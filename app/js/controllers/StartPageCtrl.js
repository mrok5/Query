angular.module('mainApp.controllers', [])
    .controller('StartPageCtrl', ['$scope', '$http', 'AuthService', function ($scope, $http, authService) {
        //Varibles
        $scope.isDataLoading=false;
        $scope.sortValue = 'newst';
        $scope.typeValue = 0;
        $scope.currentUser = '';
        $scope.skip=0;

        if (authService.authorized()) {
            $scope.currentUser = authService.currentUser()._id;
        }

;

        //POST Querye Vote
        $scope.postQueryeVote = function (voteType, index) {
            if (authService.authorized()) {
                $http({method: 'POST', url: 'api/queryes/' + $scope.allQueryes[index]._id + '/votes/' + voteType,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).
                    success(function (data, status, headers, config) {
                        if (voteType == 1) {
                            $scope.allQueryes[index].up_votes_count++;
                            $scope.allQueryes[index].up_voters.push($scope.currentUser);
                            //Check oposite vote
                            for (var i = 0; i < $scope.allQueryes[index].down_voters.length; i++) {
                                if ($scope.allQueryes[index].down_voters[i] == $scope.currentUser) {
                                    $scope.allQueryes[index].down_voters.splice(i);
                                    $scope.allQueryes[index].down_votes_count--;
                                    break;
                                }
                            }
                        } else {
                            $scope.allQueryes[index].down_votes_count++;
                            $scope.allQueryes[index].down_voters.push($scope.currentUser);
                            for (var i = 0; i < $scope.allQueryes[index].up_voters.length; i++) {
                                if ($scope.allQueryes[index].up_voters[i] == $scope.currentUser) {
                                    $scope.allQueryes[index].up_voters.splice(i);
                                    $scope.allQueryes[index].up_votes_count--;
                                    break;
                                }
                            }
                        }

                    }).
                    error(function (data, status, headers, config) {
                    });
            } else {
                alert('Zaloguj się aby głosować!')
            }
        };

        //Load more queryes
        $scope.loadMore=function(){
            $scope.skip=$scope.skip+20;
            $scope.loadQueryes($scope.typeValue,true);
        }

        //Get All Queryes
        $scope.loadQueryes = function (type,append) {
            $scope.isDataLoading=true;
            $scope.typeValue = type;
            $http({method: 'GET', url: 'api/queryes/' + type + '/' + $scope.sortValue + '/'+$scope.skip })
                .success(function (data, status, headers, config) {
                    $scope.isDataLoading=false;
                    if(append==true){
                        for(var i=0;i<data.length;i++){
                            $scope.allQueryes.push(data[i]);
                        }
                    } else {
                        $scope.allQueryes = data;
                    }

                }).error(function (data, status, headers, config) {
                    $scope.isDataLoading=false;
                });
        };

        //Watch for sort value changed
        $scope.$watch('sortValue', function () {
            $scope.loadQueryes($scope.typeValue,false);
        });


    }]);
