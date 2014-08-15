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

TaskDetailsController.prototype.create = function (task) {
    task.postrequisites.add(this.task);
    this.task.prerequisites.add(task);
    TaskBaseController.prototype.create.call(this, task);
};

TaskDetailsController.prototype.removePrerequisite = function (task) {
    this.task.prerequisites.delete(task);
    task.postrequisites.delete(this.task);
    TaskBaseController.prototype.save(this, this.task);
    TaskBaseController.prototype.save(this, task);
};

TaskDetailsController.prototype.removePostrequisite = function (task) {
    this.task.postrequisites.delete(task);
    task.prerequisites.delete(this.task);
    TaskBaseController.prototype.save(this, this.task);
    TaskBaseController.prototype.save(this, task);
};
