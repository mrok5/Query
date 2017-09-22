angular.module('mainApp.controllers')
    .controller('QuestionsCtrl', ['$scope', '$http', '$routeParams', 'AuthService', function ($scope, $http, $routeParams, authService) {
        //Varibles
        $scope.currentUser = authService.currentUser();
        $scope.currentType = 'unanswered';

        //API call method
        $scope.loadUserQuestions = function (type) {
            $http({method: 'GET', url: '/api/user/questions/' + type })
                .success(function (data, status, headers, config) {
                    $scope.userQuestions = data;
                }).error(function (data, status, headers, config) {
                });
        };

        //Dynamic Load Answer Text Aea
        $scope.loadAnswerTextArea = function (index, id) {
            $scope.currentAnswerStartedIndex = index;
            if ($('.answer-text-area').length > 0) {
                $('.answer-text-area').remove();
            } else {
                $('#question_' + index).after('' +
                    '<div class="row answer-text-area""><div class="col-lg-8 col-lg-offset-2">' +
                    '<div class="panel panel-primary">' +
                    '<div class="panel-body"><textarea id="answer_body" class="form-control" rows="3"></textarea></div>' +
                    '<div class="panel-footer">' +
                    '<button ng-click="postAnswer()" data-loading-text="Wysyłanie..." id="answerSendButton" class="btn btn-primary">Odpowiedz</button>' +
                    '</div></div></div></div>');
                //Bind Click Event
                $('#answerSendButton').click(function () {
                    $scope.postAnswer(index, id);
                });
            }
        };

        //Insert Question to Spam
        $scope.insertToSpam = function (index, question_id) {
            $http({method: 'POST', url: 'api/questions/' + question_id + '/spam/',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function (data, status, headers, config) {
                    $scope.userQuestions.splice(index, 1);
                }).
                error(function (data, status, headers, config) {
                });
        };

        //Insert Question to Spam
        $scope.removeFromSpam = function (index, question_id) {
            $http({method: 'DELETE', url: 'api/questions/' + question_id + '/spam/',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function (data, status, headers, config) {
                    $scope.userQuestions.splice(index, 1);
                }).
                error(function (data, status, headers, config) {
                });
        };
		
		//Delete Question
       $scope.deleteUserQuestion=function(question_id,index){
          $http({method: 'DELETE', url: 'api/questions/'+question_id })
            .success(function(data,status,headers,config){
                //Delete from DOM
                $scope.userQuestions.splice(index,1);
            }).error(function(data,status,headers,config){
            });
    };


        //POST Question Vote
        $scope.postQuestionVote = function (voteType, index) {
            if (authService.authorized()) {
                //Get Params
                var querye_id = $scope.userQuestions[index].querye_id;
                var question_id = $scope.userQuestions[index]._id;
                //Request to server
                $http({method: 'POST', url: 'api/queryes/' + querye_id + '/questions/' + question_id + '/votes/' + voteType,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).
                    success(function (data, status, headers, config) {
                        if (voteType == 1) {
                            $scope.userQuestions[index].up_votes_count++;
                            $scope.userQuestions[index].up_voters.push($scope.currentUser._id);
                            //Check oposite vote
                            for (var i = 0; i < $scope.userQuestions[index].down_voters.length; i++) {
                                if ($scope.userQuestions[index].down_voters[i] == $scope.currentUser._id) {
                                    $scope.userQuestions[index].down_voters.splice(i);
                                    $scope.userQuestions[index].down_votes_count--;
                                    break;
                                }
                            }
                        } else {
                            $scope.userQuestions[index].down_votes_count++;
                            $scope.userQuestions[index].down_voters.push($scope.currentUser._id);
                            //check oposite vote
                            for (var i = 0; i < $scope.userQuestions[index].up_voters.length; i++) {
                                if ($scope.userQuestions[index].up_voters[i] == $scope.currentUser._id) {
                                    $scope.userQuestions[index].up_voters.splice(i);
                                    $scope.userQuestions[index].up_votes_count--;
                                    break;
                                }
                            }
                        }
                    }).
                    error(function (data, status, headers, config) {
                    });
            } else {
                alert("zaloguj się aby głosować!")
            }
        };

        //POST Answer function
        $scope.postAnswer = function () {
            $('#answerSendButton').button('loading');
            //Get Params
            var querye_id = $scope.userQuestions[$scope.currentAnswerStartedIndex].querye_id;
            var question_id = $scope.userQuestions[$scope.currentAnswerStartedIndex]._id;
            //Request to server
            $http({method: 'POST', url: 'api/queryes/' + querye_id + '/questions/' + question_id + '/answer',
                data: $.param({
                    body: $("#answer_body").val()
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function (data, status, headers, config) {
                    $('#answerSendButton').button('reset');
                    $('.answer-text-area').remove();
                    //Remove question from list
                    if ($scope.currentAnswerStartedIndex != 1) {
                        if ($scope.currentType == 'unanswered') {
                            $scope.userQuestions.splice($scope.currentAnswerStartedIndex, 0);
                        }else{
                            $scope.userQuestions[$scope.currentAnswerStartedIndex].answer=data;
                        }
                    }
                }).
                error(function (data, status, headers, config) {
                    alert(data.message);
                    $('#answerSendButton').button('reset');
                });
        };
		
		//Edit QUESTIONS
		
        $scope.editQuestion=function(){
             $scope.phoneData = {'name': 'Nexus S'};
			  $('#editButton').button('loading');
            $http({method: 'PUT', url: 'api/queryes/'+$scope.currentQuerye._id+'/questions',
               
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            
        };


        //Tab Change Event
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            $scope.currentType = e.target.name;
            $scope.loadUserQuestions(e.target.name);
        });

        //Invoke Load Function
        $scope.loadUserQuestions('unanswered');

    }]);