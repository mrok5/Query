'use strict';
angular.module('mainApp.services', []).factory('AuthService',
    function ($http) {
        var currentUser=null;
        var authorized=false;
        var initialState = false;
        var favorites=[];
        return {
            initialState:function () {
                return initialState;
            },
            login:function (userData) {
                currentUser = userData;
                favorites=userData.favorites;
                authorized = true;
                initialState = false;
            },
            logout:function () {
                currentUser = null;
                favorites=[];
                authorized = false;
            },
            currentUser:function () {
                return currentUser;
            },
            isLoggedIn:function(){
              return authorized;
            },
            currentUserId:function () {
                if(currentUser!=null){
                    return currentUser._id;
                } else {
                    return null;
                }
            },
            authorized:function () {
                return authorized;
            },
            favorites:function(){
                return favorites;
            },
            addFavorites:function(item){
                favorites.push(item);
            }
        };
    });
