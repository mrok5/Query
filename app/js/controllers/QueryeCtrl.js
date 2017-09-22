angular.module('mainApp.controllers')
    .controller('QueryeCtrl',['$scope','$http','$routeParams','AuthService','dateFilter', function($scope,$http,$routeParams,authService,dateFilter){
        //Custon Settings
        $scope.isDataLoading=true;
        $scope.showTextArea=false;
        $scope.showInfoPanel=false;
        $scope.currentAnswerStarted=''; //when posting answer take the current id
        $scope.currentAnswerStartedIndex=-1;
        $scope.isCurrentUserOwner=false; //if current user is owner a querye
        $scope.currentUser=null;
        $scope.authorized=authService.authorized();
        $scope.isErrorNotFound=false;
        $scope.authService=authService;

        //Pagination
        $scope.skip=0;
        $scope.typeValue='newst';

        //Data Model
        $scope.question='';

        //Get Querye data function
        $scope.getQuerye=function(){
            $http({method: 'GET', url: 'api/queryes/'+$routeParams.id })
                .success(function(data,status,headers,config){
                    $scope.currentQuerye=data;
                    $scope.isDataLoading=false;
                    //Check if user is owenr
                    if(authService.authorized()){
                        $scope.currentUser=authService.currentUser()._id;
                        if(data.user_id==$scope.currentUser){
                            $scope.isCurrentUserOwner=true;
                        }  else {
                            $scope.isCurrentUserOwner=false;
                        }
                    }
                }).error(function(data,status,headers,config){
                    $scope.isErrorNotFound=true;
                    $scope.isDataLoading=false;
                });
        };

        //POST Querye Vote
        $scope.postQueryeVote=function(voteType){
            if(authService.authorized()){
                $http({method: 'POST', url: 'api/queryes/'+$scope.currentQuerye._id+'/votes/'+voteType,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).
                    success(function(data, status, headers, config) {
                        if(voteType==1){
                            $scope.currentQuerye.up_votes_count++;
                            $scope.currentQuerye.up_voters.push($scope.currentUser);
                            //Check oposite vote
                            for (var i = 0; i < $scope.currentQuerye.down_voters.length; i++) {
                                if ($scope.currentQuerye.down_voters[i] == $scope.currentUser) {
                                    $scope.currentQuerye.down_voters.splice(i);
                                    $scope.currentQuerye.down_votes_count--;
                                    break;
                                }
                            }
                        } else {
                            $scope.currentQuerye.down_votes_count++;
                            $scope.currentQuerye.down_voters.push($scope.currentUser);
                            //check oposite vote
                            for (var i = 0; i < $scope.currentQuerye.up_voters.length; i++) {
                                if ($scope.currentQuerye.up_voters[i] == $scope.currentUser) {
                                    $scope.currentQuerye.up_voters.splice(i);
                                    $scope.currentQuerye.up_votes_count--;
                                    break;
                                }
                            }
                        }
                    }).
                    error(function(data, status, headers, config) {
                    });
            } else {
                alert('Zaloguj się aby głosować!')
            }
        };

        //POST Question Vote
        $scope.postQuestionVote=function(voteType,index){
            if(authService.authorized()){
                $http({method: 'POST', url: 'api/queryes/'+$scope.currentQuerye._id+'/questions/'+$scope.currentQuerye.questions[index]._id+'/votes/'+voteType,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).
                    success(function(data, status, headers, config) {
                        if(voteType==1){
                            $scope.currentQuerye.questions[index].up_votes_count++;
                            $scope.currentQuerye.questions[index].up_voters.push($scope.currentUser);
                            //Check oposite vote
                            for (var i = 0; i <  $scope.currentQuerye.questions[index].down_voters.length; i++) {
                                if ( $scope.currentQuerye.questions[index].down_voters[i] == $scope.currentUser) {
                                    $scope.currentQuerye.questions[index].down_voters.splice(i);
                                    $scope.currentQuerye.questions[index].down_votes_count--;
                                    break;
                                }
                            }
                        } else {
                            $scope.currentQuerye.questions[index].down_votes_count++;
                            $scope.currentQuerye.questions[index].down_voters.push($scope.currentUser);
                            //check oposite vote
                            for (var i = 0; i < $scope.currentQuerye.questions[index].up_voters.length; i++) {
                                if ($scope.currentQuerye.questions[index].up_voters[i] == $scope.currentUser) {
                                    $scope.currentQuerye.questions[index].up_voters.splice(i);
                                    $scope.currentQuerye.questions[index].up_votes_count--;
                                    break;
                                }
                            }
                        }
                    }).
                    error(function(data, status, headers, config) {
                    });
            } else {
                alert("zaloguj się aby głosować!")
            }
        };

        //POST Question functon
        $scope.postQuestion=function(){
            $('#questionSendButton').button('loading');
            $http({method: 'POST', url: 'api/queryes/'+$scope.currentQuerye._id+'/questions',
                data: $.param({
                    body: $scope.question
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data, status, headers, config) {
                    //Add question
                    $scope.currentQuerye.questions.push(data[0]);

                    //Visual settings
                    $scope.showTextArea=false;
                    $scope.question='';
                    $('#questionSendButton').button('reset');
                }).
                error(function(data, status, headers, config) {
                    alert(data.message);
                    $('#questionSendButton').button('reset');
                });
        };

        //POST Answer function
        $scope.postAnswer=function(){
            $('#answerSendButton').button('loading');
            $http({method: 'POST', url: 'api/queryes/'+$scope.currentQuerye._id+'/questions/'+$scope.currentAnswerStarted+'/answer',
                data: $.param({
                    body: $("#answer_body").val()
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data, status, headers, config) {
                    $('#answerSendButton').button('reset');
                    $('.answer-text-area').remove();
                    //Add Answer to array
                    if($scope.currentAnswerStartedIndex!=1){
                        $scope.currentQuerye.questions[$scope.currentAnswerStartedIndex]["answer"]=data;
                    }

                }).
                error(function(data, status, headers, config) {
                    alert(data.message);
                    $('#answerSendButton').button('reset');
                });
        };

        //POST TO FAVORITES
        $scope.postFavorites=function(){
            if(authService.authorized()){

            $http({method: 'POST', url: 'api/users/favorites',
                data: $.param({
                    querye_id: $scope.currentQuerye._id
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(data,status,headers,config){
                    //Set favorite for current user
                    authService.addFavorites($scope.currentQuerye._id);
                }).error(function(data,status,headers,config){
                });
            }else {
                alert("Nie jesteś zalogowany.");
            }
        };

        //DELETE FROM FAVORITES
        $scope.deleteFavorites=function(){
            $http({method: 'DELETE', url: 'api/users/'+authService.currentUser()._id+'/favorites',
                data: $.param({
                    querye_id: $scope.currentQuerye._id
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(data,status,headers,config){
                }).error(function(data,status,headers,config){
                });
        };

        //LOAD QUESTION
        $scope.loadQuestions=function(type,append){
            $scope.typeValue=type;
            $http({method: 'GET', url: 'api/questions/'+$routeParams.id+'/'+type+'/'+$scope.skip})
                .success(function(data,status,headers,config){
                    if(append==true){
                        for(var i=0;i<data.length;i++)
                            $scope.currentQuerye.questions.push(data[i]);
                    }else{
                        $scope.currentQuerye.questions=data;
                        $scope.skip=data.length;
                    }

                }).error(function(data,status,headers,config){
                });
        }

        //LOAD MORE QUESTIONS
        $scope.loadMore=function(){
            $scope.skip=$scope.skip+20;
            $scope.loadQuestions($scope.typeValue,true);
        };
		
		//Edit QUESTIONS
		
        $scope.editQuestion=function(){
			 // $('#editButton').button('loading');
			  $scope.myValue = true;			       
            
        };
		//Send QUESTIONS	
        $scope.sendQuestion=function(){		  
			  $scope.myValue = false;
			  $http({method: 'PUT', url: 'api/queryes/'+$scope.currentQuerye._id+'/questions'})
                
        };

        //Show Info panel
        $scope.showInfo=function(){
            if($scope.showInfoPanel){
                $scope.showInfoPanel=false;
            } else{
                $scope.showInfoPanel=true;
                $scope.showTextArea=false;
            }
        }

        //Show question area
        $scope.showArea=function(){
            if($scope.showTextArea){
                $scope.showTextArea=false;
            }else{
                $scope.showTextArea=true;
                $scope.showInfoPanel=false;
            }
        }

        //Dynamic Load Answer Text Aea
        $scope.loadAnswerTextArea=function(index,id){
            $scope.currentAnswerStarted=id;
            $scope.currentAnswerStartedIndex=index;
            if($('.answer-text-area').length>0){
                $('.answer-text-area').remove();
            } else {
                $('#question_'+index).after('' +
                    '<div class="row answer-text-area""><div class="col-lg-8 col-lg-offset-2">' +
                    '<div class="panel panel-primary">' +
                    '<div class="panel-body"><textarea id="answer_body" class="form-control" rows="3"></textarea></div>' +
                    '<div class="panel-footer">' +
                    '<button ng-click="postAnswer()" data-loading-text="Wysyłanie..." id="answerSendButton" class="btn btn-primary">Odpowiedz</button>' +
                    '</div></div></div></div>');
                //Bind Click Event
                $('#answerSendButton').click(function(){
                    $scope.postAnswer(index,id);
                });
            }
        };
        //Invoke Get functions
        $scope.getQuerye();


    }]);
