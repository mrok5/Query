'use strict';

/* Filters */

angular.module('mainApp.filters', []).
    filter('interpolate', ['version', function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    }]).
    filter('dateFilter', [function () {
        return function (dateString) {
            var dt = new Date(dateString);
            if (!dt) return "undefined ago";

            var seconds = Math.floor((new Date() - dt) / 1000);

            var interval = Math.floor(seconds / 31536000);

            if (interval > 1) {
                return interval + " lat.";
            }
            interval = Math.floor(seconds / 2592000);
            if (interval > 1) {
                return interval + " miesięcy";
            }
            interval = Math.floor(seconds / 86400);
            if (interval > 1) {
                return interval + " dni";
            }
            interval = Math.floor(seconds / 3600);
            if (interval > 1) {
                return interval + " godzin";
            }
            interval = Math.floor(seconds / 60);
            if (interval > 1) {
                return interval + " minut";
            }
            return Math.floor(seconds) + " sekund";


        }
    }]).
    filter('textLengthFilter', [function () {
        return function (text,length) {
            var count=parseInt(length);
            if(text.length<=count){
                return text;
            }else {
                return text.substring(0,count)+"...";
            }


        }
    }]);
