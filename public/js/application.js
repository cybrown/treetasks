(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global angular */

angular.module('cy.util', [])
    .directive('cyActiveOnState', require('./directives/CyOnActiveStateDirective'))
    .service('clipService', require('./services/ClipService'));

},{"./directives/CyOnActiveStateDirective":2,"./services/ClipService":4}],2:[function(require,module,exports){
var CyOnActiveStateDirective = module.exports = function ($rootScope, $state) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            var onChangeState = function () {
                if ($state.includes(attrs.cyActiveOnState)) {
                    elem.addClass('active');
                } else {
                    elem.removeClass('active');
                }
            };
            onChangeState();
            $rootScope.$on('$stateChangeSuccess', onChangeState);
        }
    };
};

},{}],3:[function(require,module,exports){
module.exports = require('./CyUtilModule');

},{"./CyUtilModule":1}],4:[function(require,module,exports){
var ClipService = module.exports = function () {
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

},{}],5:[function(require,module,exports){
/* global angular */

module.exports = angular.module('treeTaskApp', ['ui.router', 'cy.util', 'angular-gestures'])
    .controller('TaskBaseController', require('./controllers/TaskBaseController'))
    .controller('TaskAllController', require('./controllers/TaskAllController'))
    .controller('TaskTodoController', require('./controllers/TaskTodoController'))
    .controller('TaskDetailsController', require('./controllers/TaskDetailsController'))
    .controller('TaskSearchController', require('./controllers/TaskSearchController'))
    .controller('SyncController', require('./controllers/SyncController'))
    .constant('ROUTES', require('./config/routes'))
    .service('taskService', require('./services/TaskService'))
    .service('syncService', require('./services/SyncService'))
    .constant('BASE_URL', '/api/tasks/')
    .directive('taskList', require('./directives/TaskListDirective'))
    .directive('taskCreate', require('./directives/TaskCreateDirective'))
    .config(function ($stateProvider, $urlRouterProvider, ROUTES) {
        $urlRouterProvider.otherwise('/');
        ROUTES.forEach(function (route) {
            $stateProvider.state(route.name, route);
        });
    }).run(function (syncService) {
        syncService.pull();
    });

},{"./config/routes":6,"./controllers/SyncController":7,"./controllers/TaskAllController":8,"./controllers/TaskBaseController":9,"./controllers/TaskDetailsController":10,"./controllers/TaskSearchController":11,"./controllers/TaskTodoController":12,"./directives/TaskCreateDirective":13,"./directives/TaskListDirective":14,"./services/SyncService":17,"./services/TaskService":18}],6:[function(require,module,exports){
var ROUTES = module.exports = [{
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

},{}],7:[function(require,module,exports){
var SyncController = module.exports = function (syncService) {
    this.syncService = syncService;
};

SyncController.prototype.showRefresh = function () {
    return this.syncService.pushing || this.syncService.pulling;
};

},{}],8:[function(require,module,exports){
var TaskBaseController = require('./TaskBaseController');

var TaskAllController = module.exports = function (taskService) {
    TaskBaseController.call(this, taskService);
};
TaskAllController.prototype = Object.create(TaskBaseController.prototype);

TaskAllController.prototype.findTasks = function () {
    return this.taskService.findAll();
};

},{"./TaskBaseController":9}],9:[function(require,module,exports){
var TaskBaseController = module.exports = function (taskService) {
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

},{}],10:[function(require,module,exports){
var TaskBaseController = require('./TaskBaseController');

var TaskDetailsController = module.exports = function ($scope, taskService, $stateParams) {
    this.taskId = Number($stateParams.id);
    this.task = taskService.findById(this.taskId);
    TaskBaseController.call(this, taskService);
};
TaskDetailsController.prototype = Object.create(TaskBaseController.prototype);

TaskDetailsController.prototype.findTasks = function () {
    return this.task.children.toArray();
};

},{"./TaskBaseController":9}],11:[function(require,module,exports){
var TaskSearchController = module.exports = function (taskService) {
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

},{}],12:[function(require,module,exports){
var TaskBaseController = require('./TaskBaseController');

var TaskTodoController = module.exports = function ($scope, taskService) {
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

},{"./TaskBaseController":9}],13:[function(require,module,exports){
var Task = require('../entities/Task');

var TaskCreateDirective = module.exports = function (taskService) {
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
    };
};

},{"../entities/Task":15}],14:[function(require,module,exports){
var Task = require('../entities/Task');

var TaskListDirective = module.exports = function (taskService, clipService) {
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
    };
};

},{"../entities/Task":15}],15:[function(require,module,exports){
var ArraySet = require('../../util/ArraySet');

var Task = module.exports = function () {
    this.id = 0;
    this._syncStatus = 0;

    this.description = '';
    this.done = false;
    this.parent = null;
    this.children = new ArraySet();
};

},{"../../util/ArraySet":20}],16:[function(require,module,exports){
module.exports = require('./TaskModule');

},{"./TaskModule":5}],17:[function(require,module,exports){
/* global localStorage */

var Task = require('../entities/Task');
var ArraySet = require('../../util/ArraySet');

var TaskStatus = {
    SYNCED: 1,
    LOCAL_CREATED: 2,
    REMOTE_CREATED: 3,
    LOCAL_MODIFIED: 4,
    REMOTE_MODIFIED: 5,
    LOCAL_DELETED: 6,
    REMOTE_DELETED: 7
};

var SyncService = module.exports = function (BASE_URL, $http, $q, $rootScope) {
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
        parentId: task.parent !== null ? task.parent.id :0
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
        };
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

},{"../../util/ArraySet":20,"../entities/Task":15}],18:[function(require,module,exports){
var TaskService = module.exports = function ($http, BASE_URL, $q, syncService, $rootScope) {
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

},{}],19:[function(require,module,exports){
require('./CyUtilModule');
require('./TaskModule');

},{"./CyUtilModule":3,"./TaskModule":16}],20:[function(require,module,exports){
/* global Set */

var ArraySet = module.exports = function () {
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
    var _this = this;
    if (!this._array) {
        this._array = [];
        this.forEach(function (item) {
            _this._array.push(item);
        });
    }
    return this._array;
};

},{}]},{},[19])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcQ3lCcm93blxcdHJlZXRhc2tzXFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9DeUJyb3duL3RyZWV0YXNrcy9zcmMvY2xpZW50L2pzL0N5VXRpbE1vZHVsZS9DeVV0aWxNb2R1bGUuanMiLCJDOi9Vc2Vycy9DeUJyb3duL3RyZWV0YXNrcy9zcmMvY2xpZW50L2pzL0N5VXRpbE1vZHVsZS9kaXJlY3RpdmVzL0N5T25BY3RpdmVTdGF0ZURpcmVjdGl2ZS5qcyIsIkM6L1VzZXJzL0N5QnJvd24vdHJlZXRhc2tzL3NyYy9jbGllbnQvanMvQ3lVdGlsTW9kdWxlL2luZGV4LmpzIiwiQzovVXNlcnMvQ3lCcm93bi90cmVldGFza3Mvc3JjL2NsaWVudC9qcy9DeVV0aWxNb2R1bGUvc2VydmljZXMvQ2xpcFNlcnZpY2UuanMiLCJDOi9Vc2Vycy9DeUJyb3duL3RyZWV0YXNrcy9zcmMvY2xpZW50L2pzL1Rhc2tNb2R1bGUvVGFza01vZHVsZS5qcyIsIkM6L1VzZXJzL0N5QnJvd24vdHJlZXRhc2tzL3NyYy9jbGllbnQvanMvVGFza01vZHVsZS9jb25maWcvcm91dGVzLmpzIiwiQzovVXNlcnMvQ3lCcm93bi90cmVldGFza3Mvc3JjL2NsaWVudC9qcy9UYXNrTW9kdWxlL2NvbnRyb2xsZXJzL1N5bmNDb250cm9sbGVyLmpzIiwiQzovVXNlcnMvQ3lCcm93bi90cmVldGFza3Mvc3JjL2NsaWVudC9qcy9UYXNrTW9kdWxlL2NvbnRyb2xsZXJzL1Rhc2tBbGxDb250cm9sbGVyLmpzIiwiQzovVXNlcnMvQ3lCcm93bi90cmVldGFza3Mvc3JjL2NsaWVudC9qcy9UYXNrTW9kdWxlL2NvbnRyb2xsZXJzL1Rhc2tCYXNlQ29udHJvbGxlci5qcyIsIkM6L1VzZXJzL0N5QnJvd24vdHJlZXRhc2tzL3NyYy9jbGllbnQvanMvVGFza01vZHVsZS9jb250cm9sbGVycy9UYXNrRGV0YWlsc0NvbnRyb2xsZXIuanMiLCJDOi9Vc2Vycy9DeUJyb3duL3RyZWV0YXNrcy9zcmMvY2xpZW50L2pzL1Rhc2tNb2R1bGUvY29udHJvbGxlcnMvVGFza1NlYXJjaENvbnRyb2xsZXIuanMiLCJDOi9Vc2Vycy9DeUJyb3duL3RyZWV0YXNrcy9zcmMvY2xpZW50L2pzL1Rhc2tNb2R1bGUvY29udHJvbGxlcnMvVGFza1RvZG9Db250cm9sbGVyLmpzIiwiQzovVXNlcnMvQ3lCcm93bi90cmVldGFza3Mvc3JjL2NsaWVudC9qcy9UYXNrTW9kdWxlL2RpcmVjdGl2ZXMvVGFza0NyZWF0ZURpcmVjdGl2ZS5qcyIsIkM6L1VzZXJzL0N5QnJvd24vdHJlZXRhc2tzL3NyYy9jbGllbnQvanMvVGFza01vZHVsZS9kaXJlY3RpdmVzL1Rhc2tMaXN0RGlyZWN0aXZlLmpzIiwiQzovVXNlcnMvQ3lCcm93bi90cmVldGFza3Mvc3JjL2NsaWVudC9qcy9UYXNrTW9kdWxlL2VudGl0aWVzL1Rhc2suanMiLCJDOi9Vc2Vycy9DeUJyb3duL3RyZWV0YXNrcy9zcmMvY2xpZW50L2pzL1Rhc2tNb2R1bGUvaW5kZXguanMiLCJDOi9Vc2Vycy9DeUJyb3duL3RyZWV0YXNrcy9zcmMvY2xpZW50L2pzL1Rhc2tNb2R1bGUvc2VydmljZXMvU3luY1NlcnZpY2UuanMiLCJDOi9Vc2Vycy9DeUJyb3duL3RyZWV0YXNrcy9zcmMvY2xpZW50L2pzL1Rhc2tNb2R1bGUvc2VydmljZXMvVGFza1NlcnZpY2UuanMiLCJDOi9Vc2Vycy9DeUJyb3duL3RyZWV0YXNrcy9zcmMvY2xpZW50L2pzL2Zha2VfNmRiNzQ5ZjguanMiLCJDOi9Vc2Vycy9DeUJyb3duL3RyZWV0YXNrcy9zcmMvY2xpZW50L2pzL3V0aWwvQXJyYXlTZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGdsb2JhbCBhbmd1bGFyICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3kudXRpbCcsIFtdKVxyXG4gICAgLmRpcmVjdGl2ZSgnY3lBY3RpdmVPblN0YXRlJywgcmVxdWlyZSgnLi9kaXJlY3RpdmVzL0N5T25BY3RpdmVTdGF0ZURpcmVjdGl2ZScpKVxyXG4gICAgLnNlcnZpY2UoJ2NsaXBTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9DbGlwU2VydmljZScpKTtcclxuIiwidmFyIEN5T25BY3RpdmVTdGF0ZURpcmVjdGl2ZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCRyb290U2NvcGUsICRzdGF0ZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0cnMpIHtcclxuICAgICAgICAgICAgdmFyIG9uQ2hhbmdlU3RhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJHN0YXRlLmluY2x1ZGVzKGF0dHJzLmN5QWN0aXZlT25TdGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIG9uQ2hhbmdlU3RhdGUoKTtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBvbkNoYW5nZVN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vQ3lVdGlsTW9kdWxlJyk7XHJcbiIsInZhciBDbGlwU2VydmljZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5kYXRhID0gbnVsbDtcclxuICAgIHRoaXMudHlwZSA9IG51bGw7XHJcbn07XHJcblxyXG5DbGlwU2VydmljZS5wcm90b3R5cGUuaGFzRGF0YSA9IGZ1bmN0aW9uICh0eXBlKSB7XHJcbiAgICByZXR1cm4gdGhpcy50eXBlID09PSB0eXBlO1xyXG59O1xyXG5cclxuQ2xpcFNlcnZpY2UucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbiAoZGF0YSwgdHlwZSkge1xyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbn07XHJcblxyXG5DbGlwU2VydmljZS5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLmRhdGE7XHJcbn07XHJcblxyXG5DbGlwU2VydmljZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmRhdGEgPSBudWxsO1xyXG4gICAgdGhpcy50eXBlID0gbnVsbDtcclxufTtcclxuIiwiLyogZ2xvYmFsIGFuZ3VsYXIgKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ3RyZWVUYXNrQXBwJywgWyd1aS5yb3V0ZXInLCAnY3kudXRpbCcsICdhbmd1bGFyLWdlc3R1cmVzJ10pXHJcbiAgICAuY29udHJvbGxlcignVGFza0Jhc2VDb250cm9sbGVyJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9UYXNrQmFzZUNvbnRyb2xsZXInKSlcclxuICAgIC5jb250cm9sbGVyKCdUYXNrQWxsQ29udHJvbGxlcicsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvVGFza0FsbENvbnRyb2xsZXInKSlcclxuICAgIC5jb250cm9sbGVyKCdUYXNrVG9kb0NvbnRyb2xsZXInLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL1Rhc2tUb2RvQ29udHJvbGxlcicpKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1Rhc2tEZXRhaWxzQ29udHJvbGxlcicsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvVGFza0RldGFpbHNDb250cm9sbGVyJykpXHJcbiAgICAuY29udHJvbGxlcignVGFza1NlYXJjaENvbnRyb2xsZXInLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL1Rhc2tTZWFyY2hDb250cm9sbGVyJykpXHJcbiAgICAuY29udHJvbGxlcignU3luY0NvbnRyb2xsZXInLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL1N5bmNDb250cm9sbGVyJykpXHJcbiAgICAuY29uc3RhbnQoJ1JPVVRFUycsIHJlcXVpcmUoJy4vY29uZmlnL3JvdXRlcycpKVxyXG4gICAgLnNlcnZpY2UoJ3Rhc2tTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9UYXNrU2VydmljZScpKVxyXG4gICAgLnNlcnZpY2UoJ3N5bmNTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9TeW5jU2VydmljZScpKVxyXG4gICAgLmNvbnN0YW50KCdCQVNFX1VSTCcsICcvYXBpL3Rhc2tzLycpXHJcbiAgICAuZGlyZWN0aXZlKCd0YXNrTGlzdCcsIHJlcXVpcmUoJy4vZGlyZWN0aXZlcy9UYXNrTGlzdERpcmVjdGl2ZScpKVxyXG4gICAgLmRpcmVjdGl2ZSgndGFza0NyZWF0ZScsIHJlcXVpcmUoJy4vZGlyZWN0aXZlcy9UYXNrQ3JlYXRlRGlyZWN0aXZlJykpXHJcbiAgICAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCBST1VURVMpIHtcclxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XHJcbiAgICAgICAgUk9VVEVTLmZvckVhY2goZnVuY3Rpb24gKHJvdXRlKSB7XHJcbiAgICAgICAgICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKHJvdXRlLm5hbWUsIHJvdXRlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pLnJ1bihmdW5jdGlvbiAoc3luY1NlcnZpY2UpIHtcclxuICAgICAgICBzeW5jU2VydmljZS5wdWxsKCk7XHJcbiAgICB9KTtcclxuIiwidmFyIFJPVVRFUyA9IG1vZHVsZS5leHBvcnRzID0gW3tcclxuICAgIG5hbWU6ICdyb290JyxcclxuICAgIHRlbXBsYXRlVXJsOiAndmlld3MvY29tbW9uL2xheW91dC5odG1sJyxcclxuICAgIGFic3RyYWN0OiB0cnVlXHJcbn0sIHtcclxuICAgIG5hbWU6ICd0YXNrcycsXHJcbiAgICB1cmw6ICcnLFxyXG4gICAgdmlld3M6IHtcclxuICAgICAgICBtYWluOiB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndmlld3MvY29tbW9uL3Vpdmlldy5odG1sJ1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBhYnN0cmFjdDogdHJ1ZSxcclxuICAgIHBhcmVudDogJ3Jvb3QnXHJcbn0sIHtcclxuICAgIG5hbWU6ICd0YXNrcy50b2RvJyxcclxuICAgIHVybDogJy8nLFxyXG4gICAgdGVtcGxhdGVVcmw6ICd2aWV3cy90YXNrcy90b2RvLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ1Rhc2tUb2RvQ29udHJvbGxlcicsXHJcbiAgICBjb250cm9sbGVyQXM6ICdjdHJsJ1xyXG59LCB7XHJcbiAgICBuYW1lOiAndGFza3MuYWxsJyxcclxuICAgIHVybDogJy9hbGwnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICd2aWV3cy90YXNrcy9hbGwuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnVGFza0FsbENvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAnY3RybCdcclxufSwge1xyXG4gICAgbmFtZTogJ3Rhc2tzLmRldGFpbHMnLFxyXG4gICAgdXJsOiAnL2RldGFpbHMvOmlkJyxcclxuICAgIHRlbXBsYXRlVXJsOiAndmlld3MvdGFza3MvZGV0YWlscy5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdUYXNrRGV0YWlsc0NvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAnY3RybCdcclxufSwge1xyXG4gICAgbmFtZTogJ3Rhc2tzLnNlYXJjaCcsXHJcbiAgICB1cmw6ICcvc2VhcmNoJyxcclxuICAgIHRlbXBsYXRlVXJsOiAndmlld3MvdGFza3Mvc2VhcmNoLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ1Rhc2tTZWFyY2hDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnXHJcbn1dO1xyXG4iLCJ2YXIgU3luY0NvbnRyb2xsZXIgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzeW5jU2VydmljZSkge1xyXG4gICAgdGhpcy5zeW5jU2VydmljZSA9IHN5bmNTZXJ2aWNlO1xyXG59O1xyXG5cclxuU3luY0NvbnRyb2xsZXIucHJvdG90eXBlLnNob3dSZWZyZXNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc3luY1NlcnZpY2UucHVzaGluZyB8fCB0aGlzLnN5bmNTZXJ2aWNlLnB1bGxpbmc7XHJcbn07XHJcbiIsInZhciBUYXNrQmFzZUNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL1Rhc2tCYXNlQ29udHJvbGxlcicpO1xyXG5cclxudmFyIFRhc2tBbGxDb250cm9sbGVyID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGFza1NlcnZpY2UpIHtcclxuICAgIFRhc2tCYXNlQ29udHJvbGxlci5jYWxsKHRoaXMsIHRhc2tTZXJ2aWNlKTtcclxufTtcclxuVGFza0FsbENvbnRyb2xsZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUYXNrQmFzZUNvbnRyb2xsZXIucHJvdG90eXBlKTtcclxuXHJcblRhc2tBbGxDb250cm9sbGVyLnByb3RvdHlwZS5maW5kVGFza3MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50YXNrU2VydmljZS5maW5kQWxsKCk7XHJcbn07XHJcbiIsInZhciBUYXNrQmFzZUNvbnRyb2xsZXIgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh0YXNrU2VydmljZSkge1xyXG4gICAgdGhpcy50YXNrU2VydmljZSA9IHRhc2tTZXJ2aWNlO1xyXG4gICAgdGhpcy50YXNrcyA9IFtdO1xyXG59O1xyXG5cclxuVGFza0Jhc2VDb250cm9sbGVyLnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24gKHRhc2spIHtcclxuICAgIHRoaXMudGFza1NlcnZpY2Uuc2F2ZSh0YXNrKTtcclxufTtcclxuXHJcblRhc2tCYXNlQ29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKHRhc2spIHtcclxuICAgIHRoaXMudGFza1NlcnZpY2UuY3JlYXRlKHRhc2spO1xyXG59O1xyXG5cclxuVGFza0Jhc2VDb250cm9sbGVyLnByb3RvdHlwZS5kZWxldGUgPSBmdW5jdGlvbiAodGFzaykge1xyXG4gICAgdGhpcy50YXNrU2VydmljZS5yZW1vdmUodGFzayk7XHJcbn07XHJcbiIsInZhciBUYXNrQmFzZUNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL1Rhc2tCYXNlQ29udHJvbGxlcicpO1xyXG5cclxudmFyIFRhc2tEZXRhaWxzQ29udHJvbGxlciA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCRzY29wZSwgdGFza1NlcnZpY2UsICRzdGF0ZVBhcmFtcykge1xyXG4gICAgdGhpcy50YXNrSWQgPSBOdW1iZXIoJHN0YXRlUGFyYW1zLmlkKTtcclxuICAgIHRoaXMudGFzayA9IHRhc2tTZXJ2aWNlLmZpbmRCeUlkKHRoaXMudGFza0lkKTtcclxuICAgIFRhc2tCYXNlQ29udHJvbGxlci5jYWxsKHRoaXMsIHRhc2tTZXJ2aWNlKTtcclxufTtcclxuVGFza0RldGFpbHNDb250cm9sbGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVGFza0Jhc2VDb250cm9sbGVyLnByb3RvdHlwZSk7XHJcblxyXG5UYXNrRGV0YWlsc0NvbnRyb2xsZXIucHJvdG90eXBlLmZpbmRUYXNrcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLnRhc2suY2hpbGRyZW4udG9BcnJheSgpO1xyXG59O1xyXG4iLCJ2YXIgVGFza1NlYXJjaENvbnRyb2xsZXIgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh0YXNrU2VydmljZSkge1xyXG4gICAgdGhpcy50YXNrU2VydmljZSA9IHRhc2tTZXJ2aWNlO1xyXG4gICAgdGhpcy50YXNrcyA9IFtdO1xyXG4gICAgdGhpcy5zZWFyY2hUZXJtID0gJyc7XHJcbn07XHJcblxyXG5UYXNrU2VhcmNoQ29udHJvbGxlci5wcm90b3R5cGUuc2VhcmNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIHRoaXMudGFza3MgPSB0aGlzLnRhc2tTZXJ2aWNlLmZpbmRBbGwoKS5maWx0ZXIoZnVuY3Rpb24gKHRhc2spIHtcclxuICAgICAgICByZXR1cm4gdGFzay5kZXNjcmlwdGlvbi5pbmRleE9mKF90aGlzLnNlYXJjaFRlcm0pICE9PSAtMTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuVGFza1NlYXJjaENvbnRyb2xsZXIucHJvdG90eXBlLmZpbmRUYXNrcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLnRhc2tzO1xyXG59O1xyXG4iLCJ2YXIgVGFza0Jhc2VDb250cm9sbGVyID0gcmVxdWlyZSgnLi9UYXNrQmFzZUNvbnRyb2xsZXInKTtcclxuXHJcbnZhciBUYXNrVG9kb0NvbnRyb2xsZXIgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkc2NvcGUsIHRhc2tTZXJ2aWNlKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgVGFza0Jhc2VDb250cm9sbGVyLmNhbGwodGhpcywgdGFza1NlcnZpY2UpO1xyXG4gICAgdGhpcy50YXNrcyA9IFtdO1xyXG4gICAgdmFyIGNvbXB1dGVUYXNrcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdHQgPSBfdGhpcy50YXNrU2VydmljZS5maW5kQWxsKCkuZmlsdGVyKGZ1bmN0aW9uICh0YXNrKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0YXNrLmRvbmUgPT09IGZhbHNlICYmIHRhc2suY2hpbGRyZW4udG9BcnJheSgpLmZpbHRlcihmdW5jdGlvbiAodGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZG9uZSA9PT0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pLmxlbmd0aCA9PT0gMDtcclxuICAgICAgICB9KTtcclxuICAgICAgICBfdGhpcy50YXNrcy5sZW5ndGggPSAwO1xyXG4gICAgICAgIFtdLnB1c2guYXBwbHkoX3RoaXMudGFza3MsIHR0KTtcclxuICAgIH07XHJcbiAgICBjb21wdXRlVGFza3MoKTtcclxuICAgICRzY29wZS4kb24oJ3Rhc2tzLmNoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjb21wdXRlVGFza3MoKTtcclxuICAgIH0pO1xyXG59O1xyXG5UYXNrVG9kb0NvbnRyb2xsZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUYXNrQmFzZUNvbnRyb2xsZXIucHJvdG90eXBlKTtcclxuXHJcblRhc2tUb2RvQ29udHJvbGxlci5wcm90b3R5cGUuZmluZFRhc2tzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudGFza3M7XHJcbn07XHJcbiIsInZhciBUYXNrID0gcmVxdWlyZSgnLi4vZW50aXRpZXMvVGFzaycpO1xyXG5cclxudmFyIFRhc2tDcmVhdGVEaXJlY3RpdmUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh0YXNrU2VydmljZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIG9uQ3JlYXRlOiAnJicsXHJcbiAgICAgICAgICAgIHBhcmVudElkOiAnQCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAndmlld3MvZGlyZWN0aXZlcy90YXNrLWNyZWF0ZS5odG1sJyxcclxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIHNjb3BlLnBhcmVudCA9IHRhc2tTZXJ2aWNlLmZpbmRCeUlkKE51bWJlcihzY29wZS5wYXJlbnRJZCkpO1xyXG4gICAgICAgICAgICBzY29wZS5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGFzayA9IG5ldyBUYXNrKCk7XHJcbiAgICAgICAgICAgICAgICB0YXNrLnBhcmVudCA9IHNjb3BlLnBhcmVudDtcclxuICAgICAgICAgICAgICAgIHRhc2suZGVzY3JpcHRpb24gPSBzY29wZS5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgICAgIHNjb3BlLmRlc2NyaXB0aW9uID0gJyc7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUucGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUucGFyZW50LmNoaWxkcmVuLmFkZCh0YXNrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHNjb3BlLm9uQ3JlYXRlKHt0YXNrOiB0YXNrfSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuIiwidmFyIFRhc2sgPSByZXF1aXJlKCcuLi9lbnRpdGllcy9UYXNrJyk7XHJcblxyXG52YXIgVGFza0xpc3REaXJlY3RpdmUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh0YXNrU2VydmljZSwgY2xpcFNlcnZpY2UpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICB0YXNrczogJz0nLFxyXG4gICAgICAgICAgICBvbkNyZWF0ZTogJyYnLFxyXG4gICAgICAgICAgICBvblNhdmU6ICcmJyxcclxuICAgICAgICAgICAgb25EZWxldGU6ICcmJyxcclxuICAgICAgICAgICAgaGlkZVBhcmVudDogJ0AnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3ZpZXdzL2RpcmVjdGl2ZXMvdGFzay1saXN0Lmh0bWwnLFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0cnMpIHtcclxuICAgICAgICAgICAgc2NvcGUuc2hvd1JlbGVhc2VCdG4gPSBmdW5jdGlvbiAodGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNsaXBTZXJ2aWNlLmhhc0RhdGEoJ3Rhc2snKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbGlwU2VydmljZS5nZXREYXRhKCkuaWQgPT09IHRhc2suaWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHNjb3BlLnNob3dQYXN0ZUJ0biA9IGZ1bmN0aW9uICh0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2xpcFNlcnZpY2UuaGFzRGF0YSgndGFzaycpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsaXBTZXJ2aWNlLmdldERhdGEoKS5pZCAhPT0gdGFzay5pZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgc2NvcGUuc2hvd0N1dEJ0biA9IGZ1bmN0aW9uICh0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gIWNsaXBTZXJ2aWNlLmhhc0RhdGEoJ3Rhc2snKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHNjb3BlLmN1dCA9IGZ1bmN0aW9uICh0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICBjbGlwU2VydmljZS5zZXREYXRhKHRhc2ssICd0YXNrJyk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBzY29wZS5zZXREb25lID0gZnVuY3Rpb24gKHRhc2ssIGRvbmUpIHtcclxuICAgICAgICAgICAgICAgIHRhc2suZG9uZSA9IGRvbmU7XHJcbiAgICAgICAgICAgICAgICB0YXNrU2VydmljZS5zYXZlKHRhc2spO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBzY29wZS5jcmVhdGUgPSBmdW5jdGlvbiAocGFyZW50VGFzaywgZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgIHZhciB0YXNrID0gbmV3IFRhc2soKTtcclxuICAgICAgICAgICAgICAgIHRhc2sucGFyZW50ID0gcGFyZW50VGFzaztcclxuICAgICAgICAgICAgICAgIHRhc2suZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnRUYXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50VGFzay5jaGlsZHJlbi5hZGQodGFzayk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzY29wZS5vbkNyZWF0ZSh7dGFzazogdGFza30pO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBzY29wZS5yZW1vdmUgPSBmdW5jdGlvbiAodGFzaykge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUub25EZWxldGUoe3Rhc2s6IHRhc2t9KTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgc2NvcGUucGFzdGUgPSBmdW5jdGlvbiAocGFyZW50VGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNsaXBTZXJ2aWNlLmhhc0RhdGEoJ3Rhc2snKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0YXNrID0gY2xpcFNlcnZpY2UuZ2V0RGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXNrLnBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrLnBhcmVudC5jaGlsZHJlbi5kZWxldGUodGFzayk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRhc2sucGFyZW50ID0gcGFyZW50VGFzaztcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRUYXNrLmNoaWxkcmVuLmFkZCh0YXNrKTtcclxuICAgICAgICAgICAgICAgICAgICBjbGlwU2VydmljZS5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2tTZXJ2aWNlLnNhdmUodGFzayk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHNjb3BlLnJlbGVhc2UgPSBmdW5jdGlvbiAodGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhc2sucGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5wYXJlbnQuY2hpbGRyZW4uZGVsZXRlKHRhc2spO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGFzay5wYXJlbnQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGFza1NlcnZpY2Uuc2F2ZSh0YXNrKTtcclxuICAgICAgICAgICAgICAgIGNsaXBTZXJ2aWNlLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuIiwidmFyIEFycmF5U2V0ID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9BcnJheVNldCcpO1xyXG5cclxudmFyIFRhc2sgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuaWQgPSAwO1xyXG4gICAgdGhpcy5fc3luY1N0YXR1cyA9IDA7XHJcblxyXG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9ICcnO1xyXG4gICAgdGhpcy5kb25lID0gZmFsc2U7XHJcbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XHJcbiAgICB0aGlzLmNoaWxkcmVuID0gbmV3IEFycmF5U2V0KCk7XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9UYXNrTW9kdWxlJyk7XHJcbiIsIi8qIGdsb2JhbCBsb2NhbFN0b3JhZ2UgKi9cclxuXHJcbnZhciBUYXNrID0gcmVxdWlyZSgnLi4vZW50aXRpZXMvVGFzaycpO1xyXG52YXIgQXJyYXlTZXQgPSByZXF1aXJlKCcuLi8uLi91dGlsL0FycmF5U2V0Jyk7XHJcblxyXG52YXIgVGFza1N0YXR1cyA9IHtcclxuICAgIFNZTkNFRDogMSxcclxuICAgIExPQ0FMX0NSRUFURUQ6IDIsXHJcbiAgICBSRU1PVEVfQ1JFQVRFRDogMyxcclxuICAgIExPQ0FMX01PRElGSUVEOiA0LFxyXG4gICAgUkVNT1RFX01PRElGSUVEOiA1LFxyXG4gICAgTE9DQUxfREVMRVRFRDogNixcclxuICAgIFJFTU9URV9ERUxFVEVEOiA3XHJcbn07XHJcblxyXG52YXIgU3luY1NlcnZpY2UgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChCQVNFX1VSTCwgJGh0dHAsICRxLCAkcm9vdFNjb3BlKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgdGhpcy5CQVNFX1VSTCA9IEJBU0VfVVJMO1xyXG4gICAgdGhpcy4kaHR0cCA9ICRodHRwO1xyXG4gICAgdGhpcy4kcSA9ICRxO1xyXG4gICAgdGhpcy4kcm9vdFNjb3BlID0gJHJvb3RTY29wZTtcclxuICAgIHRoaXMudGFza3MgPSBbXTtcclxuICAgIHRoaXMucHVsbGluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy50b1VwZGF0ZSA9IG5ldyBBcnJheVNldCgpO1xyXG4gICAgdGhpcy50b0NyZWF0ZSA9IG5ldyBBcnJheVNldCgpO1xyXG4gICAgdGhpcy50b1JlbW92ZSA9IG5ldyBBcnJheVNldCgpO1xyXG4gICAgdGhpcy5pZCA9IDA7XHJcbiAgICB0aGlzLl9wdXNoQWdhaW4gPSBmYWxzZTtcclxuICAgIHRoaXMucHVzaGluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5wdWxsaW5nID0gZmFsc2U7XHJcbiAgICB2YXIgZGVmZXIgPSB0aGlzLiRxLmRlZmVyKCk7XHJcbiAgICBkZWZlci5yZXNvbHZlKGZhbHNlKTtcclxuICAgIHRoaXMuZmFsc2VQcm9taXNlID0gZGVmZXIucHJvbWlzZTtcclxuICAgICRyb290U2NvcGUuJG9uKCd0YXNrcy5jaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgX3RoaXMud3JpdGVUb0xvY2FsU3RvcmFnZSgpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5TeW5jU2VydmljZS5wcm90b3R5cGUud3JpdGVUb0xvY2FsU3RvcmFnZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0YXNrcycsIEpTT04uc3RyaW5naWZ5KHNlcmlhbGl6ZVRhc2tzKHRoaXMudGFza3MpKSk7XHJcbn07XHJcblxyXG5TeW5jU2VydmljZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKHRhc2spIHtcclxuICAgIHRhc2suX3N5bmNTdGF0dXMgPSBUYXNrU3RhdHVzLkxPQ0FMX01PRElGSUVEO1xyXG4gICAgdGhpcy50b1VwZGF0ZS5hZGQodGFzayk7XHJcbiAgICB0aGlzLnB1c2goKTtcclxufTtcclxuXHJcblN5bmNTZXJ2aWNlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiAodGFzaykge1xyXG4gICAgaWYgKCF0aGlzLnRvQ3JlYXRlLmhhcyh0YXNrKSkge1xyXG4gICAgICAgIHRoaXMuaWQrKztcclxuICAgICAgICB0YXNrLl9zeW5jU3RhdHVzID0gVGFza1N0YXR1cy5MT0NBTF9DUkVBVEVEO1xyXG4gICAgICAgIHRhc2suaWQgPSAtdGhpcy5pZDtcclxuICAgICAgICB0aGlzLnRhc2tzLnB1c2godGFzayk7XHJcbiAgICAgICAgdGhpcy50b0NyZWF0ZS5hZGQodGFzayk7XHJcbiAgICAgICAgdGhpcy5wdXNoKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TeW5jU2VydmljZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKHRhc2spIHtcclxuICAgIHZhciBpbmRleDtcclxuICAgIHRhc2suX3N5bmNTdGF0dXMgPSBUYXNrU3RhdHVzLkxPQ0FMX0RFTEVURUQ7XHJcbiAgICB0aGlzLnRvVXBkYXRlLmRlbGV0ZSh0YXNrKTtcclxuICAgIGlmICgoaW5kZXggPSB0aGlzLnRhc2tzLmluZGV4T2YodGFzaykpICE9PSAtMSkge1xyXG4gICAgICAgIHRoaXMudGFza3Muc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuICAgIGlmICh0YXNrLnBhcmVudCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRhc2sucGFyZW50LmNoaWxkcmVuLmRlbGV0ZSh0YXNrKTtcclxuICAgIH1cclxuICAgIGlmICh0YXNrLmNoaWxkcmVuLnRvQXJyYXkoKS5sZW5ndGggIT09IDApIHtcclxuICAgICAgICB0YXNrLmNoaWxkcmVuLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uICh0YXNrKSB7XHJcbiAgICAgICAgICAgIHRhc2sucGFyZW50ID0gbnVsbDtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHRoaXMudG9SZW1vdmUuYWRkKHRhc2spO1xyXG4gICAgdGhpcy5wdXNoKCk7XHJcbn07XHJcblxyXG52YXIgdGFza1RvSGFzaCA9IGZ1bmN0aW9uICh0YXNrKSB7XHJcbiAgICB2YXIgaGFzaCA9IHtcclxuICAgICAgICBkZXNjcmlwdGlvbjogdGFzay5kZXNjcmlwdGlvbixcclxuICAgICAgICBkb25lOiB0YXNrLmRvbmUsXHJcbiAgICAgICAgcGFyZW50SWQ6IHRhc2sucGFyZW50ICE9PSBudWxsID8gdGFzay5wYXJlbnQuaWQgOjBcclxuICAgIH07XHJcbiAgICBpZiAodGFzay5pZCA+IDApIHtcclxuICAgICAgICBoYXNoLmlkID0gdGFzay5pZDtcclxuICAgIH1cclxuICAgIHJldHVybiBoYXNoO1xyXG59O1xyXG5cclxuU3luY1NlcnZpY2UucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgaWYgKHRoaXMucHVzaGluZykge1xyXG4gICAgICAgIHRoaXMuX3B1c2hBZ2FpbiA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wdXNoaW5nID0gdHJ1ZTtcclxuICAgIHRoaXMuX3B1c2hBZ2FpbiA9IGZhbHNlO1xyXG4gICAgdGhpcy4kcS5hbGwodGhpcy50b0NyZWF0ZS50b0FycmF5KCkubWFwKGZ1bmN0aW9uICh0YXNrKSB7XHJcbiAgICAgICAgcmV0dXJuIF90aGlzLiRodHRwLnB1dChfdGhpcy5CQVNFX1VSTCwgdGFza1RvSGFzaCh0YXNrKSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgdGFzay5pZCA9IHJlc3BvbnNlLmRhdGEuaWQ7XHJcbiAgICAgICAgICAgIHRhc2suX3N5bmNTdGF0dXMgPSBUYXNrU3RhdHVzLlNZTkNFRDtcclxuICAgICAgICAgICAgX3RoaXMud3JpdGVUb0xvY2FsU3RvcmFnZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSkpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBfdGhpcy4kcS5hbGwoX3RoaXMudG9VcGRhdGUudG9BcnJheSgpLm1hcChmdW5jdGlvbiAodGFzaykge1xyXG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuJGh0dHAucG9zdChfdGhpcy5CQVNFX1VSTCArIHRhc2suaWQsIHRhc2tUb0hhc2godGFzaykpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGFzay5fc3luY1N0YXR1cyA9IFRhc2tTdGF0dXMuU1lOQ0VEO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMud3JpdGVUb0xvY2FsU3RvcmFnZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KSk7XHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gX3RoaXMuJHEuYWxsKF90aGlzLnRvUmVtb3ZlLnRvQXJyYXkoKS5tYXAoZnVuY3Rpb24gKHRhc2spIHtcclxuICAgICAgICAgICAgcmV0dXJuIF90aGlzLiRodHRwLmRlbGV0ZShfdGhpcy5CQVNFX1VSTCArIHRhc2suaWQpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGFzay5fc3luY1N0YXR1cyA9IFRhc2tTdGF0dXMuU1lOQ0VEO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMud3JpdGVUb0xvY2FsU3RvcmFnZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KSk7XHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBfdGhpcy50b1VwZGF0ZS5jbGVhcigpO1xyXG4gICAgICAgIF90aGlzLnRvUmVtb3ZlLmNsZWFyKCk7XHJcbiAgICAgICAgX3RoaXMudG9DcmVhdGUuY2xlYXIoKTtcclxuICAgICAgICBfdGhpcy5wdXNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKF90aGlzLl9wdXNoQWdhaW4pIHtcclxuICAgICAgICAgICAgX3RoaXMucHVzaCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxudmFyIHNlcmlhbGl6ZVRhc2tzID0gZnVuY3Rpb24gKHRhc2tzKSB7XHJcbiAgICByZXR1cm4gdGFza3MubWFwKGZ1bmN0aW9uICh0YXNrKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaWQ6IHRhc2suaWQsXHJcbiAgICAgICAgICAgIF9zeW5jU3RhdHVzOiB0YXNrLl9zeW5jU3RhdHVzLFxyXG4gICAgICAgICAgICBwYXJlbnRJZDogdGFzay5wYXJlbnQgPyB0YXNrLnBhcmVudC5pZCA6IDAsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0YXNrLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICBkb25lOiB0YXNrLmRvbmVcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5TeW5jU2VydmljZS5wcm90b3R5cGUuZGVzZXJpYWxpemVUYXNrcyA9IGZ1bmN0aW9uIChjdXJyZW50VGFza0FycmF5LCByYXdUYXNrRGF0YSwgaXNMb2NhbCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIHZhciByZXNwb25zZUhhc2ggPSByYXdUYXNrRGF0YSB8fCBbXTtcclxuICAgIHZhciBoYXNoRGljdCA9IHt9O1xyXG4gICAgdmFyIG9iakRpY3QgPSB7fTtcclxuICAgIHZhciB0YXNrUHJlc2VudEluUmVtb3RlID0ge307XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgZGljdCBvZiBoYXNoZXMsIGFuZCBwb3B1bGF0aW5nIHByaW1pdGl2ZSBwcm9wZXJ0aWVzIG9mIHRhc2tzXHJcbiAgICAvLyBDcmVhdGUgYSBkaWN0IG9mIG9iamVjdHNcclxuICAgIHJlc3BvbnNlSGFzaC5mb3JFYWNoKGZ1bmN0aW9uIChoYXNoKSB7XHJcbiAgICAgICAgaGFzaERpY3RbaGFzaC5pZF0gPSBoYXNoO1xyXG4gICAgICAgIHZhciBvYmogPSBjdXJyZW50VGFza0FycmF5LmZpbHRlcihmdW5jdGlvbiAodGFzaykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGFzay5pZCA9PT0gaGFzaC5pZDtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgdGFzaztcclxuICAgICAgICBpZiAoIW9iai5sZW5ndGgpIHtcclxuICAgICAgICAgICB0YXNrID0gbmV3IFRhc2soKTtcclxuICAgICAgICAgICAgY3VycmVudFRhc2tBcnJheS5wdXNoKHRhc2spO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRhc2sgPSBvYmpbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRhc2suaWQgPSBoYXNoLmlkO1xyXG4gICAgICAgIGlmICh0YXNrLl9zeW5jU3RhdHVzID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRhc2suX3N5bmNTdGF0dXMgPSBoYXNoLl9zeW5jU3RhdHVzIHx8IFRhc2tTdGF0dXMuU1lOQ0VEO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNMb2NhbCB8fCB0YXNrLl9zeW5jU3RhdHVzID09PSBUYXNrU3RhdHVzLlNZTkNFRCkge1xyXG4gICAgICAgICAgICB0YXNrLl9zeW5jU3RhdHVzID0gaGFzaC5fc3luY1N0YXR1cyB8fCBUYXNrU3RhdHVzLlNZTkNFRDtcclxuICAgICAgICAgICAgdGFzay5kZXNjcmlwdGlvbiA9IGhhc2guZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgIHRhc2suZG9uZSA9IGhhc2guZG9uZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoICh0YXNrLl9zeW5jU3RhdHVzKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGFza1N0YXR1cy5MT0NBTF9DUkVBVEVEOlxyXG4gICAgICAgICAgICAgICAgX3RoaXMudG9DcmVhdGUuYWRkKHRhc2spO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgVGFza1N0YXR1cy5MT0NBTF9ERUxFVEVEOlxyXG4gICAgICAgICAgICAgICAgX3RoaXMudG9SZW1vdmUuYWRkKHRhc2spO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgVGFza1N0YXR1cy5MT0NBTF9NT0RJRklFRDpcclxuICAgICAgICAgICAgICAgIF90aGlzLnRvVXBkYXRlLmFkZCh0YXNrKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvYmpEaWN0W3Rhc2suaWRdID0gdGFzaztcclxuICAgICAgICBpZiAoIWlzTG9jYWwpIHtcclxuICAgICAgICAgICAgdGFza1ByZXNlbnRJblJlbW90ZVt0YXNrLmlkXSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUG9wdWxhdGluZyBjb21wbGV4IHByb3BlcnRpZXMgb2Ygb2JqZWN0c1xyXG4gICAgT2JqZWN0LmtleXMob2JqRGljdCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgdmFyIHBhcmVudElkID0gaGFzaERpY3Rba2V5XS5wYXJlbnRJZDtcclxuICAgICAgICBpZiAocGFyZW50SWQpIHtcclxuICAgICAgICAgICAgb2JqRGljdFtrZXldLnBhcmVudCA9IG9iakRpY3RbcGFyZW50SWRdO1xyXG4gICAgICAgICAgICBvYmpEaWN0W3BhcmVudElkXS5jaGlsZHJlbi5hZGQob2JqRGljdFtrZXldKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIWlzTG9jYWwpIHtcclxuICAgICAgICB2YXIgb2xkVGFza3NXaXRoRGVsZXRlZCA9IGN1cnJlbnRUYXNrQXJyYXkuc2xpY2UoKTtcclxuICAgICAgICBjdXJyZW50VGFza0FycmF5Lmxlbmd0aCA9IDA7XHJcbiAgICAgICAgb2xkVGFza3NXaXRoRGVsZXRlZC5mb3JFYWNoKGZ1bmN0aW9uICh0YXNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0YXNrUHJlc2VudEluUmVtb3RlW3Rhc2suaWRdKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VGFza0FycmF5LnB1c2godGFzayk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFzay5wYXJlbnQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRhc2sucGFyZW50LmNoaWxkcmVuLmRlbGV0ZSh0YXNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU3luY1NlcnZpY2UucHJvdG90eXBlLnB1bGxGcm9tTG9jYWxTdG9yYWdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc29sZS5sb2coJzwgU3luY1NlcnZpY2UgcHVsbEZyb21Mb2NhbFN0b3JhZ2UnKTtcclxuICAgIHZhciByYXdUYXNrcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rhc2tzJykpO1xyXG4gICAgdGhpcy50YXNrcy5sZW5ndGggPSAwO1xyXG4gICAgdGhpcy5kZXNlcmlhbGl6ZVRhc2tzKHRoaXMudGFza3MsIHJhd1Rhc2tzLCB0cnVlKTtcclxuICAgIGNvbnNvbGUubG9nKCc+IFN5bmNTZXJ2aWNlIHB1bGxGcm9tTG9jYWxTdG9yYWdlJyk7XHJcbn07XHJcblxyXG5TeW5jU2VydmljZS5wcm90b3R5cGUucHVsbEZyb21OZXR3b3JrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc29sZS5sb2coJzwgU3luY1NlcnZpY2UgcHVsbEZyb21OZXR3b3JrJyk7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgcmV0dXJuIHRoaXMuJGh0dHAuZ2V0KHRoaXMuQkFTRV9VUkwpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgX3RoaXMuZGVzZXJpYWxpemVUYXNrcyhfdGhpcy50YXNrcywgcmVzcG9uc2UuZGF0YSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJz4gU3luY1NlcnZpY2UgcHVsbEZyb21OZXR3b3JrJyk7XHJcbiAgICB9KTtcclxufTtcclxuXHJcblN5bmNTZXJ2aWNlLnByb3RvdHlwZS5wdWxsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc29sZS5sb2coJzwgU3luY1NlcnZpY2UgcHVsbCcpO1xyXG4gICAgaWYgKHRoaXMucHVsbGluZykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZhbHNlUHJvbWlzZTtcclxuICAgIH1cclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICB0aGlzLnB1bGxpbmcgPSB0cnVlO1xyXG4gICAgdGhpcy5wdWxsRnJvbUxvY2FsU3RvcmFnZSgpO1xyXG4gICAgdGhpcy5wdWxsaW5nID0gdHJ1ZTtcclxuICAgIHJldHVybiB0aGlzLnB1bGxGcm9tTmV0d29yaygpLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIF90aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdCgndGFza3MuY2hhbmdlJyk7XHJcbiAgICAgICAgX3RoaXMucHVsbGluZyA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCc+IFN5bmNTZXJ2aWNlIHB1bGwnKTtcclxuICAgICAgICBfdGhpcy5wdWxsaW5nID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9KTtcclxufTtcclxuIiwidmFyIFRhc2tTZXJ2aWNlID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoJGh0dHAsIEJBU0VfVVJMLCAkcSwgc3luY1NlcnZpY2UsICRyb290U2NvcGUpIHtcclxuICAgIHRoaXMuc3luY1NlcnZpY2UgPSBzeW5jU2VydmljZTtcclxuICAgIHRoaXMuJHJvb3RTY29wZSA9ICRyb290U2NvcGU7XHJcbn07XHJcblxyXG5UYXNrU2VydmljZS5wcm90b3R5cGUuZmluZEFsbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLnN5bmNTZXJ2aWNlLnRhc2tzO1xyXG59O1xyXG5cclxuVGFza1NlcnZpY2UucHJvdG90eXBlLmZpbmRCeUlkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3luY1NlcnZpY2UudGFza3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAodGhpcy5zeW5jU2VydmljZS50YXNrcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zeW5jU2VydmljZS50YXNrc1tpXS5pZCA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN5bmNTZXJ2aWNlLnRhc2tzW2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5UYXNrU2VydmljZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKHRhc2spIHtcclxuICAgIHRoaXMuc3luY1NlcnZpY2UuY3JlYXRlKHRhc2spO1xyXG4gICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Rhc2tzLmNoYW5nZScpO1xyXG59O1xyXG5cclxuVGFza1NlcnZpY2UucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbiAodGFzaykge1xyXG4gICAgdGhpcy5zeW5jU2VydmljZS51cGRhdGUodGFzayk7XHJcbiAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdCgndGFza3MuY2hhbmdlJyk7XHJcbn07XHJcblxyXG5UYXNrU2VydmljZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKHRhc2spIHtcclxuICAgIHRoaXMuc3luY1NlcnZpY2UucmVtb3ZlKHRhc2spO1xyXG4gICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Rhc2tzLmNoYW5nZScpO1xyXG59O1xyXG4iLCJyZXF1aXJlKCcuL0N5VXRpbE1vZHVsZScpO1xyXG5yZXF1aXJlKCcuL1Rhc2tNb2R1bGUnKTtcclxuIiwiLyogZ2xvYmFsIFNldCAqL1xyXG5cclxudmFyIEFycmF5U2V0ID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBTZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIHRoaXMuX2FycmF5ID0gbnVsbDtcclxufTtcclxuQXJyYXlTZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTZXQucHJvdG90eXBlKTtcclxuXHJcbkFycmF5U2V0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9hcnJheSA9IG51bGw7XHJcbiAgICByZXR1cm4gU2V0LnByb3RvdHlwZS5hZGQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufTtcclxuXHJcbkFycmF5U2V0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX2FycmF5ID0gbnVsbDtcclxuICAgIHJldHVybiBTZXQucHJvdG90eXBlLmNsZWFyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn07XHJcblxyXG5BcnJheVNldC5wcm90b3R5cGUuZGVsZXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fYXJyYXkgPSBudWxsO1xyXG4gICAgcmV0dXJuIFNldC5wcm90b3R5cGUuZGVsZXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn07XHJcblxyXG5BcnJheVNldC5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICBpZiAoIXRoaXMuX2FycmF5KSB7XHJcbiAgICAgICAgdGhpcy5fYXJyYXkgPSBbXTtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgX3RoaXMuX2FycmF5LnB1c2goaXRlbSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fYXJyYXk7XHJcbn07XHJcbiJdfQ==
