var express = require('express');
var TaskController = require('./controllers/task-controller');
var TaskService = require('./services/task-service');

var taskService = new TaskService();
var taskController = new TaskController(taskService);

var server = express();

server.use('/', express.static(__dirname + '/../public/'));

server.use('/api/', taskController.getController());

server.get('ok', function (req, res) {
    res.send('ok');
});

server.listen(3000);
