angular.module('mainApp.controllers').
    controller('QueryeAddCtrl', ['$scope','$http','$routeParams','AuthService','$location',function($scope, $http,$routeParams, authService, $location){
        //Query Model
        $scope.queryModel={
            title: "",
            desc: "",
            type: 1,
            settings:{
              p_view: 2,
              p_view_questions: 2,
              p_view_answers: 2,
              p_questions: 2,
              p_questions_publish: 1,
              p_view_user: 2
            }
        };

        //Check if Edit Mode
        if($routeParams.id!==undefined){
            method="PUT";
            $scope.btnText="Zapisz zmiany";
            $scope.panelTitle="Edycja Querye";
            $scope.queryeId=$routeParams.id;

            //Get Querye
            $http({method: 'GET', url: 'api/queryes/'+$routeParams.id })
                .success(function(data,status,headers,config){
                    $scope.queryModel=data;
                }).error(function(data,status,headers,config){
                });
        } else {
            var method="POST";
            $scope.btnText="Dodaj";
            $scope.panelTitle="Dodawanie Querye";
            $scope.queryeId='';
        }

        //Select Query Type function
        $scope.selectQueryeType=function(type){
            $scope.queryModel.type=type;
        };

        //Watch change of visible
        $scope.$watch('queryModel.optionVisible', function(newValue, oldValue) {
            if(newValue=='nobody'){
                $scope.queryModel.optionVisibleAnswers='nobody';
                $scope.queryModel.optionVisibleUser='nobody';

            }
        });

        //Send function
        $scope.sendQuerye=function(){
            //Before send
            $('#sendButton').button('loading');
            //Sending request
            $http({method: method, url: 'api/queryes/'+$scope.queryeId,
                data: $.param({
                    user_id: authService.currentUser()._id,
                    title: $scope.queryModel.title,
                    descr: $scope.queryModel.desc,
                    type: $scope.queryModel.type,
                    p_view: $scope.queryModel.settings.p_view,
                    p_view_answers: $scope.queryModel.settings.p_view_answers,
                    p_questions: $scope.queryModel.settings.p_questions,
                    p_view_user: $scope.queryModel.settings.p_view_user,
                    p_questions_publish: $scope.queryModel.settings.p_questions_publish,
                    p_view_questions: $scope.queryModel.settings.p_view_questions
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data, status, headers, config) {
                    //After Request
                    $('#sendButton').button('reset');
                    $location.path('/queryes');
                }).
                error(function(data, status, headers, config) {
                    alert(data.message);
                    //After Request
                    $('#sendButton').button('reset');
                });
        };
    }]);