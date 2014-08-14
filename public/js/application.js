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
            return task.done === false && task.children.toArray().filter(function (task) {
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
    return this.task.children.toArray();
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
    this.tasks = this.taskService.findAll().filter(function (task) {
        return task.description.indexOf(_this.searchTerm) !== -1;
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
                var task = new Task();
                task.parent = scope.parent;
                task.description = scope.description;
                scope.description = '';
                if (scope.parent) {
                    scope.parent.children.add(task);
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
            onDelete: '&',
            hideParent: '@'
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
                var task = new Task();
                task.parent = parentTask;
                task.description = description;
                if (parentTask) {
                    parentTask.children.add(task);
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
                        task.parent.children.delete(task);
                    }
                    task.parent = parentTask;
                    parentTask.children.add(task);
                    clipService.clear();
                    taskService.save(task);
                }
            };
            scope.release = function (task) {
                if (task.parent) {
                    task.parent.children.delete(task);
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

// <editor-fold description="ArraySet">
var ArraySet = function () {
    Set.apply(this, arguments);
    this._array = null;
};
ArraySet.prototype = Object.create(Set.prototype);

ArraySet.prototype.add = function () {
    this._array = null;
    return Set.prototype.add.apply(this, arguments);
};

ArraySet.prototype.clear = function () {
    this._array = null;
    return Set.prototype.clear.apply(this, arguments);
};

ArraySet.prototype.delete = function () {
    this._array = null;
    return Set.prototype.delete.apply(this, arguments);
};

ArraySet.prototype.toArray = function () {
    if (!this._array) {
        this._array = [];
        var i = this._es6shim_iterator_();
        var c;
        while (true) {
            c = i.next();
            if (c.done) break;
            this._array.push(c.value);
        }
    }
    return this._array;
};
// </editor-fold>

var Task = function () {
    this.id = 0;
    this._syncStatus = 0;

    this.description = '';
    this.done = false;
    this.parent = null;
    this.children = new ArraySet();
};

// <editor-fold description="SyncService">
var TaskStatus = {
    SYNCED: 1,
    LOCAL_CREATED: 2,
    REMOTE_CREATED: 3,
    LOCAL_MODIFIED: 4,
    REMOTE_MODIFIED: 5,
    LOCAL_DELETED: 6,
    REMOTE_DELETED: 7
};

var SyncService = function (BASE_URL, $http, $q, $rootScope) {
    var _this = this;
    this.BASE_URL = BASE_URL;
    this.$http = $http;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.tasks = [];
    this.pulling = false;
    this.toUpdate = new ArraySet();
    this.toCreate = new ArraySet();
    this.toRemove = new ArraySet();
    this.id = 0;
    this._pushAgain = false;
    this.pushing = false;
    this.pulling = false;
    var defer = this.$q.defer();
    defer.resolve(false);
    this.falsePromise = defer.promise;
    $rootScope.$on('tasks.change', function () {
        _this.writeToLocalStorage();
    });
};

SyncService.prototype.writeToLocalStorage = function () {
    localStorage.setItem('tasks', JSON.stringify(serializeTasks(this.tasks)));
};

SyncService.prototype.update = function (task) {
    task._syncStatus = TaskStatus.LOCAL_MODIFIED;
    this.toUpdate.add(task);
    this.push();
};

SyncService.prototype.create = function (task) {
    if (!this.toCreate.has(task)) {
        this.id++;
        task._syncStatus = TaskStatus.LOCAL_CREATED;
        task.id = -this.id;
        this.tasks.push(task);
        this.toCreate.add(task);
        this.push();
    }
};

SyncService.prototype.remove = function (task) {
    var index;
    task._syncStatus = TaskStatus.LOCAL_DELETED;
    this.toUpdate.delete(task);
    if ((index = this.tasks.indexOf(task)) !== -1) {
        this.tasks.splice(index, 1);
    }
    if (task.parent !== null) {
        task.parent.children.delete(task);
    }
    if (task.children.toArray().length !== 0) {
        task.children.toArray().forEach(function (task) {
            task.parent = null;
        });
    }
    this.toRemove.add(task);
    this.push();
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
    if (this.pushing) {
        this._pushAgain = true;
        return;
    }
    this.pushing = true;
    this._pushAgain = false;
    this.$q.all(this.toCreate.toArray().map(function (task) {
        return _this.$http.put(_this.BASE_URL, taskToHash(task)).then(function (response) {
            task.id = response.data.id;
            task._syncStatus = TaskStatus.SYNCED;
            _this.writeToLocalStorage();
        });
    })).then(function () {
        return _this.$q.all(_this.toUpdate.toArray().map(function (task) {
            return _this.$http.post(_this.BASE_URL + task.id, taskToHash(task)).then(function () {
                task._syncStatus = TaskStatus.SYNCED;
                _this.writeToLocalStorage();
            });
        }));
    }).then(function () {
        return _this.$q.all(_this.toRemove.toArray().map(function (task) {
            return _this.$http.delete(_this.BASE_URL + task.id).then(function () {
                task._syncStatus = TaskStatus.SYNCED;
                _this.writeToLocalStorage();
            });
        }));
    }).then(function () {
        _this.toUpdate.clear();
        _this.toRemove.clear();
        _this.toCreate.clear();
        _this.pushing = false;
        if (_this._pushAgain) {
            _this.push();
        }
    });
};

var serializeTasks = function (tasks) {
    return tasks.map(function (task) {
        return {
            id: task.id,
            _syncStatus: task._syncStatus,
            parentId: task.parent ? task.parent.id : 0,
            description: task.description,
            done: task.done
        }
    });
};

SyncService.prototype.deserializeTasks = function (currentTaskArray, rawTaskData, isLocal) {
    var _this = this;
    var responseHash = rawTaskData || [];
    var hashDict = {};
    var objDict = {};
    var taskPresentInRemote = {};

    // Create a dict of hashes, and populating primitive properties of tasks
    // Create a dict of objects
    responseHash.forEach(function (hash) {
        hashDict[hash.id] = hash;
        var obj = currentTaskArray.filter(function (task) {
            return task.id === hash.id;
        });
        var task;
        if (!obj.length) {
            task = new Task();
            currentTaskArray.push(task);
        } else {
            task = obj[0];
        }
        task.id = hash.id;
        if (task._syncStatus === 0) {
            task._syncStatus = hash._syncStatus || TaskStatus.SYNCED;
        }
        if (isLocal || task._syncStatus === TaskStatus.SYNCED) {
            task._syncStatus = hash._syncStatus || TaskStatus.SYNCED;
            task.description = hash.description;
            task.done = hash.done;
        }
        switch (task._syncStatus) {
            case TaskStatus.LOCAL_CREATED:
                _this.toCreate.add(task);
                break;
            case TaskStatus.LOCAL_DELETED:
                _this.toRemove.add(task);
                break;
            case TaskStatus.LOCAL_MODIFIED:
                _this.toUpdate.add(task);
                break;
        }
        objDict[task.id] = task;
        if (!isLocal) {
            taskPresentInRemote[task.id] = true;
        }
    });

    // Populating complex properties of objects
    Object.keys(objDict).forEach(function (key) {
        var parentId = hashDict[key].parentId;
        if (parentId) {
            objDict[key].parent = objDict[parentId];
            objDict[parentId].children.add(objDict[key]);
        }
    });

    if (!isLocal) {
        var oldTasksWithDeleted = currentTaskArray.slice();
        currentTaskArray.length = 0;
        oldTasksWithDeleted.forEach(function (task) {
            if (taskPresentInRemote[task.id]) {
                currentTaskArray.push(task);
            } else if (task.parent !== null) {
                task.parent.children.delete(task);
            }
        });
    }
};

SyncService.prototype.pullFromLocalStorage = function () {
    console.log('< SyncService pullFromLocalStorage');
    var rawTasks = JSON.parse(localStorage.getItem('tasks'));
    this.tasks.length = 0;
    this.deserializeTasks(this.tasks, rawTasks, true);
    console.log('> SyncService pullFromLocalStorage');
};

SyncService.prototype.pullFromNetwork = function () {
    console.log('< SyncService pullFromNetwork');
    var _this = this;
    return this.$http.get(this.BASE_URL).then(function (response) {
        _this.deserializeTasks(_this.tasks, response.data);
        console.log('> SyncService pullFromNetwork');
    });
};

SyncService.prototype.pull = function () {
    console.log('< SyncService pull');
    if (this.pulling) {
        return this.falsePromise;
    }
    var _this = this;
    this.pulling = true;
    this.pullFromLocalStorage();
    this.pulling = true;
    return this.pullFromNetwork().finally(function () {
        _this.$rootScope.$broadcast('tasks.change');
        _this.pulling = false;
        console.log('> SyncService pull');
        _this.pulling = false;
        return true;
    });
};
// </editor-fold>

// <editor-fold description="SyncController">
SyncController = function (syncService) {
    this.syncService = syncService;
};

SyncController.prototype.showRefresh = function () {
    return this.syncService.pushing || this.syncService.pulling;
};
// </editor-fold>

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
