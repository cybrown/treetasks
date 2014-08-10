// <editor-fold description="TaskBaseController">
var TaskBaseController = function (taskService) {
    this.taskService = taskService;
    this.tasks = [];
    this.refreshData();
};

TaskBaseController.prototype.save = function (task) {
    var _this = this;
    this.taskService.save(task).then(function () {
        _this.refreshData();
    });
};

TaskBaseController.prototype.create = function (task) {
    var _this = this;
    this.taskService.create(task).then(function () {
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

// <editor-fold description="TaskSearchController">
var TaskSearchController = function (taskService) {
    this.taskService = taskService;
    this.tasks = [];
};

TaskSearchController.prototype.search = function () {
    var _this = this;
    this.taskService.findBySearch(this.searchTerm).then(function (tasks) {
        _this.tasks = tasks;
    });
};

TaskSearchController.prototype.findTasks = function () {
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

TaskService.prototype.findBySearch = function (searchTerm) {
    return this.$http.get(this.BASE_URL + 'search', {
        params: {
            q: searchTerm
        }
    }).then(function (response) {
        return response.data;
    });
};

TaskService.prototype.save = function (task) {
    return this.$http.post(this.BASE_URL + task.id, task);
};

TaskService.prototype.create = function (task) {
    return this.$http.put(this.BASE_URL, task);
};

TaskService.prototype.delete = function (taskId) {
    return this.$http.delete(this.BASE_URL + taskId);
};
// </editor-fold>

// <editor-fold description="ClipService">
var ClipService = function () {
    this.data = null;
    this.type = null;
};

ClipService.prototype.hasData = function (type) {
    return this.type === type;
};

ClipService.prototype.setData = function (data, type) {
    this.type = type;
    this.data = data;
};

ClipService.prototype.getData = function () {
    return this.data;
};

ClipService.prototype.clear = function () {
    this.data = null;
    this.type = null;
};
// </editor-fold>

// <editor-fold description="TaskCreateDirective module">
var TaskCreateDirective = function (taskService) {
    return {
        restrict: 'E',
        scope: {
            onCreate: '&'
        },
        templateUrl: 'views/directives/task-create.html',
        link: function (scope, elem, attrs) {
            scope.create = function (task) {
                scope.onCreate({task: task});
            };
        }
    }
};
// </editor-fold>

// <editor-fold description="TaskListDirective module">
var TaskListDirective = function (taskService, clipService) {
    return {
        restrict: 'E',
        scope: {
            tasks: '=',
            onCreate: '&',
            onSave: '&',
            onDelete: '&'
        },
        templateUrl: 'views/directives/task-list.html',
        link: function (scope, elem, attrs) {
            scope.cut = function (task) {
                clipService.setData(task, 'task');
            };
            scope.paste = function (parentTask) {
                if (clipService.hasData('task')) {
                    var task = clipService.getData();
                    task.parentId = parentTask.id;
                    clipService.clear();
                    scope.onSave({task: task});
                }
            };
            scope.showReleaseBtn = function (task) {
                if (clipService.hasData('task')) {
                    return clipService.getData().id === task.id;
                }
                return false;
            };
            scope.showPasteBtn = function (task) {
                if (clipService.hasData('task')) {
                    return clipService.getData().id !== task.id;
                }
                return false;
            };
            scope.showCutBtn = function (task) {
                return !clipService.hasData('task');
            };
            scope.setDone = function (task, done) {
                task.done = done;
                scope.onSave({task: task});
            };
            scope.create = function (task) {
                scope.onCreate({task: task});
            };
            scope.remove = function (task) {
                scope.onDelete({task: task});
            };
            scope.release = function (task) {
                task.parentId = 0;
                clipService.clear();
                scope.onSave({task: task});
            };
        }
    }
};
// </editor-fold>

// <editor-fold description="ROUTES constant">
var ROUTES = [{
    name: 'root',
    templateUrl: 'views/common/layout.html',
    abstract: true
}, {
    name: 'tasks',
    url: '',
    views: {
        main: {
            templateUrl: 'views/common/uiview.html'
        }
    },
    abstract: true,
    parent: 'root'
}, {
    name: 'tasks.todo',
    url: '/',
    templateUrl: 'views/tasks/todo.html',
    controller: 'TaskTodoController',
    controllerAs: 'ctrl'
}, {
    name: 'tasks.all',
    url: '/all',
    templateUrl: 'views/tasks/all.html',
    controller: 'TaskAllController',
    controllerAs: 'ctrl'
}, {
    name: 'tasks.details',
    url: '/details/:id',
    templateUrl: 'views/tasks/details.html',
    controller: 'TaskDetailsController',
    controllerAs: 'ctrl'
}, {
    name: 'tasks.search',
    url: '/search',
    templateUrl: 'views/tasks/search.html',
    controller: 'TaskSearchController',
    controllerAs: 'ctrl'
}];
// </editor-fold>

// <editor-fold description="treeTaskApp module">
angular.module('treeTaskApp', ['ui.router', 'cy.util'])
    .controller('TaskBaseController', TaskBaseController)
    .controller('TaskAllController', TaskAllController)
    .controller('TaskTodoController', TaskTodoController)
    .controller('TaskDetailsController', TaskDetailsController)
    .controller('TaskSearchController', TaskSearchController)
    .constant('ROUTES', ROUTES)
    .service('taskService', TaskService)
    .constant('BASE_URL', '/api/tasks/')
    .directive('taskList', TaskListDirective)
    .directive('taskCreate', TaskCreateDirective)
    .config(function ($stateProvider, $urlRouterProvider, ROUTES) {
        $urlRouterProvider.otherwise('/');
        ROUTES.forEach(function (route) {
            $stateProvider.state(route.name, route);
        });
    });
// </editor-fold>

// <editor-fold description="cy.util module">
angular.module('cy.util', [])
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
    })
    .service('clipService', ClipService);
// </editor-fold>
