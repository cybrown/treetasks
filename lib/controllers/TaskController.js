var express = require('express');
var bodyParser = require('body-parser');

var TaskController = module.exports = function (taskService) {
    this._ctrl = null;
    this._taskService = taskService;
};

TaskController.prototype.get = function () {
    return this._taskService.findAll();
};

TaskController.prototype.getDoable = function () {
    return this._taskService.findDoable();
};

TaskController.prototype.getChildren = function (parentId) {
    parentId = Number(parentId);
    return this._taskService.findChildren(parentId);
};

TaskController.prototype.getById = function (taskId) {
    taskId = Number(taskId);
    return this._taskService.findById(taskId);
};

TaskController.prototype.postDescription = function (taskId, description) {
    taskId = Number(taskId);
    return this._taskService.setDescription(taskId, description);
};

TaskController.prototype.postDone = function (taskId) {
    taskId = Number(taskId);
    return this._taskService.setDone(taskId);
};

TaskController.prototype.postUndone = function (taskId) {
    taskId = Number(taskId);
    return this._taskService.setUndone(taskId);
};

TaskController.prototype.put = function (parentId, description) {
    parentId = Number(parentId);
    return this._taskService.create({
        parentId: parentId,
        description: description
    });
};

TaskController.prototype.delete = function (taskId) {
    taskId = Number(taskId);
    return this._taskService.removeById(taskId);
};

TaskController.prototype.getController = function () {
    var _this = this;

    if (this._ctrl == null) {
        var ctrl = this._ctrl = express();

        ctrl.use('/', bodyParser.json());

        ctrl.get('/', function (req, res) {
            _this.get().then(function (tasks) {
                res.json(tasks).end();
            }).catch(function (err) {
                console.error(err.stack);
                res.status(err.statusCode || 500).end();
            });
        });

        ctrl.get('/children/:taskId', function (req, res) {
            _this.getChildren(req.params.taskId).then(function (tasks) {
                res.json(tasks);
            }).catch(function (err) {
                console.error(err.stack);
                res.status(err.statusCode || 500).end();
            })
        });

        ctrl.get('/doable', function (req, res) {
            _this.getDoable().then(function (tasks) {
                res.json(tasks);
            }).catch(function (err) {
                console.error(err.stack);
                res.status(err.statusCode || 500).end();
            });
        });

        ctrl.get('/:taskId', function (req, res) {
            _this.getById(req.params.taskId).then(function (task) {
                res.json(task);
            }).catch(function (err) {
                console.error(err.stack);
                res.status(err.statusCode || 500).end();
            });
        });

        ctrl.post('/:taskId/description', function (req, res) {
            _this.setDescription(req.params.taskId, req.body.description).then(function () {
                res.status(200).end();
            }).catch(function (err) {
                console.error(err.stack);
                res.status(err.statusCode || 500).end();
            });
        });

        ctrl.post('/:taskId/done', function (req, res) {
            _this.postDone(req.params.taskId).then(function () {
                res.status(200).end();
            }).catch(function (err) {
                console.error(err.stack);
                res.status(err.statusCode || 500).end();
            });
        });

        ctrl.post('/:taskId/undone', function (req, res) {
            _this.postUndone(req.params.taskId).then(function () {
                res.status(200).end();
            }).catch(function (err) {
                console.error(err.stack);
                res.status(err.statusCode || 500).end();
            });
        });

        ctrl.put('/', function (req, res) {
            _this.put(req.body.parentId, req.body.description).then(function (task) {
                res.json(task);
            }).catch(function (err) {
                console.error(err.stack);
                res.status(err.statusCode || 500).end();
            });
        });

        ctrl.delete('/:taskId', function (req, res) {
            _this.delete(req.params.taskId).then(function () {
                res.status(200).end();
            }).catch(function (err) {
                res.status(err.statusCode || 500).end();
            });
        });
    }

    return this._ctrl;
};
