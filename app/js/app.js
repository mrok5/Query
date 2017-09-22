'use strict';

//Main app module
angular.module('mainApp', ['mainApp.filters', 'mainApp.services', 'mainApp.directives', 'mainApp.controllers','$strap.directives']).
    config(['$routeProvider','$httpProvider','$locationProvider', function($routeProvider,$httpProvider,$locationProvider) {
        //Routes
        $routeProvider.when('/',{templateUrl:'partials/startpage.html',controller: 'StartPageCtrl'});
        $routeProvider.when('/queryeadd', {templateUrl: 'partials/querye-add.html', controller: 'QueryeAddCtrl'});
        $routeProvider.when('/queryeedit/:id', {templateUrl: 'partials/querye-add.html', controller: 'QueryeAddCtrl'});
        $routeProvider.when('/queryes', {templateUrl: 'partials/queryes.html', controller: 'QueryesCtrl'});
        $routeProvider.when('/querye/:id',{templateUrl: 'partials/querye.html', controller: 'QueryeCtrl'});
        $routeProvider.when('/questions',{templateUrl: 'partials/questions.html', controller: 'QuestionsCtrl'});
        $routeProvider.when('/answers',{templateUrl: 'partials/answers.html', controller: 'AnswersCtrl'});
        $routeProvider.when('/user/:id',{templateUrl: 'partials/user.html', controller: 'UserCtrl'});
        $routeProvider.when('/welcome',{templateUrl: 'partials/welcome.html',controller: 'WelcomeCtrl'});
        $routeProvider.when('/profile/settings',{templateUrl: 'partials/profile-settings.html',controller: 'ProfileSettingsCtrl'});
        $routeProvider.when('/points',{templateUrl: 'partials/user-points.html',controller: 'UserPointsCtrl'});

        //Default route
        $routeProvider.otherwise({redirectTo: '/'});

        //Remove # from address
        //$locationProvider.html5Mode(true);

        //TODO REMOVE BEFORE LAUNCH
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

    }]).
    run(function ($http,AuthService) {
    });