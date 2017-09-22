angular.module('mainApp.controllers')
    .controller('AnswersCtrl',['$scope','$http','$routeParams','AuthService', function($scope,$http,$routeParams,authService){

        //Get Answers for User
        $scope.loadUserAnswers=function(type){
            $http({method: 'GET', url: 'api/users/answers/'+type })
                .success(function(data,status,headers,config){
                    $scope. userQuestions=data;
                }).error(function(data,status,headers,config){
                });
        };
		//Edit QUESTIONS
		
        $scope.editQuestion=function(id,index){
             $scope.phoneData = {'name': 'Nexus S'};
			 // $('#editButton').button('loading');
			  $scope.myValue = true;
            $http({method: 'PUT', url: 'api/users/answers/'+id,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
				
            })
            
        };
		//Send QUESTIONS
		
        $scope.sendQuestion=function(){
			  
			  $scope.myValue = false;
           
            
        };

        //Invoke Load Function
        $scope.loadUserAnswers('answered');

        //Tab Change Event
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            $scope.currentType = e.target.name;
            $scope.loadUserAnswers(e.target.name);
        });

    }])