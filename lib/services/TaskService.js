var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var TaskService = module.exports = function (path) {
    var _this = this;
    this._id = 0;
    this._tasks = {};
    this._path = path;

};

TaskService.prototype.init = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
        mkdirp(path.dirname(_this._path), function (err) {
            if (err) {
                reject(err);
                return;
            }
            fs.exists(_this._path, function (exists) {
                if (exists) {
                    fs.readFile(_this._path, function (err, body) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        var data = JSON.parse(body.toString());
                        _this._id = data.id;
                        _this._tasks = data.items;
                    });
                }
                resolve();
            });
        });
    });
};

TaskService.prototype._write = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
        fs.writeFile(_this._path, JSON.stringify({
            id: _this._id,
            items: _this._tasks
        }), null, function (err, res) {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
};

TaskService.prototype.findAll = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
        resolve(Object.keys(_this._tasks).map(function (key) {
            return _this._tasks[key];
        }));
    });
};

TaskService.prototype.findChildren = function (taskId) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        resolve(Object.keys(_this._tasks).map(function (key) {
            return _this._tasks[key];
        }).filter(function (task) {
            return task.parentId === taskId;
        }));
    });
};

TaskService.prototype.findDoable = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
        resolve(Object.keys(_this._tasks).map(function (key) {
            return _this._tasks[key];
        }).filter(function (task) {
            return task.done === false && task.undoneChildren === 0;
        }));
    });
};

TaskService.prototype.findByIdOrNull = function (taskId) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        if (_this._tasks.hasOwnProperty(taskId)) {
            resolve(_this._tasks[taskId]);
        } else {
            resolve(null);
        }
    });
};

TaskService.prototype.findById = function (taskId) {
    var _this = this;
    return this.findByIdOrNull(taskId).then(function (task) {
        if (task === null) {
            throw new Error('task not found');
        } else {
            return task;
        }
    });
};

TaskService.prototype.setDescription = function (taskId, description) {
    var _this = this;
    return _this.findById(taskId).then(function (task) {
        task.description = description;
        return _this._write();
    });
};

TaskService.prototype.setDone = function (taskId) {
    var _this = this;
    return _this.findById(taskId).then(function (task) {
        return _this._decrementUndoneChild(task.parentId).finally(function () {
            task.done = true;
            return _this._write();
        });
    });
};

TaskService.prototype.setUndone = function (taskId) {
    var _this = this;
    return _this.findById(taskId).then(function (task) {
        return _this._incrementUndoneChild(task.parentId).finally(function () {
            task.done = false;
            return _this._write();
        });
    });
};

TaskService.prototype.create = function (hash) {
    var _this = this;
    return _this._incrementUndoneChild(hash.parentId).then(function () {
        var id = ++_this._id;
        _this._tasks[id] = {
            id: id,
            parentId: hash.parentId,
            description: hash.description,
            undoneChildren: 0,
            done: false
        };
        return _this._write().then(function () {
            return _this._tasks[id];
        });
    });
};

TaskService.prototype.removeById = function (taskId) {
    var _this = this;
    return _this.findById(taskId).then(function (task) {
        return _this._decrementUndoneChild(task.parentId).then(function () {
            delete _this._tasks[task.id];
            return _this._write();
        });
    });
};

TaskService.prototype._incrementUndoneChild = function (taskId) {
    var _this = this;
    return _this.findByIdOrNull(taskId).then(function (task) {
        if (!task) {
            return;
        }
        task.undoneChildren++;
        return _this._write();
    });
};

TaskService.prototype._decrementUndoneChild = function (taskId) {
    var _this = this;
    return _this.findByIdOrNull(taskId).then(function (task) {
        if (!task) {
            return;
        }
        task.undoneChildren--;
        return _this._write();
    });
};
