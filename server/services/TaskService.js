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
                        try {
	                        var data = JSON.parse(body.toString());
	                        _this._id = data.id;
	                        _this._tasks = data.items;
                        } catch (err) {
                        	_this._id = 0;
                        	_this._tasks = {};
                        }
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

TaskService.prototype.findOrNull = function (taskId) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        if (_this._tasks.hasOwnProperty(taskId)) {
            resolve(_this._tasks[taskId]);
        } else {
            resolve(null);
        }
    });
};

TaskService.prototype.find = function (taskId) {
    var _this = this;
    return this.findOrNull(taskId).then(function (task) {
        if (task === null) {
            throw new Error('task not found');
        } else {
            return task;
        }
    });
};

TaskService.prototype.save = function (hash) {
    var _this = this;
    return _this.find(hash.id).then(function (task) {
        Object.keys(hash).forEach(function (key) {
            task[key] = hash[key];
        });
    }).then(function () {
        _this._write();
    });
};

TaskService.prototype.create = function (hash) {
    var _this = this;
    var id = ++_this._id;
    _this._tasks[id] = JSON.parse(JSON.stringify(hash));
    _this._tasks[id].id = id;
    return this._write().then(function () {
        return _this._tasks[id];
    });
};

TaskService.prototype.remove = function (taskId) {
    var _this = this;
    return _this.find(taskId).then(function (_task) {
        delete _this._tasks[_task.id];
    }).then(function () {
        _this._write();
    });
};
