var express = require('express');
var TaskController = require('./controllers/TaskController');
var TaskService = require('./services/TaskService');
var AsyncInjector = require('async-injector');

var injector = new AsyncInjector();

injector.factory('taskService', function () {
    var taskService = new TaskService(__dirname + '/../data/tasks.json');
    return taskService.init().then(function () {
        return taskService;
    });
});

injector.factory('taskController', function (taskService) {
    return new TaskController(taskService);
});

injector.factory('server', function (taskController) {
    var server = express();
    server.use('/', express.static(__dirname + '/../public/'));
    server.use('/api/', taskController.getController());
    return server;
});

injector.inject(function (server) {
    server.listen(3000);
});
