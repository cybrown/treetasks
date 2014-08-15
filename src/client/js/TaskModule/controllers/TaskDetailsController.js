var TaskBaseController = require('./TaskBaseController');

var TaskDetailsController = module.exports = function ($scope, taskService, $stateParams) {
    this.taskId = Number($stateParams.id);
    this.task = taskService.findById(this.taskId);
    TaskBaseController.call(this, taskService);
};
TaskDetailsController.prototype = Object.create(TaskBaseController.prototype);

TaskDetailsController.prototype.findTasks = function () {
    return this.task.prerequisites.toArray();
};
