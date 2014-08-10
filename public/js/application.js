// <editor-fold description="TaskBaseController">
var TaskBaseController = function (taskService) {
    this.taskService = taskService;
    this.tasks = [];
    this.refreshData();
};

TaskBaseController.prototype.setDone = function (taskId) {
    this.taskService.setDone(taskId);
    this.refreshData();
};

TaskBaseController.prototype.setUndone = function (taskId) {
    this.taskService.setUndone(taskId);
    this.refreshData();
};

TaskBaseController.prototype.create = function (taskId, description) {
    var _this = this;
    this.taskService.create(taskId, description).then(function () {
        _this.refreshData();
    });
};

TaskBaseController.prototype.delete = function (taskId) {
    var _this = this;
    this.taskService.delete(taskId).then(function () {
        _this.refreshData();
    });
};
// </editor-fold>

// <editor-fold description="TaskAllController">
var TaskAllController = function (taskService) {
    TaskBaseController.call(this, taskService);
};
TaskAllController.prototype = Object.create(TaskBaseController.prototype);

TaskAllController.prototype.refreshData = function () {
    var _this = this;
    this.taskService.findAll().then(function (tasks) {
        _this.tasks.length = 0;
        tasks.forEach(function (task) {
            _this.tasks.push(task);
        });
    });
};

TaskAllController.prototype.findTasks = function () {
    return this.tasks;
};
// </editor-fold>

// <editor-fold description="TaskTodoController">
TaskTodoController = function (taskService) {
    TaskBaseController.call(this, taskService);
};
TaskTodoController.prototype = Object.create(TaskBaseController.prototype);

TaskTodoController.prototype.refreshData = function () {
    var _this = this;
    this.taskService.findDoable().then(function (tasks) {
        _this.tasks.length = 0;
        tasks.forEach(function (task) {
            _this.tasks.push(task);
        });
    });
};

TaskTodoController.prototype.findTasks = function () {
    return this.tasks;
};
// </editor-fold>

// <editor-fold description="TaskDetailsController">
var TaskDetailsController = function (taskService, $stateParams) {
    this.taskId = $stateParams.id;
    this.task = null;
    this.defaultParentTaskId = this.taskId;
    this.tasks = [];
    TaskBaseController.call(this, taskService);
};
TaskDetailsController.prototype = Object.create(TaskBaseController.prototype);

TaskDetailsController.prototype.refreshData = function () {
    var _this = this;
    this.taskService.findById(this.taskId).then(function (task) {
        _this.task = task;
    });
    this.taskService.findByParentId(this.taskId).then(function (tasks) {
        _this.tasks.length = 0;
        tasks.forEach(function (task) {
            _this.tasks.push(task);
        });
    });
};

TaskDetailsController.prototype.findTasks = function () {
    return this.tasks;
};
// </editor-fold>

// <editor-fold description="TaskService">
var TaskService = function ($http, BASE_URL) {
    this.$http = $http;
    this.BASE_URL = BASE_URL;
};

TaskService.prototype.findAll = function () {
    return this.$http.get(this.BASE_URL).then(function (response) {
        return response.data;
    });
};

TaskService.prototype.findDoable = function () {
    return this.$http.get(this.BASE_URL + 'doable').then(function (response) {
        return response.data;
    });
};

TaskService.prototype.findByParentId = function (taskId) {
    return this.$http.get(this.BASE_URL + 'children/' + taskId).then(function (response) {
        return response.data;
    });
};

TaskService.prototype.findById = function (taskId) {
    return this.$http.get(this.BASE_URL + taskId).then(function (response) {
        return response.data;
    });
};

TaskService.prototype.setDone = function (taskId) {
    return this.$http.post(this.BASE_URL + taskId + '/done').then(function (response) {
        console.log(response);
    })
};

TaskService.prototype.setUndone = function (taskId) {
    return this.$http.post(this.BASE_URL + taskId + '/undone').then(function (response) {
        console.log(response);
    })
};

TaskService.prototype.create = function (parentId, description) {
    return this.$http.put(this.BASE_URL, {
        parentId: parentId,
        description: description
    }).then(function (response) {
        return response.data;
    });
};

TaskService.prototype.delete = function (taskId) {
    return this.$http.delete(this.BASE_URL + taskId).then(function (response) {
        return response.data;
    });
};
// </editor-fold>

// <editor-fold description="TaskSearchController">
var TaskSearchController = function (taskService) {
    this.taskService = taskService;
};

TaskSearchController.prototype.findAll = function () {
    return this.taskService.findAll();
};

TaskSearchController.prototype.search = function () {
    this.taskService.search(this.searchTerm).then(function () {

    })
};
// </editor-fold>

// <editor-fold description="treeTaskApp module">
angular.module('treeTaskApp', ['ui.router', 'cy'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('root', {
                templateUrl: 'views/common/layout.html',
                abstract: true
            })
            .state('tasks', {
                url: '',
                views: {
                    main: {
                        template: '<ui-view></ui-view>'
                    }
                },
                abstract: true,
                parent: 'root'
            })
            .state('tasks.todo', {
                url: '/',
                templateUrl: 'views/tasks/todo.html',
                controller: TaskTodoController,
                controllerAs: 'ctrl'
            })
            .state('tasks.all', {
                url: '/all',
                templateUrl: 'views/tasks/all.html',
                controller: TaskAllController,
                controllerAs: 'ctrl'
            })
            .state('tasks.details', {
                url: '/details/:id',
                templateUrl: 'views/tasks/details.html',
                controller: TaskDetailsController,
                controllerAs: 'ctrl'
            })
            .state('tasks.search', {
                url: '/search',
                templateUrl: 'views/tasks/search.html',
                controller: TaskSearchController,
                controllerAs: 'ctrl'
            });
    })
    .run(function ($rootScope) {
        $rootScope.$on('$stateChangeStart', function (event, toState, fromState, toParams, fromParams) {
            console.log('sStateChangeStart: ' + fromState.name + ' to ' + toState.name);
        });
    })
    .service('taskService', TaskService)
    .constant('BASE_URL', '/api/')
    .directive('taskList', function (taskService) {
        return {
            restrict: 'E',
            scope: {
                showNew: '@',
                tasks: '=',
                create: '&',
                delete: '&',
                setDone: '&',
                setUndone: '&',
                currentTaskId: '@'
            },
            templateUrl: 'views/directives/task-list.html',
            link: function (scope, elem, attrs) {
                scope.showNew = JSON.parse(scope.showNew);
                if (scope.currentTaskId) {
                    scope.currentTaskId = Number(scope.currentTaskId);
                }
            }
        }
    });
// </editor-fold>

// <editor-fold description="cy module">
angular.module('cy', [])
    .directive('cyActiveOnState', function ($rootScope, $state) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                var changeState = function () {
                    if ($state.includes(attrs.cyActiveOnState)) {
                        $(elem).addClass('active');
                    } else {
                        $(elem).removeClass('active');
                    }
                };
                changeState();
                $rootScope.$on('$stateChangeSuccess', changeState);
            }
        };
    });
// </editor-fold>
