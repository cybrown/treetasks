var TaskBaseController = require('./TaskBaseController');

var TaskAllController = module.exports = function (taskService) {
    TaskBaseController.call(this, taskService);
};
TaskAllController.prototype = Object.create(TaskBaseController.prototype);

TaskAllController.prototype.findTasks = function () {
    return this.taskService.findAll();
};
