angular.module('mainApp.controllers')
    .controller('ProfileSettingsCtrl', ['$scope', '$http', '$routeParams', 'AuthService', function ($scope, $http, $routeParams, authService) {
        //Varibles
        $scope.isDataLoading=true;
        $scope.userData={};
        $scope.userPassword={};
        $scope.alert=null;

        //Close alert
        $scope.closeAlert=function(){
            $scope.alert=null;
        }

        //Save profle changes
        $scope.saveProfile = function () {
            $scope.isDataLoading=true;
            //Sending request
            $http({method: 'PUT', url: 'api/users/profile/'+authService.currentUserId(),
                data: $.param({
                    username: $scope.userData.username,
                    email: $scope.userData.email,
                    first_name: $scope.userData.first_name,
                    last_name: $scope.userData.last_name
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data, status, headers, config) {
                    $scope.isDataLoading=false;
                    $scope.alert={type:'success',title:'Zapisano zmiany',message:'Zmiany w profilu zostały zapisane.'};
                }).
                error(function(data, status, headers, config) {
                    $scope.isDataLoading=false;
                    switch (data.code){
                        case 0:
                            $scope.alert={type:'danger',title:'Błąd API',message:'Nieoczekiwany bład, wkrótce naprawimy problem. Jeśli ponownie widzisz ten bład zgłoś to na queryeportal@gmail.com'};
                            break;
                        case 1:
                            $scope.alert={type:'danger',title:'Nieporawna nazwa użytkownika',message:'Za krótka nazwa użytkownika.'};
                            break;
                        case 2:
                            $scope.alert={type:'danger',title:'Niepoprawne imię.',message:'Za krótkie imię.'};
                            break;
                        case 3:
                            $scope.alert={type:'danger',title:'Niepoprawne nazwisko',message:'Za krótkie nazwisko.'};
                            break;
                        case 4:
                            $scope.alert={type:'danger',title:'Nieporawny adres email',message:'Adres email jest niepoprawny.'};
                            break;
                        case 5:
                            $scope.alert={type:'danger',title:'Email już istnieje',message:'Wybrany adres email jest już zajęty. Wybierz inny.'};
                            break;
                        case 6:
                            $scope.alert={type:'danger',title:'Nazwa użytkownika już istnieje',message:'Wybrana nazwa użytkownika jest już zajęta. Wybierz inną.'};
                            break;

                        default:
                            $scope.alert={type:'danger',title:'Nieznany błąd',message:'Nieoczekiwany bład, wkrótce naprawimy problem. Jeśli ponownie widzisz ten bład zgłoś to na queryeportal@gmail.com'};
                            break;
                    }

                });
        }

        //Save new password
        $scope.savePassword=function(){
            //Password Validation
            if($scope.userPassword.new!=$scope.userPassword.new2){
                alert('Hasła są różne');
                return;
            }

            $scope.isDataLoading=true;
            //Sending request
            $http({method: 'PUT', url: 'api/users/password/'+authService.currentUserId(),
                data: $.param({
                    old: $scope.userPassword.old,
                    new: $scope.userPassword.new
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data, status, headers, config) {
                    $scope.userPassword={};
                    $scope.isDataLoading=false;
                    $scope.alert={type:'success',title:'Hasło zmienione',message:'Hasło zostało zmienione poprawnie.'};
                }).
                error(function(data, status, headers, config) {
                    $scope.isDataLoading=false;
                    $scope.alert={type:'danger',title:'title',message:data.message};
                });
        }

        //Get profile data
        $scope.getProfile=function(){
            $scope.isDataLoading=true;
            $http({method: 'GET', url: 'api/users/'+authService.currentUserId() })
                .success(function(data,status,headers,config){
                    $scope.userData=data;
                    $scope.isDataLoading=false;
                }).error(function(data,status,headers,config){
                    $scope.isDataLoading=false;
                });
        }
        $scope.getProfile();
    }]);
