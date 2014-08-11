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
        _this.tasks = _this.task.children;
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
    this.searchTerm = '';
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
var TaskService = function ($http, BASE_URL, $q, syncService) {
    this.$http = $http;
    this.BASE_URL = BASE_URL;
    this.syncService = syncService;
    this._tasksLoaded = false;
    this._tasks = {};
    this.$q = $q;
};

TaskService.prototype._fetchAll = function (revision) {
    var _this = this;
    return this.$http.get(this.BASE_URL).then(function (response) {
        var tasks = response.data;
        var dict = {};

        // Create a dict of hashes, and populating primitive properties of tasks
        tasks.forEach(function (hash) {
            dict[hash.id] = dict;
            _this._tasks[hash.id] = {
                id: hash.id,
                description: hash.description,
                parent: null,
                children: []
            };
        });

        // Populating complex properties of tasks
        Object.keys(_this._tasks).forEach(function (key) {
            var parentId = dict[key].parentId;
            if (parentId) {
                _this._tasks[key].parent = _this._tasks[parentId];
                _this._tasks[parentId].children.push(_this._tasks[key]);
            }
        });

        _this._tasksLoaded = true;
    });
};

TaskService.prototype._fetchIfNotLoaded = function () {
    if (this._tasksLoaded) {
        return this.$q.when(true);
    } else {
        return this._fetchAll(0);
    }
};

TaskService.prototype.findAll = function () {
    var _this = this;
    return this._fetchIfNotLoaded().then(function () {
        return  Object.keys(_this._tasks).map(function (key) {
            return _this._tasks[key];
        });
    });
};

TaskService.prototype.findDoable = function () {
    var _this = this;
    return this._fetchIfNotLoaded().then(function () {
        return  Object.keys(_this._tasks).map(function (key) {
            return _this._tasks[key];
        }).filter(function (task) {
            return !task.done && (task.children.filter(function (task) {
                return !task.done;
            }).length === 0);
        });
    });
};

TaskService.prototype.findById = function (taskId) {
    var _this = this;
    return this._fetchIfNotLoaded().then(function () {
        return _this._tasks[taskId];
    });
};

TaskService.prototype.findBySearch = function (searchTerm) {
    var _this = this;
    return this._fetchIfNotLoaded().then(function () {
        return  Object.keys(_this._tasks).map(function (key) {
            return _this._tasks[key];
        }).filter(function (task) {
            return task.description.indexOf(searchTerm) !== -1;
        });
    });
};

TaskService.prototype.save = function (task) {
    this.syncService.update(task);
    return this.$q.when(true);
    //return this.$http.post(this.BASE_URL + task.id, task);
};

TaskService.prototype.create = function (task) {
    return this.$q.when(true);
    //return this.$http.put(this.BASE_URL, task);
};

TaskService.prototype.delete = function (task) {
    if (task.parent) {
        task.parent.children.splice(task.parent.children.indexOf(task), 1);
    }
    delete this._tasks[task.id];
    return this.$q.when(true);
    //return this.$http.delete(this.BASE_URL + taskId);
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
            onCreate: '&',
            parentId: '@'
        },
        templateUrl: 'views/directives/task-create.html',
        link: function (scope, elem, attrs) {
            scope.parentId = Number(scope.parentId);
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

            scope.cut = function (task) {
                clipService.setData(task, 'task');
            };

            scope.setDone = function (task, done) {
                task.done = done;
                taskService.save(task);
            };
            scope.create = function (task) {
            };
            scope.remove = function (task) {
                taskService.remove(task);
            };
            scope.paste = function (parentTask) {
                if (clipService.hasData('task')) {
                    var task = clipService.getData();
                    if (task.parent) {
                        task.parent.children.splice(task.parent.children.indexOf(task), 1);
                    }
                    task.parent = parentTask;
                    parentTask.children.push(task);
                    clipService.clear();
                    taskService.save(task);
                }
            };
            scope.release = function (task) {
                if (task.parent) {
                    task.parent.children.splice(task.parent.children.indexOf(task), 1);
                }
                task.parent = null;
                clipService.clear();
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

// <editor-fold description="SyncService">
var SyncService = function (BASE_URL, $http) {
    this.BASE_URL = BASE_URL;
    this.$http = $http;
    this.toUpdate = [];
    this.toCreate = [];
    this.toRemove = [];
};

SyncService.prototype.update = function (task) {
    if (this.toUpdate.indexOf(task) === -1) {
        this.toUpdate.push(task);
    }
};

SyncService.prototype.create = function (task) {
    if (this.toCreate.indexOf(task) === -1) {
        this.toCreate.push(task);
    }
};

SyncService.prototype.remove = function (task) {
    if (this.toRemove.indexOf(task) === -1) {
        this.toRemove.push(task);
    }
};

SyncService.prototype.sync = function () {
    var _this = this;
    this.toUpdate.map(function (task) {
        var hash = {
            id: task.id,
            description: task.description,
            done: task.done,
            parentId: task.parent != null ? task.parent.id :0
        };
        return _this.$http.post(_this.BASE_URL + hash.id, hash);
    });
};
// </editor-fold>

var SyncController = function ($scope, syncService) {
    $scope.sync = function () {
        syncService.sync();
    };
};

// <editor-fold description="treeTaskApp module">
angular.module('treeTaskApp', ['ui.router', 'cy.util', 'angular-gestures'])
    .controller('TaskBaseController', TaskBaseController)
    .controller('TaskAllController', TaskAllController)
    .controller('TaskTodoController', TaskTodoController)
    .controller('TaskDetailsController', TaskDetailsController)
    .controller('TaskSearchController', TaskSearchController)
    .controller('SyncController', SyncController)
    .constant('ROUTES', ROUTES)
    .service('taskService', TaskService)
    .service('syncService', SyncService)
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
var CyOnActiveStateDirective = function ($rootScope, $state) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            var onChangeState = function () {
                if ($state.includes(attrs.cyActiveOnState)) {
                    $(elem).addClass('active');
                } else {
                    $(elem).removeClass('active');
                }
            };
            onChangeState();
            $rootScope.$on('$stateChangeSuccess', onChangeState);
        }
    };
};
// </editor-fold>

// <editor-fold description="cy.util module">
angular.module('cy.util', [])
    .directive('cyActiveOnState', CyOnActiveStateDirective)
    .service('clipService', ClipService);
// </editor-fold>
