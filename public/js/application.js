// <editor-fold description="TaskBaseController">
var TaskBaseController = function (taskService) {
    this.taskService = taskService;
    this.tasks = [];
};

TaskBaseController.prototype.save = function (task) {
    this.taskService.save(task);
};

TaskBaseController.prototype.create = function (task) {
    this.taskService.create(task);
};

TaskBaseController.prototype.delete = function (task) {
    this.taskService.remove(task);
};
// </editor-fold>

// <editor-fold description="TaskAllController">
var TaskAllController = function (taskService) {
    TaskBaseController.call(this, taskService);
};
TaskAllController.prototype = Object.create(TaskBaseController.prototype);

TaskAllController.prototype.findTasks = function () {
    return this.taskService.findAll();
};
// </editor-fold>

// <editor-fold description="TaskTodoController">
TaskTodoController = function ($scope, taskService) {
    var _this = this;
    TaskBaseController.call(this, taskService);
    this.tasks = [];
    var computeTasks = function () {
        var tt = _this.taskService.findAll().filter(function (task) {
            return task.done === false && task.children.filter(function (task) {
                return task.done === false;
            }).length === 0;
        });
        _this.tasks.length = 0;
        [].push.apply(_this.tasks, tt);
    };
    computeTasks();
    $scope.$on('tasks.change', function () {
        computeTasks();
    });
};
TaskTodoController.prototype = Object.create(TaskBaseController.prototype);

TaskTodoController.prototype.findTasks = function () {
    return this.tasks;
};
// </editor-fold>

// <editor-fold description="TaskDetailsController">
var TaskDetailsController = function ($scope, taskService, $stateParams) {
    this.taskId = Number($stateParams.id);
    this.task = taskService.findById(this.taskId);
    TaskBaseController.call(this, taskService);
};
TaskDetailsController.prototype = Object.create(TaskBaseController.prototype);

TaskDetailsController.prototype.findTasks = function () {
    return this.task.children;
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
var TaskService = function ($http, BASE_URL, $q, syncService, $rootScope) {
    this.syncService = syncService;
    this.$rootScope = $rootScope;
};

TaskService.prototype.findAll = function () {
    return this.syncService.tasks;
};

TaskService.prototype.findById = function (id) {
    for (var i = 0; i < this.syncService.tasks.length; i++) {
        if (this.syncService.tasks.hasOwnProperty(i)) {
            if (this.syncService.tasks[i].id === id) {
                return this.syncService.tasks[i];
            }
        }
    }
    return null;
};

TaskService.prototype.create = function (task) {
    this.syncService.create(task);
    this.$rootScope.$broadcast('tasks.change');
};

TaskService.prototype.save = function (task) {
    this.syncService.update(task);
    this.$rootScope.$broadcast('tasks.change');
};

TaskService.prototype.remove = function (task) {
    this.syncService.remove(task);
    this.$rootScope.$broadcast('tasks.change');
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
            scope.parent = taskService.findById(Number(scope.parentId));
            scope.create = function () {
                var task = {
                    parent: scope.parent,
                    description: scope.description,
                    done: false,
                    children: []
                };
                scope.description = '';
                if (scope.parent) {
                    scope.parent.children.push(task);
                }
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
            scope.create = function (parentTask, description) {
                var task = {
                    parent: parentTask,
                    description: description,
                    done: false,
                    children: []
                };
                if (parentTask) {
                    parentTask.children.push(task);
                }
                scope.onCreate({task: task});
            };
            scope.remove = function (task) {
                scope.onDelete({task: task});
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
                taskService.save(task);
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
var SyncService = function (BASE_URL, $http, $q, $rootScope) {
    var _this = this;
    this.BASE_URL = BASE_URL;
    this.$http = $http;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.tasks = [];
    this.pulling = false;
    this.toUpdate = [];
    this.toCreate = [];
    this.toRemove = [];
    this.id = 0;
    $rootScope.$on('tasks.change', function () {
        localStorage.setItem('tasks', JSON.stringify(serializeTasks(_this.tasks)));
    });
};

SyncService.prototype.update = function (task) {
    if (this.toUpdate.indexOf(task) === -1) {
        this.toUpdate.push(task);
    }
};

SyncService.prototype.create = function (task) {
    if (this.toCreate.indexOf(task) === -1) {
        this.id++;
        task.id = -this.id;
        this.tasks.push(task);
        this.toCreate.push(task);
    }
};

SyncService.prototype.remove = function (task) {
    var index;
    if ((index = this.toUpdate.indexOf(task)) !== -1) {
        this.toUpdate.splice(index, 1);
    }
    if ((index = this.tasks.indexOf(task)) !== -1) {
        this.tasks.splice(index, 1);
    }
    if (this.toRemove.indexOf(task) === -1) {
        this.toRemove.push(task);
    }
};

var taskToHash = function (task) {
    var hash = {
        description: task.description,
        done: task.done,
        parentId: task.parent != null ? task.parent.id :0
    };
    if (task.id > 0) {
        hash.id = task.id;
    }
    return hash;
};

SyncService.prototype.push = function () {
    var _this = this;
    this.$q.all(this.toCreate.map(function (task) {
        return _this.$http.put(_this.BASE_URL, taskToHash(task)).then(function (response) {
            task.id = response.data.id;
        });
    })).then(function () {
        return _this.$q.all(_this.toUpdate.map(function (task) {
            return _this.$http.post(_this.BASE_URL + task.id, taskToHash(task));
        }));
    }).then(function () {
        return _this.$q.all(_this.toRemove.map(function (task) {
            return _this.$http.delete(_this.BASE_URL + task.id);
        }));
    }).then(function () {
        _this.toUpdate.length = 0;
        _this.toRemove.length = 0;
        _this.toCreate.length = 0;
    });
};

var serializeTasks = function (tasks) {
    return tasks.map(function (task) {
        return {
            id: task.id,
            parentId: task.parent ? task.parent.id : 0,
            description: task.description,
            done: task.done
        }
    });
};

var deserializeTasks = function (taskObj, rawTaskData) {
    var responseHash = rawTaskData;
    var hashDict = {};
    var objDict = {};

    // Create a dict of hashes, and populating primitive properties of tasks
    // Create a dict of objects
    responseHash.forEach(function (hash) {
        hashDict[hash.id] = hash;
        objDict[hash.id] = {
            id: hash.id,
            description: hash.description,
            parent: null,
            done: hash.done,
            children: []
        };
    });

    // Populating complex properties of objects
    Object.keys(objDict).forEach(function (key) {
        var parentId = hashDict[key].parentId;
        if (parentId) {
            objDict[key].parent = objDict[parentId];
            objDict[parentId].children.push(objDict[key]);
        }
        taskObj.push(objDict[key]);
    });
};

SyncService.prototype.pull = function () {
    var _this = this;
    this.pulling = true;
    return this.$http.get(this.BASE_URL).then(function (response) {
        _this.tasks.length = 0;
        deserializeTasks(_this.tasks, response.data);
        _this.pulling = false;
        _this.$rootScope.$broadcast('tasks.change');
    }).catch(function (err) {
        var rawTasks = JSON.parse(localStorage.getItem('tasks'));
        _this.tasks.length = 0;
        deserializeTasks(_this.tasks, rawTasks);
        _this.pulling = false;
        _this.$rootScope.$broadcast('tasks.change');
    });
};
// </editor-fold>

var SyncController = function ($scope, syncService) {
    $scope.push = function () {
        syncService.push();
    };

    $scope.pull = function () {
        syncService.pull();
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
    }).run(function (syncService) {
        syncService.pull();
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
