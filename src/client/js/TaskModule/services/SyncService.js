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
