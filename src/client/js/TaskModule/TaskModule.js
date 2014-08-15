/* global angular */

module.exports = angular.module('treeTaskApp', ['ui.router', 'cy.util', 'angular-gestures', 'templates'])
    .controller('TaskBaseController', require('./controllers/TaskBaseController'))
    .controller('TaskFavoriteController', require('./controllers/TaskFavoriteController'))
    .controller('TaskAllController', require('./controllers/TaskAllController'))
    .controller('TaskTodoController', require('./controllers/TaskTodoController'))
    .controller('TaskDetailsController', require('./controllers/TaskDetailsController'))
    .controller('TaskSearchController', require('./controllers/TaskSearchController'))
    .controller('SyncController', require('./controllers/SyncController'))
    .constant('ROUTES', require('./constants/routes'))
    .constant('BASE_URL', '/api/tasks/')
    .service('taskService', require('./services/TaskService'))
    .service('syncService', require('./services/SyncService'))
    .directive('taskList', require('./directives/TaskListDirective'))
    .directive('taskCreate', require('./directives/TaskCreateDirective'))
    .directive('taskListElement', require('./directives/TaskListElementDirective'))
    .config(function ($stateProvider, $urlRouterProvider, ROUTES) {
        $urlRouterProvider.otherwise('/');
        ROUTES.forEach(function (route) {
            $stateProvider.state(route.name, route);
        });
    }).run(function (syncService) {
        syncService.pull();
    });
