// <editor-fold description="TaskBaseController">
var TaskBaseController = function (taskService) {
    this.taskService = taskService;
    this.tasks = [];
    this.refreshData();
};

TaskBaseController.prototype.setDone = function (task) {
    this.taskService.setDone(task.id);
    this.refreshData();
};

TaskBaseController.prototype.setUndone = function (task) {
    this.taskService.setUndone(task.id);
    this.refreshData();
};

TaskBaseController.prototype.create = function (parentTaskId, description) {
    var _this = this;
    this.taskService.create(parentTaskId, description).then(function () {
        _this.refreshData();
    });
};

TaskBaseController.prototype.delete = function (task) {
    var _this = this;
    this.taskService.delete(task.id).then(function () {
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
// </editor-fold>

// <editor-fold description="TaskDetailListController">
var TaskDetailListController = function (taskService, $stateParams) {
    this.taskId = $stateParams.id;
    this.task = null;
    this.defaultParentTaskId = this.taskId;
    TaskBaseController.call(this, taskService);
};
TaskDetailListController.prototype = Object.create(TaskBaseController.prototype);

TaskDetailListController.prototype.refreshData = function () {
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
// </editor-fold>

// <editor-fold description="TaskDetailsController">
var TaskDetailsController = function (taskService, $stateParams) {
    var _this = this;
    this.taskService = taskService;
    taskService.findById($stateParams.id).then(function (task) {
        _this.task = task;
    });
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
                templateUrl: 'views/tasks/list.html',
                controller: TaskTodoController,
                controllerAs: 'ctrl'
            })
            .state('tasks.all', {
                url: '/all',
                templateUrl: 'views/tasks/list.html',
                controller: TaskAllController,
                controllerAs: 'ctrl'
            })
            .state('tasks.details', {
                url: '/details/:id',
                templateUrl: 'views/tasks/details.html',
                controller: TaskDetailsController,
                controllerAs: 'ctrl',
                abstract: true
            })
            .state('tasks.details.list', {
                url: '/',
                templateUrl: 'views/tasks/list.html',
                controller: TaskDetailListController,
                controllerAs: 'ctrl'
            });
    })
    .run(function ($rootScope) {
        $rootScope.$on('$stateChangeStart', function (event, toState, fromState, toParams, fromParams) {
            console.log('sStateChangeStart: ' + fromState.name + ' to ' + toState.name);
        });
    })
    .service('taskService', TaskService)
    .constant('BASE_URL', '/api/');
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
