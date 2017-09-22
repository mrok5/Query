'use strict';
angular.module('mainApp.directives', []).
    directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }]);


angular.module('mainApp.directives', []).directive('accessbuttons',function () {
    return {
        restrict: 'E',
        scope: {
            option: '='
        },
        template: '<div class="btn-group">' +
            '<button type="button" class="btn btn-default"><span class="glyphicon {{selectedClass}}"></span> {{selectedOptionText}}</button>' +
            '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">' +
            '<span class="caret"></span>' +
            '<span class="sr-only">Toggle Dropdown</span>' +
            '</button>' +
            '<ul class="dropdown-menu" role="menu">' +
            '<li><a ng-click="selectOption(2)"><span class="glyphicon glyphicon-globe"></span> Publiczne</li>' +
            '<li><a ng-click="selectOption(1)"><span class="glyphicon glyphicon-user"></span> Tylko użytkownicy</a></li>' +
            '<li><a ng-click="selectOption(0)"><span class="glyphicon glyphicon-ban-circle"></span> Nikt</a></li>' +
            '</ul>' +
            ' </div>',

        link: function (scope, elem, attr) {
            //Select option function
            scope.selectOption = function (option) {
                scope.option = option;
                if (option == 2) {
                    scope.selectedOptionText = 'Publiczne';
                    scope.selectedClass = 'glyphicon-globe';
                } else if (option == 1) {
                    scope.selectedOptionText = 'Tylko użytkownicy';
                    scope.selectedClass = 'glyphicon-user';
                } else if (option == 0) {
                    scope.selectedOptionText = 'Nikt';
                    scope.selectedClass = 'glyphicon-ban-circle';
                }
            };
            //init
            scope.selectOption(scope.option);

            //Watch value
            scope.$watch('option', function () {
                scope.selectOption(scope.option);
            });
        }
    };
}).directive('visiblebuttons',function () {
        return {
            restrict: 'E',
            scope: {
                option: '='
            },
            template: '<div class="btn-group">' +
                '<button type="button" class="btn btn-default"><span class="glyphicon {{selectedClass}}"></span> {{selectedOptionText}}</button>' +
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">' +
                '<span class="caret"></span>' +
                '<span class="sr-only">Toggle Dropdown</span>' +
                '</button>' +
                '<ul class="dropdown-menu" role="menu">' +
                '<li><a ng-click="selectOption(1)"><span class="glyphicon glyphicon-ok"></span> Tak</li>' +
                '<li><a ng-click="selectOption(0)"><span class="glyphicon glyphicon-remove"></span> Nie</a></li>' +
                '</ul>' +
                ' </div>',

            link: function (scope, elem, attr) {
                //Select option function
                scope.selectOption = function (option) {
                    scope.option = option;
                    if (option == 1) {
                        scope.selectedOptionText = 'Tak';
                        scope.selectedClass = 'glyphicon-ok';
                    } else if (option == 0) {
                        scope.selectedOptionText = 'Nie';
                        scope.selectedClass = 'glyphicon-remove';
                    }
                };

                //Watch value
                scope.$watch('option', function () {
                    scope.selectOption(scope.option);
                });
            }
        };
    }).directive('typebuttons',function () {
        return {
            restrict: 'E',
            scope: {
                option: '='
            },
            template: '<div class="btn-group">' +
                '<button type="button" class="btn btn-default"><typeicon type="option" /></button>' +
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">' +
                '<span class="caret"></span>' +
                '<span class="sr-only">Toggle Dropdown</span>' +
                '</button>' +
                '<ul class="dropdown-menu" role="menu">' +
                '<li ng-repeat="option in options"><a  ng-click="selectOption($index)" ><typeicon type="option.value" /></li>' +
                '</ul>' +
                ' </div>',

            link: function (scope, elem, attr) {
                //Options
                scope.options = [
                    {value: 1, text: 'Job', class: 'glyphicon-ok'},
                    {value: 2, text: 'Home', class: 'glyphicon-ok'},
                    {value: 3, text: 'Studies', class: 'glyphicon-ok'},
                    {value: 4, text: 'Travel', class: 'glyphicon-ok'},
                    {value: 5, text: 'Sport', class: 'glyphicon-ok'},
                    {value: 6, text: 'Hobby', class: 'glyphicon-ok'}
                ];

                //Select option function
                scope.selectOption = function (index) {
                    scope.selectedOptionText = scope.options[index].text;
                    scope.selectedClass = scope.options[index].class;
                    scope.option = scope.options[index].value;
                };
            }
        };
    }).directive('typeicon',function () {
        return{
            restrict: 'E',
            replace: true,
            scope: {
                type: '='
            },
            template: '<span><span class="glyphicon glyphicon-{{class}}"></span> {{text}}</span>',
            link: function (scope, elem, attr) {

                scope.invoke = function () {
                    //Switch type
                    switch (scope.type) {
                        case 0:
                            scope.class = 'th';
                            scope.text = 'All';
                            break;
                        case 1:
                            scope.class = 'briefcase';
                            scope.text = 'Job';
                            break;
                        case 2:
                            scope.class = 'home';
                            scope.text = 'Home';
                            break;
                        case 3:
                            scope.class = 'book';
                            scope.text = 'Studies';
                            break;
                        case 4:
                            scope.class = 'plane';
                            scope.text = 'Travel';
                            break;
                        case 5:
                            scope.class = 'cloud';
                            scope.text = 'Sport';
                            break;
                        case 6:
                            scope.class = 'camera';
                            scope.text = 'Hobby';
                            break;
                        case 7:
                            scope.class = 'user';
                            scope.text = 'Famous person';
                            break;
                        case 8:
                            scope.class = 'share-alt';
                            scope.text = 'Other';
                            break;

                        default:
                            scope.class = '';
                            break;
                    }
                }

                scope.$watch('type', function () {
                    scope.invoke();
                });

            }
        }
    }).directive('accessicon',function () {
        return{
            restrict: 'E',
            scope: {
                type: '='
            },
            template: '<span><span class="glyphicon glyphicon-{{class}}"></span> {{text}}</span>',
            replace: true,
            link: function (scope, elem, attr) {
                //Invoke function
                scope.invoke = function () {
                    if (scope.type == 2) {
                        scope.text = 'Publiczne';
                        scope.class='globe';
                    } else if(scope.type==1){
                        scope.text = 'Tylko zarejestrowani';
                        scope.class='user';
                    }else if (scope.type==0){
                        scope.text = 'Nikt';
                        scope.class='ban-circle';
                    }
                }

                //Watch value
                scope.$watch('type', function () {
                    scope.invoke();
                });
            }
        }

    }).directive('sortbuttons',function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                option: '='
            },
            template: '<div class="btn-group">' +
                '<button type="button" class="btn btn-default"><span class="glyphicon glyphicon-{{selectedClass}}"></span> {{selectedOptionText}}</button>' +
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">' +
                '<span class="caret"></span>' +
                '<span class="sr-only">Toggle Dropdown</span>' +
                '</button>' +
                '<ul class="dropdown-menu" role="menu" >' +
                '<li ng-repeat="option in options"><a ng-click="selectOption(option)"><span class="glyphicon glyphicon-{{option.class}}"></span> {{option.text}}</li>' +
                '</ul>' +
                ' </div>',

            link: function (scope, elem, attr) {
                //Options
                scope.options=[
                    {value:'newst',text:'Nowe',class:'chevron-up'},
                    {value: 'best',text: 'Dobre',class:'chevron-up'},
                    {value:'oldst',text:'Stare',class:'chevron-down'},
                    {value: 'worst',text: 'Słabe',class:'chevron-down'}
                ];
                //Select option function
                scope.selectOption = function (option) {
                    scope.selectedOptionText=option.text;
                    scope.selectedClass=option.class;
                    scope.option=option.value;
                };
                //Default select
                scope.selectOption(scope.options[0]);
            }
        };
    }).directive('pointshistory',function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                history: '='
            },
            template: '<span><span style="font-weight: bold; margin-right: 30px">{{sign}} {{history.points_count}}</span> {{begin_text}}</span>',
            link: function (scope, elem, attr) {


                switch(scope.history.type){
                    case 0:
                        scope.sign='+';
                        scope.begin_text="Utworzenie nowego Querye";
                        break;
                    case 1:
                        scope.sign='+';
                        scope.begin_text="Pozytywny głos na Querye";
                        break;
                    case 2:
                        scope.sign='-';
                        scope.begin_text="Negatywny głos na Querye";
                        break;
                    case 3:
                        scope.sign='+';
                        scope.begin_text="Dodanie do ulbionych przez użytnownika";
                        break;
                    case 4:
                        scope.sign='+';
                        scope.begin_text="Pozytywny głos na Pytanie";
                        break;
                    case 5:
                        scope.sign='-';
                        scope.begin_text="Negatywny głos na Pytanie";
                        break;
                    default:
                        scope.begin_text="error";
                }

                //Check + or -

            }
        };
        });