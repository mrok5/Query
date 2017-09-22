angular.module('mainApp.controllers')
    .controller('NavbarTopCtrl', ['$scope','$modal','$http','AuthService',function($scope,$modal,$http,authService) {
        //Login and Register Data Model
        $scope.userLogin={email:'',password:'', loginError: ''};
        $scope.userRegister={email:'',password1:'',password2:''};

        //Auth User
        $scope.currentUser=authService.currentUser();
        $scope.isLogged=authService.isLoggedIn();

        //Check user session on Server Side
        $http({method: 'GET', url: 'api/users/status' })
            .success(function(data,status,headers,config){
                if(data.logged==true){
                    authService.login(data.user);
                    $scope.currentUser=authService.currentUser();
                    $scope.isLogged=authService.isLoggedIn();
                }

            }).error(function(data,status,headers,config){
            });


        //Logout function
        $scope.logout=function(){
            $http({method: 'POST', url: 'api/users/logout' })
                .success(function(data,status,headers,config){
                    $scope.isLogged=false;
                    $scope.currentUser={};
                    authService.logout();
                }).error(function(data,status,headers,config){
                });
        }

        //Login function
        $scope.loginUser=function(){
            //Check password length
            if($scope.userLogin.password.length <6){
                alert("Hasło za krótkie. Min 6 znaków.")
                return;
            }
            //Check email format
            var re = /\S+@\S+\.\S+/;
            if (!re.test($scope.userLogin.email)|| $scope.userLogin.email.length<5){
                alert("Niepoprawny format email.");
                return;
            }

            $('#loginButton').button('loading');
            $http({method: 'POST', url: 'api/users/login',
                data: $.param({
                    email: $scope.userLogin.email,
                    password: $scope.userLogin.password
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data, status, headers, config) {
                    authService.login(data);
                    $scope.currentUser=authService.currentUser();
                    $scope.isLogged=authService.isLoggedIn();
                    $('#modalLogin').modal('hide');
                    $('#loginButton').button('reset');
                }).
                error(function(data, status, headers, config) {
                    alert(data.message);
                    $('#loginButton').button('reset');
                });
        };

        //Register Function
        $scope.registerUser=function(){
            //Check passwords match
            if($scope.userRegister.password1!=$scope.userRegister.password2){
                alert("Hasła są różne");
                return;
            }
            //Check password length
            if($scope.userRegister.password1.length <6){
                alert("Hasło za krótkie. Min 6 znaków.")
                return;
            }
            //Check email length
            if($scope.userRegister.email.length<5){
                alert("Za krótki adres email");
                return;
            }
            //Check email format
            var re = /\S+@\S+\.\S+/;
            if (!re.test($scope.userRegister.email)){
                alert("Niepoprawny format email.");
                return;
            }
            $('#registerButton').button('loading');
            $http({method: 'POST', url: 'api/users',
                data: $.param({
                    email: $scope.userRegister.email,
                    password: $scope.userRegister.password1,
                    reg_source: 1
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data, status, headers, config) {
                    $('#registerButton').button('reset');
                    $('#modalRegister').modal('hide');
                    authService.login(data);
                    $scope.currentUser=authService.currentUser();
                    $scope.isLogged=authService.isLoggedIn();
                }).
                error(function(data, status, headers, config) {
                    alert(data.message);
                    $('#registerButton').button('reset');
                });
        };

    }])